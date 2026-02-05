from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.sql import func

from app.database import Base


class NetworkSegment(Base):
    __tablename__ = "network_segments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    ip_range = Column(String(50), nullable=False)  # CIDR format
    zone_type = Column(String(50), nullable=False)  # DMZ/Internal/External/Management
    color = Column(String(7), nullable=False)  # HEX color
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index('idx_network_segment_zone_type', 'zone_type'),
        Index('idx_network_segment_name', 'name'),
    )
