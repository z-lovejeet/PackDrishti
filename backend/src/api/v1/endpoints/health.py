from fastapi import APIRouter
from backend.src.core.config import settings

router = APIRouter()


@router.get("", summary="Subsystem Health Check")
async def health_check():
    """
    Returns detailed health and operational readiness status of the MetroScan API service.
    """
    return {
        "status": "ok",
        "version": settings.VERSION,
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "subsystems": {
            "database": "configured",
            "redis": "configured",
            "storage": settings.STORAGE_PROVIDER,
            "ocr_engine": settings.OCR_ENGINE,
            "llm_provider": settings.LLM_PROVIDER,
        },
    }
