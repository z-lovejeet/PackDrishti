import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.src.models.base import Base, GUID

if TYPE_CHECKING:
    from backend.src.models.user import User


class HealthInsightsLog(Base):
    __tablename__ = "health_insights_log"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    insight_type: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="info", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    related_condition: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="health_insights")

    __table_args__ = (
        CheckConstraint(
            "severity IN ('info', 'warning', 'critical', 'achievement')",
            name="chk_insight_severity",
        ),
        Index("idx_health_insights_user", "user_id", "is_read"),
    )
