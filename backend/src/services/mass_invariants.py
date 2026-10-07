"""
BiteIQ - Nutritional Mass-Conservation & Thermodynamic Invariant Verifier.
Validates nutritional data against physical and biological conservation laws:
1. Lipid Invariant: Saturated Fat + Trans Fat <= Total Fat
2. Carbohydrate Invariant: Added Sugars <= Total Sugars <= Total Carbohydrates
3. Mass Summation Ceiling: Sum of macros <= Total sample mass
4. Atwater Energy Invariant: Declared calories match Atwater energy factors within 20%
"""

from typing import Any, Dict, List, Tuple


class MassInvariantValidator:
    """
    Validates physical and thermodynamic consistency of nutrient profiles.
    """

    TOLERANCE_GRAMS = 0.2
    ATWATER_TOLERANCE_RATIO = 0.20  # 20% clinical analytical tolerance

    @classmethod
    def validate_nutrients(
        cls,
        nutrients: Dict[str, Any],
        is_per_100g: bool = False,
    ) -> Tuple[bool, List[str]]:
        """
        Validates nutritional profile against the 4 fundamental conservation invariants.
        Returns: (is_valid, list_of_violations)
        """
        violations: List[str] = []

        # Extract values with safe defaults
        calories = float(nutrients.get("calories", nutrients.get("energy_kcal", 0.0)))
        protein = float(nutrients.get("protein_g", nutrients.get("protein", 0.0)))
        total_fat = float(nutrients.get("fat_g", nutrients.get("total_fat_g", 0.0)))
        sat_fat = float(nutrients.get("saturated_fat_g", 0.0))
        trans_fat = float(nutrients.get("trans_fat_g", 0.0))
        total_carbs = float(nutrients.get("carbs_g", nutrients.get("total_carbs_g", 0.0)))
        total_sugars = float(nutrients.get("sugar_g", nutrients.get("total_sugars_g", 0.0)))
        added_sugars = float(nutrients.get("added_sugars_g", 0.0))
        fiber = float(nutrients.get("fiber_g", nutrients.get("dietary_fiber_g", 0.0)))

        # Baseline Non-Negativity Check
        for name, val in [
            ("Calories", calories),
            ("Protein", protein),
            ("Total Fat", total_fat),
            ("Saturated Fat", sat_fat),
            ("Trans Fat", trans_fat),
            ("Total Carbohydrates", total_carbs),
            ("Total Sugars", total_sugars),
            ("Added Sugars", added_sugars),
            ("Dietary Fiber", fiber),
        ]:
            if val < 0.0:
                violations.append(f"{name} cannot be negative ({val}).")

        # 1. Lipid Invariant: Saturated Fat + Trans Fat <= Total Fat
        if (sat_fat + trans_fat) > (total_fat + cls.TOLERANCE_GRAMS):
            violations.append(
                f"Lipid Invariant Violated: Saturated fat ({sat_fat}g) + Trans fat ({trans_fat}g) "
                f"exceeds Total fat ({total_fat}g)."
            )

        # 2. Carbohydrate Invariant: Added Sugars <= Total Sugars <= Total Carbohydrates
        if added_sugars > (total_sugars + cls.TOLERANCE_GRAMS) and total_sugars > 0.0:
            violations.append(
                f"Carbohydrate Invariant Violated: Added sugars ({added_sugars}g) "
                f"exceeds Total sugars ({total_sugars}g)."
            )

        if total_sugars > (total_carbs + cls.TOLERANCE_GRAMS):
            violations.append(
                f"Carbohydrate Invariant Violated: Total sugars ({total_sugars}g) "
                f"exceeds Total carbohydrates ({total_carbs}g)."
            )

        # 3. Mass Summation Ceiling (per 100g sample)
        if is_per_100g:
            macro_sum = protein + total_fat + total_carbs + fiber
            if macro_sum > (100.0 + cls.TOLERANCE_GRAMS):
                violations.append(
                    f"Mass Summation Violated: Sum of macronutrients ({macro_sum:.1f}g) "
                    f"exceeds total 100g matter limit."
                )

        # 4. Atwater Energy Invariant
        # Theoretical Energy = (4 * P) + (4 * C) + (9 * F) + (2 * Fiber)
        if calories > 10.0:  # Only evaluate if non-trivial calorie density
            theoretical_energy = (4.0 * protein) + (4.0 * total_carbs) + (9.0 * total_fat) + (2.0 * fiber)
            discrepancy = abs(calories - theoretical_energy) / max(1.0, calories)

            if discrepancy > cls.ATWATER_TOLERANCE_RATIO:
                violations.append(
                    f"Atwater Energy Invariant Violated: Declared calories ({calories} kcal) "
                    f"deviates by {discrepancy * 100:.1f}% from theoretical macronutrient energy "
                    f"({theoretical_energy:.1f} kcal), exceeding the {cls.ATWATER_TOLERANCE_RATIO * 100:.0f}% tolerance."
                )

        return (len(violations) == 0, violations)
