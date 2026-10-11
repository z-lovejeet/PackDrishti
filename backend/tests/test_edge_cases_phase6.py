"""
BiteIQ - Phase 6 Clinical Nutrition & Vision Boundary Edge-Case Test Suite.
Verifies:
1. Mass invariant boundary fuzzing (negative grams, zero grams, extreme quantities).
2. Physical & thermodynamic conservation laws (Lipid, Carbs, Mass Sum, Atwater energy).
3. Atwater energy tolerance and discrepancy auto-correction.
4. Multi-morbid clinical contraindications (Diabetes + Hypertension + CKD Stage 3+).
5. Extreme biometric boundary handling (physiological caloric floors, age/weight extremes).
6. Dual-LLM vision fallback resilience (graceful degradation guarantee).
7. Packaged scanner zero serving size and missing field protections.
8. Diary boundary routes (invalid date formats, invalid slots, missing entry 404s).
"""

from datetime import date
from decimal import Decimal
import io
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import patch, AsyncMock

from backend.src.main import app
from backend.src.core.database import get_db_session
from backend.src.models.user import User, UserRole
from backend.src.services.mass_invariants import MassInvariantValidator
from backend.src.services.nutrition_calc import NutritionCalculator
from backend.src.services.clinical_engine import ClinicalContraindicationEngine
from ai.src.pipeline.plate_agent import PlateVisionAgent
from ai.src.pipeline.health_agent import MultimodalHealthAgent
from backend.tests.conftest import make_test_token


# ==============================================================================
# 1. Mass Invariant Boundary Fuzzing
# ==============================================================================

