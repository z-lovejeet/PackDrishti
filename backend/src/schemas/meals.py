"""
BiteIQ - Pydantic v2 Schemas for AI Meal Plate Computer Vision & Confirmation.
"""

from datetime import date
from typing import Any, Dict, List, Literal, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field, field_validator


class DetectedFoodItem(BaseModel):
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique identifier for this detected item on the plate",
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Culinary name of the food item (e.g., 'Toor Dal Tadka', 'Jeera Rice')",
    )
    hindi_name: Optional[str] = Field(
        None,
        description="Localized Hindi or regional culinary name (e.g., 'तूर दाल तड़का')",
    )
    category: str = Field(
        ...,
        description="Category: 'Grain', 'Lentil/Dal', 'Curry', 'Bread', 'Dairy', 'Meat', 'Salad', 'Snack'",
    )
    estimated_grams: float = Field(
        ...,
        gt=0.0,
        le=2000.0,
        description="Estimated physical mass in grams based on visual volume",
    )
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="VLM detection confidence score",
    )
    bounding_box: List[int] = Field(
        ...,
        min_length=4,
        max_length=4,
        description="Normalized spatial coordinates [ymin, xmin, ymax, xmax] on a 0-1000 scale",
    )
    calories: float = Field(
        ...,
        ge=0.0,
        description="Total computed energy in kcal for the estimated weight",
    )
    protein_g: float = Field(
        ...,
        ge=0.0,
        description="Total protein in grams",
    )
    carbs_g: float = Field(
        ...,
        ge=0.0,
        description="Total carbohydrate content in grams",
    )
    fat_g: float = Field(
        ...,
        ge=0.0,
        description="Total fat content in grams",
    )
    fiber_g: float = Field(
        default=0.0,
        ge=0.0,
        description="Dietary fiber in grams",
    )
    sodium_mg: float = Field(
        default=0.0,
        ge=0.0,
        description="Estimated sodium content in milligrams",
    )
    sugar_g: float = Field(
        default=0.0,
        ge=0.0,
        description="Estimated sugar content in grams",
    )
    serving_description: str = Field(
        ...,
        description="Human-readable measure: '1 Standard Katori (150g)', '2 Medium Rotis'",
    )
    clinical_warnings: List[str] = Field(
        default_factory=list,
        description="Personalized warnings if item conflicts with user's conditions",
    )

    @field_validator("bounding_box")
    @classmethod
    def clamp_coordinates(cls, v: List[int]) -> List[int]:
        """Ensures bounding boxes stay strictly inside [0, 1000] coordinate space."""
        return [max(0, min(1000, int(coord))) for coord in v]

    model_config = ConfigDict(from_attributes=True)


class PlateSummary(BaseModel):
    total_calories: float = Field(ge=0.0)
    total_protein_g: float = Field(ge=0.0)
    total_carbs_g: float = Field(ge=0.0)
    total_fat_g: float = Field(ge=0.0)
    total_fiber_g: float = Field(default=0.0, ge=0.0)
    total_sodium_mg: float = Field(default=0.0, ge=0.0)

    model_config = ConfigDict(from_attributes=True)


class PlateAnalysisResult(BaseModel):
    analysis_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique UUID for this plate visual session",
    )
    items: List[DetectedFoodItem] = Field(
        ...,
        description="List of segmented food items identified on the plate",
    )
    plate_summary: PlateSummary = Field(
        ...,
        description="Aggregate nutritional yield of the entire plate",
    )
    health_verdict: str = Field(
        ...,
        description="Clinical evaluation summary of the overall meal composition",
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="Consolidated clinical contraindication warnings for the user",
    )

    model_config = ConfigDict(from_attributes=True)


class ConfirmedPlateItem(BaseModel):
    food_name: str = Field(..., min_length=1, max_length=255)
    serving_quantity: float = Field(default=1.0, gt=0.0)
    serving_unit: str = Field(default="serving", max_length=64)
    weight_in_grams: float = Field(gt=0.0)
    calories: float = Field(ge=0.0)
    protein_g: float = Field(ge=0.0)
    carbs_g: float = Field(ge=0.0)
    fat_g: float = Field(ge=0.0)
    fiber_g: float = Field(default=0.0, ge=0.0)
    sodium_mg: float = Field(default=0.0, ge=0.0)
    sugar_g: float = Field(default=0.0, ge=0.0)
    bounding_box: Optional[List[int]] = None
    confidence_score: Optional[float] = None


class ConfirmPlateLogRequest(BaseModel):
    diary_date: Optional[date] = None  # Defaults to today if omitted
    meal_type: Literal["breakfast", "lunch", "dinner", "snack"]
    items: List[ConfirmedPlateItem] = Field(
        ...,
        min_length=1,
        description="List of user-verified plate items to commit into the food diary",
    )


class ConfirmPlateLogResponse(BaseModel):
    status: str = "success"
    diary_id: uuid.UUID
    diary_date: date
    meal_type: str
    logged_entries_count: int
    total_calories_logged: float
    total_protein_logged: float
    total_carbs_logged: float
    total_fat_logged: float
    clinical_warnings_count: int
