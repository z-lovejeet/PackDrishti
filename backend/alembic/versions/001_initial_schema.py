"""initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-10 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        "users",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), nullable=False, server_default="consumer"),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_users_email", "users", ["email"])

    # 2. health_audits table
    op.create_table(
        "health_audits",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("product_name", sa.String(255), nullable=False),
        sa.Column("brand", sa.String(150), nullable=False),
        sa.Column("front_image_url", sa.Text(), nullable=False),
        sa.Column("back_image_url", sa.Text(), nullable=False),
        sa.Column("health_score", sa.Numeric(5, 2), nullable=False),
        sa.Column("nutrients_json", sa.JSON(), nullable=False),
        sa.Column("badges_json", sa.JSON(), nullable=False),
        sa.Column("dietary_advisory_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_health_audits_user", "health_audits", ["user_id"])

    # 3. scan_history table
    op.create_table(
        "scan_history",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("health_audit_id", sa.CHAR(36), sa.ForeignKey("health_audits.id", ondelete="CASCADE"), nullable=True),
        sa.Column("scan_type", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_scan_history_user", "scan_history", ["user_id"])


def downgrade() -> None:
    op.drop_table("scan_history")
    op.drop_table("health_audits")
    op.drop_table("users")
