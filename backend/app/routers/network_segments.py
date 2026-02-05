from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io
import csv

from app.database import get_db
from app.models.network_segment import NetworkSegment as NetworkSegmentModel
from app.schemas.network_segment import NetworkSegmentCreate, NetworkSegment

router = APIRouter(prefix="/api/network-segments", tags=["network-segments"])


@router.get("/", response_model=List[NetworkSegment])
def get_network_segments(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max number of records to return"),
    zone_type: str | None = Query(None, description="Filter by zone type"),
    db: Session = Depends(get_db)
):
    """
    Get list of network segments with pagination
    """
    query = db.query(NetworkSegmentModel)

    if zone_type:
        query = query.filter(NetworkSegmentModel.zone_type == zone_type)

    segments = query.offset(skip).limit(limit).all()
    return segments


@router.get("/count", response_model=dict)
def get_network_segments_count(
    zone_type: str | None = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get total count of network segments
    """
    query = db.query(NetworkSegmentModel)

    if zone_type:
        query = query.filter(NetworkSegmentModel.zone_type == zone_type)

    total = query.count()
    return {"total": total}


@router.get("/export/csv")
def export_segments_csv(db: Session = Depends(get_db)):
    """
    Export all network segments to CSV
    """
    segments = db.query(NetworkSegmentModel).all()

    # CSV 생성
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(['id', 'name', 'ip_range', 'zone_type', 'color', 'description'])

    # Data
    for seg in segments:
        writer.writerow([
            seg.id,
            seg.name,
            seg.ip_range,
            seg.zone_type,
            seg.color,
            seg.description or ''
        ])

    output.seek(0)

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=network_segments.csv"}
    )


@router.get("/{segment_id}", response_model=NetworkSegment)
def get_network_segment(segment_id: int, db: Session = Depends(get_db)):
    """Get a specific network segment by ID"""
    segment = db.query(NetworkSegmentModel).filter(NetworkSegmentModel.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Network segment not found")
    return segment


@router.post("/", response_model=NetworkSegment)
def create_network_segment(segment: NetworkSegmentCreate, db: Session = Depends(get_db)):
    """Create a new network segment"""
    # Check if name already exists
    existing = db.query(NetworkSegmentModel).filter(NetworkSegmentModel.name == segment.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Network segment with this name already exists")

    db_segment = NetworkSegmentModel(**segment.model_dump())
    db.add(db_segment)
    db.commit()
    db.refresh(db_segment)
    return db_segment


@router.put("/{segment_id}", response_model=NetworkSegment)
def update_network_segment(segment_id: int, segment: NetworkSegmentCreate, db: Session = Depends(get_db)):
    """Update an existing network segment"""
    db_segment = db.query(NetworkSegmentModel).filter(NetworkSegmentModel.id == segment_id).first()
    if not db_segment:
        raise HTTPException(status_code=404, detail="Network segment not found")

    # Check if new name conflicts with another segment
    if segment.name != db_segment.name:
        existing = db.query(NetworkSegmentModel).filter(NetworkSegmentModel.name == segment.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Network segment with this name already exists")

    for key, value in segment.model_dump().items():
        setattr(db_segment, key, value)

    db.commit()
    db.refresh(db_segment)
    return db_segment


@router.delete("/{segment_id}")
def delete_network_segment(segment_id: int, db: Session = Depends(get_db)):
    """Delete a network segment"""
    db_segment = db.query(NetworkSegmentModel).filter(NetworkSegmentModel.id == segment_id).first()
    if not db_segment:
        raise HTTPException(status_code=404, detail="Network segment not found")

    db.delete(db_segment)
    db.commit()
    return {"message": "Network segment deleted successfully"}


@router.post("/import/csv")
async def import_segments_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Import network segments from CSV

    CSV format: name, ip_range, zone_type, color, description
    """
    content = await file.read()
    decoded = content.decode('utf-8')

    reader = csv.DictReader(io.StringIO(decoded))
    created_count = 0
    errors = []

    for row in reader:
        try:
            # Validate required fields
            if not all([row.get('name'), row.get('ip_range'), row.get('zone_type')]):
                errors.append(f"Row missing required fields: {row}")
                continue

            # Create segment
            segment = NetworkSegmentModel(
                name=row['name'],
                ip_range=row['ip_range'],
                zone_type=row['zone_type'],
                color=row.get('color', '#CCCCCC'),
                description=row.get('description')
            )
            db.add(segment)
            created_count += 1
        except Exception as e:
            errors.append(f"Error processing row {row}: {str(e)}")

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "message": f"Failed to commit: {str(e)}",
            "created": 0,
            "errors": errors
        }

    return {
        "success": True,
        "created": created_count,
        "errors": errors
    }
