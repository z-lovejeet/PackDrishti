from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.src.core.config import settings
from backend.src.api.v1.router import api_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="MetroScan: Automated Compliance Verification Platform under Legal Metrology (Packaged Commodities) Rules, 2011.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.DEBUG else None,
    docs_url=f"{settings.API_V1_STR}/docs" if settings.DEBUG else None,
    redoc_url=f"{settings.API_V1_STR}/redoc" if settings.DEBUG else None,
)

# Cross-Origin Resource Sharing (CORS) Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", summary="Root Liveness Probe", tags=["System Diagnostics"])
async def root_health():
    """
    Direct root liveness probe.
    Acceptance Criteria: Returns {'status': 'ok', 'version': '0.1.0'}.
    """
    return {
        "status": "ok",
        "version": settings.VERSION,
    }


@app.get("/", summary="Root Index", tags=["System Diagnostics"])
async def root():
    """
    API Service information index.
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": f"{settings.API_V1_STR}/docs" if settings.DEBUG else "disabled",
    }


# Mount API version 1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
