from datetime import datetime
from pydantic import BaseModel, field_validator
import ipaddress


class NetworkSegmentBase(BaseModel):
    name: str
    ip_range: str
    zone_type: str
    color: str
    description: str | None = None

    @field_validator('ip_range')
    @classmethod
    def validate_cidr(cls, v: str) -> str:
        """Validate CIDR format"""
        try:
            ipaddress.ip_network(v, strict=False)
            return v
        except ValueError:
            raise ValueError(f"Invalid CIDR format: {v}")


class NetworkSegmentCreate(NetworkSegmentBase):
    pass


class NetworkSegment(NetworkSegmentBase):
    id: int
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
