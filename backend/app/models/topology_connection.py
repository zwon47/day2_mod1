from sqlalchemy import Column, Integer, String, DateTime, Text, Index
from datetime import datetime

from app.database import Base


class TopologyConnection(Base):
    """
    미리 계산된 토폴로지 연결 정보를 캐싱
    대규모 규칙 세트에서 성능 최적화용
    """
    __tablename__ = "topology_connection"

    id = Column(Integer, primary_key=True, index=True)
    source_segment_id = Column(Integer, nullable=False, index=True)
    destination_segment_id = Column(Integer, nullable=False, index=True)

    # JSON 문자열로 저장
    rule_ids = Column(Text, nullable=False)  # "[1, 5, 12]"
    protocols = Column(Text, nullable=False)  # '["TCP", "UDP"]'
    ports = Column(Text, nullable=False)  # '["80", "443"]'
    actions = Column(Text, nullable=False)  # '["ALLOW"]'

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_topology_connection_source_dest', 'source_segment_id', 'destination_segment_id'),
    )
