import io
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from backend.src.main import app
from backend.src.core.database import get_db_session
from ai.src.rules.nutrition_parser import NutritionFactsParser, NutrientValues
from backend.src.services.health_engine import ICMRNutritionProfilingEngine


def test_normalization_invariant_per_serve_to_100g():
    """
    Verify that a product declaring 6.4g sugar per 20g serve produces exactly 32.0g per 100g.
    """
    declared = {
        "energy_kcal": 78.0,
        "total_sugars_g": 7.4,
        "added_sugars_g": 6.4,
        "total_fat_g": 0.36,
        "saturated_fat_g": 0.36,
        "trans_fat_g": 0.0,
        "sodium_mg": 31.0,
        "total_carbohydrates_g": 17.0,
        "dietary_fiber_g": 0.5,
        "protein_g": 1.4,
    }
    nutrients_100g, nutrients_serve = NutritionFactsParser.normalize_to_100g(
        declared_values=declared,
        serving_size_g=20.0,
        declared_basis="per_serve"
    )

    assert nutrients_serve.added_sugars_g == 6.4
    assert nutrients_100g.added_sugars_g == 32.0
    assert nutrients_100g.energy_kcal == 390.0
    assert nutrients_100g.sodium_mg == 155.0


def test_mass_conservation_invariants():
    """
    Verify that mass conservation violations are flagged by the validator.
    """
    # Case 1: Saturated Fat + Trans Fat > Total Fat
    invalid_fat = NutrientValues(
        total_fat_g=5.0,
        saturated_fat_g=4.5,
        trans_fat_g=1.5,  # 4.5 + 1.5 = 6.0 > 5.0
    )
    is_valid, warnings = NutritionFactsParser.validate_invariants(invalid_fat)
    assert is_valid is False
    assert any("Fat invariant violated" in w for w in warnings)

    # Case 2: Added Sugar > Total Sugar
    invalid_sugar = NutrientValues(
        total_carbohydrates_g=20.0,
        total_sugars_g=10.0,
        added_sugars_g=12.0,  # Added > Total
    )
    is_valid, warnings = NutritionFactsParser.validate_invariants(invalid_sugar)
    assert is_valid is False
    assert any("Added sugars" in w for w in warnings)

    # Case 3: Valid nutrients
    valid_nutrients = NutrientValues(
        total_fat_g=10.0,
        saturated_fat_g=3.0,
        trans_fat_g=0.0,
        total_carbohydrates_g=50.0,
        total_sugars_g=15.0,
        added_sugars_g=10.0,
    )
    is_valid, warnings = NutritionFactsParser.validate_invariants(valid_nutrients)
    assert is_valid is True
    assert len(warnings) == 0


def test_trans_fat_immediate_penalty():
    """
    Verify that setting trans_fat > 0.0g levies an immediate 30-point flat penalty.
    """
    baseline_profile = NutrientValues(
        energy_kcal=200.0,
        total_fat_g=6.0,
        saturated_fat_g=2.5,
        trans_fat_g=0.0,
        sodium_mg=200.0,
        total_carbohydrates_g=30.0,
        total_sugars_g=5.0,
        added_sugars_g=2.0,
        dietary_fiber_g=0.0,
        protein_g=0.0,
    )
    score_clean, penalties_clean, _ = ICMRNutritionProfilingEngine.calculate_health_score(baseline_profile)
    assert penalties_clean["trans_fat_penalty"] == 0.0

    tainted_profile = NutrientValues(
        energy_kcal=200.0,
        total_fat_g=6.0,
        saturated_fat_g=2.5,
        trans_fat_g=0.2,  # Trace industrial trans fat
        sodium_mg=200.0,
        total_carbohydrates_g=30.0,
        total_sugars_g=5.0,
        added_sugars_g=2.0,
        dietary_fiber_g=0.0,
        protein_g=0.0,
    )
    score_tainted, penalties_tainted, _ = ICMRNutritionProfilingEngine.calculate_health_score(tainted_profile)
    assert penalties_tainted["trans_fat_penalty"] == 30.0
    assert score_clean - score_tainted == 30


def test_score_clamping_invariants():
    """
    Verify that scores never fall below 0 and never exceed 100.
    """
    # Toxic profile
    toxic = NutrientValues(
        energy_kcal=600.0,
        total_fat_g=35.0,
        saturated_fat_g=20.0,
        trans_fat_g=2.0,
        sodium_mg=5000.0,
        total_carbohydrates_g=90.0,
        total_sugars_g=85.0,
        added_sugars_g=80.0,
        dietary_fiber_g=0.0,
        protein_g=0.0,
    )
    score_toxic, _, _ = ICMRNutritionProfilingEngine.calculate_health_score(toxic)
    assert score_toxic == 0

    # Hyper-nutrient dense profile
    superfood = NutrientValues(
        energy_kcal=250.0,
        total_fat_g=4.0,
        saturated_fat_g=0.5,
        trans_fat_g=0.0,
        sodium_mg=10.0,
        total_carbohydrates_g=30.0,
        total_sugars_g=1.0,
        added_sugars_g=0.0,
        dietary_fiber_g=20.0,
        protein_g=30.0,
    )
    score_super, _, _ = ICMRNutritionProfilingEngine.calculate_health_score(superfood)
    assert score_super == 100


