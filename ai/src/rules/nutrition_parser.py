import re
from typing import Dict, Any, Optional, List, Tuple
from pydantic import BaseModel, Field


class NutrientValues(BaseModel):
    energy_kcal: float = Field(default=0.0, ge=0.0, description="Energy in kilocalories")
    total_fat_g: float = Field(default=0.0, ge=0.0, description="Total fat in grams")
    saturated_fat_g: float = Field(default=0.0, ge=0.0, description="Saturated fatty acids in grams")
    trans_fat_g: float = Field(default=0.0, ge=0.0, description="Trans fatty acids in grams")
    cholesterol_mg: float = Field(default=0.0, ge=0.0, description="Cholesterol in milligrams")
    sodium_mg: float = Field(default=0.0, ge=0.0, description="Sodium in milligrams")
    total_carbohydrates_g: float = Field(default=0.0, ge=0.0, description="Total carbohydrates in grams")
    total_sugars_g: float = Field(default=0.0, ge=0.0, description="Total sugars in grams")
    added_sugars_g: float = Field(default=0.0, ge=0.0, description="Added or free sugars in grams")
    dietary_fiber_g: float = Field(default=0.0, ge=0.0, description="Dietary fiber in grams")
    protein_g: float = Field(default=0.0, ge=0.0, description="Protein in grams")


class NovaClassification(BaseModel):
    group: int = Field(description="NOVA classification group number 1 to 4")
    name: str = Field(description="NOVA classification group name")
    summary: str = Field(description="Scientific rationale for NOVA grouping")
    ultra_processed_markers: List[str] = Field(default_factory=list, description="Detected industrial cosmetic markers")


class ParsedNutritionPanel(BaseModel):
    product_name: str
    brand: str
    commodity_category: str
    declared_basis: str  # per_100g, per_serve, dual_declared
    serving_size_g: float = 100.0
    serving_unit: str = "g"
    is_liquid: bool = False
    nutrients_per_100g: NutrientValues
    nutrients_per_serve: NutrientValues
    nova_classification: NovaClassification
    invariants_valid: bool = True
    invariants_warnings: List[str] = Field(default_factory=list)


# Known Ultra-Processed Cosmetic Food Additive Markers (NOVA 4)
UPF_MARKERS = {
    "emulsifier": ["ins 471", "ins 472", "ins 322", "soy lecithin", "polysorbate", "mono- and diglycerides"],
    "artificial_sweetener": ["ins 950", "ins 951", "ins 955", "aspartame", "acesulfame", "sucralose", "saccharin"],
    "industrial_syrup": ["high fructose corn syrup", "inverted sugar syrup", "maltodextrin", "liquid glucose", "dextrose monohydrate"],
    "thickener_stabilizer": ["ins 412", "guar gum", "ins 415", "xanthan gum", "ins 407", "carrageenan"],
    "hydrogenated_fat": ["hydrogenated vegetable oil", "partially hydrogenated oil", "interesterified fat", "refined palm olein", "fractionated palm fat"],
    "flavour_enhancer": ["ins 621", "msg", "monosodium glutamate", "ins 627", "ins 631", "disodium inosinate"],
}


