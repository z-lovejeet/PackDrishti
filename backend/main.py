"""
MetroScan Backend Entrypoint.
Delegates to backend.src.main:app.
"""
from backend.src.main import app

if __name__ == "__main__":
    import uvicorn
    from backend.src.core.config import settings

    uvicorn.run(
        "backend.src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
