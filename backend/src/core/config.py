from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    PackDrashiti Application Configuration Settings.
    Type-safe environment parsing backed by Pydantic v2 Settings.
    """

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application Runtime Settings
    APP_NAME: str = "PackDrashiti"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "0.1.0"

    # Supabase Unified Relational Database & Vector Store (pgvector)
    SUPABASE_URL: str = "https://placeholder.supabase.co"
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = "4a2e8c1f9b3d7a6e508192c73e4b5a6f80192837465019283746501928374650"

    # Direct PostgreSQL / Supabase pooler connection string for SQLAlchemy & Alembic
    DATABASE_URL: str = (
        "postgresql://packdrashiti_user:packdrashiti_pass@localhost:5432/packdrashiti_db"
    )
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_POOL_TIMEOUT: int = 30

    # Zero-Manual In-Memory Cache (Replaces Redis with 0 external setup)
    CACHE_TTL_SECONDS: int = 3600
    CACHE_MAX_ITEMS: int = 5000

    # Authentication & Security Tokens (Supabase Auth)
    JWT_SECRET_KEY: str = "4a2e8c1f9b3d7a6e508192c73e4b5a6f80192837465019283746501928374650"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Storage Architecture (Supabase Storage / Local)
    STORAGE_PROVIDER: str = "supabase"
    STORAGE_LOCAL_DIR: str = "./uploads"
    STORAGE_BUCKET_NAME: str = "packaging-scans"

    # Cross-Origin Resource Sharing (CORS)
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://localhost:3000"]

    # Optical & Spatial Perception (Zero Manual Setup)
    OCR_ENGINE: str = "multimodal_vlm"
    OCR_USE_GPU: bool = False
    OCR_CONFIDENCE_THRESHOLD: float = 0.60
    CALIBRATION_PIXEL_PER_MM: float = 11.81

    # Parallel Dual-LLM Pipeline: Primary Gemini Fallback Chain
    GEMINI_API_KEY: str = ""
    GEMINI_FALLBACK_CHAIN: Union[List[str], str] = [
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-3.7-flash",
        "gemini-flash-lite-latest",
        "gemini-3.6-flash",
    ]

    @field_validator("GEMINI_FALLBACK_CHAIN", mode="before")
    @classmethod
    def assemble_gemini_chain(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return [
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.7-flash",
            "gemini-flash-lite-latest",
            "gemini-3.6-flash",
        ]

    # Parallel Dual-LLM Pipeline: Secondary Groq Fallback Chain (Pure Open-Weights Qwen Models)
    GROQ_API_KEY: str = ""
    GROQ_FALLBACK_CHAIN: Union[List[str], str] = [
        "qwen/qwen3.8-27b",
        "qwen/qwen3.6-27b",
    ]

    @field_validator("GROQ_FALLBACK_CHAIN", mode="before")
    @classmethod
    def assemble_groq_chain(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["qwen/qwen3.8-27b", "qwen/qwen3.6-27b"]


    # LangGraph Statutory RAG Pipeline in Supabase pgvector
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    VECTOR_DIMENSION: int = 1536
    RAG_FRAMEWORK: str = "langgraph"


settings = Settings()
