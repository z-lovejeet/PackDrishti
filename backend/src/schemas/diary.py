"""
BiteIQ - Pydantic v2 Schemas for Daily Food Diary, Meal Entries, and Macro Tracking.
"""

import uuid
from datetime import date, datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class MealEntryCreateRequest(BaseModel):
    diary_date: Optional[date] = None  # Defaults to today in server/user local time
    meal_type: Literal["breakfast", "lunch", "dinner", "snack"]
    food_name: str = Field(min_length=1, max_length=255)
    source_type: str = "manual_search"
    verified_food_id: Optional[uuid.UUID] = None
    custom_food_id: Optional[uuid.UUID] = None
    packaged_audit_id: Optional[uuid.UUID] = None
    serving_quantity: float = Field(default=1.0, gt=0.0)
    serving_unit: str = "serving"
    weight_in_grams: float = Field(gt=0.0)
    calories: float = Field(ge=0.0)
    protein_g: float = Field(ge=0.0)
    carbs_g: float = Field(ge=0.0)
    fat_g: float = Field(ge=0.0)
    fiber_g: float = Field(default=0.0, ge=0.0)
    sodium_mg: float = Field(default=0.0, ge=0.0)
    sugar_g: float = Field(default=0.0, ge=0.0)
    metadata_json: Optional[Dict[str, Any]] = None


class MealEntryUpdateRequest(BaseModel):
    serving_quantity: Optional[float] = Field(None, gt=0.0)
    serving_unit: Optional[str] = None
    weight_in_grams: Optional[float] = Field(None, gt=0.0)
    calories: Optional[float] = Field(None, ge=0.0)
    protein_g: Optional[float] = Field(None, ge=0.0)
    carbs_g: Optional[float] = Field(None, ge=0.0)
    fat_g: Optional[float] = Field(None, ge=0.0)
    fiber_g: Optional[float] = Field(None, ge=0.0)
    sodium_mg: Optional[float] = Field(None, ge=0.0)
    sugar_g: Optional[float] = Field(None, ge=0.0)


class MealEntryResponse(BaseModel):
    id: uuid.UUID
    diary_id: uuid.UUID
    meal_type: str
    food_name: str
    source_type: str
    serving_quantity: float
    serving_unit: str
    weight_in_grams: float
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sodium_mg: float
    sugar_g: float
    metadata_json: Optional[Dict[str, Any]] = None
    logged_at: datetime
    clinical_warnings: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class WaterLogRequest(BaseModel):
    diary_date: Optional[date] = None
    amount_ml: float = Field(default=250.0, gt=0.0, le=5000.0)


class DailyBudgetSummary(BaseModel):
    target_calories: float
    target_protein_g: float
    target_carbs_g: float
    target_fat_g: float
    target_fiber_g: float
    ceiling_sodium_mg: float
    ceiling_added_sugar_g: float
    target_water_ml: float

    model_config = ConfigDict(from_attributes=True)


class TotalsConsumedSummary(BaseModel):
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sodium_mg: float
    sugar_g: float
    water_ml: float

    model_config = ConfigDict(from_attributes=True)


class RemainingBudgetSummary(BaseModel):
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float


class DiaryResponse(BaseModel):
    diary_id: uuid.UUID
    diary_date: date
    budget: DailyBudgetSummary
    totals_consumed: TotalsConsumedSummary
    remaining: RemainingBudgetSummary
    meals: Dict[str, List[MealEntryResponse]]
    adherence_status: str

    model_config = ConfigDict(from_attributes=True)
