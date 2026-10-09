"""
BiteIQ - Pydantic v2 Schemas for Packaged Food Scanner & Diary Bridge.
Defines data structures for ICMR-NIN 2024 profiling, additive audits,
clinical contraindication checks, and proportional diary logging.
"""

from datetime import date, datetime
from typing import Any, Dict, List, Optional
import uuid

from pydantic import BaseModel, Field, ConfigDict


class NutrientItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., description="Nutrient title (e.g., Energy, Protein, Saturated Fat)")
    value_per_100g: float = Field(0.0, description="Declared or measured value per 100g/ml")
    value_per_serve: float = Field(0.0, description="Calculated or declared value per single serving portion")
    unit: str = Field("g", description="Measurement unit (g, mg, kcal)")
    icmr_daily_limit: Optional[str] = Field(None, description="ICMR-NIN 2024 recommended ceiling or daily reference")
    level: Optional[str] = Field("Moderate", description="Risk level (Low, Moderate, High, Excessive)")
    assessment: Optional[str] = Field(None, description="Nutritional assessment commentary")


class BadgeItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = Field(None, description="Standard badge identifier")
    label: str = Field(..., description="Badge label (e.g., High Palm Oil, High Sodium)")
    severity: str = Field("warning", description="Severity classification: danger, warning, good, neutral")
    description: Optional[str] = Field(None, description="Detailed explanation of the health marker")


class AdditiveAuditItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: Optional[str] = Field(None, description="INS or E-number code (e.g., INS 627, INS 102)")
    name: str = Field(..., description="Chemical or common name of the food additive")
    type: Optional[str] = Field(None, description="Additive function (Colorant, Flavour Enhancer, Preservative)")
    grade: str = Field("Grade B (Permitted Synthetic)", description="3-Tier Quality Grade (Grade A, Grade B, Grade C)")
    advisory: Optional[str] = Field(None, description="Clinical or consumer advisory note")


class NutrientsPer100gSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    energy_kcal: float = Field(0.0, description="Energy in kcal per 100g")
    protein_g: float = Field(0.0, description="Protein in grams per 100g")
    total_carbs_g: float = Field(0.0, description="Total carbohydrates in grams per 100g")
    total_sugars_g: float = Field(0.0, description="Total sugars in grams per 100g")
    added_sugars_g: float = Field(0.0, description="Added industrial sugars in grams per 100g")
    total_fat_g: float = Field(0.0, description="Total lipids in grams per 100g")
    saturated_fat_g: float = Field(0.0, description="Saturated fatty acids in grams per 100g")
    trans_fat_g: float = Field(0.0, description="Trans fatty acids in grams per 100g")
    sodium_mg: float = Field(0.0, description="Sodium in milligrams per 100g")
    dietary_fiber_g: float = Field(0.0, description="Dietary fiber in grams per 100g")


class ContraindicationAlertSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    condition: str = Field(..., description="Target medical condition key (e.g., hypertension, type2_diabetes)")
    severity: str = Field("warning", description="Alert severity: warning, critical, info")
    alert: str = Field(..., description="Actionable clinical warning text")


class ClinicalAdvisorySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    should_we_eat_it: str = Field("Consume in Strict Moderation", description="Direct consumer verdict")
    how_bad_is_it: str = Field("Ultra-processed packaged food commodity.", description="Comprehensive product assessment")
    not_eatable_for_age: List[str] = Field(default_factory=list, description="Vulnerable age groups")
    who_can_consume: List[str] = Field(default_factory=list, description="Target demographic guidelines")
    who_should_avoid: List[str] = Field(default_factory=list, description="Clinical exclusion populations")
    health_problems: List[str] = Field(default_factory=list, description="Potential health risks from regular intake")
    has_palm_oil: bool = Field(False, description="Whether product contains palm oil or palmolein")
    palm_oil_details: Optional[str] = Field(None, description="Details regarding palm oil formulation")
    has_added_sugar: bool = Field(False, description="Whether product contains added sugars or syrups")
    has_high_sodium: bool = Field(False, description="Whether sodium exceeds ICMR-NIN thresholds")
    has_artificial_additives: bool = Field(False, description="Whether synthetic additives or azo dyes are present")
    ingredients_list: List[str] = Field(default_factory=list, description="Declared ingredients in descending mass order")
    flagged_ingredients: List[Dict[str, str]] = Field(default_factory=list, description="Ingredients with health concerns")


