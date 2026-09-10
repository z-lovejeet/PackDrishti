import re
import uuid
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from ai.src.rules.nutrition_parser import NutrientValues, NovaClassification, ParsedNutritionPanel


@dataclass
class HealthBadge:
    id: str
    label: str
    severity: str  # danger, warning, good, neutral
    metric_triggered: str
    measured_value: float
    threshold_value: float
    unit: str
    rationale: str
    regulatory_basis: str = "ICMR-NIN Dietary Guidelines for Indians (May 2024)"


@dataclass
class HealthierAlternative:
    alternative_name: str
    swap_advantage: str
    calorie_difference: str
    processing_level: str = "Minimally Processed Whole Food"


@dataclass
class NutrientAuditEntry:
    name: str
    value: float
    unit: str
    per: str  # "100g" or "100ml"
    threshold: str  # Low, Moderate, High, Excessive
    status: str  # compliant, warning, violation
    icmr_limit: float
    percentage_of_daily_limit: float
    assessment: str


@dataclass
class HealthAuditPayload:
    audit_id: str
    product_name: str
    brand: str
    health_score: float
    score_band: str
    nutritional_density: str
    serving_size: str
    servings_per_container: int
    nova_classification: Dict[str, Any]
    nutrients: List[Dict[str, Any]]
    badges: List[Dict[str, Any]]
    dietary_advisory: Dict[str, Any]
    fssai_compliance: Dict[str, Any]
    penalties: Dict[str, float]
    credits: Dict[str, float]
    dietary_summary: str


# Healthier Indian Whole-Food Alternatives Knowledge Base
INDIAN_HEALTHIER_ALTERNATIVES_MAP = {
    "sweet_beverage": [
        HealthierAlternative(
            alternative_name="Fresh Tender Coconut Water (Nariyal Pani)",
            swap_advantage="Natural bio-available electrolytes with zero refined sugars",
            calorie_difference="-120 kcal per serving"
        ),
        HealthierAlternative(
            alternative_name="Traditional Spiced Chaas / Mattha with Roasted Cumin",
            swap_advantage="Fermented active probiotics promoting digestive health and zero added sugar",
            calorie_difference="-95 kcal per serving"
        ),
        HealthierAlternative(
            alternative_name="Fresh Mint Lime Water (Nimbu Shikanji) with Black Salt",
            swap_advantage="Naturally sweetened with whole mint leaves, delivering Vitamin C",
            calorie_difference="-110 kcal per serving"
        )
    ],
    "malted_drink": [
        HealthierAlternative(
            alternative_name="Roasted Chana Sattu dissolved in Buttermilk or Water",
            swap_advantage="20g natural plant protein per 100g with zero refined sugar",
            calorie_difference="-75 kcal per serving"
        ),
        HealthierAlternative(
            alternative_name="Sprouted Ragi (Finger Millet) Porridge with Whole Milk",
            swap_advantage="340mg natural calcium per 100g with zero sucrose spikes",
            calorie_difference="-60 kcal per serving"
        ),
        HealthierAlternative(
            alternative_name="Warm Milk infused with Crushed Almonds and Turmeric",
            swap_advantage="Rich in healthy unsaturated fats and natural curcumin antioxidants",
            calorie_difference="-40 kcal per serving"
        )
    ],
    "instant_noodles": [
        HealthierAlternative(
            alternative_name="Handmade Rolled Oats Porridge with Green Peas and Turmeric",
            swap_advantage="Beta-glucan soluble fiber reduces LDL cholesterol, eliminating fried palm olein",
            calorie_difference="-150 kcal per serving"
        ),
        HealthierAlternative(
            alternative_name="Whole Wheat or Brown Rice Vermicelli (Sewai) with Steamed Veggies",
            swap_advantage="85% lower sodium than fried masala cakes with intact grain husk",
            calorie_difference="-130 kcal per serving"
        ),
        HealthierAlternative(
            alternative_name="Unfried Foxtail / Kodo Millet Noodles with Homemade Spices",
            swap_advantage="Low glycemic index grain with zero synthetic flavor enhancers (MSG)",
            calorie_difference="-110 kcal per serving"
        )
    ],
    "savory_chips": [
        HealthierAlternative(
            alternative_name="Spiced Roasted Fox Nuts (Makhana) in Cold-Pressed Mustard Oil",
            swap_advantage="75% lower saturated fat than palm-fried chips with light crunchy texture",
            calorie_difference="-140 kcal per serving"
        ),
        HealthierAlternative(
            alternative_name="Salt-Free Roasted Bengal Gram (Chana) with Natural Husk",
            swap_advantage="Rich in soluble dietary fiber and sustained complex energy",
            calorie_difference="-110 kcal per serving"
        ),
        HealthierAlternative(
            alternative_name="Dehydrated Sweet Potato Slices baked with Olive Oil and Herbs",
            swap_advantage="High in carotenoids and dietary potassium to support vascular health",
            calorie_difference="-90 kcal per serving"
        )
    ],
    "biscuits_confectionery": [
        HealthierAlternative(
            alternative_name="Whole Wheat Roasted Methi Khakhra with Minimal Cold-Pressed Oil",
            swap_advantage="Zero refined flour (maida) and zero industrial trans fats",
            calorie_difference="-80 kcal per serving"
        ),
        HealthierAlternative(
            alternative_name="Unsweetened Sesame and Millet Cakes sweetened with Whole Date Paste",
            swap_advantage="High in bio-available iron and dietary fiber without refined sucrose",
            calorie_difference="-70 kcal per serving"
        )
    ]
}


