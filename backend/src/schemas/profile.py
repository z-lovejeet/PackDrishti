"""
BiteIQ - Pydantic v2 Schemas for User Biometric Profile & Macro Budgets.
"""

import uuid
from datetime import date
from typing import List, Literal, Optional, Union
from pydantic import BaseModel, ConfigDict, Field


class ConditionItem(BaseModel):
    condition_key: str
    severity: str = "moderate"
    notes: Optional[str] = None
    diagnosed_date: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)


class ProfileUpdateRequest(BaseModel):
    age: int = Field(ge=10, le=120, description="Age in completed years (10-120)")
    biological_sex: Literal["male", "female"]
    height_cm: float = Field(ge=80.0, le=260.0, description="Height in centimeters (80-260)")
    current_weight_kg: float = Field(ge=25.0, le=400.0, description="Current weight in kilograms (25-400)")
    target_weight_kg: float = Field(ge=25.0, le=400.0, description="Goal target weight in kilograms (25-400)")
    body_fat_percentage: Optional[float] = Field(None, ge=3.0, le=60.0, description="Optional body fat percentage")
    activity_level: Literal[
        "sedentary",
        "lightly_active",
        "moderately_active",
        "very_active",
        "extra_active",
    ] = "sedentary"
    primary_goal: Literal[
        "rapid_fat_loss",
        "moderate_fat_loss",
        "maintenance",
        "clean_lean_bulk",
        "aggressive_hypertrophy",
        "metabolic_reversal",
    ] = "maintenance"
    diet_type: str = "standard_omnivore"
    conditions: List[Union[str, ConditionItem]] = Field(default_factory=list)


class MacroBudgetResponse(BaseModel):
    target_calories: float
    target_protein_g: float
    target_carbs_g: float
    target_fat_g: float
    target_fiber_g: float
    ceiling_sodium_mg: float
    ceiling_added_sugar_g: float
    ceiling_saturated_fat_g: float
    ceiling_trans_fat_g: float
    target_water_ml: float
    bmr_kcal: float
    tdee_kcal: float
    is_clamped_to_floor: bool
    safety_advisory: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProfileResponse(BaseModel):
    user_id: uuid.UUID
    age: int
    biological_sex: str
    height_cm: float
    current_weight_kg: float
    target_weight_kg: float
    body_fat_percentage: Optional[float]
    activity_level: str
    primary_goal: str
    diet_type: str
    bmr_kcal: float
    tdee_kcal: float
    conditions: List[ConditionItem]
    macro_budget: Optional[MacroBudgetResponse] = None

    model_config = ConfigDict(from_attributes=True)
