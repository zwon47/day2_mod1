from datetime import datetime
from pydantic import BaseModel


class FirewallBase(BaseModel):
    name: str
    vendor: str | None = None
    model: str | None = None
    management_ip: str | None = None


class FirewallCreate(FirewallBase):
    pass


class Firewall(FirewallBase):
    id: int
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
