from datetime import datetime
from pydantic import BaseModel
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.schemas.firewall import Firewall
    from app.schemas.network_segment import NetworkSegment


class FirewallRuleBase(BaseModel):
    firewall_id: int
    rule_name: str
    source_segment_id: int
    destination_segment_id: int
    protocol: str
    port_range: str | None = None
    action: str
    description: str | None = None


class FirewallRuleCreate(FirewallRuleBase):
    pass


class FirewallRule(FirewallRuleBase):
    id: int
    created_at: datetime
    updated_at: datetime | None
    source_segment_ip: str | None = None
    source_segment_name: str | None = None
    destination_segment_ip: str | None = None
    destination_segment_name: str | None = None

    class Config:
        from_attributes = True


class FirewallRuleWithRelations(FirewallRule):
    """Rule with full relationship data"""
    firewall: Optional["Firewall"] = None
    source_segment: Optional["NetworkSegment"] = None
    destination_segment: Optional["NetworkSegment"] = None

    class Config:
        from_attributes = True
