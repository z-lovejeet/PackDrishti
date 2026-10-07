"""
BiteIQ - Pydantic v2 Schemas for Clinical Health Insights & Indian Food Swaps.
"""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class InsightResponse(BaseModel):
    id: uuid.UUID
    insight_type: str
    severity: str
    title: str
    message: str
    related_condition: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WholeFoodSwapItem(BaseModel):
    category: str
    original_item: str
    swap_name: str
    swap_advantage: str
    calorie_difference: str

    model_config = ConfigDict(from_attributes=True)
