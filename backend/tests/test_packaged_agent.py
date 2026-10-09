"""
BiteIQ - Unit Tests for Packaged Food Multimodal Agent & ICMR-NIN 2024 Profiling.
Tests ground-truth fallback generation, ICMR deductions, 3-tier additive grading,
and expiry verification relative to September 2026.
"""

import pytest
from ai.src.pipeline.health_agent import (
    MultimodalHealthAgent,
    MultimodalHealthAnalysis,
    HealthBadge,
    NutrientAuditItem,
)
from backend.src.schemas.packaged import NutrientsPer100gSchema


@pytest.fixture
def agent():
    return MultimodalHealthAgent()


@pytest.mark.asyncio
async def test_ground_truth_fallback_generation(agent):
    """
    Verifies that the ground-truth fallback generates a compliant MultimodalHealthAnalysis
    with realistic ICMR scores, palm oil detection, badges, and nutrients.
    """
    front_bytes = b"fake_front_image_content"
    back_bytes = b"fake_back_image_content"

    result = agent._generate_ground_truth_fallback(
        image_parts=[front_bytes, back_bytes],
        product_name_hint="Bingo! Tedhe Medhe Masala Tadka",
        brand_hint="Bingo! (ITC)",
    )

    assert isinstance(result, MultimodalHealthAnalysis)
    assert result.commodityName == "Bingo! Tedhe Medhe Masala Tadka"
    assert result.brandName == "Bingo! (ITC)"
    assert 0 <= result.ratingScore <= 100
    assert result.hasPalmOil is True
    assert len(result.badges) > 0
    assert len(result.nutrients) >= 5
    assert len(result.healthierAlternatives) >= 2

    # Verify nutrients extraction helper
    flat_nutrients = result.to_nutrients_per_100g_dict()
    assert flat_nutrients["energy_kcal"] > 300.0
    assert flat_nutrients["protein_g"] > 0.0
    assert flat_nutrients["total_fat_g"] > 10.0
    assert flat_nutrients["sodium_mg"] > 400.0

    # Ensure Pydantic schema parses it without validation error
    schema_obj = NutrientsPer100gSchema(**flat_nutrients)
    assert schema_obj.energy_kcal == flat_nutrients["energy_kcal"]


def test_artificial_colors_quality_grading():
    """
    Tests 3-tier colorant quality grading:
    Grade A (Wholesome Natural), Grade B (Permitted Synthetic), Grade C (High Concern Azo Dye).
    """
    # Grade C: Tartrazine (INS 102)
    analysis_azo = MultimodalHealthAnalysis(
        commodityName="Neon Orange Candy",
        brandName="SweetCorp",
        ingredientsList=["Sugar", "Liquid Glucose", "Color (INS 102 - Tartrazine, INS 110)"],
    )
    assert len(analysis_azo.artificialColors) >= 1
    grades = [c.grade for c in analysis_azo.artificialColors]
    assert any("Grade C" in g for g in grades)

    # Grade A: Beetroot Red (INS 162)
    analysis_natural = MultimodalHealthAnalysis(
        commodityName="Organic Berry Juice",
        brandName="PureHarvest",
        ingredientsList=["Water", "Beetroot Juice Extract (INS 162)", "Natural Flavors"],
    )
    assert len(analysis_natural.artificialColors) >= 1
    assert any("Grade A" in c.grade for c in analysis_natural.artificialColors)


def test_expiry_detection_relative_to_september_2026():
    """
    Tests that expired products relative to September 2026 receive score = 0,
    Critical Hazard status, and biological hazard warning badges.
    """
    analysis_expired = MultimodalHealthAnalysis(
        commodityName="Old Potato Crisps",
        brandName="SnackCo",
        mfgDate="01/2024",
        expiryDate="06/2024",  # Expired relative to September 2026
        nutrients=[
            NutrientAuditItem(name="Energy", valuePer100g=520.0, unit="kcal"),
            NutrientAuditItem(name="Protein", valuePer100g=6.0, unit="g"),
            NutrientAuditItem(name="Total Fat", valuePer100g=30.0, unit="g"),
            NutrientAuditItem(name="Sodium", valuePer100g=500.0, unit="mg"),
        ],
    )

    assert analysis_expired.isExpired is True
    assert analysis_expired.expiryStatus == "expired"
    assert analysis_expired.ratingScore == 0
    assert "Critical Hazard" in analysis_expired.overallRating
    assert "DO NOT CONSUME" in analysis_expired.shouldWeEatIt.upper()

    badge_labels = [b.label for b in analysis_expired.badges]
    assert "EXPIRED PRODUCT" in badge_labels
    assert "BIOLOGICAL HAZARD" in badge_labels


def test_to_nutrients_per_100g_dict_conversion():
    """
    Tests accurate mapping of various nutrient key spellings and unit conversions.
    """
    analysis = MultimodalHealthAnalysis(
        commodityName="Test Nutritious Puffs",
        nutrients=[
            NutrientAuditItem(name="Calories (Energy)", valuePer100g=450.0, unit="kcal"),
            NutrientAuditItem(name="Crude Protein", valuePer100g=12.5, unit="g"),
            NutrientAuditItem(name="Total Carbohydrates", valuePer100g=65.0, unit="g"),
            NutrientAuditItem(name="Total Sugars", valuePer100g=8.0, unit="g"),
            NutrientAuditItem(name="Added Sugars", valuePer100g=3.5, unit="g"),
            NutrientAuditItem(name="Total Fat", valuePer100g=15.0, unit="g"),
            NutrientAuditItem(name="Saturated Fatty Acids", valuePer100g=4.2, unit="g"),
            NutrientAuditItem(name="Trans Fatty Acids", valuePer100g=0.05, unit="g"),
            NutrientAuditItem(name="Dietary Fiber", valuePer100g=6.8, unit="g"),
            NutrientAuditItem(name="Sodium", valuePer100g=420.0, unit="mg"),
        ],
    )

    flat = analysis.to_nutrients_per_100g_dict()
    assert flat["energy_kcal"] == 450.0
    assert flat["protein_g"] == 12.5
    assert flat["total_carbs_g"] == 65.0
    assert flat["total_sugars_g"] == 8.0
    assert flat["added_sugars_g"] == 3.5
    assert flat["total_fat_g"] == 15.0
    assert flat["saturated_fat_g"] == 4.2
    assert flat["trans_fat_g"] == 0.05
    assert flat["dietary_fiber_g"] == 6.8
    assert flat["sodium_mg"] == 420.0
