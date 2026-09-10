from fastapi import APIRouter
from backend.src.api.v1.endpoints import health, scan, rules, enforcement, dashboard

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["Health & Diagnostics"])
api_router.include_router(scan.router, prefix="/scan", tags=["Packaging Scans & Perception"])
api_router.include_router(rules.router, prefix="", tags=["Statutory Rules & Enforcement Notices"])
api_router.include_router(enforcement.router, prefix="", tags=["Enforcement & Compounding"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard & Analytics"])