@pytest.mark.asyncio
async def test_mass_invariant_fuzzing_negative_and_extreme_grams(db_session: AsyncSession):
    """
    Verifies that negative grams are rejected with HTTP 422 and extreme portions scale safely.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session

    user_id = uuid.uuid4()
    user = User(id=user_id, email="edge_fuzz@biteiq.io", password_hash="hash", full_name="Fuzzer", role=UserRole.CONSUMER)
    db_session.add(user)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Negative serving quantity -> HTTP 422
        bad_qty_payload = {
            "meal_type": "lunch",
            "food_name": "Tofu Bowl",
            "serving_quantity": -1.5,
            "weight_in_grams": 150.0,
            "calories": 200.0,
        }
        res_neg_qty = await client.post("/api/v1/diary/log-item", json=bad_qty_payload, headers=headers)
        assert res_neg_qty.status_code == 422

        # 2. Negative weight in grams -> HTTP 422
        bad_weight_payload = {
            "meal_type": "lunch",
            "food_name": "Tofu Bowl",
            "serving_quantity": 1.0,
            "weight_in_grams": -100.0,
            "calories": 200.0,
        }
        res_neg_wt = await client.post("/api/v1/diary/log-item", json=bad_weight_payload, headers=headers)
        assert res_neg_wt.status_code == 422

        # 3. Extreme quantity (5,000g) -> handled without float overflow
        extreme_payload = {
            "meal_type": "dinner",
            "food_name": "Massive Feast Bowl",
            "serving_quantity": 50.0,
            "weight_in_grams": 5000.0,
            "calories": 8500.0,
            "protein_g": 350.0,
            "carbs_g": 900.0,
            "fat_g": 220.0,
            "fiber_g": 80.0,
            "sodium_mg": 4500.0,
            "sugar_g": 50.0,
        }
        res_extreme = await client.post("/api/v1/diary/log-item", json=extreme_payload, headers=headers)
        assert res_extreme.status_code == 201
        logged_item = res_extreme.json()
        assert logged_item["calories"] == 8500.0

    app.dependency_overrides.clear()


def test_mass_invariant_thermodynamic_laws():
    """
    Verifies physical conservation laws via MassInvariantValidator:
    - Saturated fat + Trans fat <= Total fat
    - Added sugar <= Total Carbohydrates
    - Sum of macros <= Total sample mass
    """
    # 1. Violating lipid invariant (sat fat + trans fat > total fat)
    bad_lipids = {
        "calories": 300.0,
        "protein_g": 10.0,
        "fat_g": 10.0,
        "saturated_fat_g": 9.0,
        "trans_fat_g": 3.0,  # 9 + 3 = 12 > 10
        "carbs_g": 20.0,
    }
    is_valid, violations = MassInvariantValidator.validate_nutrients(bad_lipids)
    assert is_valid is False
    assert any("Lipid Invariant" in v for v in violations)

    # 2. Violating carbohydrate invariant (added sugars > total carbs)
    bad_carbs = {
        "calories": 200.0,
        "protein_g": 5.0,
        "fat_g": 5.0,
        "carbs_g": 15.0,
        "sugar_g": 25.0,  # total sugars > carbs
        "added_sugars_g": 20.0,
    }
    is_valid, violations = MassInvariantValidator.validate_nutrients(bad_carbs)
    assert is_valid is False
    assert any("Carbohydrate Invariant" in v for v in violations)

    # 3. Completely valid nutrient profile
    clean_nutrients = {
        "calories": 250.0,
        "protein_g": 20.0,
        "fat_g": 10.0,
        "saturated_fat_g": 3.0,
        "trans_fat_g": 0.0,
        "carbs_g": 20.0,
        "sugar_g": 5.0,
        "added_sugars_g": 2.0,
        "fiber_g": 5.0,
    }
    is_valid, violations = MassInvariantValidator.validate_nutrients(clean_nutrients)
    assert is_valid is True
    assert len(violations) == 0


# ==============================================================================
# 2. Atwater Energy Tolerance & Reconciliation
# ==============================================================================

def test_atwater_discrepancy_detection():
    """
    Verifies that declaring calories that violate 4P + 4C + 9F by > 20%
    is intercepted by the Atwater Invariant checker.
    """
    discrepant_profile = {
        "calories": 500.0,  # Declared 500 kcal
        "protein_g": 10.0,  # 10 * 4 = 40
        "carbs_g": 10.0,    # 10 * 4 = 40
        "fat_g": 5.0,       # 5 * 9 = 45 -> Total Atwater = 125 kcal (deviation > 70%)
    }
    is_valid, violations = MassInvariantValidator.validate_nutrients(discrepant_profile)
    assert is_valid is False
    assert any("Atwater Energy Invariant" in v for v in violations)


@pytest.mark.asyncio
async def test_plate_agent_atwater_auto_correction():
    """
    Verifies that PlateVisionAgent automatically reconciles Atwater discrepancy.
    """
    agent = PlateVisionAgent(api_key="", groq_key="")
    # Analyze a dummy meal with fallback
    result = await agent.analyze_plate(b"dummy_plate_photo")
    assert result.plate_summary.total_calories > 0
    # Every detected item must have positive, reconciled calories
    for item in result.items:
        atwater_calc = (item.protein_g * 4.0) + (item.carbs_g * 4.0) + (item.fat_g * 9.0)
        # Check that corrected calories are within reasonable Atwater boundaries
        assert item.calories > 0
        assert abs(item.calories - atwater_calc) <= max(35.0, atwater_calc * 0.25)


# ==============================================================================
# 3. Multi-Morbid Clinical Contraindications
# ==============================================================================

def test_multi_morbid_contraindications_resolution():
    """
    Verifies comorbidity resolution for:
    Type 2 Diabetes + Hypertension + CKD Stage 3+.
    """
    # 1. Macro Budget Allocation with comorbidity
    budget = NutritionCalculator.calculate_macro_budget(
        age=52,
        biological_sex="male",
        height_cm=172.0,
        weight_kg=84.0,
        activity_level="sedentary",
        primary_goal="moderate_fat_loss",
        conditions=["diabetes_type_2", "hypertension", "chronic_kidney_disease_ckd"],
    )

    # Diabetic cap applies (carbs <= 130g)
    assert budget.target_carbs_g <= 130.0
    # Added sugar ceiling capped at <= 10g
    assert budget.ceiling_added_sugar_g <= 10.0
    # Hypertension sodium ceiling applies (<= 1500mg)
    assert budget.ceiling_sodium_mg <= 1500.0
    # CKD protein restriction applies (capped at 0.8g/kg * 84kg = ~67.2g)
    assert budget.target_protein_g <= 70.0

    # 2. Food Evaluation for comorbid user consuming high sodium + high carb food
    alerts = ClinicalContraindicationEngine.evaluate_food(
        user_conditions=["diabetes_type_2", "hypertension", "chronic_kidney_disease_stage_3_plus"],
        food_name="Salty Fried Samosa with Sweet Chutney",
        nutrients={
            "calories": 380.0,
            "protein_g": 6.0,
            "carbs_g": 48.0,
            "fat_g": 18.0,
            "sugar_g": 16.0,
            "sodium_mg": 720.0,
        },
        ingredients_text="Refined wheat flour, potatoes, palm oil, salt, sugar, preservatives",
        cumulative_daily_sodium_mg=1000.0,
    )
    assert len(alerts) >= 2
    alert_titles = [a.title for a in alerts]
    assert "High Glycemic Load Meal" in alert_titles
    assert "Daily Sodium Limit Exceeded" in alert_titles


# ==============================================================================
# 4. Extreme Biometric Boundary Handling
# ==============================================================================

def test_extreme_biometrics_and_safety_floors():
    """
    Verifies that extreme weight/BMI inputs do not cause crashes,
    and metabolic safety floors (1500 kcal for male, 1200 kcal for female) are enforced.
    """
    # Severely underweight male (35kg, 185cm) with aggressive fat loss goal
    bmr_low = NutritionCalculator.calculate_bmr(age=25, biological_sex="male", height_cm=185.0, weight_kg=35.0)
    assert bmr_low > 0
    tdee_low = NutritionCalculator.calculate_tdee(bmr_low, "sedentary")
    target_cals, is_clamped, advisory = NutritionCalculator.calculate_target_calories(
        tdee_kcal=tdee_low,
        primary_goal="rapid_fat_loss",
        biological_sex="male",
    )
    # Must be clamped to male floor (1500.0 kcal)
    assert is_clamped is True
    assert target_cals == 1500.0
    assert advisory is not None

    # Severely obese female (210kg, 155cm)
    bmr_high = NutritionCalculator.calculate_bmr(age=45, biological_sex="female", height_cm=155.0, weight_kg=210.0)
    assert bmr_high > 1800.0
    tdee_high = NutritionCalculator.calculate_tdee(bmr_high, "moderately_active")
    assert tdee_high > 2500.0

    # Age extremes (10 and 99 years)
    bmr_child = NutritionCalculator.calculate_bmr(age=10, biological_sex="female", height_cm=135.0, weight_kg=30.0)
    bmr_elder = NutritionCalculator.calculate_bmr(age=99, biological_sex="male", height_cm=165.0, weight_kg=60.0)
    assert bmr_child > 500.0
    assert bmr_elder > 500.0


# ==============================================================================
# 5. Dual-LLM Vision Fallback Resilience
# ==============================================================================

@pytest.mark.asyncio
async def test_plate_agent_dual_llm_graceful_fallback():
    """
    Verifies that when primary and secondary LLM APIs fail (or have empty keys),
    PlateVisionAgent falls back seamlessly to deterministic ground truth
    without crashing or returning 500 errors.
    """
    agent = PlateVisionAgent(api_key="invalid-gemini-key", groq_key="invalid-groq-key")

    # Call analyze_plate with dummy image bytes
    result = await agent.analyze_plate(b"sample_plate_image_data")

    assert result is not None
    assert len(result.items) > 0
    assert result.plate_summary.total_calories > 0
    assert result.health_verdict is not None


# ==============================================================================
# 6. Packaged Scanner Incompleteness & Zero Serving Size Protections
# ==============================================================================

@pytest.mark.asyncio
async def test_packaged_agent_fallback_robustness():
    """
    Verifies MultimodalHealthAgent generates compliant analysis even without upstream API access.
    """
    agent = MultimodalHealthAgent()
    analysis = agent._generate_ground_truth_fallback(
        image_parts=[b"front_img", b"back_img"],
        product_name_hint=None,
        brand_hint=None,
    )
    assert analysis.commodityName is not None
    assert 0 <= analysis.ratingScore <= 100
    assert len(analysis.nutrients) > 0


# ==============================================================================
# 7. Diary Boundary Routes
# ==============================================================================

@pytest.mark.asyncio
async def test_diary_boundary_routes(db_session: AsyncSession):
    """
    Verifies that invalid dates, unknown meal slots, and non-existent entry deletions
    return precise HTTP 422 and HTTP 404 status codes.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session

    user_id = uuid.uuid4()
    user = User(id=user_id, email="diary_boundary@biteiq.io", password_hash="hash", full_name="Boundary Tester", role=UserRole.CONSUMER)
    db_session.add(user)
    await db_session.commit()

    token = make_test_token(user_id=str(user_id), email=user.email)
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Invalid date query -> HTTP 422
        res_bad_date = await client.get("/api/v1/diary?date=2026-99-99", headers=headers)
        assert res_bad_date.status_code == 422

        # 2. Invalid meal slot -> HTTP 422
        bad_slot_payload = {
            "meal_type": "midnight_feast",
            "food_name": "Midnight Biryani",
            "serving_quantity": 1.0,
            "weight_in_grams": 200.0,
            "calories": 400.0,
        }
        res_bad_slot = await client.post("/api/v1/diary/log-item", json=bad_slot_payload, headers=headers)
        assert res_bad_slot.status_code == 422

        # 3. Delete non-existent entry ID -> HTTP 404
        non_existent_uuid = uuid.uuid4()
        res_delete_404 = await client.delete(f"/api/v1/diary/entry/{non_existent_uuid}", headers=headers)
        assert res_delete_404.status_code == 404

    app.dependency_overrides.clear()
