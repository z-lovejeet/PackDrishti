from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.src.core.config import settings
from backend.src.api.v1.router import api_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="PackDrashiti: Automated Compliance Verification Platform under Legal Metrology (Packaged Commodities) Rules, 2011.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.DEBUG else None,
    docs_url=f"{settings.API_V1_STR}/docs" if settings.DEBUG else None,
    redoc_url=f"{settings.API_V1_STR}/redoc" if settings.DEBUG else None,
)

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Cross-Origin Resource Sharing (CORS) Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Enforces modern browser defense headers:
    X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS, Referrer-Policy.
    """
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


app.add_middleware(SecurityHeadersMiddleware)


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

from fastapi.responses import RedirectResponse

@app.get("/docs", include_in_schema=False)
async def redirect_docs():
    """
    Redirect root /docs to API v1 docs endpoint.
    """
    return RedirectResponse(url=f"{settings.API_V1_STR}/docs")

@app.get("/redoc", include_in_schema=False)
async def redirect_redoc():
    """
    Redirect root /redoc to API v1 redoc endpoint.
    """
    return RedirectResponse(url=f"{settings.API_V1_STR}/redoc")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
