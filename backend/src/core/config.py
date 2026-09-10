from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    PackDrashiti Application Configuration Settings.
    Utilizes Pydantic BaseSettings for strict environment variable parsing and validation.
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

    # Database Configuration (PostgreSQL with pgvector)
    DATABASE_URL: str = (
        "postgresql://packdrashiti_user:packdrashiti_pass@localhost:5432/packdrashiti_db"
    )
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_POOL_TIMEOUT: int = 30

    # Redis Cache & Broker Configuration
    REDIS_URL: str = "redis://localhost:6379/0"

    # Authentication, Tokenization & Security
    JWT_SECRET_KEY: str = (
        "4a2e8c1f9b3d7a6e508192c73e4b5a6f80192837465019283746501928374650"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BCRYPT_ROUNDS: int = 12

    # Storage Architecture
    STORAGE_PROVIDER: str = "local"
    STORAGE_LOCAL_DIR: str = "./uploads"
    S3_ENDPOINT_URL: str = ""
    S3_BUCKET_NAME: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_REGION: str = "auto"

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

    # Optical & Computer Vision Pipeline
    OCR_ENGINE: str = "paddleocr"
    OCR_USE_GPU: bool = False
    OCR_CONFIDENCE_THRESHOLD: float = 0.60
    CALIBRATION_PIXEL_PER_MM: float = 11.81

    # LLM & Statutory RAG Pipeline
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    VECTOR_DIMENSION: int = 1536


settings = Settings()
