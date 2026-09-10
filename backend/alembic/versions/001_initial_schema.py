"""initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-10 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

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
        sa.Column("badge_number", sa.String(100), nullable=True),
        sa.Column("designation", sa.String(150), nullable=True),
        sa.Column("zone", sa.String(150), nullable=True),
        sa.Column("jurisdiction", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_users_email", "users", ["email"])
    op.create_index("idx_users_badge_number", "users", ["badge_number"])

    # 2. product_scans table
    op.create_table(
        "product_scans",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("scan_code", sa.String(64), unique=True, nullable=False),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("product_name", sa.String(255), nullable=False),
        sa.Column("brand", sa.String(150), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("barcode", sa.String(64), nullable=True),
        sa.Column("pdp_area_cm2", sa.Numeric(8, 2), nullable=False),
        sa.Column("net_quantity", sa.String(64), nullable=False),
        sa.Column("mrp", sa.String(64), nullable=False),
        sa.Column("mfg_date", sa.String(64), nullable=False),
        sa.Column("overall_status", sa.String(50), nullable=False, server_default="pending"),
        sa.Column("compliance_score", sa.Numeric(5, 2), nullable=False, server_default="0.00"),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("inspector_notes", sa.Text(), nullable=True),
        sa.Column("scanned_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_product_scans_scan_code", "product_scans", ["scan_code"])
    op.create_index("idx_product_scans_user_id", "product_scans", ["user_id"])

    # 3. extracted_declarations table
    op.create_table(
        "extracted_declarations",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("scan_id", sa.CHAR(36), sa.ForeignKey("product_scans.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rule_clause", sa.String(100), nullable=False),
        sa.Column("field_name", sa.String(150), nullable=False),
        sa.Column("extracted_value", sa.Text(), nullable=False),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("status_note", sa.Text(), nullable=True),
        sa.Column("measured_font_height_mm", sa.Numeric(5, 2), nullable=True),
        sa.Column("required_font_height_mm", sa.Numeric(5, 2), nullable=True),
        sa.Column("contrast_ratio", sa.Numeric(5, 2), nullable=True),
        sa.Column("bounding_box_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_extracted_declarations_scan_id", "extracted_declarations", ["scan_id"])

    # 4. statutory_knowledge_base table
    op.create_table(
        "statutory_knowledge_base",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("rule_identifier", sa.String(100), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("act_reference", sa.String(255), nullable=False),
        sa.Column("amendment_year", sa.Integer(), nullable=True),
        sa.Column("full_text", sa.Text(), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_statutory_knowledge_rule_id", "statutory_knowledge_base", ["rule_identifier"])

    # 5. statutory_violations table
    op.create_table(
        "statutory_violations",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("scan_id", sa.CHAR(36), sa.ForeignKey("product_scans.id", ondelete="CASCADE"), nullable=False),
        sa.Column("cited_knowledge_id", sa.CHAR(36), sa.ForeignKey("statutory_knowledge_base.id", ondelete="SET NULL"), nullable=True),
        sa.Column("rule_reference", sa.String(100), nullable=False),
        sa.Column("act_section", sa.String(100), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("penalty_clause", sa.Text(), nullable=False),
        sa.Column("severity", sa.String(50), nullable=False),
        sa.Column("corrective_action", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_statutory_violations_scan_id", "statutory_violations", ["scan_id"])

    # 6. violation_records table
    op.create_table(
        "violation_records",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("scan_id", sa.CHAR(36), sa.ForeignKey("product_scans.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("violation_code", sa.String(64), unique=True, nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="Open"),
        sa.Column("assigned_officer_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("timeline_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_violation_records_scan_id", "violation_records", ["scan_id"])

    # 7. compliance_reports table
    op.create_table(
        "compliance_reports",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("report_number", sa.String(100), unique=True, nullable=False),
        sa.Column("officer_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("scan_id", sa.CHAR(36), sa.ForeignKey("product_scans.id", ondelete="SET NULL"), nullable=True),
        sa.Column("report_type", sa.String(100), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("district", sa.String(150), nullable=False),
        sa.Column("total_products_scanned", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("compliant_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("violation_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("pdf_url", sa.Text(), nullable=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_compliance_reports_officer", "compliance_reports", ["officer_id"])
    op.create_index("idx_compliance_reports_report_num", "compliance_reports", ["report_number"])

    # 8. health_audits table
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

    # 9. scan_history table
    op.create_table(
        "scan_history",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("scan_id", sa.CHAR(36), sa.ForeignKey("product_scans.id", ondelete="SET NULL"), nullable=True),
        sa.Column("health_audit_id", sa.CHAR(36), sa.ForeignKey("health_audits.id", ondelete="SET NULL"), nullable=True),
        sa.Column("scan_type", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_scan_history_user", "scan_history", ["user_id"])


def downgrade() -> None:
    op.drop_table("scan_history")
    op.drop_table("health_audits")
    op.drop_table("compliance_reports")
    op.drop_table("violation_records")
    op.drop_table("statutory_violations")
    op.drop_table("statutory_knowledge_base")
    op.drop_table("extracted_declarations")
    op.drop_table("product_scans")
    op.drop_table("users")