class NutritionFactsParser:
    """
    Optical and structured parser for packaged food back-panel nutrition tables.
    Implements FSSAI Labelling Regulations (2020) and ICMR-NIN 2024 profiling specifications.
    """

    @staticmethod
    def normalize_to_100g(
        declared_values: Dict[str, float],
        serving_size_g: float,
        declared_basis: str = "per_100g",
        is_liquid: bool = False
    ) -> Tuple[NutrientValues, NutrientValues]:
        """
        Standardizes nutritional quantities to a uniform 100g (or 100ml) denominator
        while preserving serving-size calculations.
        """
        if serving_size_g <= 0:
            serving_size_g = 100.0

        per_100_dict: Dict[str, float] = {}
        per_serve_dict: Dict[str, float] = {}

        multiplier = 100.0 / serving_size_g if declared_basis == "per_serve" else 1.0
        serve_ratio = serving_size_g / 100.0 if declared_basis == "per_100g" else 1.0

        for key in [
            "energy_kcal", "total_fat_g", "saturated_fat_g", "trans_fat_g",
            "cholesterol_mg", "sodium_mg", "total_carbohydrates_g",
            "total_sugars_g", "added_sugars_g", "dietary_fiber_g", "protein_g"
        ]:
            raw_val = float(declared_values.get(key, 0.0))
            if declared_basis == "per_serve":
                per_serve_dict[key] = round(raw_val, 2)
                per_100_dict[key] = round(raw_val * multiplier, 2)
            else:
                per_100_dict[key] = round(raw_val, 2)
                per_serve_dict[key] = round(raw_val * serve_ratio, 2)

        return NutrientValues(**per_100_dict), NutrientValues(**per_serve_dict)

    @staticmethod
    def validate_invariants(nutrients: NutrientValues) -> Tuple[bool, List[str]]:
        """
        Enforces statutory mass conservation and nutritional invariants:
        1. total_fat >= saturated_fat + trans_fat
        2. total_carbohydrates >= total_sugars >= added_sugars
        """
        warnings: List[str] = []
        is_valid = True

        # Mass conservation: Fat fractions
        fat_sum = nutrients.saturated_fat_g + nutrients.trans_fat_g
        if fat_sum > nutrients.total_fat_g + 0.5:  # 0.5g tolerance for rounding
            warnings.append(
                f"Fat invariant violated: Saturated fat ({nutrients.saturated_fat_g}g) + "
                f"Trans fat ({nutrients.trans_fat_g}g) exceeds Total fat ({nutrients.total_fat_g}g)."
            )
            is_valid = False

        # Mass conservation: Sugar fractions
        if nutrients.added_sugars_g > nutrients.total_sugars_g + 0.5:
            warnings.append(
                f"Carbohydrate invariant violated: Added sugars ({nutrients.added_sugars_g}g) "
                f"exceed Total sugars ({nutrients.total_sugars_g}g)."
            )
            is_valid = False

        if nutrients.total_sugars_g > nutrients.total_carbohydrates_g + 0.5:
            warnings.append(
                f"Carbohydrate invariant violated: Total sugars ({nutrients.total_sugars_g}g) "
                f"exceed Total carbohydrates ({nutrients.total_carbohydrates_g}g)."
            )
            is_valid = False

        return is_valid, warnings

    @staticmethod
    def classify_nova(
        ingredients_text: str,
        nutrients_100g: NutrientValues,
        commodity_name: str = ""
    ) -> NovaClassification:
        """
        Determines the NOVA food processing classification (Group 1 to 4).
        """
        text_lower = ingredients_text.lower()
        detected_markers: List[str] = []

        for category, markers in UPF_MARKERS.items():
            for marker in markers:
                if marker in text_lower:
                    detected_markers.append(f"{category}: {marker}")

        # Group 4: Ultra-processed food products
        # Indicators: Presence of cosmetic additives, inverted syrups, or severe HFSS formulation
        if (
            len(detected_markers) >= 1
            or nutrients_100g.added_sugars_g > 20.0
            or (nutrients_100g.sodium_mg > 800.0 and nutrients_100g.saturated_fat_g > 5.0)
            or "instant noodles" in commodity_name.lower()
            or "chips" in commodity_name.lower()
            or "biscuit" in commodity_name.lower()
        ):
            summary = (
                "Industrial formulation of ingredients containing cosmetic food additives, "
                "refined fractionated fats, or synthetic processing aids with minimal intact whole foods."
            )
            return NovaClassification(
                group=4,
                name="Ultra-processed food products",
                summary=summary,
                ultra_processed_markers=detected_markers or ["Industrial formulation with high nutrient refining"],
            )

        # Group 3: Processed foods
        # Indicators: Added sugar, oil, or salt to preserve or enhance whole foods (e.g. canned beans, cheese)
        if nutrients_100g.total_sugars_g > 5.0 or nutrients_100g.sodium_mg > 300.0 or nutrients_100g.total_fat_g > 10.0:
            return NovaClassification(
                group=3,
                name="Processed foods",
                summary="Relatively simple foods manufactured by adding salt, sugar, or oil to intact foods.",
                ultra_processed_markers=[],
            )

        # Group 2: Processed culinary ingredients
        if any(w in commodity_name.lower() for w in ["oil", "ghee", "butter", "sugar", "salt", "flour"]):
            return NovaClassification(
                group=2,
                name="Processed culinary ingredients",
                summary="Substances derived from nature or whole foods used in culinary preparation.",
                ultra_processed_markers=[],
            )

        # Group 1: Unprocessed or minimally processed foods
        return NovaClassification(
            group=1,
            name="Unprocessed or minimally processed foods",
            summary="Whole, unadulterated edible parts of plants or animals subjected to minimal physical processing.",
            ultra_processed_markers=[],
        )

    @classmethod
    def parse_nutrition_text(
        cls,
        text: str,
        ingredients_text: str = "",
        product_name: str = "Packaged Food Commodity",
        brand: str = "Brand",
        category: str = "Packaged Food",
        serving_size_g: float = 100.0,
        is_liquid: bool = False
    ) -> ParsedNutritionPanel:
        """
        Extracts nutritional parameters from raw back-panel text lines.
        """
        lines = text.lower().split("\n")
        extracted: Dict[str, float] = {}

        patterns = {
            "energy_kcal": r"(?:energy|calories|caloric value)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*(?:kcal|cal)?",
            "total_fat_g": r"(?:total fat|fat)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*g",
            "saturated_fat_g": r"(?:saturated fat|saturated fatty acids|sfa)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*g",
            "trans_fat_g": r"(?:trans fat|trans fatty acids|tfa)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*g",
            "cholesterol_mg": r"(?:cholesterol)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*mg",
            "sodium_mg": r"(?:sodium|salt equivalent)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*mg",
            "total_carbohydrates_g": r"(?:carbohydrate|total carbohydrate|carbs)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*g",
            "total_sugars_g": r"(?:total sugars?|sugars?)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*g",
            "added_sugars_g": r"(?:added sugars?|free sugars?)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*g",
            "dietary_fiber_g": r"(?:dietary fiber|fibre)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*g",
            "protein_g": r"(?:protein)[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*g",
        }

        full_text = " ".join(lines)
        for nutrient, pattern in patterns.items():
            match = re.search(pattern, full_text, re.IGNORECASE)
            if match:
                try:
                    extracted[nutrient] = float(match.group(1))
                except ValueError:
                    extracted[nutrient] = 0.0

        # Infer added sugar if undeclared but total sugar is present
        if "added_sugars_g" not in extracted and "total_sugars_g" in extracted:
            extracted["added_sugars_g"] = max(0.0, round(extracted["total_sugars_g"] - 4.0, 2))

        # Check declared basis
        declared_basis = "per_100g"
        if "per serve" in full_text or "per serving" in full_text:
            declared_basis = "per_serve"

        nutrients_100g, nutrients_serve = cls.normalize_to_100g(
            extracted, serving_size_g, declared_basis=declared_basis, is_liquid=is_liquid
        )

        is_valid, warnings = cls.validate_invariants(nutrients_100g)
        nova = cls.classify_nova(ingredients_text, nutrients_100g, commodity_name=product_name)

        return ParsedNutritionPanel(
            product_name=product_name,
            brand=brand,
            commodity_category=category,
            declared_basis=declared_basis,
            serving_size_g=serving_size_g,
            serving_unit="ml" if is_liquid else "g",
            is_liquid=is_liquid,
            nutrients_per_100g=nutrients_100g,
            nutrients_per_serve=nutrients_serve,
            nova_classification=nova,
            invariants_valid=is_valid,
            invariants_warnings=warnings,
        )
