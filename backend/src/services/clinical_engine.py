"""
BiteIQ - Clinical Contraindication & Health Rules Engine.
Evaluates food items, meals, and ingredients against user chronic conditions and allergies
to produce real-time clinical alerts, safety advisories, and whole-food alternatives.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set


@dataclass
class ClinicalAlert:
    condition_key: str
    severity: str  # 'info', 'warning', 'critical'
    title: str
    message: str
    recommendation: Optional[str] = None


@dataclass
class WholeFoodSwap:
    category: str
    original_item: str
    swap_name: str
    swap_advantage: str
    calorie_difference: str


# Knowledge base of culturally familiar Indian whole-food swaps
INDIAN_WHOLE_FOOD_SWAPS: List[WholeFoodSwap] = [
    WholeFoodSwap(
        category="sweet_beverage",
        original_item="Carbonated Sweetened Soda / Cola",
        swap_name="Fresh Tender Coconut Water",
        swap_advantage="0g added sugar, rich in natural potassium and electrolytes that blunt vascular tension",
        calorie_difference="-110 kcal per 300ml",
    ),
    WholeFoodSwap(
        category="sweet_beverage",
        original_item="Packaged Fruit Juice Concentrate",
        swap_name="Spiced Chaas (Buttermilk) with Roasted Jeera",
        swap_advantage="Probiotic fermented dairy, low glycemic load, natural satiety, zero added fructose",
        calorie_difference="-80 kcal per 250ml",
    ),
    WholeFoodSwap(
        category="fried_snack",
        original_item="Commercial Fried Potato Chips / Extruded Snacks",
        swap_name="Roasted Makhana (Foxnuts) with Rock Salt & Turmeric",
        swap_advantage="Zero industrial palmolein, -80% sodium, rich in antioxidants and plant magnesium",
        calorie_difference="-220 kcal per 100g",
    ),
    WholeFoodSwap(
        category="fried_snack",
        original_item="Deep Fried Samosa / Pakoda",
        swap_name="Air-Popped Spiced Chana (Bengal Gram)",
        swap_advantage="High dietary fiber (10g+), low GI, sustained satiety without trans fats",
        calorie_difference="-190 kcal per serving",
    ),
    WholeFoodSwap(
        category="refined_grain",
        original_item="Refined Wheat Toast (Maida) with Fruit Jam",
        swap_name="Besan Chilla (Gram Flour Pancake) with Mint Chutney",
        swap_advantage="High plant protein (8g), complex low-GI carbs, high prebiotic fiber",
        calorie_difference="-90 kcal per meal",
    ),
    WholeFoodSwap(
        category="refined_grain",
        original_item="Instant Maida Noodles",
        swap_name="Foxtail Millet / Vegetable Oats Upma",
        swap_advantage="4x dietary fiber, zero synthetic tertiary butylhydroquinone (TBHQ), steady glycemic curve",
        calorie_difference="-140 kcal per bowl",
    ),
    WholeFoodSwap(
        category="sweet_dessert",
        original_item="Milk Chocolate Bar with Liquid Glucose",
        swap_name="Fresh Guava with Chaat Masala or Pomegranate Seeds with Curd",
        swap_advantage="Natural polyphenol fiber matrix, zero added sugar, Vitamin C powerhouse",
        calorie_difference="-180 kcal per serve",
    ),
]


class ClinicalContraindicationEngine:
    """
    Evaluates meal items and scanned foods against individual clinical disease profiles.
    """

    # High-GI sugars that cause rapid blood glucose spikes
    HIGH_GI_SUGARS = [
        "maltodextrin",
        "liquid glucose",
        "invert sugar syrup",
        "dextrose",
        "high fructose corn syrup",
        "hfcs",
        "corn syrup solids",
    ]

    # Non-nutritive artificial sweeteners
    ARTIFICIAL_SWEETENERS = [
        "sucralose",
        "acesulfame",
        "aspartame",
        "saccharin",
        "ins 950",
        "ins 951",
        "ins 955",
        "ins 954",
        "neotame",
    ]

    # Industrial oils rich in saturated palmitic acid and atherogenic lipids
    ATHEROGENIC_OILS = [
        "palmolein",
        "palm oil",
        "palm kernel oil",
        "hydrogenated vegetable fat",
        "hydrogenated vegetable oil",
        "vanaspati",
        "partially hydrogenated",
    ]

    # Gluten-bearing grains and derivatives
    GLUTEN_TERMS = [
        "wheat",
        "atta",
        "maida",
        "barley",
        "rye",
        "spelt",
        "semolina",
        "suji",
        "rava",
        "malt extract",
        "maltodextrin from wheat",
    ]

    # Inorganic phosphate food additives (high renal absorption load)
    INORGANIC_PHOSPHATES = [
        "ins 338",
        "ins 339",
        "ins 340",
        "ins 450",
        "ins 451",
        "ins 452",
        "phosphoric acid",
        "sodium phosphate",
        "potassium phosphate",
        "diphosphate",
        "polyphosphate",
    ]

    # Sodium-bearing preservatives & flavour enhancers
    SODIUM_ADDITIVES = [
        "monosodium glutamate",
        "msg",
        "ins 621",
        "sodium benzoate",
        "ins 211",
        "sodium bicarbonate",
        "disodium 5'-ribonucleotide",
        "ins 635",
        "disodium 5'-guanylate",
        "ins 627",
        "disodium 5'-inosinate",
        "ins 631",
        "sodium metabisulphite",
        "ins 223",
    ]

    @classmethod
    def calculate_net_carbs(
        cls,
        total_carbs_g: float,
        fiber_g: float = 0.0,
        sugar_alcohols_g: float = 0.0,
    ) -> float:
        """
        Computes Net Carbohydrates: Total Carbs - Dietary Fiber - (0.5 * Sugar Alcohols).
        """
        net = float(total_carbs_g) - float(fiber_g) - (0.5 * float(sugar_alcohols_g))
        return round(max(0.0, net), 1)

    @classmethod
    def evaluate_food(
        cls,
        user_conditions: List[str],
        food_name: str,
        nutrients: Dict[str, Any],
        ingredients_text: Optional[str] = None,
        cumulative_daily_sodium_mg: float = 0.0,
    ) -> List[ClinicalAlert]:
        """
        Evaluates a single food item against the user's active clinical conditions.
        Returns a list of ClinicalAlert items.
        """
        alerts: List[ClinicalAlert] = []
        cond_set: Set[str] = {str(c).lower().strip() for c in user_conditions}
        ing_clean = str(ingredients_text or "").lower()
        food_clean = str(food_name).lower()

        # Extract nutrients safely
        calories = float(nutrients.get("calories", nutrients.get("energy_kcal", 0.0)))
        carbs = float(nutrients.get("carbs_g", nutrients.get("total_carbs_g", 0.0)))
        protein = float(nutrients.get("protein_g", 0.0))
        fat = float(nutrients.get("fat_g", nutrients.get("total_fat_g", 0.0)))
        fiber = float(nutrients.get("fiber_g", nutrients.get("dietary_fiber_g", 0.0)))
        sodium = float(nutrients.get("sodium_mg", 0.0))
        sugar = float(nutrients.get("sugar_g", nutrients.get("total_sugars_g", 0.0)))
        added_sugar = float(nutrients.get("added_sugars_g", sugar))
        sat_fat = float(nutrients.get("saturated_fat_g", 0.0))
        trans_fat = float(nutrients.get("trans_fat_g", 0.0))

        net_carbs = cls.calculate_net_carbs(carbs, fiber)

        # ----------------------------------------------------------------------
        # 1. Type 2 Diabetes / Prediabetes Rulebook
        # ----------------------------------------------------------------------
        if "diabetes_type_2" in cond_set or "prediabetes" in cond_set:
            if net_carbs > 40.0:
                alerts.append(
                    ClinicalAlert(
                        condition_key="diabetes_type_2",
                        severity="warning",
                        title="High Glycemic Load Meal",
                        message=f"Contains {net_carbs}g net carbohydrates in a single serving. This can trigger a sharp postprandial glucose spike.",
                        recommendation="Pair with raw vegetable salad (fiber) or lean protein to slow carbohydrate gastric emptying.",
                    )
                )

            if added_sugar > 5.0:
                alerts.append(
                    ClinicalAlert(
                        condition_key="diabetes_type_2",
                        severity="warning",
                        title="Elevated Added Sugar",
                        message=f"Contains {added_sugar}g of sugars, exceeding single-serving glycemic thresholds.",
                        recommendation="Look for unsweetened whole-food alternatives.",
                    )
                )

            # Hidden high-GI sugars
            detected_sugars = [s for s in cls.HIGH_GI_SUGARS if s in ing_clean or s in food_clean]
            if detected_sugars:
                alerts.append(
                    ClinicalAlert(
                        condition_key="diabetes_type_2",
                        severity="critical",
                        title="Hidden High-GI Additives Detected",
                        message=f"Identified disguised high-glycemic sugars ({', '.join(detected_sugars)}). These have a Glycemic Index above 100 and cause rapid blood sugar surges.",
                        recommendation="Avoid products formulated with maltodextrin or liquid glucose.",
                    )
                )

            # Non-sugar sweetener advisory
            detected_sweeteners = [sw for sw in cls.ARTIFICIAL_SWEETENERS if sw in ing_clean]
            if detected_sweeteners:
                alerts.append(
                    ClinicalAlert(
                        condition_key="diabetes_type_2",
                        severity="info",
                        title="Non-Sugar Sweetener Advisory",
                        message=f"Contains non-nutritive sweetener ({', '.join(detected_sweeteners)}). WHO guidelines advise these do not provide long-term glycemic benefits and may alter gut microbiome diversity.",
                        recommendation="Prefer naturally unsweetened whole foods over artificial diet foods.",
                    )
                )

        # ----------------------------------------------------------------------
        # 2. Hypertension (High Blood Pressure) Rulebook
        # ----------------------------------------------------------------------
        if "hypertension" in cond_set:
            if sodium > 400.0:
                alerts.append(
                    ClinicalAlert(
                        condition_key="hypertension",
                        severity="warning",
                        title="High Sodium Item",
                        message=f"Contains {sodium:.0f}mg sodium in a single serving (>26% of your strict 1,500mg daily DASH ceiling).",
                        recommendation="Drink plenty of water and balance with potassium-rich whole foods like tender coconut water or spinach.",
                    )
                )

            if (cumulative_daily_sodium_mg + sodium) > 1500.0:
                alerts.append(
                    ClinicalAlert(
                        condition_key="hypertension",
                        severity="critical",
                        title="Daily Sodium Limit Exceeded",
                        message=f"Adding this food brings daily sodium to {cumulative_daily_sodium_mg + sodium:.0f}mg, crossing your 1,500mg clinical threshold.",
                        recommendation="Avoid additional salted snacks or pickles for the rest of the day.",
                    )
                )

            detected_na_additives = [na for na in cls.SODIUM_ADDITIVES if na in ing_clean]
            if detected_na_additives:
                alerts.append(
                    ClinicalAlert(
                        condition_key="hypertension",
                        severity="warning",
                        title="Hidden Sodium Salts Detected",
                        message=f"Contains sodium-bearing additives ({', '.join(detected_na_additives)}) which elevate vascular pressure without tasting salty.",
                        recommendation="Choose fresh, minimally processed home-cooked options.",
                    )
                )

        # ----------------------------------------------------------------------
        # 3. Dyslipidemia & Cardiovascular Disease Rulebook
        # ----------------------------------------------------------------------
        if "dyslipidemia" in cond_set:
            if sat_fat > 4.0:
                alerts.append(
                    ClinicalAlert(
                        condition_key="dyslipidemia",
                        severity="warning",
                        title="Elevated Saturated Fat",
                        message=f"Contains {sat_fat}g saturated fat. High saturated fat downregulates LDL clearance receptors, increasing circulating ApoB.",
                        recommendation="Limit dietary saturated fat to <7% of total daily caloric intake.",
                    )
                )

            detected_oils = [oil for oil in cls.ATHEROGENIC_OILS if oil in ing_clean or oil in food_clean]
            if detected_oils:
                alerts.append(
                    ClinicalAlert(
                        condition_key="dyslipidemia",
                        severity="critical",
                        title="Industrial Palmolein / Vanaspati Detected",
                        message=f"Formulated with industrial palm oil/hydrogenated fat ({', '.join(detected_oils)}), known to increase atherogenic LDL particles.",
                        recommendation="Replace with snacks roasted in cold-pressed mustard oil, olive oil, or zero added fat.",
                    )
                )

            if trans_fat > 0.0:
                alerts.append(
                    ClinicalAlert(
                        condition_key="dyslipidemia",
                        severity="critical",
                        title="Trans Fat Detected",
                        message=f"Contains {trans_fat}g trans fat. Zero tolerance applies: trans fats simultaneously raise LDL and depress protective HDL.",
                        recommendation="Strictly avoid products with partially hydrogenated fats.",
                    )
                )

        # ----------------------------------------------------------------------
        # 4. Polycystic Ovary Syndrome (PCOS / PCOD) Rulebook
        # ----------------------------------------------------------------------
        if "pcod_pcos" in cond_set:
            if "maida" in ing_clean or "refined wheat flour" in ing_clean:
                alerts.append(
                    ClinicalAlert(
                        condition_key="pcod_pcos",
                        severity="warning",
                        title="Refined Flour (Maida) Detected",
                        message="Refined wheat flour drives rapid insulin spikes that stimulate ovarian theca cells to overproduce androgens.",
                        recommendation="Opt for complex millets (Jowar, Bajra, Ragi) or whole sprouted grains.",
                    )
                )

            if any(oil in ing_clean for oil in cls.ATHEROGENIC_OILS):
                alerts.append(
                    ClinicalAlert(
                        condition_key="pcod_pcos",
                        severity="warning",
                        title="Inflammatory Seed / Palm Oil Detected",
                        message="Ultra-processed heated oils contribute to systemic low-grade inflammation in PCOS.",
                        recommendation="Prioritize anti-inflammatory monounsaturated fats (nuts, seeds, cold-pressed oils).",
                    )
                )

        # ----------------------------------------------------------------------
        # 5. Non-Alcoholic Fatty Liver Disease (NAFLD) Rulebook
        # ----------------------------------------------------------------------
        if "fatty_liver_nafld" in cond_set:
            if "high fructose corn syrup" in ing_clean or "hfcs" in ing_clean or "fructose" in ing_clean:
                alerts.append(
                    ClinicalAlert(
                        condition_key="fatty_liver_nafld",
                        severity="critical",
                        title="Hepatic Lipogenesis Risk (Added Fructose)",
                        message="Added fructose bypasses phosphofructokinase and is metabolized directly in the liver into triglycerides, worsening hepatic steatosis.",
                        recommendation="Strictly avoid commercial syrups, sweetened juices, and beverages.",
                    )
                )

        # ----------------------------------------------------------------------
        # 6. Chronic Kidney Disease (CKD Stages 1–3) Rulebook
        # ----------------------------------------------------------------------
        if "chronic_kidney_disease_ckd" in cond_set:
            if protein > 30.0:
                alerts.append(
                    ClinicalAlert(
                        condition_key="chronic_kidney_disease_ckd",
                        severity="warning",
                        title="High Single-Meal Protein Bolus",
                        message=f"Contains {protein}g protein. Large protein boluses elevate intraglomerular pressure in impaired renal nephrons.",
                        recommendation="Distribute protein intake evenly across smaller meals (max 20-25g per meal).",
                    )
                )

            detected_phosphates = [p for p in cls.INORGANIC_PHOSPHATES if p in ing_clean]
            if detected_phosphates:
                alerts.append(
                    ClinicalAlert(
                        condition_key="chronic_kidney_disease_ckd",
                        severity="critical",
                        title="Inorganic Phosphate Additive Detected",
                        message=f"Contains inorganic phosphate additives ({', '.join(detected_phosphates)}). These are 90-100% absorbed by the intestines, increasing renal phosphorus load.",
                        recommendation="Choose fresh whole foods with natural organic phosphates.",
                    )
                )

        # ----------------------------------------------------------------------
        # 7. Celiac Disease (Strict Gluten Interception)
        # ----------------------------------------------------------------------
        if "celiac_disease" in cond_set:
            detected_gluten = [g for g in cls.GLUTEN_TERMS if g in ing_clean or g in food_clean]
            if detected_gluten:
                alerts.append(
                    ClinicalAlert(
                        condition_key="celiac_disease",
                        severity="critical",
                        title="CRITICAL HAZARD: GLUTEN DETECTED",
                        message=f"Item contains gluten-bearing ingredients ({', '.join(detected_gluten)}). Unsafe for Celiac Disease.",
                        recommendation="Choose certified gluten-free alternatives made from rice, maize, or millets.",
                    )
                )

        # ----------------------------------------------------------------------
        # 8. Severe Food Allergies
        # ----------------------------------------------------------------------
        allergy_map = {
            "peanut_allergy": ["peanut", "groundnut", "moongfali"],
            "tree_nut_allergy": ["almond", "cashew", "walnut", "pistachio", "hazelnut", "pecan"],
            "shellfish_allergy": ["prawn", "shrimp", "crab", "lobster", "shellfish"],
            "soy_allergy": ["soy", "soya", "soybean", "edamame", "tofu"],
            "egg_allergy": ["egg", "albumin", "egg yolk", "egg white"],
            "lactose_intolerance": ["milk", "dairy", "cheese", "paneer", "whey", "curd", "yogurt"],
        }

        for condition_key, triggers in allergy_map.items():
            if condition_key in cond_set:
                matched = [t for t in triggers if t in ing_clean or t in food_clean]
                if matched:
                    alerts.append(
                        ClinicalAlert(
                            condition_key=condition_key,
                            severity="critical",
                            title=f"Allergen Alert: {matched[0].capitalize()}",
                            message=f"Matches your declared allergen profile ({', '.join(matched)}).",
                            recommendation="Do not consume this food.",
                        )
                    )

        return alerts

    @classmethod
    def get_swaps(cls, category: Optional[str] = None) -> List[WholeFoodSwap]:
        """
        Retrieves recommended Indian whole-food alternatives.
        Optionally filtered by category.
        """
        if not category:
            return INDIAN_WHOLE_FOOD_SWAPS

        cat_clean = category.lower().strip()
        return [s for s in INDIAN_WHOLE_FOOD_SWAPS if s.category.lower() == cat_clean]
