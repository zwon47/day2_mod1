from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
import io
import csv

from app.database import get_db
from app.models.firewall_rule import FirewallRule as FirewallRuleModel
from app.schemas.firewall_rule import FirewallRuleCreate, FirewallRule

router = APIRouter(prefix="/api/firewall-rules", tags=["firewall-rules"])


class BulkDeleteRequest(BaseModel):
    ids: List[int]


@router.get("/", response_model=List[FirewallRule])
def get_firewall_rules(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    firewall_id: int | None = Query(None, description="Filter by firewall ID"),
    protocol: str | None = Query(None, description="Filter by protocol"),
    action: str | None = Query(None, description="Filter by action"),
    db: Session = Depends(get_db)
):
    """
    Get list of firewall rules with pagination and filters
    """
    query = db.query(FirewallRuleModel).options(
        joinedload(FirewallRuleModel.source_segment),
        joinedload(FirewallRuleModel.destination_segment)
    )

    if firewall_id:
        query = query.filter(FirewallRuleModel.firewall_id == firewall_id)
    if protocol:
        query = query.filter(FirewallRuleModel.protocol == protocol.upper())
    if action:
        query = query.filter(FirewallRuleModel.action == action.upper())

    rules = query.offset(skip).limit(limit).all()

    # Add IP and name info to response
    result = []
    for rule in rules:
        rule_dict = {
            "id": rule.id,
            "firewall_id": rule.firewall_id,
            "rule_name": rule.rule_name,
            "source_segment_id": rule.source_segment_id,
            "destination_segment_id": rule.destination_segment_id,
            "protocol": rule.protocol,
            "port_range": rule.port_range,
            "action": rule.action,
            "description": rule.description,
            "created_at": rule.created_at,
            "updated_at": rule.updated_at,
            "source_segment_ip": rule.source_segment.ip_range if rule.source_segment else None,
            "source_segment_name": rule.source_segment.name if rule.source_segment else None,
            "destination_segment_ip": rule.destination_segment.ip_range if rule.destination_segment else None,
            "destination_segment_name": rule.destination_segment.name if rule.destination_segment else None,
        }
        result.append(rule_dict)

    return result


@router.get("/count", response_model=dict)
def get_firewall_rules_count(
    firewall_id: int | None = Query(None),
    protocol: str | None = Query(None),
    action: str | None = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get total count of firewall rules
    """
    query = db.query(FirewallRuleModel)

    if firewall_id:
        query = query.filter(FirewallRuleModel.firewall_id == firewall_id)
    if protocol:
        query = query.filter(FirewallRuleModel.protocol == protocol.upper())
    if action:
        query = query.filter(FirewallRuleModel.action == action.upper())

    total = query.count()
    return {"total": total}


@router.get("/export/csv")
def export_rules_csv(db: Session = Depends(get_db)):
    """
    Export all firewall rules to CSV
    """
    rules = db.query(FirewallRuleModel).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        'id', 'firewall_id', 'rule_name', 'source_segment_id',
        'destination_segment_id', 'protocol', 'port_range', 'action', 'description'
    ])

    # Data
    for rule in rules:
        writer.writerow([
            rule.id,
            rule.firewall_id,
            rule.rule_name,
            rule.source_segment_id,
            rule.destination_segment_id,
            rule.protocol,
            rule.port_range or '',
            rule.action,
            rule.description or ''
        ])

    output.seek(0)

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=firewall_rules.csv"}
    )


@router.get("/{rule_id}", response_model=FirewallRule)
def get_firewall_rule(rule_id: int, db: Session = Depends(get_db)):
    """
    Get single firewall rule with relationships
    """
    rule = db.query(FirewallRuleModel).options(
        joinedload(FirewallRuleModel.firewall),
        joinedload(FirewallRuleModel.source_segment),
        joinedload(FirewallRuleModel.destination_segment)
    ).filter(FirewallRuleModel.id == rule_id).first()

    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    # Add IP and name info to response
    return {
        "id": rule.id,
        "firewall_id": rule.firewall_id,
        "rule_name": rule.rule_name,
        "source_segment_id": rule.source_segment_id,
        "destination_segment_id": rule.destination_segment_id,
        "protocol": rule.protocol,
        "port_range": rule.port_range,
        "action": rule.action,
        "description": rule.description,
        "created_at": rule.created_at,
        "updated_at": rule.updated_at,
        "source_segment_ip": rule.source_segment.ip_range if rule.source_segment else None,
        "source_segment_name": rule.source_segment.name if rule.source_segment else None,
        "destination_segment_ip": rule.destination_segment.ip_range if rule.destination_segment else None,
        "destination_segment_name": rule.destination_segment.name if rule.destination_segment else None,
    }


@router.post("/", response_model=FirewallRule)
def create_firewall_rule(rule: FirewallRuleCreate, db: Session = Depends(get_db)):
    """Create a new firewall rule"""
    db_rule = FirewallRuleModel(**rule.model_dump())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule


@router.put("/{rule_id}", response_model=FirewallRule)
def update_firewall_rule(rule_id: int, rule: FirewallRuleCreate, db: Session = Depends(get_db)):
    """Update an existing firewall rule"""
    db_rule = db.query(FirewallRuleModel).filter(FirewallRuleModel.id == rule_id).first()
    if not db_rule:
        raise HTTPException(status_code=404, detail="Firewall rule not found")

    for key, value in rule.model_dump().items():
        setattr(db_rule, key, value)

    db.commit()
    db.refresh(db_rule)
    return db_rule


@router.delete("/{rule_id}")
def delete_firewall_rule(rule_id: int, db: Session = Depends(get_db)):
    """Delete a firewall rule"""
    db_rule = db.query(FirewallRuleModel).filter(FirewallRuleModel.id == rule_id).first()
    if not db_rule:
        raise HTTPException(status_code=404, detail="Firewall rule not found")

    db.delete(db_rule)
    db.commit()
    return {"message": "Firewall rule deleted successfully"}


@router.post("/bulk-delete")
def bulk_delete_rules(
    request: BulkDeleteRequest,
    db: Session = Depends(get_db)
):
    """
    Delete multiple firewall rules at once
    """
    deleted_count = db.query(FirewallRuleModel).filter(
        FirewallRuleModel.id.in_(request.ids)
    ).delete(synchronize_session=False)

    db.commit()

    return {
        "success": True,
        "deleted": deleted_count
    }
