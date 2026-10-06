"""health_platform_expansion

Revision ID: 002_health_platform_expansion
Revises: 001_initial_schema
Create Date: 2026-10-06 20:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "002_health_platform_expansion"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. user_profiles table
    op.create_table(
        "user_profiles",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("biological_sex", sa.String(16), nullable=False),
        sa.Column("height_cm", sa.Numeric(5, 2), nullable=False),
        sa.Column("current_weight_kg", sa.Numeric(5, 2), nullable=False),
        sa.Column("target_weight_kg", sa.Numeric(5, 2), nullable=False),
        sa.Column("body_fat_percentage", sa.Numeric(4, 2), nullable=True),
        sa.Column("activity_level", sa.String(32), nullable=False, server_default="sedentary"),
        sa.Column("primary_goal", sa.String(32), nullable=False, server_default="maintenance"),
        sa.Column("diet_type", sa.String(32), nullable=False, server_default="standard_omnivore"),
        sa.Column("bmr_kcal", sa.Numeric(6, 2), nullable=False),
        sa.Column("tdee_kcal", sa.Numeric(6, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("age >= 10 AND age <= 120", name="chk_profiles_age"),
        sa.CheckConstraint("biological_sex IN ('male', 'female')", name="chk_profiles_sex"),
        sa.CheckConstraint("height_cm >= 80.0 AND height_cm <= 260.0", name="chk_profiles_height"),
        sa.CheckConstraint("current_weight_kg >= 25.0 AND current_weight_kg <= 400.0", name="chk_profiles_weight"),
        sa.CheckConstraint(
            "activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')",
            name="chk_profiles_activity",
        ),
        sa.CheckConstraint(
            "primary_goal IN ('rapid_fat_loss', 'moderate_fat_loss', 'maintenance', 'clean_lean_bulk', 'aggressive_hypertrophy', 'metabolic_reversal')",
            name="chk_profiles_goal",
        ),
    )
    op.create_index("idx_user_profiles_user", "user_profiles", ["user_id"])

    # 2. user_medical_conditions table
    op.create_table(
        "user_medical_conditions",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("condition_key", sa.String(64), nullable=False),
        sa.Column("severity", sa.String(32), nullable=False, server_default="moderate"),
        sa.Column("notes", sa.String(500), nullable=True),
        sa.Column("diagnosed_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", "condition_key", name="uq_user_condition"),
        sa.CheckConstraint(
            "condition_key IN ('diabetes_type_2', 'prediabetes', 'hypertension', 'dyslipidemia', "
            "'fatty_liver_nafld', 'pcod_pcos', 'hypothyroidism', 'hyperthyroidism', "
            "'chronic_kidney_disease_ckd', 'hyperuricemia_gout', 'gerd_acid_reflux', "
            "'celiac_disease', 'lactose_intolerance', 'peanut_allergy', 'tree_nut_allergy', "
            "'shellfish_allergy', 'soy_allergy', 'egg_allergy')",
            name="chk_condition_key",
        ),
    )
    op.create_index("idx_medical_conditions_user", "user_medical_conditions", ["user_id"])

    # 3. daily_macro_budgets table
    op.create_table(
        "daily_macro_budgets",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("effective_date", sa.Date(), nullable=False),
        sa.Column("target_calories", sa.Numeric(6, 2), nullable=False),
        sa.Column("target_protein_g", sa.Numeric(5, 2), nullable=False),
        sa.Column("target_carbs_g", sa.Numeric(5, 2), nullable=False),
        sa.Column("target_fat_g", sa.Numeric(5, 2), nullable=False),
        sa.Column("target_fiber_g", sa.Numeric(5, 2), nullable=False, server_default="30.00"),
        sa.Column("ceiling_sodium_mg", sa.Numeric(6, 2), nullable=False, server_default="2000.00"),
        sa.Column("ceiling_added_sugar_g", sa.Numeric(5, 2), nullable=False, server_default="25.00"),
        sa.Column("target_water_ml", sa.Numeric(6, 2), nullable=False, server_default="2500.00"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", "effective_date", name="uq_user_budget_date"),
        sa.CheckConstraint("target_calories >= 1000.0", name="chk_target_calories"),
    )
    op.create_index("idx_macro_budgets_user_date", "daily_macro_budgets", ["user_id", "effective_date"])

    # 4. daily_food_diaries table
    op.create_table(
        "daily_food_diaries",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("diary_date", sa.Date(), nullable=False),
        sa.Column("total_calories", sa.Numeric(6, 2), nullable=False, server_default="0.00"),
        sa.Column("total_protein_g", sa.Numeric(5, 2), nullable=False, server_default="0.00"),
        sa.Column("total_carbs_g", sa.Numeric(5, 2), nullable=False, server_default="0.00"),
        sa.Column("total_fat_g", sa.Numeric(5, 2), nullable=False, server_default="0.00"),
        sa.Column("total_fiber_g", sa.Numeric(5, 2), nullable=False, server_default="0.00"),
        sa.Column("total_sodium_mg", sa.Numeric(6, 2), nullable=False, server_default="0.00"),
        sa.Column("total_sugar_g", sa.Numeric(5, 2), nullable=False, server_default="0.00"),
        sa.Column("total_water_ml", sa.Numeric(6, 2), nullable=False, server_default="0.00"),
        sa.Column("adherence_status", sa.String(32), nullable=False, server_default="on_track"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", "diary_date", name="uq_user_diary_date"),
    )
    op.create_index("idx_food_diaries_lookup", "daily_food_diaries", ["user_id", "diary_date"])

    # 5. verified_food_reference table
    op.create_table(
        "verified_food_reference",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("food_name", sa.String(255), nullable=False, unique=True),
        sa.Column("regional_name", sa.String(255), nullable=True),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("calories_per_100g", sa.Numeric(6, 2), nullable=False),
        sa.Column("protein_per_100g", sa.Numeric(5, 2), nullable=False),
        sa.Column("carbs_per_100g", sa.Numeric(5, 2), nullable=False),
        sa.Column("fat_per_100g", sa.Numeric(5, 2), nullable=False),
        sa.Column("fiber_per_100g", sa.Numeric(5, 2), nullable=False, server_default="0.00"),
        sa.Column("sodium_per_100g", sa.Numeric(6, 2), nullable=False, server_default="0.00"),
        sa.Column("sugar_per_100g", sa.Numeric(5, 2), nullable=False, server_default="0.00"),
        sa.Column("portion_sizes_json", sa.JSON(), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_food_ref_name", "verified_food_reference", ["food_name"])
    op.create_index("idx_food_ref_category", "verified_food_reference", ["category"])

    # 6. custom_foods table
    op.create_table(
        "custom_foods",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("food_name", sa.String(255), nullable=False),
        sa.Column("calories_per_serving", sa.Numeric(6, 2), nullable=False),
        sa.Column("protein_per_serving", sa.Numeric(5, 2), nullable=False),
        sa.Column("carbs_per_serving", sa.Numeric(5, 2), nullable=False),
        sa.Column("fat_per_serving", sa.Numeric(5, 2), nullable=False),
        sa.Column("serving_description", sa.String(100), nullable=False, server_default="1 serving"),
        sa.Column("ingredients_recipe_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("idx_custom_foods_user", "custom_foods", ["user_id"])

    # 7. packaged_food_audits table
    op.create_table(
        "packaged_food_audits",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("product_name", sa.String(255), nullable=False),
        sa.Column("brand_name", sa.String(150), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("health_score", sa.Numeric(5, 2), nullable=False),
        sa.Column("score_band", sa.String(50), nullable=False),
        sa.Column("mrp", sa.Numeric(8, 2), nullable=True),
        sa.Column("net_quantity_g", sa.Numeric(8, 2), nullable=True),
        sa.Column("price_per_100g", sa.Numeric(8, 2), nullable=True),
        sa.Column("mfg_date", sa.String(64), nullable=True),
        sa.Column("expiry_date", sa.String(64), nullable=True),
        sa.Column("is_expired", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("nutrients_json", sa.JSON(), nullable=False),
        sa.Column("badges_json", sa.JSON(), nullable=False),
        sa.Column("additives_json", sa.JSON(), nullable=False),
        sa.Column("clinical_advisory_json", sa.JSON(), nullable=False),
        sa.Column("front_image_url", sa.Text(), nullable=True),
        sa.Column("back_image_url", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("health_score >= 0.00 AND health_score <= 100.00", name="chk_health_score_range"),
    )
    op.create_index("idx_packaged_audits_user", "packaged_food_audits", ["user_id"])
    op.create_index("idx_packaged_audits_created", "packaged_food_audits", ["created_at"])

    # 8. meal_entries table
    op.create_table(
        "meal_entries",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("diary_id", sa.CHAR(36), sa.ForeignKey("daily_food_diaries.id", ondelete="CASCADE"), nullable=False),
        sa.Column("meal_type", sa.String(20), nullable=False),
        sa.Column("food_name", sa.String(255), nullable=False),
        sa.Column("source_type", sa.String(32), nullable=False, server_default="manual_search"),
        sa.Column("packaged_audit_id", sa.CHAR(36), sa.ForeignKey("packaged_food_audits.id", ondelete="SET NULL"), nullable=True),
        sa.Column("verified_food_id", sa.CHAR(36), sa.ForeignKey("verified_food_reference.id", ondelete="SET NULL"), nullable=True),
        sa.Column("custom_food_id", sa.CHAR(36), sa.ForeignKey("custom_foods.id", ondelete="SET NULL"), nullable=True),
        sa.Column("serving_quantity", sa.Numeric(6, 2), nullable=False, server_default="1.00"),
        sa.Column("serving_unit", sa.String(64), nullable=False, server_default="serving"),
        sa.Column("weight_in_grams", sa.Numeric(6, 2), nullable=False),
        sa.Column("calories", sa.Numeric(6, 2), nullable=False),
        sa.Column("protein_g", sa.Numeric(5, 2), nullable=False),
        sa.Column("carbs_g", sa.Numeric(5, 2), nullable=False),
        sa.Column("fat_g", sa.Numeric(5, 2), nullable=False),
        sa.Column("fiber_g", sa.Numeric(5, 2), nullable=False, server_default="0.00"),
        sa.Column("sodium_mg", sa.Numeric(6, 2), nullable=False, server_default="0.00"),
        sa.Column("sugar_g", sa.Numeric(5, 2), nullable=False, server_default="0.00"),
        sa.Column("metadata_json", sa.JSON(), nullable=False),
        sa.Column("logged_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')", name="chk_meal_type"),
        sa.CheckConstraint(
            "source_type IN ('manual_search', 'plate_vision', 'packaged_scan', 'custom_recipe')",
            name="chk_source_type",
        ),
    )
    op.create_index("idx_meal_entries_diary", "meal_entries", ["diary_id"])
    op.create_index("idx_meal_entries_type", "meal_entries", ["meal_type"])

    # 9. health_insights_log table
    op.create_table(
        "health_insights_log",
        sa.Column("id", sa.CHAR(36), primary_key=True),
        sa.Column("user_id", sa.CHAR(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("insight_type", sa.String(50), nullable=False),
        sa.Column("severity", sa.String(20), nullable=False, server_default="info"),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("related_condition", sa.String(64), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "severity IN ('info', 'warning', 'critical', 'achievement')",
            name="chk_insight_severity",
        ),
    )
    op.create_index("idx_health_insights_user", "health_insights_log", ["user_id", "is_read"])


def downgrade() -> None:
    op.drop_table("health_insights_log")
    op.drop_table("meal_entries")
    op.drop_table("packaged_food_audits")
    op.drop_table("custom_foods")
    op.drop_table("verified_food_reference")
    op.drop_table("daily_food_diaries")
    op.drop_table("daily_macro_budgets")
    op.drop_table("user_medical_conditions")
    op.drop_table("user_profiles")
