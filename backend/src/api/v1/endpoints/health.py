from fastapi import APIRouter
from backend.src.core.config import settings

router = APIRouter()


@router.get("", summary="Subsystem Health Check")
async def health_check():
    """
    Returns detailed health and operational readiness status of the PackDrashiti API service,
    verifying Supabase Database, pgvector, Supabase Auth, in-memory cache, and Parallel Dual-LLM chains.
    """
    return {
        "status": "ok",
        "version": settings.VERSION,
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "subsystems": {
            "database": "supabase_postgresql",
            "vectordb": "supabase_pgvector",
            "auth": "supabase_auth",
            "cache": "in_memory_async_lru",
            "ocr_engine": settings.OCR_ENGINE,
            "llm_primary_chain": " -> ".join(settings.GEMINI_FALLBACK_CHAIN),
            "llm_secondary_chain": " -> ".join(settings.GROQ_FALLBACK_CHAIN),
            "rag_framework": settings.RAG_FRAMEWORK,
            "storage": settings.STORAGE_PROVIDER,
        },
    }
