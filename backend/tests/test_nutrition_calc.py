"""
BiteIQ - Unit Test Suite for Nutrition Calculation Engine (nutrition_calc.py).
Tests Mifflin-St Jeor, Katch-McArdle, TDEE derivation, goal adjustments,
metabolic safety floor clamping, dynamic macro allocations, and condition overrides.
"""

import pytest
from backend.src.services.nutrition_calc import NutritionCalculator, CalculatedMacroBudget


def test_mifflin_st_jeor_male():
    """
    Male: Age 28, Height 178 cm, Weight 76.5 kg
    BMR = (10 * 76.5) + (6.25 * 178) - (5 * 28) + 5
        = 765.0 + 1112.5 - 140.0 + 5.0 = 1742.5 kcal
    """
    bmr = NutritionCalculator.calculate_bmr(
        age=28,
        biological_sex="male",
        height_cm=178.0,
        weight_kg=76.5,
    )
    assert bmr == 1742.5


def test_mifflin_st_jeor_female():
    """
    Female: Age 32, Height 162 cm, Weight 58.0 kg
    BMR = (10 * 58.0) + (6.25 * 162) - (5 * 32) - 161
        = 580.0 + 1012.5 - 160.0 - 161.0 = 1271.5 kcal
    """
    bmr = NutritionCalculator.calculate_bmr(
        age=32,
        biological_sex="female",
        height_cm=162.0,
        weight_kg=58.0,
    )
    assert bmr == 1271.5


def test_katch_mcardle_with_body_fat():
    """
    Weight: 80.0 kg, Body Fat: 15.0%
    LBM = 80.0 * (1 - 0.15) = 68.0 kg
    BMR = 370 + (21.6 * 68.0) = 370 + 1468.8 = 1838.8 kcal
    """
    bmr = NutritionCalculator.calculate_bmr(
        age=25,
        biological_sex="male",
        height_cm=180.0,
        weight_kg=80.0,
        body_fat_percentage=15.0,
    )
    assert bmr == 1838.8


def test_tdee_activity_multipliers():
    bmr = 1500.0
    assert NutritionCalculator.calculate_tdee(bmr, "sedentary") == 1800.0
    assert NutritionCalculator.calculate_tdee(bmr, "lightly_active") == 2062.5
    assert NutritionCalculator.calculate_tdee(bmr, "moderately_active") == 2325.0
    assert NutritionCalculator.calculate_tdee(bmr, "very_active") == 2587.5
    assert NutritionCalculator.calculate_tdee(bmr, "extra_active") == 2850.0


def test_goal_calorie_adjustments():
    tdee = 2000.0
    # Maintenance: 0% -> 2000
    c_maint, clamped, _ = NutritionCalculator.calculate_target_calories(tdee, "maintenance", "male")
    assert c_maint == 2000.0 and not clamped

    # Moderate fat loss: -18% -> 1640
    c_fatloss, clamped, _ = NutritionCalculator.calculate_target_calories(tdee, "moderate_fat_loss", "male")
    assert c_fatloss == 1640.0 and not clamped

    # Clean lean bulk: +11% -> 2220
    c_bulk, clamped, _ = NutritionCalculator.calculate_target_calories(tdee, "clean_lean_bulk", "male")
    assert c_bulk == 2220.0 and not clamped


def test_metabolic_safety_floor_clamping():
    # Extreme deficit for female where raw target is 1000 kcal
    tdee = 1300.0
    target, clamped, advisory = NutritionCalculator.calculate_target_calories(
        tdee, "rapid_fat_loss", "female"
    )
    assert target == 1200.0
    assert clamped is True
    assert "safety floor" in advisory

    # Extreme deficit for male where raw target is 1200 kcal
    target_male, clamped_m, advisory_m = NutritionCalculator.calculate_target_calories(
        1400.0, "rapid_fat_loss", "male"
    )
    assert target_male == 1500.0
    assert clamped_m is True
    assert "safety floor" in advisory_m


def test_ckd_protein_clamp_override():
    # User with CKD should have protein capped at 0.8 g/kg
    weight = 70.0
    budget = NutritionCalculator.calculate_macro_budget(
        age=45,
        biological_sex="male",
        height_cm=175.0,
        weight_kg=weight,
        activity_level="moderately_active",
        primary_goal="clean_lean_bulk",
        conditions=["chronic_kidney_disease_ckd"],
    )
    assert budget.target_protein_g == round(0.8 * weight, 1)


def test_diabetic_carbohydrate_cap_reallocation():
    # High-calorie diet with diabetes should cap carbs at 130g and shift balance to fat
    budget = NutritionCalculator.calculate_macro_budget(
        age=35,
        biological_sex="male",
        height_cm=180.0,
        weight_kg=85.0,
        activity_level="very_active",
        primary_goal="maintenance",
        conditions=["diabetes_type_2"],
    )
    assert budget.target_carbs_g <= 130.0
    assert budget.ceiling_added_sugar_g == 10.0


def test_hypertension_sodium_ceiling():
    budget = NutritionCalculator.calculate_macro_budget(
        age=50,
        biological_sex="male",
        height_cm=170.0,
        weight_kg=75.0,
        conditions=["hypertension"],
    )
    assert budget.ceiling_sodium_mg == 1500.0


def test_water_hydration_calculation():
    budget = NutritionCalculator.calculate_macro_budget(
        age=25,
        biological_sex="male",
        height_cm=180.0,
        weight_kg=70.0,
        activity_level="very_active",  # 70 * 35 = 2450 + 750 = 3200
    )
    assert budget.target_water_ml == 3200.0
