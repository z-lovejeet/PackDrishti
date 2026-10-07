"""
BiteIQ - Unit Test Suite for Clinical Engine and Mass Invariants.
Tests clinical disease rulebooks, hidden additive interception,
mass-conservation invariants, and whole-food alternatives.
"""

import pytest
from backend.src.services.clinical_engine import ClinicalContraindicationEngine
from backend.src.services.mass_invariants import MassInvariantValidator


def test_diabetic_high_glycemic_sugar_interception():
    # Diabetic user consuming food with maltodextrin and high net carbs
    alerts = ClinicalContraindicationEngine.evaluate_food(
        user_conditions=["diabetes_type_2"],
        food_name="Energy Drink",
        nutrients={
            "calories": 250.0,
            "carbs_g": 55.0,
            "fiber_g": 0.0,
            "sugar_g": 20.0,
        },
        ingredients_text="Carbonated water, maltodextrin, liquid glucose, citric acid",
    )
    assert len(alerts) >= 2
    titles = [a.title for a in alerts]
    assert "High Glycemic Load Meal" in titles
    assert "Hidden High-GI Additives Detected" in titles


def test_hypertension_sodium_and_additive_alert():
    alerts = ClinicalContraindicationEngine.evaluate_food(
        user_conditions=["hypertension"],
        food_name="Instant Noodles",
        nutrients={
            "calories": 420.0,
            "sodium_mg": 850.0,
        },
        ingredients_text="Wheat flour, palm oil, monosodium glutamate (INS 621), salt",
        cumulative_daily_sodium_mg=800.0,  # 800 + 850 = 1650 > 1500
    )
    titles = [a.title for a in alerts]
    assert "High Sodium Item" in titles
    assert "Daily Sodium Limit Exceeded" in titles
    assert "Hidden Sodium Salts Detected" in titles


def test_dyslipidemia_palmolein_and_trans_fat():
    alerts = ClinicalContraindicationEngine.evaluate_food(
        user_conditions=["dyslipidemia"],
        food_name="Fried Bhujia",
        nutrients={
            "calories": 550.0,
            "fat_g": 35.0,
            "saturated_fat_g": 16.0,
            "trans_fat_g": 0.2,
        },
        ingredients_text="Gram flour, edible vegetable oil (palmolein), spices, salt",
    )
    titles = [a.title for a in alerts]
    assert "Elevated Saturated Fat" in titles
    assert "Industrial Palmolein / Vanaspati Detected" in titles
    assert "Trans Fat Detected" in titles


def test_celiac_disease_gluten_hazard():
    alerts = ClinicalContraindicationEngine.evaluate_food(
        user_conditions=["celiac_disease"],
        food_name="Atta Halwa",
        nutrients={"calories": 300.0},
        ingredients_text="Whole wheat flour (atta), sugar, ghee",
    )
    assert len(alerts) == 1
    assert "GLUTEN DETECTED" in alerts[0].title
    assert alerts[0].severity == "critical"


def test_severe_allergen_matching():
    alerts = ClinicalContraindicationEngine.evaluate_food(
        user_conditions=["peanut_allergy"],
        food_name="Chikki",
        nutrients={"calories": 200.0},
        ingredients_text="Jaggery, roasted peanuts",
    )
    assert len(alerts) == 1
    assert "Allergen Alert: Peanut" in alerts[0].title


def test_whole_food_swaps_retrieval():
    all_swaps = ClinicalContraindicationEngine.get_swaps()
    assert len(all_swaps) >= 6

    beverage_swaps = ClinicalContraindicationEngine.get_swaps("sweet_beverage")
    assert len(beverage_swaps) >= 1
    assert any("Coconut Water" in s.swap_name for s in beverage_swaps)


def test_mass_invariants_valid_food():
    # Wholesome food that satisfies all 4 invariants
    # 100g Paneer: 265 kcal, 18g P, 20g F (sat 12g, trans 0g), 3g C (sugars 2g), 0g fiber
    # Theoretical energy: 4*18 + 4*3 + 9*20 = 72 + 12 + 180 = 264 kcal
    nutrients = {
        "calories": 265.0,
        "protein_g": 18.0,
        "fat_g": 20.0,
        "saturated_fat_g": 12.0,
        "trans_fat_g": 0.0,
        "carbs_g": 3.0,
        "sugar_g": 2.0,
        "added_sugars_g": 0.0,
        "fiber_g": 0.0,
    }
    is_valid, violations = MassInvariantValidator.validate_nutrients(nutrients, is_per_100g=True)
    assert is_valid is True
    assert len(violations) == 0


def test_mass_invariants_lipid_violation():
    # Saturated fat + trans fat exceeds total fat
    nutrients = {
        "calories": 200.0,
        "fat_g": 10.0,
        "saturated_fat_g": 12.0,  # Invalid: 12 > 10
        "trans_fat_g": 0.5,
    }
    is_valid, violations = MassInvariantValidator.validate_nutrients(nutrients)
    assert is_valid is False
    assert any("Lipid Invariant Violated" in v for v in violations)


def test_mass_invariants_atwater_violation():
    # Declared calories = 800 kcal, but macros only yield ~100 kcal
    nutrients = {
        "calories": 800.0,
        "protein_g": 10.0,
        "carbs_g": 10.0,
        "fat_g": 2.0,
    }
    is_valid, violations = MassInvariantValidator.validate_nutrients(nutrients)
    assert is_valid is False
    assert any("Atwater Energy Invariant Violated" in v for v in violations)
