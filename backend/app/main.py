from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, SessionLocal
from app.routers import examples, network_segments, firewalls, firewall_rules, topology
from app.seed_data import seed_database

# Import models to register with Base
from app.models import topology_connection  # noqa: F401

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

# 초기 샘플 데이터 생성 (개발 환경)
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(title="Module 5 API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(examples.router)
app.include_router(network_segments.router)
app.include_router(firewalls.router)
app.include_router(firewall_rules.router)
app.include_router(topology.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI 서버가 정상 작동 중입니다."}
