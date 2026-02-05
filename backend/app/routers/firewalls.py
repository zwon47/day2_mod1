from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.firewall import Firewall as FirewallModel
from app.schemas.firewall import FirewallCreate, Firewall

router = APIRouter(prefix="/api/firewalls", tags=["firewalls"])


@router.get("/", response_model=List[Firewall])
def get_firewalls(db: Session = Depends(get_db)):
    """Get all firewalls"""
    return db.query(FirewallModel).all()


@router.get("/{firewall_id}", response_model=Firewall)
def get_firewall(firewall_id: int, db: Session = Depends(get_db)):
    """Get a specific firewall by ID"""
    firewall = db.query(FirewallModel).filter(FirewallModel.id == firewall_id).first()
    if not firewall:
        raise HTTPException(status_code=404, detail="Firewall not found")
    return firewall


@router.post("/", response_model=Firewall)
def create_firewall(firewall: FirewallCreate, db: Session = Depends(get_db)):
    """Create a new firewall"""
    # Check if name already exists
    existing = db.query(FirewallModel).filter(FirewallModel.name == firewall.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Firewall with this name already exists")

    db_firewall = FirewallModel(**firewall.model_dump())
    db.add(db_firewall)
    db.commit()
    db.refresh(db_firewall)
    return db_firewall


@router.put("/{firewall_id}", response_model=Firewall)
def update_firewall(firewall_id: int, firewall: FirewallCreate, db: Session = Depends(get_db)):
    """Update an existing firewall"""
    db_firewall = db.query(FirewallModel).filter(FirewallModel.id == firewall_id).first()
    if not db_firewall:
        raise HTTPException(status_code=404, detail="Firewall not found")

    # Check if new name conflicts with another firewall
    if firewall.name != db_firewall.name:
        existing = db.query(FirewallModel).filter(FirewallModel.name == firewall.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Firewall with this name already exists")

    for key, value in firewall.model_dump().items():
        setattr(db_firewall, key, value)

    db.commit()
    db.refresh(db_firewall)
    return db_firewall


@router.delete("/{firewall_id}")
def delete_firewall(firewall_id: int, db: Session = Depends(get_db)):
    """Delete a firewall"""
    db_firewall = db.query(FirewallModel).filter(FirewallModel.id == firewall_id).first()
    if not db_firewall:
        raise HTTPException(status_code=404, detail="Firewall not found")

    db.delete(db_firewall)
    db.commit()
    return {"message": "Firewall deleted successfully"}
