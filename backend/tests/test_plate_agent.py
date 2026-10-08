"""
BiteIQ - Unit Test Suite for AI Meal Plate Vision Agent (plate_agent.py).
Tests bounding box coordinate clamping, ground-truth fallback fidelity,
mass invariant Atwater corrections, clinical warning enrichment, and MIME sniffing.
"""

from unittest.mock import AsyncMock, patch
import pytest

from ai.src.pipeline.plate_agent import PlateVisionAgent
from backend.src.schemas.meals import DetectedFoodItem, PlateAnalysisResult, PlateSummary


def test_bounding_box_coordinate_clamping():
    """
    Ensures spatial bounding boxes are clamped strictly within [0, 1000].
    """
    item = DetectedFoodItem(
        name="Test Dal",
        category="Lentil/Dal",
        estimated_grams=150.0,
        confidence_score=0.90,
        bounding_box=[-50, 100, 1200, 850],
        calories=140.0,
        protein_g=8.0,
        carbs_g=20.0,
        fat_g=3.0,
        serving_description="1 Katori",
    )
    assert item.bounding_box == [0, 100, 1000, 850]


@pytest.mark.asyncio
async def test_ground_truth_fallback_execution():
    """
    Verifies that when third-party keys are absent or invalid, the agent
    falls back cleanly to deterministic ICMR-NIN 2024 ground-truth items.
    """
    agent = PlateVisionAgent(api_key="", groq_key="")
    dummy_image = b"\xFF\xD8\xFF\xE0\x00\x10JFIF" + b"\x00" * 100  # Mock JPEG bytes

    result = await agent.analyze_plate(dummy_image, user_conditions=["hypertension"])
    assert isinstance(result, PlateAnalysisResult)
    assert len(result.items) >= 3

    # Check that authentic Indian thali staples are present
    names = [i.name for i in result.items]
    assert any("Toor Dal" in n for n in names)
    assert any("Roti" in n for n in names)
    assert any("Salad" in n for n in names)

    # Check plate summary math
    assert result.plate_summary.total_calories > 300.0
    assert result.plate_summary.total_protein_g > 10.0
    assert result.plate_summary.total_carbs_g > 50.0


@pytest.mark.asyncio
async def test_mass_invariant_atwater_correction():
    """
    If raw VLM output produces calories conflicting with the Atwater equation (> 20% deviation),
    the agent must deterministically self-correct item calories to (4P + 4C + 9F + 2Fib).
    """
    agent = PlateVisionAgent(api_key="", groq_key="")

    # Mock raw result with heavily hallucinated calories (100 kcal instead of 4*10 + 4*20 + 9*10 + 2*5 = 220 kcal)
    mock_item = DetectedFoodItem(
        name="Hallucinated Paneer Dish",
        category="Curry",
        estimated_grams=120.0,
        confidence_score=0.88,
        bounding_box=[100, 100, 500, 500],
        calories=100.0,  # Severely understated energy
        protein_g=10.0,  # 40 kcal
        carbs_g=20.0,    # 80 kcal
        fat_g=10.0,      # 90 kcal
        fiber_g=5.0,     # 10 kcal -> Theoretical = 220 kcal
        serving_description="1 Portion",
    )
    mock_raw = PlateAnalysisResult(
        analysis_id="test-analysis-1",
        items=[mock_item],
        plate_summary=PlateSummary(
            total_calories=100.0,
            total_protein_g=10.0,
            total_carbs_g=20.0,
            total_fat_g=10.0,
        ),
        health_verdict="Test verdict",
        warnings=[],
    )

    with patch.object(agent, "_generate_ground_truth_fallback", return_value=mock_raw):
        result = await agent.analyze_plate(b"dummy_bytes")
        corrected_item = result.items[0]
        # Must be corrected to 220.0 kcal
        assert corrected_item.calories == 220.0
        assert result.plate_summary.total_calories == 220.0


@pytest.mark.asyncio
async def test_clinical_warning_enrichment_for_diabetes():
    """
    Verifies that when a user has 'diabetes_type_2', logged items with high net carbs
    receive personalized glycemic spike warnings in item.clinical_warnings and result.warnings.
    """
    agent = PlateVisionAgent(api_key="", groq_key="")

    # Fallback thali has Whole Wheat Roti with 42g carbs, 5.2g fiber -> net carbs 36.8g
    # Let's add a sweet dessert item with > 40g net carbs to test interception
    high_carb_item = DetectedFoodItem(
        name="Sweet Gulab Jamun",
        category="Sweet",
        estimated_grams=100.0,
        confidence_score=0.95,
        bounding_box=[600, 600, 800, 800],
        calories=350.0,
        protein_g=4.0,
        carbs_g=55.0,
        fat_g=13.0,
        fiber_g=0.5,
        sugar_g=40.0,
        serving_description="2 Pieces",
    )
    mock_raw = PlateAnalysisResult(
        analysis_id="test-analysis-2",
        items=[high_carb_item],
        plate_summary=PlateSummary(
            total_calories=350.0,
            total_protein_g=4.0,
            total_carbs_g=55.0,
            total_fat_g=13.0,
        ),
        health_verdict="Sweet dish",
        warnings=[],
    )

    with patch.object(agent, "_generate_ground_truth_fallback", return_value=mock_raw):
        result = await agent.analyze_plate(b"dummy_bytes", user_conditions=["diabetes_type_2"])
        assert len(result.warnings) > 0
        warning_str = " ".join(result.warnings).lower()
        assert "glycemic" in warning_str or "sugar" in warning_str


def test_mime_type_sniffing():
    """
    Tests magic byte sniffing for JPEG, PNG, and WebP formats.
    """
    agent = PlateVisionAgent()
    jpeg_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF"
    png_bytes = b"\x89PNG\r\n\x1a\n"
    webp_bytes = b"RIFF\x00\x00\x00\x00WEBPVP8 "
    unknown_bytes = b"GIF89a"

    assert agent._detect_mime(jpeg_bytes) == "image/jpeg"
    assert agent._detect_mime(png_bytes) == "image/png"
    assert agent._detect_mime(webp_bytes) == "image/webp"
    assert agent._detect_mime(unknown_bytes) == "image/jpeg"
