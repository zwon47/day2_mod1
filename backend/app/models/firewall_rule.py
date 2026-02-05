from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class FirewallRule(Base):
    __tablename__ = "firewall_rules"

    id = Column(Integer, primary_key=True, index=True)
    firewall_id = Column(Integer, ForeignKey("firewalls.id"), nullable=False)
    rule_name = Column(String(100), nullable=False)
    source_segment_id = Column(Integer, ForeignKey("network_segments.id"), nullable=False, index=True)
    destination_segment_id = Column(Integer, ForeignKey("network_segments.id"), nullable=False, index=True)
    protocol = Column(String(20), nullable=False)  # TCP/UDP/ICMP/ANY
    port_range = Column(String(50), nullable=True)
    action = Column(String(20), nullable=False, index=True)  # ALLOW/DENY
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    firewall = relationship("Firewall", lazy="selectin")
    source_segment = relationship("NetworkSegment", foreign_keys=[source_segment_id], lazy="selectin")
    destination_segment = relationship("NetworkSegment", foreign_keys=[destination_segment_id], lazy="selectin")

    # Additional indexes
    __table_args__ = (
        Index('idx_firewall_rule_source', 'source_segment_id'),
        Index('idx_firewall_rule_destination', 'destination_segment_id'),
        Index('idx_firewall_rule_action', 'action'),
        Index('idx_firewall_rule_protocol', 'protocol'),
    )
