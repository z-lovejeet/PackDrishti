"""
BiteIQ - Clinical Nutrition & Metabolic Calculation Engine.
Implements Mifflin-St Jeor, Katch-McArdle, TDEE derivation, dynamic goal deltas,
metabolic safety floors, physiological macronutrient allocations, and micronutrient ceilings.
"""

from dataclasses import dataclass
from decimal import Decimal
from typing import List, Optional, Set, Union


@dataclass
class CalculatedMacroBudget:
    bmr_kcal: float
    tdee_kcal: float
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
    is_clamped_to_floor: bool
    safety_advisory: Optional[str] = None


class NutritionCalculator:
    """
    Deterministic clinical nutrition calculator adhering to ICMR-NIN 2024
    and standard endocrinological metabolic formulas.
    """

    # Physical Activity Level (PAL) Multipliers
    ACTIVITY_MULTIPLIERS = {
        "sedentary": 1.200,
        "lightly_active": 1.375,
        "moderately_active": 1.550,
        "very_active": 1.725,
        "extra_active": 1.900,
    }

    # Goal Caloric Delta Percentages
    GOAL_DELTAS = {
        "rapid_fat_loss": -0.25,        # -25% aggressive deficit
        "moderate_fat_loss": -0.18,     # -18% sustainable deficit
        "maintenance": 0.00,           # 0% homeostasis
        "clean_lean_bulk": 0.11,        # +11% controlled surplus
        "aggressive_hypertrophy": 0.19, # +19% athletic mass building
        "metabolic_reversal": -0.05,    # -5% mild glycemic deficit
    }

    # Metabolic Safety Floors (kcal/day)
    FEMALE_CALORIC_FLOOR = 1200.0
    MALE_CALORIC_FLOOR = 1500.0

    @classmethod
    def calculate_bmr(
        cls,
        age: int,
        biological_sex: str,
        height_cm: float,
        weight_kg: float,
        body_fat_percentage: Optional[float] = None,
    ) -> float:
        """
        Calculates Basal Metabolic Rate (BMR) in kcal/day.
        Uses Katch-McArdle if body_fat_percentage is provided (>0),
        otherwise defaults to Mifflin-St Jeor.
        """
        if body_fat_percentage is not None and 3.0 <= float(body_fat_percentage) <= 60.0:
            # Katch-McArdle Equation
            lbm = float(weight_kg) * (1.0 - (float(body_fat_percentage) / 100.0))
            bmr = 370.0 + (21.6 * lbm)
            return round(bmr, 2)

        # Mifflin-St Jeor Equation
        sex_normalized = str(biological_sex).lower().strip()
        if sex_normalized == "female":
            bmr = (10.0 * float(weight_kg)) + (6.25 * float(height_cm)) - (5.0 * float(age)) - 161.0
        else:
            # Male default
            bmr = (10.0 * float(weight_kg)) + (6.25 * float(height_cm)) - (5.0 * float(age)) + 5.0

        return round(bmr, 2)

    @classmethod
    def calculate_tdee(cls, bmr_kcal: float, activity_level: str) -> float:
        """
        Calculates Total Daily Energy Expenditure (TDEE) based on PAL multiplier.
        """
        multiplier = cls.ACTIVITY_MULTIPLIERS.get(activity_level.lower().strip(), 1.200)
        tdee = float(bmr_kcal) * multiplier
        return round(tdee, 2)

    @classmethod
    def calculate_target_calories(
        cls,
        tdee_kcal: float,
        primary_goal: str,
        biological_sex: str,
    ) -> tuple[float, bool, Optional[str]]:
        """
        Calculates Target Daily Calories adjusting for goal and clamping to metabolic floors.
        Returns: (target_calories, is_clamped_to_floor, safety_advisory)
        """
        delta = cls.GOAL_DELTAS.get(primary_goal.lower().strip(), 0.00)
        raw_target = float(tdee_kcal) * (1.0 + delta)

        sex_normalized = str(biological_sex).lower().strip()
        floor = cls.FEMALE_CALORIC_FLOOR if sex_normalized == "female" else cls.MALE_CALORIC_FLOOR

        if raw_target < floor:
            advisory = (
                f"Your calculated caloric target ({round(raw_target)} kcal) was below the physiological "
                f"safety floor ({round(floor)} kcal) and has been clamped to prevent metabolic and endocrine downregulation."
            )
            return round(floor, 2), True, advisory

        return round(raw_target, 2), False, None

    @classmethod
    def calculate_macro_budget(
        cls,
        age: int,
        biological_sex: str,
        height_cm: float,
        weight_kg: float,
        activity_level: str = "sedentary",
        primary_goal: str = "maintenance",
        body_fat_percentage: Optional[float] = None,
        conditions: Optional[List[str]] = None,
    ) -> CalculatedMacroBudget:
        """
        Complete deterministic calculation yielding daily caloric targets,
        macro distribution (Protein, Carbs, Fat in grams), and micronutrient ceilings.
        """
        w = float(weight_kg)
        cond_set: Set[str] = {str(c).lower().strip() for c in (conditions or [])}

        # 1. BMR & TDEE
        bmr = cls.calculate_bmr(age, biological_sex, height_cm, w, body_fat_percentage)
        tdee = cls.calculate_tdee(bmr, activity_level)

        # 2. Target Calories with Floor Clamping
        target_calories, is_clamped, advisory = cls.calculate_target_calories(
            tdee, primary_goal, biological_sex
        )

        # 3. Protein Allocation (Physiological Priority #1)
        if "chronic_kidney_disease_ckd" in cond_set:
            # Strict renal clearance clamp for CKD Stages 1-3
            protein_g = round(0.8 * w, 1)
        else:
            goal_key = primary_goal.lower().strip()
            if goal_key in ("rapid_fat_loss", "moderate_fat_loss"):
                protein_g = round(2.0 * w, 1)
            elif goal_key in ("clean_lean_bulk", "aggressive_hypertrophy"):
                protein_g = round(2.2 * w, 1)
            elif goal_key == "metabolic_reversal":
                protein_g = round(1.6 * w, 1)
            else:
                # Sedentary or maintenance baseline
                protein_g = round(1.2 * w, 1)

        protein_kcal = protein_g * 4.0

        # 4. Dietary Fat Allocation (Physiological Priority #2)
        # Default 25% of target calories with biological floor of 0.6g/kg
        fat_from_pct = (target_calories * 0.25) / 9.0
        essential_fat_floor = 0.6 * w
        fat_g = max(essential_fat_floor, fat_from_pct)
        fat_g = round(fat_g, 1)
        fat_kcal = fat_g * 9.0

        # 5. Carbohydrate Allocation (Physiological Priority #3: Residual Energy)
        residual_kcal = target_calories - (protein_kcal + fat_kcal)

        # Diabetic / Prediabetic carbohydrate cap override (130g net carbs max)
        is_diabetic = "diabetes_type_2" in cond_set or "prediabetes" in cond_set
        if is_diabetic:
            standard_carbs_g = max(0.0, residual_kcal / 4.0)
            if standard_carbs_g > 130.0:
                carbs_g = 130.0
                excess_carb_kcal = residual_kcal - (130.0 * 4.0)
                # Reallocate excess carbohydrate calories into healthy fats
                fat_g += round(excess_carb_kcal / 9.0, 1)
            else:
                carbs_g = round(standard_carbs_g, 1)
        else:
            carbs_g = round(max(0.0, residual_kcal / 4.0), 1)

        # 6. Micronutrient Ceilings & Targets
        # Fiber: max(30g, 14g per 1000 kcal)
        fiber_g = round(max(30.0, (target_calories / 1000.0) * 14.0), 1)

        # Sodium: 1500mg for hypertension, 2000mg standard
        if "hypertension" in cond_set:
            sodium_mg = 1500.0
        else:
            sodium_mg = 2000.0

        # Added Sugar: 10g for diabetes, 25g standard
        if is_diabetic:
            sugar_g = 10.0
        else:
            sugar_g = 25.0

        # Saturated Fat: 7% for dyslipidemia, 10% standard
        if "dyslipidemia" in cond_set:
            sat_fat_ceiling_g = round((target_calories * 0.07) / 9.0, 1)
        else:
            sat_fat_ceiling_g = round((target_calories * 0.10) / 9.0, 1)

        trans_fat_g = 0.0  # Zero tolerance

        # 7. Water Hydration Target
        # Base: 35 ml per kg body weight + activity bonus
        activity_bonus = 0.0
        act_key = activity_level.lower().strip()
        if act_key == "moderately_active":
            activity_bonus = 500.0
        elif act_key == "very_active":
            activity_bonus = 750.0
        elif act_key == "extra_active":
            activity_bonus = 1000.0

        raw_water = (w * 35.0) + activity_bonus
        water_ml = round(max(2000.0, min(4500.0, raw_water)), 0)

        return CalculatedMacroBudget(
            bmr_kcal=bmr,
            tdee_kcal=tdee,
            target_calories=target_calories,
            target_protein_g=protein_g,
            target_carbs_g=carbs_g,
            target_fat_g=fat_g,
            target_fiber_g=fiber_g,
            ceiling_sodium_mg=sodium_mg,
            ceiling_added_sugar_g=sugar_g,
            ceiling_saturated_fat_g=sat_fat_ceiling_g,
            ceiling_trans_fat_g=trans_fat_g,
            target_water_ml=water_ml,
            is_clamped_to_floor=is_clamped,
            safety_advisory=advisory,
        )