def test_worked_case_studies():
    """
    Validates the 3 worked case studies from docs/nutrition_profiling_spec.md Section 4.5.
    """
    # Case A: Malt Chocolate Drink (Bournvita)
    bournvita = NutrientValues(
        energy_kcal=390.0,
        total_fat_g=1.8,
        saturated_fat_g=1.8,
        trans_fat_g=0.0,
        sodium_mg=155.0,
        total_carbohydrates_g=85.2,
        total_sugars_g=37.0,
        added_sugars_g=32.2,
        dietary_fiber_g=2.5,
        protein_g=7.0,
    )
    score_a, penalties_a, credits_a = ICMRNutritionProfilingEngine.calculate_health_score(bournvita, nova_group=4)
    assert penalties_a["sugar_penalty"] == 35.0  # Capped at max 35.0
    badges_a = ICMRNutritionProfilingEngine.evaluate_badges(bournvita, nova_group=4)
    assert any(b.id == "BADGE_HIGH_SUGAR" for b in badges_a)
    assert any(b.id == "BADGE_ULTRA_PROCESSED" for b in badges_a)

    # Case B: Instant Masala Noodles (Maggi)
    maggi = NutrientValues(
        energy_kcal=427.0,
        total_fat_g=15.7,
        saturated_fat_g=9.8,
        trans_fat_g=0.1,
        sodium_mg=1220.0,
        total_carbohydrates_g=63.5,
        total_sugars_g=2.2,
        added_sugars_g=0.0,
        dietary_fiber_g=3.5,
        protein_g=8.0,
    )
    score_b, penalties_b, _ = ICMRNutritionProfilingEngine.calculate_health_score(maggi, nova_group=4)
    assert penalties_b["sodium_penalty"] == 25.0  # Capped at max 25.0
    assert penalties_b["trans_fat_penalty"] == 30.0
    assert score_b <= 35  # Ultra-processed / High Health Concern
    badges_b = ICMRNutritionProfilingEngine.evaluate_badges(maggi, nova_group=4)
    assert any(b.id == "BADGE_HIGH_SODIUM" for b in badges_b)
    assert any(b.id == "BADGE_HIGH_SAT_FAT" for b in badges_b)
    assert any(b.id == "BADGE_TRANS_FAT" for b in badges_b)

    # Case C: Whole Raw California Almonds
    almonds = NutrientValues(
        energy_kcal=579.0,
        total_fat_g=49.9,
        saturated_fat_g=3.8,
        trans_fat_g=0.0,
        sodium_mg=1.0,
        total_carbohydrates_g=21.6,
        total_sugars_g=4.4,
        added_sugars_g=0.0,
        dietary_fiber_g=12.2,
        protein_g=21.2,
    )
    score_c, penalties_c, credits_c = ICMRNutritionProfilingEngine.calculate_health_score(almonds, nova_group=1)
    assert credits_c["fiber_credit"] == 10.0  # Capped at 10.0
    assert score_c >= 85  # Nutritious / Clean Profile


def test_clinical_contraindications_and_alternatives():
    """
    Verifies that clinical risks and culturally aligned Indian alternatives are generated correctly.
    """
    # Test alternative resolution
    noodle_alts = ICMRNutritionProfilingEngine.resolve_alternatives("Instant Masala Noodles", "Convenience Food", 28)
    assert len(noodle_alts) >= 2
    assert any("Rolled Oats" in a.alternative_name or "Vermicelli" in a.alternative_name for a in noodle_alts)

    bev_alts = ICMRNutritionProfilingEngine.resolve_alternatives("Carbonated Sweetened Cola", "Beverage", 22)
    assert any("Coconut Water" in a.alternative_name or "Chaas" in a.alternative_name for a in bev_alts)


@pytest.mark.asyncio
async def test_health_analyze_endpoint(db_session: AsyncSession):
    """
    Verifies POST /api/v1/health/analyze with dual multipart images.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        front_bytes = io.BytesIO(b"mock-front-packaging-jpeg-stream")
        back_bytes = io.BytesIO(b"mock-back-packaging-jpeg-stream")

        response = await client.post(
            "/api/v1/health/analyze",
            files={
                "front_image": ("sample_bournvita_front.jpg", front_bytes, "image/jpeg"),
                "back_image": ("sample_bournvita_back.jpg", back_bytes, "image/jpeg"),
            },
            data={
                "product_name": "Malt Chocolate Nutrition Drink",
                "brand": "Bournvita",
                "serving_size_g": "20.0",
                "user_profile": "standard"
            }
        )

        assert response.status_code == 200
        json_data = response.json()
        assert json_data["status"] == "success"
        data = json_data["data"]
        assert "audit_id" in data
        assert data["product_name"] == "Malt Chocolate Nutrition Drink"
        assert data["health_score"] >= 0.0 and data["health_score"] <= 100.0
        assert len(data["nutrients"]) >= 7
        assert len(data["badges"]) >= 1
        assert "who_should_avoid" in data["dietary_advisory"]
        assert "healthier_alternatives" in data["dietary_advisory"]

        audit_id = data["audit_id"]

        # Verify GET /api/v1/health/{audit_id}
        get_res = await client.get(f"/api/v1/health/{audit_id}")
        assert get_res.status_code == 200
        get_data = get_res.json()["data"]
        assert get_data["audit_id"] == audit_id
        assert get_data["health_score"] == data["health_score"]

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_health_audit_not_found_handling(db_session: AsyncSession):
    """
    Verifies 404 response on unknown audit ID and 400 on invalid UUID format.
    """
    app.dependency_overrides[get_db_session] = lambda: db_session
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Invalid UUID
        invalid_res = await client.get("/api/v1/health/not-a-valid-uuid")
        assert invalid_res.status_code == 400

        # Non-existent UUID
        random_uuid = str(uuid.uuid4())
        not_found_res = await client.get(f"/api/v1/health/{random_uuid}")
        assert not_found_res.status_code == 404

    app.dependency_overrides.clear()
