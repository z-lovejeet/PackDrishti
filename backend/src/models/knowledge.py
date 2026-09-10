import uuid
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import (
    String,
    Integer,
    Text,
    DateTime,
    JSON,
)
from sqlalchemy.types import UserDefinedType
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.src.models.base import Base, GUID


class PGVectorType(UserDefinedType):
    """
    Vector column type compatible with PostgreSQL pgvector (vector(dim))
    and falling back gracefully to JSON array representation in SQLite for tests.
    """
    def __init__(self, dimension: int = 1536):
        self.dimension = dimension

    def get_col_spec(self, **kw):
        return f"vector({self.dimension})"

    def bind_processor(self, dialect):
        def process(value):
            if value is None:
                return None
            if isinstance(value, list):
                if dialect.name == "postgresql":
                    return "[" + ",".join(str(float(x)) for x in value) + "]"
                return json.dumps(value)
            return str(value)
        return process

    def result_processor(self, dialect, coltype):
        def process(value):
            if value is None:
                return None
            if isinstance(value, str):
                cleaned = value.strip("[]")
                if not cleaned:
                    return []
                return [float(x.strip()) for x in cleaned.split(",")]
            if isinstance(value, list):
                return value
            return value
        return process


class StatutoryKnowledgeBase(Base):
    __tablename__ = "statutory_knowledge_base"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    rule_identifier: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    act_reference: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    amendment_year: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    full_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )
    embedding: Mapped[Optional[List[float]]] = mapped_column(
        PGVectorType(1536),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    statutory_violations: Mapped[List["StatutoryViolation"]] = relationship(
        "StatutoryViolation",
        back_populates="cited_knowledge",
        lazy="selectin",
    )