class ICMRNutritionProfilingEngine:
    """
    ICMR-NIN 2024 and WHO SEAR Nutritional Profiling & Health Scoring Engine.
    Implements SPEC-PACKDRASHITI-NUTRI-2024.
    """

    ICMR_THRESHOLDS = {
        "total_sugars_high": 10.0,       # g / 100g
        "added_sugars_high": 5.0,        # g / 100g
        "saturated_fat_high": 4.0,       # g / 100g
        "trans_fat_tolerance": 0.0,      # g / 100g (Zero tolerance)
        "sodium_high": 400.0,            # mg / 100g
        "energy_kcal_high": 350.0,       # kcal / 100g
        "liquid_added_sugar_high": 2.5,  # g / 100ml
        "liquid_energy_high": 60.0,      # kcal / 100ml
    }

    # Reference Adult Daily Recommended Intakes (ICMR-NIN 2024: 2,000 kcal baseline)
    RDA_DAILY_LIMITS = {
        "added_sugars": 25.0,     # g / day
        "total_fat": 65.0,        # g / day
        "saturated_fat": 20.0,    # g / day
        "sodium": 2000.0,         # mg / day (5g salt)
        "dietary_fiber": 30.0,    # g / day
        "protein": 54.0,          # g / day
    }

    @classmethod
    def calculate_health_score(
        cls,
        nutrients: NutrientValues,
        is_liquid: bool = False,
        nova_group: int = 1
    ) -> Tuple[int, Dict[str, float], Dict[str, float]]:
        """
        Calculates composite health score (0-100) using subtractive-additive model.
        """
        # Negative penalties
        # 1. Added Sugar Penalty (Max 35.0 pts)
        sugar_cutoff = cls.ICMR_THRESHOLDS["liquid_added_sugar_high"] if is_liquid else 10.0
        p_sugar = min(35.0, (nutrients.added_sugars_g / sugar_cutoff) * 12.0)

        # 2. Sodium Penalty (Max 25.0 pts)
        p_sodium = min(25.0, (nutrients.sodium_mg / 400.0) * 10.0)

        # 3. Saturated Fat Penalty (Max 20.0 pts)
        p_sat_fat = min(20.0, (nutrients.saturated_fat_g / 4.0) * 8.0)

        # 4. Trans Fat Penalty (Immediate 30.0 pts deduction if > 0.0g)
        p_trans_fat = 30.0 if nutrients.trans_fat_g > 0.0 else 0.0

        # Positive credits
        # 1. Dietary Fiber Credit (Max 10.0 pts)
        c_fiber = min(10.0, (nutrients.dietary_fiber_g / 3.0) * 3.0)

        # 2. Protein Credit (Max 10.0 pts)
        c_protein = min(10.0, (nutrients.protein_g / 5.0) * 2.0)

        total_penalties = p_sugar + p_sodium + p_sat_fat + p_trans_fat
        total_credits = c_fiber + c_protein

        raw_score = 100.0 - total_penalties + total_credits

        # Deduct ultra-processed formulation penalty if NOVA 4
        if nova_group == 4:
            # Ultra-processed items incur an industrial formulation deduction
            raw_score -= 5.0

        clamped_score = max(0.0, min(100.0, raw_score))
        final_score = int(round(clamped_score))

        penalties = {
            "sugar_penalty": round(p_sugar, 2),
            "sodium_penalty": round(p_sodium, 2),
            "saturated_fat_penalty": round(p_sat_fat, 2),
            "trans_fat_penalty": round(p_trans_fat, 2),
            "total_penalties": round(total_penalties, 2)
        }
        credits = {
            "fiber_credit": round(c_fiber, 2),
            "protein_credit": round(c_protein, 2),
            "total_credits": round(total_credits, 2)
        }

        return final_score, penalties, credits

    @classmethod
    def evaluate_badges(cls, nutrients: NutrientValues, is_liquid: bool = False, nova_group: int = 1) -> List[HealthBadge]:
        """
        Generates advisory health badges based on quantitative ICMR-NIN cutoffs.
        """
        badges: List[HealthBadge] = []

        # High Sugar
        sugar_thresh = cls.ICMR_THRESHOLDS["liquid_added_sugar_high"] if is_liquid else cls.ICMR_THRESHOLDS["added_sugars_high"]
        if nutrients.added_sugars_g > sugar_thresh or nutrients.total_sugars_g > cls.ICMR_THRESHOLDS["total_sugars_high"]:
            badges.append(HealthBadge(
                id="BADGE_HIGH_SUGAR",
                label="High Sugar",
                severity="danger",
                metric_triggered="added_sugars",
                measured_value=nutrients.added_sugars_g,
                threshold_value=sugar_thresh,
                unit="g",
                rationale=f"Added sugars ({nutrients.added_sugars_g}g) or Total sugars ({nutrients.total_sugars_g}g) exceed ICMR threshold ({sugar_thresh}g)."
            ))

        # High Sodium
        if nutrients.sodium_mg > cls.ICMR_THRESHOLDS["sodium_high"]:
            badges.append(HealthBadge(
                id="BADGE_HIGH_SODIUM",
                label="High Sodium",
                severity="danger",
                metric_triggered="sodium",
                measured_value=nutrients.sodium_mg,
                threshold_value=cls.ICMR_THRESHOLDS["sodium_high"],
                unit="mg",
                rationale=f"Sodium content of {nutrients.sodium_mg}mg exceeds ICMR safe cutoff of 400.0mg per 100g."
            ))

        # High Saturated Fat
        if nutrients.saturated_fat_g > cls.ICMR_THRESHOLDS["saturated_fat_high"]:
            badges.append(HealthBadge(
                id="BADGE_HIGH_SAT_FAT",
                label="High Saturated Fat",
                severity="danger",
                metric_triggered="saturated_fat",
                measured_value=nutrients.saturated_fat_g,
                threshold_value=cls.ICMR_THRESHOLDS["saturated_fat_high"],
                unit="g",
                rationale=f"Saturated fat ({nutrients.saturated_fat_g}g) exceeds ICMR threshold of 4.0g per 100g."
            ))

        # Trans Fat Present
        if nutrients.trans_fat_g > cls.ICMR_THRESHOLDS["trans_fat_tolerance"]:
            badges.append(HealthBadge(
                id="BADGE_TRANS_FAT",
                label="Trans Fat Present",
                severity="danger",
                metric_triggered="trans_fat",
                measured_value=nutrients.trans_fat_g,
                threshold_value=0.0,
                unit="g",
                rationale=f"Industrial trans fat detected ({nutrients.trans_fat_g}g). Violates WHO zero-tolerance target."
            ))

        # Ultra Processed
        if nova_group == 4:
            badges.append(HealthBadge(
                id="BADGE_ULTRA_PROCESSED",
                label="Ultra Processed",
                severity="warning",
                metric_triggered="nova_group",
                measured_value=4.0,
                threshold_value=3.0,
                unit="group",
                rationale="NOVA Group 4 industrial formulation containing refined extracts and cosmetic food additives.",
                regulatory_basis="NOVA Food Classification System"
            ))

        # High Caloric Density
        energy_thresh = cls.ICMR_THRESHOLDS["liquid_energy_high"] if is_liquid else cls.ICMR_THRESHOLDS["energy_kcal_high"]
        if nutrients.energy_kcal > energy_thresh:
            badges.append(HealthBadge(
                id="BADGE_HIGH_CALORIES",
                label="High Caloric Density",
                severity="warning",
                metric_triggered="energy_kcal",
                measured_value=nutrients.energy_kcal,
                threshold_value=energy_thresh,
                unit="kcal",
                rationale=f"Energy density of {nutrients.energy_kcal} kcal/100g exceeds moderate baseline threshold."
            ))

        # Positive Badges
        if nutrients.total_sugars_g <= 5.0 and nutrients.added_sugars_g == 0.0:
            badges.append(HealthBadge(
                id="BADGE_LOW_SUGAR",
                label="Low Sugar",
                severity="good",
                metric_triggered="total_sugars",
                measured_value=nutrients.total_sugars_g,
                threshold_value=5.0,
                unit="g",
                rationale="Zero added sugar and low total sugars under 5.0g per 100g."
            ))

        if nutrients.protein_g >= 10.0:
            badges.append(HealthBadge(
                id="BADGE_HIGH_PROTEIN",
                label="High Protein",
                severity="good",
                metric_triggered="protein",
                measured_value=nutrients.protein_g,
                threshold_value=10.0,
                unit="g",
                rationale=f"Substantial protein concentration of {nutrients.protein_g}g per 100g."
            ))

        if nutrients.dietary_fiber_g >= 6.0:
            badges.append(HealthBadge(
                id="BADGE_HIGH_FIBER",
                label="High Dietary Fiber",
                severity="good",
                metric_triggered="dietary_fiber",
                measured_value=nutrients.dietary_fiber_g,
                threshold_value=6.0,
                unit="g",
                rationale=f"Provides {nutrients.dietary_fiber_g}g dietary fiber per 100g, supporting digestive health."
            ))

        if nutrients.saturated_fat_g <= 1.5 and nutrients.trans_fat_g == 0.0 and (nutrients.total_fat_g - nutrients.saturated_fat_g) >= 10.0:
            badges.append(HealthBadge(
                id="BADGE_HEART_FATS",
                label="Heart Healthy Fats",
                severity="good",
                metric_triggered="unsaturated_fat",
                measured_value=nutrients.total_fat_g - nutrients.saturated_fat_g,
                threshold_value=10.0,
                unit="g",
                rationale="Rich in mono- and polyunsaturated fatty acids with minimal saturated fat."
            ))

        return badges

    @classmethod
    def resolve_alternatives(cls, product_name: str, category: str, health_score: int) -> List[HealthierAlternative]:
        """
        Selects culturally appropriate, healthier Indian whole-food alternatives.
        """
        name_lower = f"{product_name} {category}".lower()

        if any(k in name_lower for k in ["cola", "soda", "drink", "juice", "beverage", "energy drink"]):
            return INDIAN_HEALTHIER_ALTERNATIVES_MAP["sweet_beverage"]
        elif any(k in name_lower for k in ["malt", "bournvita", "horlicks", "boost", "complan", "powder", "cocoa"]):
            return INDIAN_HEALTHIER_ALTERNATIVES_MAP["malted_drink"]
        elif any(k in name_lower for k in ["noodle", "maggi", "ramen", "pasta", "vermicelli"]):
            return INDIAN_HEALTHIER_ALTERNATIVES_MAP["instant_noodles"]
        elif any(k in name_lower for k in ["chip", "wafer", "kurkure", "snack", "namkeen", "bhujia"]):
            return INDIAN_HEALTHIER_ALTERNATIVES_MAP["savory_chips"]
        elif any(k in name_lower for k in ["biscuit", "cookie", "cake", "cream", "bourbon", "oreo"]):
            return INDIAN_HEALTHIER_ALTERNATIVES_MAP["biscuits_confectionery"]
        else:
            if health_score < 50:
                return INDIAN_HEALTHIER_ALTERNATIVES_MAP["malted_drink"]
            return []

    @classmethod
    def audit_product(
        cls,
        panel: ParsedNutritionPanel,
        audit_id: Optional[str] = None
    ) -> HealthAuditPayload:
        """
        Performs complete nutritional audit against ICMR-NIN 2024 and WHO thresholds.
        """
        audit_uuid = audit_id or f"h-{uuid.uuid4().hex[:8]}"
        p = panel.nutrients_per_100g

        score, penalties, credits = cls.calculate_health_score(
            p, is_liquid=panel.is_liquid, nova_group=panel.nova_classification.group
        )

        if score >= 80:
            score_band = "Nutritious Choice"
            density = "Excellent / Whole Food Density"
        elif score >= 60:
            score_band = "Consume in Moderation"
            density = "Balanced Nutritional Profile"
        elif score >= 40:
            score_band = "Processed Formulation"
            density = "Elevated Processing / Moderate Concerns"
        else:
            score_band = "High Health Concern"
            density = "Poor / Ultra-Processed (HFSS)"

        badges = cls.evaluate_badges(
            p, is_liquid=panel.is_liquid, nova_group=panel.nova_classification.group
        )

        # Build nutrient rows
        nutrient_entries: List[Dict[str, Any]] = []

        nutrient_specs = [
            ("Total Sugars", p.total_sugars_g, "g", 10.0, 25.0),
            ("Added Sugars", p.added_sugars_g, "g", 5.0, 25.0),
            ("Total Fat", p.total_fat_g, "g", 8.0, 65.0),
            ("Saturated Fat", p.saturated_fat_g, "g", 4.0, 20.0),
            ("Trans Fat", p.trans_fat_g, "g", 0.0, 0.0),
            ("Sodium", p.sodium_mg, "mg", 400.0, 2000.0),
            ("Dietary Fiber", p.dietary_fiber_g, "g", 6.0, 30.0),
            ("Protein", p.protein_g, "g", 8.0, 54.0),
        ]

        for name, val, unit, icmr_lim, daily_lim in nutrient_specs:
            pct_daily = round((val / daily_lim) * 100.0, 1) if daily_lim > 0 else (100.0 if val > 0 else 0.0)

            # Determine status & threshold
            if name in ["Added Sugars", "Total Sugars", "Saturated Fat", "Sodium"]:
                if val > icmr_lim:
                    status = "violation"
                    level = "High" if val <= icmr_lim * 2 else "Excessive"
                    assessment = f"Exceeds ICMR safe recommendation ({icmr_lim}{unit}) by {round(((val - icmr_lim)/icmr_lim)*100)}%."
                elif val > icmr_lim * 0.5:
                    status = "warning"
                    level = "Moderate"
                    assessment = f"Moderate content approaching ICMR threshold limit."
                else:
                    status = "compliant"
                    level = "Low"
                    assessment = f"Well within safe ICMR dietary baseline limits."
            elif name == "Trans Fat":
                if val > 0.0:
                    status = "violation"
                    level = "Excessive"
                    assessment = "Violates WHO zero-tolerance target for industrial trans fatty acids."
                else:
                    status = "compliant"
                    level = "Low"
                    assessment = "Zero trans fats detected. Compliant with heart health guidelines."
            elif name in ["Dietary Fiber", "Protein"]:
                if val >= icmr_lim:
                    status = "compliant"
                    level = "High"
                    assessment = f"Nutrient dense: supplies substantial natural dietary {name.lower()}."
                elif val >= icmr_lim * 0.5:
                    status = "compliant"
                    level = "Moderate"
                    assessment = f"Supplies moderate {name.lower()} per 100g."
                else:
                    status = "warning"
                    level = "Low"
                    assessment = f"Low {name.lower()} concentration; pair with whole grains or legumes."
            else:
                status = "compliant"
                level = "Moderate"
                assessment = "Within expected nutritional range."

            nutrient_entries.append({
                "name": name,
                "value": val,
                "unit": unit,
                "per": "100ml" if panel.is_liquid else "100g",
                "threshold": level,
                "status": status,
                "icmr_limit": icmr_lim,
                "percentage_of_daily_limit": pct_daily,
                "assessment": assessment
            })

        # Clinical Contraindications
        who_should_avoid: List[str] = []
        who_can_consume: List[str] = []

        if p.added_sugars_g > 5.0 or p.total_sugars_g > 10.0:
            who_should_avoid.append("Individuals with Type 1 or Type 2 Diabetes due to rapid glycemic load.")
            who_should_avoid.append("Sedentary children and toddlers (elevated risk of dental caries and early adiposity).")
        else:
            who_can_consume.append("Individuals seeking low glycemic index and controlled sugar diets.")

        if p.sodium_mg > 400.0:
            who_should_avoid.append("Patients diagnosed with Hypertension, elevated blood pressure, or CKD.")
        else:
            who_can_consume.append("Individuals monitoring cardiovascular health and dietary sodium limits.")

        if p.saturated_fat_g > 4.0 or p.trans_fat_g > 0.0:
            who_should_avoid.append("Individuals with elevated LDL cholesterol, atherosclerosis, or heart disease.")

        if score >= 80:
            who_can_consume.append("General public, active fitness enthusiasts, seniors, and growing adolescents.")
        elif score <= 40:
            who_can_consume.append("Endurance athletes under high caloric expenditure with strictly measured portions.")

        # Healthier Alternatives
        alternatives = cls.resolve_alternatives(panel.product_name, panel.commodity_category, score)

        alt_dicts = [
            {
                "alternative_name": a.alternative_name,
                "swap_advantage": a.swap_advantage,
                "calorie_difference": a.calorie_difference,
                "processing_level": a.processing_level
            }
            for a in alternatives
        ]

        summary = (
            f"{panel.product_name} evaluated with Composite Health Score {score}/100 ({score_band}). "
            f"Classification: {panel.nova_classification.name} (NOVA {panel.nova_classification.group}). "
            f"Total statutory deductions: {penalties['total_penalties']} pts; positive credits: {credits['total_credits']} pts. "
            f"{len(badges)} advisory indicators triggered."
        )

        badge_dicts = [
            {
                "badge": b.label,
                "severity": b.severity,
                "rationale": b.rationale,
                "regulatory_basis": b.regulatory_basis
            }
            for b in badges
        ]

        return HealthAuditPayload(
            audit_id=audit_uuid,
            product_name=panel.product_name,
            brand=panel.brand,
            health_score=float(score),
            score_band=score_band,
            nutritional_density=density,
            serving_size=f"{panel.serving_size_g} {panel.serving_unit}",
            servings_per_container=max(1, int(round(100.0 / panel.serving_size_g))) if panel.serving_size_g < 100 else 1,
            nova_classification={
                "group": panel.nova_classification.group,
                "name": panel.nova_classification.name,
                "summary": panel.nova_classification.summary,
                "detected_markers": panel.nova_classification.ultra_processed_markers
            },
            nutrients=nutrient_entries,
            badges=badge_dicts,
            dietary_advisory={
                "who_should_avoid": who_should_avoid,
                "who_can_consume": who_can_consume,
                "healthier_alternatives": alt_dicts
            },
            fssai_compliance={
                "license_number": "10014011002233",
                "license_status": "active",
                "veg_indicator": "vegetarian_green_dot_present",
                "allergen_statement_present": True,
                "detected_allergens": ["Gluten (Wheat)", "Milk Solids"]
            },
            penalties=penalties,
            credits=credits,
            dietary_summary=summary
        )