class PackagedAuditData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    audit_id: uuid.UUID = Field(..., description="Unique packaged audit identifier")
    product_name: str = Field(..., description="Product or variant name")
    brand_name: str = Field(..., description="Manufacturer or brand name")
    category: str = Field("Packaged Food", description="Food classification")
    health_score: float = Field(..., ge=0.0, le=100.0, description="ICMR-NIN 2024 calibrated score (0-100)")
    score_band: str = Field(..., description="Score band (Nutritious Choice, Consume in Moderation, High Health Concern, Critical Hazard - Expired Food)")
    mrp: Optional[float] = Field(None, description="Maximum Retail Price in INR")
    net_quantity_g: Optional[float] = Field(None, description="Declared net quantity in grams")
    price_per_100g: Optional[float] = Field(None, description="Unit Sale Price per 100g in INR")
    price_rating: Optional[str] = Field("Fair Market Rate", description="Economic assessment (Budget, Fair Market Rate, Premium)")
    mfg_date: Optional[str] = Field(None, description="Printed manufacturing date")
    expiry_date: Optional[str] = Field(None, description="Printed or calculated expiry date")
    is_expired: bool = Field(False, description="Whether product is expired relative to reference date")
    nutrients_per_100g: NutrientsPer100gSchema = Field(..., description="Normalized nutrients per 100g")
    nutrients_raw: List[NutrientItemSchema] = Field(default_factory=list, description="Complete extracted nutrient facts table")
    badges: List[BadgeItemSchema] = Field(default_factory=list, description="Evaluated health markers and hazard badges")
    additives_audit: List[AdditiveAuditItemSchema] = Field(default_factory=list, description="3-Tier evaluated chemical additives")
    contraindication_alerts: List[ContraindicationAlertSchema] = Field(default_factory=list, description="Active user clinical warnings")
    healthier_alternatives: List[str] = Field(default_factory=list, description="Recommended clean Indian whole-food swaps")
    clinical_advisory: ClinicalAdvisorySchema = Field(..., description="Deep clinical advisory breakdown")
    front_image_url: Optional[str] = Field(None, description="Front packaging panel image reference")
    back_image_url: Optional[str] = Field(None, description="Back packaging panel image reference")
    created_at: datetime = Field(..., description="Timestamp of scan audit")


class PackagedAuditResponse(BaseModel):
    status: str = Field("success", description="API status code")
    data: PackagedAuditData = Field(..., description="Complete audit details")
    timestamp: datetime = Field(..., description="Response generation timestamp")


class LogPackagedToDiaryRequest(BaseModel):
    audit_id: uuid.UUID = Field(..., description="ID of previously audited packaged product")
    diary_date: Optional[date] = Field(None, description="Target diary date (default: today)")
    meal_type: str = Field(
        ...,
        pattern=r"^(breakfast|lunch|dinner|snack)$",
        description="Target meal slot (breakfast, lunch, dinner, snack)",
    )
    consumed_grams: float = Field(
        ...,
        gt=0.0,
        le=5000.0,
        description="Weight of consumed portion in grams",
    )
    serving_unit: Optional[str] = Field(
        "serving",
        description="Human-readable serving description (e.g., '0.5 pack', '1 pack (55g)', '30g')",
    )


class LogPackagedToDiaryResponse(BaseModel):
    status: str = Field("success", description="API status code")
    meal_entry_id: uuid.UUID = Field(..., description="Created MealEntry UUID")
    diary_id: uuid.UUID = Field(..., description="Updated DailyFoodDiary UUID")
    diary_date: date = Field(..., description="Date of the food diary")
    meal_type: str = Field(..., description="Meal category")
    food_name: str = Field(..., description="Product name logged")
    consumed_grams: float = Field(..., description="Consumed mass in grams")
    calories_logged: float = Field(..., description="Proportionally scaled calories")
    protein_logged: float = Field(..., description="Proportionally scaled protein in grams")
    carbs_logged: float = Field(..., description="Proportionally scaled carbs in grams")
    fat_logged: float = Field(..., description="Proportionally scaled fat in grams")
    fiber_logged: float = Field(..., description="Proportionally scaled fiber in grams")
    sodium_logged: float = Field(..., description="Proportionally scaled sodium in mg")
    sugar_logged: float = Field(..., description="Proportionally scaled sugar in grams")
    contraindications_logged: int = Field(0, description="Count of clinical warnings logged to insights")


class PackagedAuditSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="Audit UUID")
    product_name: str = Field(..., description="Product name")
    brand_name: str = Field(..., description="Brand name")
    category: str = Field("Packaged Food", description="Food category")
    health_score: float = Field(..., description="Health score (0-100)")
    score_band: str = Field(..., description="Score band description")
    mrp: Optional[float] = Field(None, description="Maximum Retail Price in INR")
    is_expired: bool = Field(False, description="Expiry flag")
    created_at: datetime = Field(..., description="Date of audit creation")


class PackagedHistoryListResponse(BaseModel):
    status: str = Field("success", description="API status code")
    items: List[PackagedAuditSummaryResponse] = Field(default_factory=list, description="List of audit summaries")
    total: int = Field(0, description="Total audit records for user")
    skip: int = Field(0, description="Pagination offset")
    limit: int = Field(20, description="Pagination page limit")
