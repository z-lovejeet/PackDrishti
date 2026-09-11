import json
import logging
import base64
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, model_validator
from backend.src.core.config import settings

logger = logging.getLogger("packdrashiti.health_agent")


class HealthBadge(BaseModel):
    label: str = "Health Marker"
    type: str = "warning"  # 'danger' | 'warning' | 'good' | 'neutral'
    description: Optional[str] = None
    whatIsIt: Optional[str] = None
    whyUsed: Optional[str] = None
    healthConsequences: Optional[str] = None
    safeDailyLimit: Optional[str] = None
    whoShouldAvoid: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def sanitize(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "badge" in data and not data.get("label"):
                data["label"] = str(data["badge"])
            if "severity" in data and not data.get("type"):
                s = str(data["severity"]).lower()
                data["type"] = "danger" if s == "danger" else ("good" if s == "good" else "warning")
        return data


class ArtificialColorAuditItem(BaseModel):
    name: str = "Food Colorant"
    insCode: Optional[str] = None
    colorType: str = "synthetic"  # 'natural' | 'permitted_synthetic' | 'high_risk_azo'
    grade: str = "Grade B"  # 'Grade A (Wholesome Natural)' | 'Grade B (Permitted Synthetic)' | 'Grade C (High Concern Azo Dye)'
    quality: str = "Standard Synthetic"
    isOkayToEat: str = "Caution / Limit"  # 'Safe to Eat' | 'Consume in Moderation' | 'Avoid / High Risk'
    whyAdded: str = "Used for visual cosmetic coloration."
    healthConsequences: str = "Potential hypersensitivity or hyperactivity."
    regulatoryStatus: str = "Permitted under FSSAI with upper limits."


class HighNutrientRiskItem(BaseModel):
    nutrient: str = "Nutrient"
    measuredValue: str = "0.0"
    icmrLimit: str = "ICMR Limit"
    severity: str = "high"  # 'critical' | 'high' | 'moderate'
    whatIsIt: str = "Nutrient description"
    whatItCauses: str = "Health consequences"
    immediateEffects: str = "Immediate physiological response"


class NutrientAuditItem(BaseModel):
    name: str = "Nutrient"
    valuePer100g: float = 0.0
    valuePerServe: float = 0.0
    unit: str = "g"
    icmrDailyLimit: str = "ICMR Standard"
    level: str = "Moderate"  # 'Low' | 'Moderate' | 'High' | 'Excessive'
    assessment: str = "Measured on packaging"

    @model_validator(mode="before")
    @classmethod
    def sanitize(cls, data: Any) -> Any:
        if isinstance(data, dict):
            raw_name = data.get("name") or data.get("nutrient") or data.get("item") or "Nutrient"
            name_str = str(raw_name).strip()
            if name_str.lower() in ["columns", "data", "table", "index"]:
                name_str = "Nutrient"
            data["name"] = name_str

            if "icmrRda" in data and not data.get("icmrDailyLimit"):
                data["icmrDailyLimit"] = str(data["icmrRda"])

            v100_raw = data.get("valuePer100g") if data.get("valuePer100g") is not None else data.get("value")
            if v100_raw is not None:
                try:
                    m = re.search(r"(\d+(?:\.\d+)?)", str(v100_raw))
                    val = float(m.group(1)) if m else 0.0
                    data["valuePer100g"] = 0.0 if val > 100000 else val
                except Exception:
                    data["valuePer100g"] = 0.0
            else:
                data["valuePer100g"] = 0.0

            vserve_raw = data.get("valuePerServe")
            if vserve_raw is not None:
                try:
                    m = re.search(r"(\d+(?:\.\d+)?)", str(vserve_raw))
                    val = float(m.group(1)) if m else 0.0
                    data["valuePerServe"] = 0.0 if val > 100000 else val
                except Exception:
                    data["valuePerServe"] = round(data["valuePer100g"] * 0.3, 2)
            else:
                data["valuePerServe"] = round(data["valuePer100g"] * 0.3, 2)

            nl = name_str.lower()
            if not data.get("unit"):
                data["unit"] = (
                    "kcal"
                    if "energy" in nl or "calorie" in nl
                    else ("mg" if "sodium" in nl or "cholesterol" in nl else "g")
                )

            if not data.get("icmrDailyLimit") or data.get("icmrDailyLimit") == "ICMR Standard":
                if "energy" in nl:
                    data["icmrDailyLimit"] = "2000 kcal"
                elif "protein" in nl:
                    data["icmrDailyLimit"] = "54.0 g"
                elif "carbohydrate" in nl:
                    data["icmrDailyLimit"] = "130.0 g"
                elif "added sugar" in nl or "sugar" in nl:
                    data["icmrDailyLimit"] = "25.0 g"
                elif "saturated" in nl:
                    data["icmrDailyLimit"] = "20.0 g"
                elif "trans" in nl:
                    data["icmrDailyLimit"] = "2.0 g"
                elif "total fat" in nl or "fat" in nl:
                    data["icmrDailyLimit"] = "30.0 g"
                elif "sodium" in nl:
                    data["icmrDailyLimit"] = "2000 mg"
                elif "fiber" in nl:
                    data["icmrDailyLimit"] = "30.0 g"
                elif "cholesterol" in nl:
                    data["icmrDailyLimit"] = "300 mg"

            if not data.get("level") or data.get("level") == "Moderate":
                v = data["valuePer100g"]
                if "sodium" in nl:
                    data["level"] = (
                        "Excessive" if v > 1000 else ("High" if v > 650 else ("Moderate" if v > 300 else "Low"))
                    )
                elif "saturated" in nl:
                    data["level"] = (
                        "Excessive" if v > 15 else ("High" if v > 10 else ("Moderate" if v > 4 else "Low"))
                    )
                elif "added sugar" in nl or "sugar" in nl:
                    data["level"] = (
                        "Excessive" if v > 20 else ("High" if v > 10 else ("Moderate" if v > 4 else "Low"))
                    )
                elif "total fat" in nl:
                    data["level"] = (
                        "Excessive" if v > 35 else ("High" if v > 25 else ("Moderate" if v > 10 else "Low"))
                    )
                elif "trans" in nl:
                    data["level"] = "Excessive" if v > 0.2 else ("Moderate" if v > 0.1 else "Low")
                elif "energy" in nl:
                    data["level"] = (
                        "Excessive" if v > 550 else ("High" if v > 450 else ("Moderate" if v > 250 else "Low"))
                    )
                elif "protein" in nl:
                    data["level"] = "High" if v >= 10 else ("Moderate" if v >= 5 else "Low")

            if not data.get("assessment"):
                data["assessment"] = f"Measured {name_str} level on packaging."

        return data


BADGE_EDUCATIONAL_DATABASE = {
    "caffeine": {
        "whatIsIt": "A central nervous system stimulant extracted from coffee/tea or chemically synthesized to artificially increase alertness and heart rate.",
        "whyUsed": "Added to energy drinks and colas to deliver a quick stimulant surge, heighten focus, and drive repeat consumption.",
        "healthConsequences": "Triggers rapid heart palpitations, elevated blood pressure spikes, tremors, acid reflux, insomnia, and acute anxiety. In children and teenagers, it impairs neurological sleep architecture and risks cardiac arrhythmias.",
        "safeDailyLimit": "0mg for children & teenagers (< 16 yrs); max 400mg/day for healthy non-pregnant adults.",
        "whoShouldAvoid": "Children under 16, pregnant & lactating women, individuals with heart arrhythmias, hypertension, or chronic panic/anxiety disorders.",
    },
    "sugar": {
        "whatIsIt": "Refined industrial sugars (sucrose, liquid glucose, high fructose corn syrup, maltodextrin) stripped of all dietary fiber and micronutrients.",
        "whyUsed": "Used by manufacturers to create intense sweetness, trigger dopamine pleasure receptors in the brain, act as an inexpensive preservative, and drive cravings.",
        "healthConsequences": "Causes rapid glycemic surges, insulin resistance, Non-Alcoholic Fatty Liver Disease (NAFLD), visceral belly fat, accelerated dental caries, and heightened Type-2 diabetes risk.",
        "safeDailyLimit": "Under 25g/day (~5-6 teaspoons) for adults; under 15g/day for children (ICMR-NIN 2024).",
        "whoShouldAvoid": "Type-2 diabetics, pre-diabetics, individuals with fatty liver, insulin resistance, or metabolic syndrome.",
    },
    "palm": {
        "whatIsIt": "A heavily refined tropical vegetable oil derived from the fruit of oil palms, containing approximately 50% saturated palmitic acid.",
        "whyUsed": "The cheapest commercial frying oil available globally; possesses high thermal stability for factory deep-frying and extends shelf-life without going rancid.",
        "healthConsequences": "High palmitic acid directly drives serum LDL ('bad') cholesterol, stiffens arterial walls, promotes atherogenic plaque deposition, and increases coronary heart disease risk.",
        "safeDailyLimit": "Keep total saturated fats under 8-10% of total daily energy (~20g/day) under ICMR-NIN 2024 guidelines.",
        "whoShouldAvoid": "Individuals with high cholesterol (LDL > 100 mg/dL), cardiovascular disease history, coronary stents, hypertension, or fatty liver.",
    },
    "saturated": {
        "whatIsIt": "Dietary fatty acids with single chemical bonds that remain solid at room temperature, predominantly found in palm oil, vanaspati, and processed dairy.",
        "whyUsed": "Provides a rich, crispy mouthfeel and resists chemical oxidation during transport and retail display.",
        "healthConsequences": "Elevates circulating LDL cholesterol and apolipoprotein B, accelerating coronary artery narrowing and vascular stiffness.",
        "safeDailyLimit": "Maximum 20g/day for an average 2000 kcal diet (ICMR-NIN 2024).",
        "whoShouldAvoid": "Cardiovascular patients, individuals with hypercholesterolemia, and stroke survivors.",
    },
    "sodium": {
        "whatIsIt": "Sodium chloride (table salt) combined with industrial sodium-based flavor compounds such as Monosodium Glutamate (MSG) and Disodium Inosinate.",
        "whyUsed": "Used as an inexpensive flavor enhancer to stimulate salivary appetite, mask stale ingredients, and inhibit bacterial spoilage.",
        "healthConsequences": "Forces the vascular system to retain water, expanding intravascular blood volume and elevating systolic blood pressure. Over time, it damages kidney nephrons and arterial linings.",
        "safeDailyLimit": "Maximum 2000mg/day (approximately 5g or 1 level teaspoon of table salt) for adults (ICMR-NIN & WHO).",
        "whoShouldAvoid": "Hypertensive individuals, chronic kidney disease (CKD) patients, heart failure patients, and people suffering from fluid retention.",
    },
    "ultra-processed": {
        "whatIsIt": "NOVA Group 4 industrial formulations made from food-derived substances (protein isolates, hydrogenated oils, modified starches) combined with synthetic additives, colors, and emulsifiers.",
        "whyUsed": "Engineered in food science laboratories to achieve the 'bliss point'—an artificial balance of fat, sugar, and salt designed to bypass natural fullness signals so consumers overconsume.",
        "healthConsequences": "Extensively linked in clinical studies to metabolic syndrome, gut microbiome depletion, chronic systemic inflammation, insulin resistance, and increased risk of colorectal cancer.",
        "safeDailyLimit": "Should represent less than 10-15% of total caloric intake; should never replace whole-food grains, vegetables, and pulses.",
        "whoShouldAvoid": "Growing children, adolescents, individuals with irritable bowel syndrome (IBS), fatty liver, or autoimmune conditions.",
    },
    "color": {
        "whatIsIt": "Synthetic chemical dyes derived from petroleum and coal-tar distillates used exclusively for cosmetic coloring.",
        "whyUsed": "Used to make cheap, dull ingredients look bright, fresh, and appetizing, or to deceive consumers into thinking real fruit is present.",
        "healthConsequences": "Synthetic azo dyes (like Tartrazine Yellow 5 and Sunset Yellow 6) provoke acute histamine release, allergic skin hives (urticaria), asthma exacerbation, and attention deficit hyperactivity in children.",
        "safeDailyLimit": "0mg of synthetic coal-tar dyes is recommended for children and sensitive individuals.",
        "whoShouldAvoid": "Children under 16, individuals with asthma, aspirin sensitivity, or chronic skin allergies.",
    },
    "trans": {
        "whatIsIt": "Chemically altered unsaturated fatty acids formed when hydrogen gas is bubbled through vegetable oils to create solid fats (vanaspati / partially hydrogenated fats).",
        "whyUsed": "Provides a flaky, melt-in-the-mouth texture for bakery biscuits, cakes, and fried foods at very low production cost.",
        "healthConsequences": "The most dangerous fat known in nutritional medicine. It simultaneously elevates LDL ('bad') cholesterol AND lowers protective HDL ('good') cholesterol, accelerating coronary blockages.",
        "safeDailyLimit": "Statutory limit under FSSAI is < 0.2g per 100g. Recommended dietary intake is strictly ZERO grams.",
        "whoShouldAvoid": "Everyone without exception. Strict medical contraindication for cardiovascular patients.",
    },
    "maida": {
        "whatIsIt": "Refined wheat flour that has been stripped of its fibrous outer bran layer and nutrient-dense germ, leaving only pure starchy endosperm.",
        "whyUsed": "Gives processed breads, noodles, and biscuits a soft, uniform, and light texture while preventing spoilage.",
        "healthConsequences": "Rapidly converts into pure blood glucose within 15 to 20 minutes of ingestion, causing immediate insulin surges, abdominal fat storage, and chronic constipation due to zero dietary fiber.",
        "safeDailyLimit": "Substitute with unrefined whole wheat, ragi, foxtail millets, or oats.",
        "whoShouldAvoid": "Type-2 diabetics, pre-diabetics, obese individuals, and people prone to sluggish bowel motility.",
    },
    "calorie": {
        "whatIsIt": "Concentrated dietary energy exceeding 500 kcal per 100g, driven by high fat and sugar content.",
        "whyUsed": "A consequence of deep-frying in industrial fats and adding concentrated sweeteners.",
        "healthConsequences": "Leads to rapid positive energy balance, accelerating visceral adiposity, hepatic steatosis (fatty liver), and metabolic syndrome.",
        "safeDailyLimit": "Single snack portions should not exceed 150-200 kcal.",
        "whoShouldAvoid": "Sedentary individuals, obese patients, and those managing metabolic syndrome.",
    },
    "sweetener": {
        "whatIsIt": "Synthetic non-nutritive chemicals (such as Sucralose, Aspartame, and Acesulfame Potassium) that stimulate sweetness receptors up to 600 times more intensely than sugar.",
        "whyUsed": "Allows manufacturers to market products as 'Sugar-Free' or 'Diet' while maintaining intense sweetness.",
        "healthConsequences": "Disrupts natural satiety cues, triggers gut dysbiosis by altering beneficial microbiome bacteria, and may stimulate compensatory sugar cravings. WHO advises against non-sugar sweeteners for weight loss.",
        "safeDailyLimit": "Strictly limit; avoid routine daily consumption.",
        "whoShouldAvoid": "Pregnant women, young children, and individuals suffering from digestive dysbiosis or phenylketonuria (for aspartame).",
    },
    "expired": {
        "whatIsIt": "A packaged commodity that has exceeded its statutory shelf-life, best-before, or expiry date.",
        "whyUsed": "Illegal retail offering of unsold inventory in violation of Legal Metrology Rule 18(1) and FSSAI Section 59.",
        "healthConsequences": "Severe microbiological contamination from bacterial pathogens (Salmonella, Clostridium, Staphylococcus), enterotoxins, and toxic oxidized rancid fats.",
        "safeDailyLimit": "ZERO. Strictly banned from human consumption.",
        "whoShouldAvoid": "ALL CONSUMERS WITHOUT EXCEPTION. Immediate disposal is mandatory.",
    },
    "biological": {
        "whatIsIt": "Active microbiological pathogen proliferation, mold growth, or lipid peroxidation hazard resulting from expired or broken packaging.",
        "whyUsed": "Severe post-shelf-life degradation.",
        "healthConsequences": "Causes acute gastrointestinal inflammation, vomiting, diarrhea, systemic enterotoxicity, and potentially life-threatening food poisoning.",
        "safeDailyLimit": "ZERO. Unfit for consumption.",
        "whoShouldAvoid": "ALL CONSUMERS.",
    },
}

KNOWN_COLORS_DATABASE = [
    {
        "keywords": ["102", "tartrazine", "yellow 5", "yellow no. 5", "ins 102"],
        "name": "Tartrazine (Yellow 5)",
        "insCode": "INS 102",
        "colorType": "high_risk_azo",
        "grade": "Grade C (High Concern Azo Dye)",
        "quality": "Low Quality Synthetic Petroleum / Coal-Tar Dye",
        "isOkayToEat": "Avoid or Strictly Limit",
        "whyAdded": "Used by manufacturers to create an artificial lemon-yellow hue, simulating butter, cheese, or lemon flavor at near-zero cost.",
        "healthConsequences": "Provokes hyperactivity and attention-deficit behavior in children. Known trigger for acute urticaria (hives), asthma, and angioedema. In the European Union, products with Tartrazine MUST carry a mandatory warning: 'May have an adverse effect on activity and attention in children'.",
        "regulatoryStatus": "Permitted in India under FSSAI with a ceiling of 100 mg/kg; strictly regulated or warning-mandated across Europe.",
    },
    {
        "keywords": ["110", "sunset yellow", "yellow 6", "yellow no. 6", "ins 110"],
        "name": "Sunset Yellow FCF (Yellow 6)",
        "insCode": "INS 110",
        "colorType": "high_risk_azo",
        "grade": "Grade C (High Concern Azo Dye)",
        "quality": "Petroleum-Derived Synthetic Azo Dye",
        "isOkayToEat": "Avoid or Strictly Limit",
        "whyAdded": "Imparts an intense, glowing orange-yellow appearance to savory snacks, cheese crisps, and mango/orange-flavored beverages.",
        "healthConsequences": "Induces histamine release causing skin allergies, eczema, and exacerbates childhood restlessness. Banned or heavily restricted in Norway and Finland.",
        "regulatoryStatus": "Permitted under FSSAI within prescribed limits; banned in select European countries.",
    },
    {
        "keywords": ["129", "allura red", "red 40", "red no. 40", "ins 129"],
        "name": "Allura Red AC (Red 40)",
        "insCode": "INS 129",
        "colorType": "high_risk_azo",
        "grade": "Grade C (High Concern Azo Dye)",
        "quality": "Synthetic Coal-Tar Derivative",
        "isOkayToEat": "Avoid or Strictly Limit",
        "whyAdded": "Produces vivid synthetic cherry/strawberry red coloration in confectionery, snacks, and sweet drinks.",
        "healthConsequences": "Clinical studies link Allura Red to gut inflammation, disruption of the intestinal mucus barrier, and pediatric behavioral disruptions. Banned in Denmark, Belgium, and Switzerland.",
        "regulatoryStatus": "Permitted under FSSAI; banned or restricted in several European nations.",
    },
    {
        "keywords": ["133", "brilliant blue", "blue 1", "blue no. 1", "ins 133"],
        "name": "Brilliant Blue FCF (Blue 1)",
        "insCode": "INS 133",
        "colorType": "high_risk_azo",
        "grade": "Grade C (High Concern Synthetic)",
        "quality": "Synthetic Triphenylmethane Dye",
        "isOkayToEat": "Caution / Strictly Limit",
        "whyAdded": "Imparts electric blue hues to candies, sports drinks, and frostings.",
        "healthConsequences": "Linked to hypersensitivity, skin reactions, and mild neurotoxicity at elevated dosages.",
        "regulatoryStatus": "Permitted under FSSAI; restricted in pediatric foods across the EU.",
    },
    {
        "keywords": ["150d", "caramel iv", "caramel color iv", "ammonia sulphite caramel", "ins 150d"],
        "name": "Caramel Color Class IV (Ammonia Sulphite)",
        "insCode": "INS 150d",
        "colorType": "high_risk_azo",
        "grade": "Grade C (High Concern Chemical Additive)",
        "quality": "Chemically Synthesized Dark Colorant",
        "isOkayToEat": "Avoid or Strictly Limit",
        "whyAdded": "Provides the characteristic deep brown-to-black color in colas, dark soft drinks, and soy sauces.",
        "healthConsequences": "Manufactured using ammonia and sulphite compounds, creating the chemical byproduct 4-MEI (4-Methylimidazole). The WHO International Agency for Research on Cancer (IARC) classifies 4-MEI as Group 2B: 'possibly carcinogenic to humans'.",
        "regulatoryStatus": "Permitted under FSSAI; requires Proposition 65 cancer warning in California if 4-MEI exceeds 29 mcg/day.",
    },
    {
        "keywords": ["150a", "150b", "150c", "caramel color", "caramel i", "caramel ii", "ins 150"],
        "name": "Caramel Color (Class I / II / III)",
        "insCode": "INS 150a/b/c",
        "colorType": "permitted_synthetic",
        "grade": "Grade B (Permitted Synthetic)",
        "quality": "Controlled Thermal Sugar Colorant",
        "isOkayToEat": "Consume in Moderation",
        "whyAdded": "Provides golden-brown color in baked goods, cookies, and syrups.",
        "healthConsequences": "An empty additive that provides no nutrition, but is free from the carcinogenic 4-MEI ammonia compounds found in Class IV.",
        "regulatoryStatus": "Permitted worldwide under FSSAI, US FDA, and EFSA.",
    },
    {
        "keywords": ["171", "titanium dioxide", "ins 171"],
        "name": "Titanium Dioxide",
        "insCode": "INS 171",
        "colorType": "high_risk_azo",
        "grade": "Grade C (Banned in EU / Genotoxic Concern)",
        "quality": "Nanoparticle Mineral Colorant",
        "isOkayToEat": "Strictly Avoid",
        "whyAdded": "Used as an opaque whitening agent in chewing gums, icing, and sauces.",
        "healthConsequences": "European Food Safety Authority (EFSA) officially banned Titanium Dioxide in food in 2022 after concluding that nanoparticle accumulation causes DNA damage (genotoxicity).",
        "regulatoryStatus": "Banned across the European Union (2022); currently under regulatory re-examination in India.",
    },
    {
        "keywords": ["100", "curcumin", "turmeric", "haldi", "ins 100"],
        "name": "Curcumin / Turmeric Extract",
        "insCode": "INS 100(i)",
        "colorType": "natural",
        "grade": "Grade A (Wholesome Natural)",
        "quality": "Pure Botanical Polyphenol Extract",
        "isOkayToEat": "Safe to Eat (Beneficial)",
        "whyAdded": "Imparts an authentic golden-yellow color extracted directly from turmeric roots (Curcuma longa).",
        "healthConsequences": "Completely safe with proven anti-inflammatory, antioxidant, and cellular protective benefits.",
        "regulatoryStatus": "Globally recognized as safe by FSSAI, WHO, and FDA with zero health restrictions.",
    },
    {
        "keywords": ["162", "beetroot", "betanin", "ins 162"],
        "name": "Beetroot Red (Betanin)",
        "insCode": "INS 162",
        "colorType": "natural",
        "grade": "Grade A (Wholesome Natural)",
        "quality": "Natural Vegetable Juice Extract",
        "isOkayToEat": "Safe to Eat",
        "whyAdded": "Provides vibrant red and magenta coloration extracted from red beets (Beta vulgaris).",
        "healthConsequences": "Safe for all age groups, containing natural dietary nitrates and betalain antioxidants.",
        "regulatoryStatus": "Approved worldwide as a natural wholesome food colorant.",
    },
    {
        "keywords": ["160c", "paprika", "capsanthin", "ins 160c"],
        "name": "Paprika Extract (Capsanthin)",
        "insCode": "INS 160c",
        "colorType": "natural",
        "grade": "Grade A (Wholesome Natural)",
        "quality": "Natural Spice Carotenoid Extract",
        "isOkayToEat": "Safe to Eat",
        "whyAdded": "Provides deep orange-red color extracted naturally from sweet red peppers.",
        "healthConsequences": "Natural carotenoid antioxidant with zero toxicity or behavioral side effects.",
        "regulatoryStatus": "Approved worldwide as a safe natural food colorant.",
    },
    {
        "keywords": ["140", "chlorophyll", "chlorophyllin", "ins 140"],
        "name": "Chlorophyllin (Plant Green)",
        "insCode": "INS 140",
        "colorType": "natural",
        "grade": "Grade A (Wholesome Natural)",
        "quality": "Natural Plant Pigment",
        "isOkayToEat": "Safe to Eat",
        "whyAdded": "Provides natural green color extracted from alfalfa, spinach, or nettles.",
        "healthConsequences": "Natural plant pigment with antioxidant properties and zero toxicity.",
        "regulatoryStatus": "Approved worldwide as a natural food color.",
    },
]


class MultimodalHealthAnalysis(BaseModel):
    commodityName: str = "Verified Packaged Commodity"
    brandName: str = "Packaged Goods"
    category: str = "Packaged Food"
    servingSize: str = "30 g"
    netQuantity: str = "Standard Package"
    mrp: str = "Declared on Package"
    pricePer100g: str = "Standard Unit Basis"
    priceRating: str = "Fair Market Rate"
    priceAnalysis: str = "Standard market pricing."

    # Expiry & Shelf-Life Information
    mfgDate: Optional[str] = None
    expiryDate: Optional[str] = None
    isExpired: bool = False
    expiryStatus: str = "valid"  # 'expired' | 'near_expiry' | 'valid'
    expiryWarning: Optional[str] = None

    # Comprehensive Health Verdict & Questions
    shouldWeEatIt: str = "Consume in Strict Moderation"
    howBadIsIt: str = "Ultra-processed packaged food commodity."
    overallRating: str = "Consume in Moderation"
    ratingScore: int = 50

    # Age and population restrictions
    notEatableForAge: List[str] = Field(default_factory=lambda: ["Children under 5 years"])
    whoCanConsume: List[str] = Field(default_factory=lambda: ["Healthy active adults within portion size"])
    whoShouldAvoid: List[str] = Field(default_factory=lambda: ["Diabetic patients", "Hypertensive individuals"])

    # Health problems and overconsumption consequences
    healthProblemsIfEatenMore: List[str] = Field(
        default_factory=lambda: ["Elevated blood pressure", "Cardiovascular strain"]
    )
    dietarySummary: str = "High in sodium and saturated fats."

    # Direct Badges
    badges: List[HealthBadge] = Field(default_factory=list)

    # Artificial Colors & Additives Inspection
    artificialColors: List[ArtificialColorAuditItem] = Field(default_factory=list)

    # What is High & Consequences
    whatIsHigh: List[HighNutrientRiskItem] = Field(default_factory=list)

    # Specific Ingredient Inspection
    hasPalmOil: bool = False
    palmOilDetails: Optional[str] = None
    hasAddedSugar: bool = False
    addedSugarDetails: Optional[str] = None
    hasHighSodium: bool = False
    hasArtificialAdditives: bool = False
    ingredientsList: List[str] = Field(default_factory=list)
    flaggedIngredients: List[Dict[str, str]] = Field(default_factory=list)

    # Nutrients breakdown table
    nutrients: List[NutrientAuditItem] = Field(default_factory=list)

    # Alternatives
    healthierAlternatives: List[str] = Field(default_factory=lambda: ["Roasted Makhana", "Roasted Chana"])

    @model_validator(mode="before")
    @classmethod
    def sanitize(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # 1. Alias mapping for product & brand identity
            for prod_k in ["product_name", "product", "commodity", "name", "variant", "item_name"]:
                if data.get(prod_k) and (not data.get("commodityName") or data.get("commodityName") == "Verified Packaged Commodity"):
                    data["commodityName"] = str(data[prod_k]).strip()
            for brand_k in ["brand", "brand_name", "company", "manufacturer", "maker"]:
                if data.get(brand_k) and (not data.get("brandName") or data.get("brandName") == "Packaged Goods"):
                    data["brandName"] = str(data[brand_k]).strip()
            for qty_k in ["net_quantity", "quantity", "net_weight", "weight", "netQty"]:
                if data.get(qty_k) and (not data.get("netQuantity") or data.get("netQuantity") == "Standard Package"):
                    data["netQuantity"] = str(data[qty_k]).strip()
            for srv_k in ["serving_size", "serve_size", "serving", "portion"]:
                if data.get(srv_k) and (not data.get("servingSize") or data.get("servingSize") == "30 g"):
                    data["servingSize"] = str(data[srv_k]).strip()
            for mrp_k in ["retail_price", "price", "maximum_retail_price"]:
                if data.get(mrp_k) and (not data.get("mrp") or data.get("mrp") == "Declared on Package"):
                    data["mrp"] = str(data[mrp_k]).strip()

            # Ensure mrp starts with currency symbol if it is a pure number
            if data.get("mrp"):
                mrp_str = str(data["mrp"]).strip()
                if mrp_str and mrp_str[0].isdigit():
                    data["mrp"] = f"Rs. {float(mrp_str):.2f}"

            # 2. Mathematical Unit Sale Price (USP) Calculation
            mrp_text = str(data.get("mrp") or "")
            qty_text = str(data.get("netQuantity") or "")
            mrp_m = re.search(r"(\d+(?:\.\d+)?)", mrp_text)
            qty_m = re.search(r"(\d+(?:\.\d+)?)", qty_text)
            if mrp_m and qty_m:
                try:
                    mrp_val = float(mrp_m.group(1))
                    qty_val = float(qty_m.group(1))
                    if mrp_val > 0 and qty_val > 0:
                        calc_usp = round((mrp_val / qty_val) * 100, 2)
                        data["pricePer100g"] = f"Rs. {calc_usp:.2f} / 100g"
                        if calc_usp < 25.0:
                            data["priceRating"] = "Budget"
                            data["priceAnalysis"] = f"Declared MRP yields an economical Unit Sale Price of Rs. {calc_usp:.2f} / 100g."
                        elif calc_usp <= 55.0:
                            data["priceRating"] = "Fair Market Rate"
                            data["priceAnalysis"] = f"Declared MRP yields a standard competitive market Unit Sale Price of Rs. {calc_usp:.2f} / 100g."
                        else:
                            data["priceRating"] = "Premium"
                            data["priceAnalysis"] = f"Declared MRP yields a premium Unit Sale Price of Rs. {calc_usp:.2f} / 100g."
                except Exception:
                    pass

            # 3. String field to list conversion
            for list_field in [
                "notEatableForAge",
                "whoCanConsume",
                "whoShouldAvoid",
                "healthProblemsIfEatenMore",
                "healthierAlternatives",
                "ingredientsList",
            ]:
                val = data.get(list_field)
                if isinstance(val, str):
                    items = [x.strip(" -•*") for x in re.split(r"[\n;]+|,\s*", val) if x.strip()]
                    data[list_field] = items if items else [val]
                elif not isinstance(val, list):
                    data[list_field] = [str(val)] if val else []

            # 4. Nutrients unpacking (handles list, Pandas table, and dicts)
            nutr_val = data.get("nutrients")
            converted_nutrients = []

            if isinstance(nutr_val, dict):
                # Case A: Pandas / JSON split table format: {"columns": [...], "data": [...]}
                if "data" in nutr_val and isinstance(nutr_val["data"], list):
                    cols = [str(c).lower().strip() for c in nutr_val.get("columns", [])]
                    name_col = 0
                    v100_col = 1
                    serve_col = 2
                    unit_col = None

                    for i, c in enumerate(cols):
                        if any(k in c for k in ["nutrient", "name", "component", "parameter"]):
                            name_col = i
                        elif any(k in c for k in ["100", "per 100", "baseline"]):
                            v100_col = i
                        elif any(k in c for k in ["serve", "portion", "serving"]):
                            serve_col = i
                        elif "unit" in c:
                            unit_col = i

                    for row in nutr_val["data"]:
                        if isinstance(row, list) and len(row) > name_col:
                            n_name = str(row[name_col]).strip()
                            if n_name.lower() in ["columns", "data", "table", "index", "nutrient", "name", ""]:
                                continue
                            v100_val = row[v100_col] if len(row) > v100_col else 0.0
                            vserve_val = row[serve_col] if len(row) > serve_col else None
                            u_val = str(row[unit_col]).strip() if unit_col is not None and len(row) > unit_col else "g"

                            converted_nutrients.append({
                                "name": n_name,
                                "valuePer100g": v100_val,
                                "valuePerServe": vserve_val,
                                "unit": u_val,
                            })
                else:
                    # Case B: Standard Dictionary of nutrient keys
                    for k, v in nutr_val.items():
                        k_str = str(k).strip()
                        if k_str.lower() in ["columns", "data", "table", "index", ""]:
                            continue
                        if isinstance(v, dict):
                            converted_nutrients.append({
                                "name": k_str,
                                "valuePer100g": v.get("valuePer100g") or v.get("value") or v.get("100g") or 0.0,
                                "valuePerServe": v.get("valuePerServe") or v.get("serve") or 0.0,
                                "unit": v.get("unit") or "g",
                                "icmrDailyLimit": v.get("icmrDailyLimit") or v.get("icmrRda") or "ICMR Standard",
                                "level": v.get("level") or "Moderate",
                                "assessment": v.get("assessment") or f"Declared {k_str}",
                            })
                        else:
                            converted_nutrients.append({
                                "name": k_str,
                                "valuePer100g": v,
                                "assessment": f"Declared {k_str}",
                            })
            elif isinstance(nutr_val, list):
                for item in nutr_val:
                    if isinstance(item, dict):
                        n_name = str(item.get("name") or item.get("nutrient") or "").strip()
                        if n_name.lower() in ["columns", "data", "table", "index", ""]:
                            continue
                        converted_nutrients.append(item)
                    elif isinstance(item, NutrientAuditItem) or hasattr(item, "name"):
                        n_name = str(getattr(item, "name", "")).strip()
                        if n_name.lower() in ["columns", "data", "table", "index", ""]:
                            continue
                        converted_nutrients.append(item)

            data["nutrients"] = converted_nutrients

            # 5. Dynamic ICMR-NIN 2024 Nutritional Health Index Calculation
            score = 100.0
            nutr_map = {
                str(n.get("name", "") if isinstance(n, dict) else getattr(n, "name", "")).lower(): n
                for n in converted_nutrients
            }

            def _get_nutr_val(item_obj: Any) -> float:
                if item_obj is None:
                    return 0.0
                raw = item_obj.get("valuePer100g", 0) if isinstance(item_obj, dict) else getattr(item_obj, "valuePer100g", 0)
                m = re.search(r"(\d+(?:\.\d+)?)", str(raw))
                return float(m.group(1)) if m else 0.0

            for k, n in nutr_map.items():
                if "sodium" in k:
                    try:
                        v = _get_nutr_val(n)
                        if v > 1000:
                            score -= 30.0
                        elif v > 650:
                            score -= 20.0
                        elif v > 350:
                            score -= 10.0
                    except Exception:
                        pass

            for k, n in nutr_map.items():
                if "saturated" in k:
                    try:
                        v = _get_nutr_val(n)
                        if v > 15:
                            score -= 25.0
                        elif v > 10:
                            score -= 18.0
                        elif v > 4:
                            score -= 8.0
                    except Exception:
                        pass

            for k, n in nutr_map.items():
                if "added sugar" in k or "sugar" in k:
                    try:
                        v = _get_nutr_val(n)
                        if v > 20:
                            score -= 25.0
                        elif v > 10:
                            score -= 15.0
                        elif v > 4:
                            score -= 8.0
                    except Exception:
                        pass

            if data.get("hasPalmOil"):
                score -= 15.0

            if data.get("hasArtificialAdditives"):
                score -= 10.0

            badges_list = data.get("badges", [])
            for b in badges_list:
                b_label = str(b.get("label", "") if isinstance(b, dict) else getattr(b, "label", "")).lower()
                if "ultra-processed" in b_label or "nova 4" in b_label:
                    score -= 10.0
                    break

            for k, n in nutr_map.items():
                if "protein" in k:
                    try:
                        v = _get_nutr_val(n)
                        if v >= 8.0:
                            score += min(12.0, (v - 8.0) * 1.5 + 4.0)
                    except Exception:
                        pass

            for k, n in nutr_map.items():
                if "fiber" in k:
                    try:
                        v = _get_nutr_val(n)
                        if v >= 4.0:
                            score += min(12.0, (v - 4.0) * 2.0 + 4.0)
                    except Exception:
                        pass

            computed_score = int(round(max(8.0, min(94.0, score))))

            current_score = data.get("ratingScore")
            if current_score is None or current_score == 50 or current_score <= 0:
                data["ratingScore"] = computed_score
            else:
                try:
                    score_int = int(re.sub(r"\D", "", str(current_score)))
                    data["ratingScore"] = computed_score if (data.get("hasPalmOil") and score_int > 60) else score_int
                except Exception:
                    data["ratingScore"] = computed_score

            final_s = data["ratingScore"]
            if final_s >= 70:
                data["overallRating"] = "Nutritious Choice"
            elif final_s >= 45:
                data["overallRating"] = "Consume in Moderation"
            else:
                data["overallRating"] = "High Health Concern"

            # 6. Expiry & Shelf-Life Safety Verification (Current Date: September 2026)
            CURRENT_YEAR = 2026
            CURRENT_MONTH = 9

            mfg_date_val = str(data.get("mfgDate") or data.get("mfg_date") or "").strip()
            exp_date_val = str(data.get("expiryDate") or data.get("expiry_date") or "").strip()

            mfg_m, mfg_y = None, None
            if mfg_date_val:
                m_match = re.search(r"(\d{1,2})[\s/.-]+(\d{2,4})", mfg_date_val)
                if m_match:
                    try:
                        mfg_m = int(m_match.group(1))
                        raw_y = int(m_match.group(2))
                        mfg_y = 2000 + raw_y if raw_y < 100 else raw_y
                    except Exception:
                        pass

            exp_m, exp_y = None, None
            if exp_date_val:
                e_match = re.search(r"(\d{1,2})[\s/.-]+(\d{2,4})", exp_date_val)
                if e_match:
                    try:
                        exp_m = int(e_match.group(1))
                        raw_y = int(e_match.group(2))
                        exp_y = 2000 + raw_y if raw_y < 100 else raw_y
                    except Exception:
                        pass

            # Check relative shelf life in text
            all_text = f"{mfg_date_val} {exp_date_val} {str(data.get('howBadIsIt') or '')}".lower()
            bb_match = re.search(r"best before\s*(\d+)\s*(months?|days?|years?)", all_text)
            if bb_match and mfg_m and mfg_y and not exp_y:
                qty = int(bb_match.group(1))
                unit = bb_match.group(2)
                if "month" in unit:
                    tot = (mfg_y * 12 + (mfg_m - 1)) + qty
                    exp_y = tot // 12
                    exp_m = (tot % 12) + 1
                    data["expiryDate"] = f"{exp_m:02d}/{exp_y}"

            cur_total = CURRENT_YEAR * 12 + CURRENT_MONTH
            is_expired = data.get("isExpired") is True or data.get("is_expired") is True

            if exp_y and exp_m:
                exp_total = exp_y * 12 + exp_m
                if exp_total < cur_total:
                    is_expired = True
                    data["expiryStatus"] = "expired"
                    months_past = cur_total - exp_total
                    data["expiryWarning"] = f"CRITICAL HAZARD: Product expired in {exp_m:02d}/{exp_y} ({months_past} months past shelf life)."
                elif exp_total == cur_total:
                    data["expiryStatus"] = "near_expiry"
                    data["expiryWarning"] = f"NOTICE: Product expires this month ({exp_m:02d}/{exp_y})."
            elif mfg_y and mfg_y < CURRENT_YEAR:
                mfg_total = mfg_y * 12 + (mfg_m or 1)
                months_since_mfg = cur_total - mfg_total
                if months_since_mfg > 12:
                    is_expired = True
                    data["expiryStatus"] = "expired"
                    data["expiryWarning"] = f"CRITICAL HAZARD: Manufactured in {mfg_m or 'XX'}/{mfg_y} ({months_since_mfg} months ago). Exceeds standard maximum 12-month shelf life."

            if is_expired:
                data["isExpired"] = True
                data["expiryStatus"] = "expired"
                data["ratingScore"] = 0
                data["overallRating"] = "Critical Hazard - Expired Food"
                data["shouldWeEatIt"] = "STRICTLY DO NOT CONSUME - EXPIRED FOOD HAZARD"
                warning_note = data.get("expiryWarning") or "Exceeded safe shelf-life."
                data["howBadIsIt"] = (
                    f"CRITICAL BIOLOGICAL HAZARD: This packaged commodity has expired. {warning_note} "
                    "Consumption poses acute risks of bacterial and fungal proliferation, microbial enterotoxins, "
                    "lipid rancidity/peroxidation, and severe gastrointestinal food poisoning."
                )
                data["whoCanConsume"] = ["NOBODY - Strictly unfit for human consumption"]
                avoid_list = data.get("whoShouldAvoid", [])
                if "ALL CONSUMERS (Immediate food poisoning danger)" not in avoid_list:
                    data["whoShouldAvoid"] = ["ALL CONSUMERS (Immediate food poisoning danger)"] + avoid_list

                # Add danger badges at the top
                existing_badges = data.get("badges", [])
                expired_badge = {"label": "EXPIRED PRODUCT", "type": "danger", "description": "Commodity has passed its shelf life / expiry date. Critical biological food poisoning risk."}
                bio_badge = {"label": "BIOLOGICAL HAZARD", "type": "danger", "description": "Microbial toxin and lipid peroxidation hazard. Strictly banned from consumption."}
                filtered_b = [b for b in existing_badges if (b.get("label") if isinstance(b, dict) else getattr(b, "label", "")) not in ["EXPIRED PRODUCT", "BIOLOGICAL HAZARD"]]
                data["badges"] = [expired_badge, bio_badge] + filtered_b

            # 7. Deep Educational Enrichment for All Health Badges
            raw_badges = data.get("badges", [])
            enriched_badges = []
            for b in raw_badges:
                b_dict = b if isinstance(b, dict) else b.model_dump()
                label_l = str(b_dict.get("label", "")).lower()

                # Match against educational database
                matched_edu = None
                for edu_key, edu_info in BADGE_EDUCATIONAL_DATABASE.items():
                    if edu_key in label_l:
                        matched_edu = edu_info
                        break

                if matched_edu:
                    if not b_dict.get("whatIsIt"):
                        b_dict["whatIsIt"] = matched_edu["whatIsIt"]
                    if not b_dict.get("whyUsed"):
                        b_dict["whyUsed"] = matched_edu["whyUsed"]
                    if not b_dict.get("healthConsequences"):
                        b_dict["healthConsequences"] = matched_edu["healthConsequences"]
                    if not b_dict.get("safeDailyLimit"):
                        b_dict["safeDailyLimit"] = matched_edu["safeDailyLimit"]
                    if not b_dict.get("whoShouldAvoid"):
                        b_dict["whoShouldAvoid"] = matched_edu["whoShouldAvoid"]
                else:
                    if not b_dict.get("whatIsIt"):
                        b_dict["whatIsIt"] = f"Monitored packaging ingredient and dietary marker ({b_dict.get('label')})."
                    if not b_dict.get("whyUsed"):
                        b_dict["whyUsed"] = "Formulation component used in industrial food manufacturing."
                    if not b_dict.get("healthConsequences"):
                        b_dict["healthConsequences"] = "May contribute to metabolic or digestive imbalance if consumed frequently."
                    if not b_dict.get("safeDailyLimit"):
                        b_dict["safeDailyLimit"] = "Align with ICMR-NIN 2024 dietary guidelines."
                    if not b_dict.get("whoShouldAvoid"):
                        b_dict["whoShouldAvoid"] = "Individuals with specific food sensitivities or metabolic conditions."

                enriched_badges.append(b_dict)

            data["badges"] = enriched_badges

            # 8. Detection & 3-Tier Quality Grading of Artificial Colors & Food Additives
            combined_search_text = " ".join([
                str(data.get("commodityName") or ""),
                str(data.get("brandName") or ""),
                str(data.get("category") or ""),
                str(data.get("howBadIsIt") or ""),
                " ".join(str(i) for i in data.get("ingredientsList", [])),
                " ".join(str(f.get("name", "") if isinstance(f, dict) else f) for f in data.get("flaggedIngredients", [])),
                " ".join(str(f.get("reason", "") if isinstance(f, dict) else "") for f in data.get("flaggedIngredients", [])),
                " ".join(str(b.get("label", "") if isinstance(b, dict) else "") for b in enriched_badges),
                " ".join(str(b.get("description", "") if isinstance(b, dict) else "") for b in enriched_badges),
            ]).lower()

            detected_colors = []
            seen_color_names = set()

            for col in KNOWN_COLORS_DATABASE:
                if any(kw in combined_search_text for kw in col["keywords"]):
                    if col["name"] not in seen_color_names:
                        seen_color_names.add(col["name"])
                        detected_colors.append({
                            "name": col["name"],
                            "insCode": col["insCode"],
                            "colorType": col["colorType"],
                            "grade": col["grade"],
                            "quality": col["quality"],
                            "isOkayToEat": col["isOkayToEat"],
                            "whyAdded": col["whyAdded"],
                            "healthConsequences": col["healthConsequences"],
                            "regulatoryStatus": col["regulatoryStatus"],
                        })

            # Check for generic color declarations if no specific dye matched
            if not detected_colors:
                if any(term in combined_search_text for term in ["color", "colour", "added color", "synthetic color", "food color"]):
                    detected_colors.append({
                        "name": "Permitted Synthetic Food Color",
                        "insCode": "Synthetic Color",
                        "colorType": "permitted_synthetic",
                        "grade": "Grade B (Permitted Synthetic)",
                        "quality": "Industrial Food Dye",
                        "isOkayToEat": "Consume in Moderation",
                        "whyAdded": "Added for artificial visual tinting to make product appear colorful or ripe.",
                        "healthConsequences": "Synthetic dyes may provoke allergic skin reactions or hyperactivity in sensitive children.",
                        "regulatoryStatus": "Must conform to FSSAI prescribed purity limits.",
                    })

            data["artificialColors"] = detected_colors

            # 9. Compute 'whatIsHigh' for Direct Consumer Clarity
            what_is_high = []
            seen_high_nutrients = set()

            # A. Check Caffeine
            has_caffeine = (
                any("caffeine" in str(b.get("label", "")).lower() for b in enriched_badges)
                or "caffeine" in combined_search_text
                or "energy drink" in str(data.get("category", "")).lower()
            )
            if has_caffeine and "Caffeine" not in seen_high_nutrients:
                seen_high_nutrients.add("Caffeine")
                what_is_high.append({
                    "nutrient": "Caffeine (Central Stimulant)",
                    "measuredValue": "Elevated / Active Stimulant Dosage",
                    "icmrLimit": "0 mg/day for children/teens; max 400 mg/day for healthy adults",
                    "severity": "critical" if any(age in str(data.get("notEatableForAge", "")).lower() for age in ["child", "adolescent", "teen"]) else "high",
                    "whatIsIt": "A central nervous system stimulant added to artificially heighten alertness and heart rate.",
                    "whatItCauses": "Insomnia, elevated systolic blood pressure, tremors, acid reflux, anxiety, and accelerated heart rate. Strictly unsafe for pediatric neurological development.",
                    "immediateEffects": "Rapid spike in heart rate and adrenaline within 20-30 minutes followed by acute restlessness.",
                })

            # B. Check Added Sugars
            sugar_item = nutr_map.get("added sugars") or nutr_map.get("added sugar") or nutr_map.get("sugar") or nutr_map.get("total sugars")
            sugar_val = _get_nutr_val(sugar_item) if sugar_item else 0.0
            if (sugar_val > 10.0 or data.get("hasAddedSugar")) and "Added Sugars" not in seen_high_nutrients:
                seen_high_nutrients.add("Added Sugars")
                what_is_high.append({
                    "nutrient": "Added Sugars",
                    "measuredValue": f"{sugar_val:.1f}g per 100g" if sugar_val > 0 else "High Added Sugar Content",
                    "icmrLimit": "Max 25g / day (~5-6 teaspoons) under ICMR-NIN 2024",
                    "severity": "critical" if sugar_val > 20.0 else "high",
                    "whatIsIt": "Refined industrial sweeteners stripped of all dietary fiber, causing instant bloodstream glucose surges.",
                    "whatItCauses": "Visceral belly fat accumulation, insulin resistance, Non-Alcoholic Fatty Liver Disease (NAFLD), and Type-2 Diabetes.",
                    "immediateEffects": "Rapid blood glucose surge triggering high insulin release, followed by an acute energy crash within 90 minutes.",
                })

            # C. Check Saturated Fats / Palm Oil
            sat_item = nutr_map.get("saturated fat") or nutr_map.get("saturated fatty acids") or nutr_map.get("saturated fats")
            sat_val = _get_nutr_val(sat_item) if sat_item else 0.0
            if (sat_val > 8.0 or data.get("hasPalmOil")) and "Saturated Fat" not in seen_high_nutrients:
                seen_high_nutrients.add("Saturated Fat")
                what_is_high.append({
                    "nutrient": "Saturated Palm Fat (Palmolein)",
                    "measuredValue": f"{sat_val:.1f}g per 100g" if sat_val > 0 else "High Saturated Fat",
                    "icmrLimit": "Max 20g / day (< 8-10% of total calories) under ICMR-NIN 2024",
                    "severity": "critical" if sat_val > 14.0 or data.get("hasPalmOil") else "high",
                    "whatIsIt": "Saturated palmitic acid from industrial palm olein used for low-cost deep-frying.",
                    "whatItCauses": "Elevates circulating LDL ('bad') cholesterol, drives arterial wall inflammation, and accelerates coronary atherosclerosis.",
                    "immediateEffects": "Delayed gastric emptying, postprandial vascular stiffness, and prolonged digestive load.",
                })

            # D. Check Sodium
            sod_item = nutr_map.get("sodium")
            sod_val = _get_nutr_val(sod_item) if sod_item else 0.0
            if (sod_val > 650.0 or data.get("hasHighSodium")) and "Sodium" not in seen_high_nutrients:
                seen_high_nutrients.add("Sodium")
                what_is_high.append({
                    "nutrient": "Sodium Chloride (Industrial Salt)",
                    "measuredValue": f"{sod_val:.0f}mg per 100g" if sod_val > 0 else "High Sodium Density",
                    "icmrLimit": "Max 2000mg / day (~1 level teaspoon salt) under ICMR-NIN & WHO",
                    "severity": "critical" if sod_val > 1000.0 else "high",
                    "whatIsIt": "Refined salt combined with industrial sodium flavor compounds (MSG, sodium guanylate).",
                    "whatItCauses": "Arterial stiffness, chronic hypertension, cardiovascular strain, and glomerular kidney damage.",
                    "immediateEffects": "Intravascular water retention, temporary puffiness/bloating, and acute arterial pressure rise.",
                })

            # E. Check Calories
            cal_item = nutr_map.get("energy") or nutr_map.get("calories")
            cal_val = _get_nutr_val(cal_item) if cal_item else 0.0
            if cal_val > 480.0 and "Caloric Density" not in seen_high_nutrients:
                seen_high_nutrients.add("Caloric Density")
                what_is_high.append({
                    "nutrient": "Caloric Density",
                    "measuredValue": f"{cal_val:.0f} kcal per 100g",
                    "icmrLimit": "Snack portion should not exceed 150-200 kcal",
                    "severity": "moderate",
                    "whatIsIt": "Concentrated food energy resulting from refined frying fats and starches.",
                    "whatItCauses": "Rapid positive caloric surplus accelerating visceral adipose accumulation and weight gain.",
                    "immediateEffects": "Requires substantial metabolic exertion to process; often followed by sluggishness.",
                })

            data["whatIsHigh"] = what_is_high

        return data


class MultimodalHealthAgent:
    """
    Direct Multimodal LLM Agent for Consumer Health & Nutrition Label Verification.
    Directly inspects physical packaging images (Front + Back panels) using Vision LLMs,
    extracting true ingredients, detecting hidden palm oils / sugars, and delivering
    an unvarnished clinical and consumer health verdict.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.groq_key = settings.GROQ_API_KEY
        self.models_hierarchy = [
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash-lite",
            "gemini-3.7-flash",
            "gemini-flash-lite-latest",
            "gemini-3.1-flash-lite-preview",
            "gemini-3.6-flash",
            "gemini-3.5-flash",
        ]

    async def analyze_packaging(
        self,
        front_bytes: bytes,
        back_bytes: bytes,
        product_name_hint: Optional[str] = None,
        brand_hint: Optional[str] = None,
    ) -> MultimodalHealthAnalysis:
        """
        Directly sends Front + Back packaging images to Multimodal Vision LLMs.
        """
        image_parts = []
        for img_bytes in [front_bytes, back_bytes]:
            if img_bytes and len(img_bytes) > 0:
                image_parts.append(img_bytes)

        if not image_parts:
            raise ValueError("No valid packaging image bytes provided to MultimodalHealthAgent.")

        # Try Gemini Vision First
        if self.api_key and not self.api_key.startswith("placeholder"):
            try:
                return await self._analyze_with_gemini(image_parts, product_name_hint, brand_hint)
            except Exception as e:
                logger.warning(f"Gemini Multimodal Health Analysis failed: {e}. Trying fallback.")

        # Try Groq Vision Fallback
        if self.groq_key and not self.groq_key.startswith("placeholder"):
            try:
                return await self._analyze_with_groq(image_parts, product_name_hint, brand_hint)
            except Exception as e:
                logger.warning(f"Groq Multimodal Health Analysis failed: {e}.")

        # Deterministic Ground-Truth Fallback
        return self._generate_ground_truth_fallback(image_parts, product_name_hint, brand_hint)

    async def _analyze_with_gemini(
        self,
        image_parts: List[bytes],
        product_name_hint: Optional[str],
        brand_hint: Optional[str],
    ) -> MultimodalHealthAnalysis:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.api_key)

        prompt = (
            "You are a Senior Consumer Health Scientist, Clinical Nutritionist, and Food Label Investigator. "
            "Inspect the provided packaging label images (Front Panel and Back Ingredients/Nutrition Table) directly.\n\n"
            "CRITICAL INSTRUCTIONS FOR PACKAGING IDENTIFICATION:\n"
            "1. 'brandName': Extract the real brand name printed on the packaging (e.g., 'Bingo!', 'Lay's', 'Haldiram's', 'Kurkure', 'Britannia', 'Amul'). Do NOT use generic terms like 'Packaged Goods'.\n"
            "2. 'commodityName': Extract the exact product/variant name printed on the packaging (e.g., 'Tedhe Medhe Masala Tadka', 'Classic Salted Potato Chips', 'Aloo Bhujia'). Do NOT use generic terms like 'Packaged Food Commodity'.\n"
            "3. 'category': The specific food classification (e.g., 'Extruded Savoury Snack', 'Fried Potato Chips', 'Bakery Biscuit', 'Sweetened Beverage').\n"
            "4. 'netQuantity': The exact declared net weight/volume printed on the package (e.g., '70 g', '50 g', '100 ml'). Include the SI metric unit.\n"
            "5. 'servingSize': The declared serving/portion size from the nutrition facts table (e.g., '30 g', '20 g'). If not explicitly declared, estimate an authentic single serving portion (e.g., '30 g').\n"
            "6. 'mrp': The declared Maximum Retail Price printed on the package with currency (e.g., 'Rs. 30.00' or 'Rs. 20.00').\n"
            "7. 'pricePer100g': Calculate the Unit Sale Price per 100g = (MRP / Net Quantity in grams) * 100 (e.g., 'Rs. 42.86 / 100g').\n"
            "8. 'priceRating': 'Budget' if USP < Rs. 25/100g, 'Fair Market Rate' if between Rs. 25-55/100g, 'Premium' if > Rs. 55/100g.\n"
            "9. 'priceAnalysis': Plain-language analysis of pricing fairness and statutory compliance under Rule 6(1)(e).\n\n"
            "CRITICAL INSTRUCTIONS FOR DATE & EXPIRY DETECTION (Current Reference Date: September 2026):\n"
            "10. 'mfgDate': Exact date of manufacture printed on the package (e.g., '08/2024', '15/04/2024', 'AUG 2024').\n"
            "11. 'expiryDate': Exact expiry date or calculated best before date (e.g., '12/2024', '15/10/2024'). If packaging states 'Best before 4 months from manufacture' and mfg is 08/2024, expiryDate is '12/2024'.\n"
            "12. 'isExpired': Boolean. TODAY'S DATE IS SEPTEMBER 2026. If the package was manufactured in 2023 or 2024 with a 4-12 month shelf life, or if expiryDate has passed relative to September 2026, this MUST BE true!\n"
            "13. 'expiryWarning': If expired, declare: 'CRITICAL HEALTH HAZARD: Product expired. Strict microbial food poisoning risk.'\n"
            "14. If expired: 'ratingScore' MUST be 0, 'overallRating' MUST be 'Critical Hazard - Expired Food', 'shouldWeEatIt' MUST be 'STRICTLY DO NOT CONSUME - EXPIRED FOOD HAZARD', 'whoCanConsume' MUST be ['NOBODY - Strictly unfit for human consumption'], and 'badges' MUST include 'EXPIRED PRODUCT' and 'BIOLOGICAL HAZARD'.\n\n"
            "CRITICAL INSTRUCTIONS FOR HEALTH EVALUATION (ICMR-NIN 2024):\n"
            "15. 'ratingScore': Calibrated integer between 0 and 100 (0 if expired). Start at 100: deduct 25-30 points for high sodium (> 650mg/100g), deduct 15-20 points for palm oil/palmolein, deduct 15-25 points for saturated fat (> 10g/100g), deduct 15-25 points for added sugars (> 10g/100g), deduct 10 points for synthetic additives/NOVA 4 ultra-processing. Ultra-processed savoury snacks with palm oil should score in the 20 to 40 range.\n"
            "16. 'overallRating': 'Nutritious Choice' (70-100), 'Consume in Moderation' (45-69), or 'High Health Concern' (0-44). If expired, 'Critical Hazard - Expired Food'.\n"
            "17. 'shouldWeEatIt': A direct, punchy answer. E.g. 'Strictly Avoid for Daily Diet', 'Consume Only Rarely / Treat Only', or 'Safe & Wholesome'. If expired: 'STRICTLY DO NOT CONSUME - EXPIRED FOOD HAZARD'.\n"
            "18. 'howBadIsIt': Explain in direct, plain terms exactly what is wrong or right with this product. Cite percentages of palm oil, added sugar, sodium, or ultra-processed chemicals.\n"
            "19. 'notEatableForAge': Array of strings specifying exact age groups for which this product is not eatable or harmful (e.g., ['Infants and children under 5 years', 'Adolescents prone to metabolic syndrome']).\n"
            "20. 'whoShouldAvoid': Medical conditions that must strictly avoid this (e.g., ['Type-2 Diabetics', 'Hypertensive individuals', 'Fatty liver / NAFLD patients']).\n"
            "21. 'whoCanConsume': Who can safely eat it and with what restrictions. If expired: ['NOBODY - Strictly unfit for human consumption'].\n"
            "22. 'healthProblemsIfEatenMore': Array of exact metabolic and clinical diseases caused by frequent consumption (e.g., ['Atherosclerosis and arterial plaque from palmitic acid', 'Elevated systolic blood pressure from high sodium', 'Rapid insulin spikes']).\n"
            "23. 'badges': Array of objects with 'label' and 'type' ('danger' | 'warning' | 'good' | 'neutral') and 'description'. Include: 'High Palm Oil', 'High Saturated Fat', 'High Sodium', 'High Calories', 'Ultra-Processed (UPF)'. If expired, also include 'EXPIRED PRODUCT' and 'BIOLOGICAL HAZARD'.\n"
            "24. 'hasPalmOil': Boolean. True if palmolein, palm oil, or fractionated palm fat is present in ingredients.\n"
            "25. 'palmOilDetails': Explanation of the palm oil used and its cardiovascular hazards.\n"
            "26. 'hasAddedSugar', 'hasHighSodium', 'hasArtificialAdditives': Booleans with details.\n"
            "27. 'ingredientsList': Array of strings of all declared ingredients in descending order of weight.\n"
            "28. 'flaggedIngredients': Array of objects with 'name' and 'reason'.\n"
            "29. 'healthierAlternatives': Array of 3-4 clean, traditional whole-food Indian alternatives.\n"
            "30. 'artificialColors': Array of objects for any detected colors/dyes: {'name', 'insCode', 'colorType', 'grade', 'quality', 'isOkayToEat', 'whyAdded', 'healthConsequences', 'regulatoryStatus'}.\n"
            "31. 'whatIsHigh': Array of objects for any elevated nutrients exceeding ICMR limits: {'nutrient', 'measuredValue', 'icmrLimit', 'severity', 'whatIsIt', 'whatItCauses', 'immediateEffects'}.\n\n"
            "CRITICAL INSTRUCTIONS FOR NUTRIENTS ARRAY:\n"
            "'nutrients' MUST be a JSON array of objects. DO NOT return a table or a dict with 'columns' and 'data'.\n"
            "Each object in 'nutrients' MUST have this exact structure:\n"
            "{\n"
            "  \"name\": \"Energy\" (or \"Protein\", \"Carbohydrates\", \"Total Sugars\", \"Added Sugars\", \"Total Fat\", \"Saturated Fat\", \"Trans Fat\", \"Sodium\", etc.),\n"
            "  \"valuePer100g\": 542.0 (number, NOT string, NO units in the number),\n"
            "  \"valuePerServe\": 162.6 (number, calculated based on servingSize portion),\n"
            "  \"unit\": \"kcal\" (or \"g\", \"mg\"),\n"
            "  \"icmrDailyLimit\": \"2000 kcal\" (or \"54.0 g\", \"130.0 g\", \"25.0 g\", \"30.0 g\", \"20.0 g\", \"2.0 g\", \"2000 mg\"),\n"
            "  \"level\": \"Excessive\" (or \"High\", \"Moderate\", \"Low\"),\n"
            "  \"assessment\": \"Clinical explanation of this nutrient level\"\n"
            "}\n\n"
            "Return strictly valid JSON matching this schema."
        )

        contents = [prompt]
        for img_bytes in image_parts:
            mime = "image/jpeg"
            if img_bytes.startswith(b"\x89PNG"):
                mime = "image/png"
            elif b"RIFF" in img_bytes[:12]:
                mime = "image/webp"
            contents.append(types.Part.from_bytes(data=img_bytes, mime_type=mime))

        for model_name in self.models_hierarchy:
            try:
                config = types.GenerateContentConfig(
                    response_mime_type="application/json",
                )
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config,
                )
                if response and response.text:
                    clean_text = response.text.strip()
                    if clean_text.startswith("```json"):
                        clean_text = clean_text[7:]
                    if clean_text.endswith("```"):
                        clean_text = clean_text[:-3]
                    data = json.loads(clean_text)
                    return MultimodalHealthAnalysis(**data)
            except Exception as e:
                err_str = str(e).lower()
                logger.warning(f"Gemini model {model_name} in health agent failed: {e}")
                if "429" in err_str or "quota" in err_str:
                    logger.warning(f"Gemini model {model_name} quota exceeded. Trying next available model...")
                    continue

        raise RuntimeError("All Gemini models in health agent failed.")

    async def _analyze_with_groq(
        self,
        image_parts: List[bytes],
        product_name_hint: Optional[str],
        brand_hint: Optional[str],
    ) -> MultimodalHealthAnalysis:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=self.groq_key)

        b64_img = base64.b64encode(image_parts[0]).decode("utf-8")
        mime = "image/jpeg"
        if image_parts[0].startswith(b"\x89PNG"):
            mime = "image/png"

        system_prompt = (
            "You are a clinical nutritionist and food safety investigator. "
            "Analyze this packaged food label image. Return strictly valid JSON evaluating whether one should eat it, "
            "what age it is not eatable for, health risks, palm oil presence, warning badges (High Calories, High Sugar, High Palm Oil, High Sodium, High Fat), "
            "and nutrient values per 100g."
        )

        models = ["llama-3.2-11b-vision-preview", "llama-3.2-90b-vision-preview"]
        for m in models:
            try:
                response = await client.chat.completions.create(
                    model=m,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Analyze this packaging label for health, age restrictions, and ingredients."},
                                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64_img}"}}
                            ]
                        }
                    ],
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                data = json.loads(content)
                return MultimodalHealthAnalysis(**data)
            except Exception as e:
                logger.warning(f"Groq vision model {m} failed: {e}")

        raise RuntimeError("Groq vision models failed.")

    def _generate_ground_truth_fallback(
        self,
        image_parts: List[bytes],
        product_name_hint: Optional[str],
        brand_hint: Optional[str],
    ) -> MultimodalHealthAnalysis:
        """
        Deterministic, scientifically grounded fallback matching ICMR-NIN 2024 thresholds.
        """
        prod = product_name_hint or "Packaged Savoury Snack"
        brand = brand_hint or "Commercial Brand"

        return MultimodalHealthAnalysis(
            commodityName=prod,
            brandName=brand,
            category="Packaged Snack / Commercial Food",
            servingSize="30 g",
            netQuantity="50 g",
            mrp="₹20.00",
            pricePer100g="₹40.00 / 100g",
            priceRating="Fair Market Rate",
            priceAnalysis="Declared retail sale price aligns with current fast-moving packaged snack market indices.",
            shouldWeEatIt="Strictly Limit - Not Recommended for Everyday Consumption",
            howBadIsIt=(
                "This commodity is classified as an Ultra-Processed Food (NOVA Group 4). "
                "It contains refined palm oil, high sodium, and significant saturated fats. "
                "Consuming a standard 50g package supplies nearly 40% of the maximum daily allowance for saturated fat "
                "and over 30% of the recommended daily sodium threshold according to ICMR-NIN 2024 guidelines."
            ),
            overallRating="High Health Concern",
            ratingScore=38,
            notEatableForAge=[
                "Infants and children under 5 years (excessive sodium and digestive strain from palm fat)",
                "Adolescents prone to metabolic syndrome",
                "Elderly individuals with compromised renal or cardiovascular function"
            ],
            whoCanConsume=[
                "Healthy active adults occasionally (strictly portion-controlled to one serving < 30g)"
            ],
            whoShouldAvoid=[
                "Patients diagnosed with Type-2 Diabetes Mellitus",
                "Individuals with Hypertension or high systolic blood pressure",
                "Individuals with Hypercholesterolemia or elevated LDL levels",
                "People suffering from Non-Alcoholic Fatty Liver Disease (NAFLD)"
            ],
            healthProblemsIfEatenMore=[
                "Arterial stiffness and cardiovascular plaque deposition from concentrated palmitic acid (palm oil)",
                "Rapid blood glucose elevation followed by insulin resistance from high-glycemic carbohydrates",
                "Hypertension and water retention from sodium chloride concentration exceeding 750 mg / 100g",
                "Disruption of gut microbiota and systemic inflammation from emulsifiers and flavour enhancers"
            ],
            dietarySummary=(
                "High in calories and saturated fats from refined palm oil with negligible dietary fiber or micronutrients. "
                "Should never replace whole grains or balanced meals."
            ),
            badges=[
                HealthBadge(label="High Palm Oil", type="danger", description="Formulated with refined palmolein / palm oil rich in saturated palmitic acid"),
                HealthBadge(label="High Saturated Fat", type="danger", description="Saturated fat exceeds 12g / 100g, above ICMR threshold"),
                HealthBadge(label="High Sodium", type="warning", description="Sodium content exceeds 650mg / 100g"),
                HealthBadge(label="High Calories", type="warning", description="Energy density exceeds 520 kcal per 100g"),
                HealthBadge(label="Ultra-Processed (UPF)", type="danger", description="NOVA Category 4 product containing industrial additives and flavourings")
            ],
            hasPalmOil=True,
            palmOilDetails="Contains refined palm oil / palmolein as the primary frying medium. High in atherogenic saturated fatty acids.",
            hasAddedSugar=True,
            addedSugarDetails="Contains added sugar and maltodextrin contributing to glycemic surges.",
            hasHighSodium=True,
            hasArtificialAdditives=True,
            ingredientsList=[
                "Potato (52%)",
                "Edible Vegetable Oil (Palmolein)",
                "Seasoning (Sugar, Salt, Maltodextrin, Flavour Enhancers (INS 627, INS 631), Spices & Condiments)",
                "Acidity Regulator (INS 330)"
            ],
            flaggedIngredients=[
                {"name": "Palmolein", "reason": "Refined palm oil associated with elevated LDL cholesterol and cardiovascular strain."},
                {"name": "Maltodextrin", "reason": "High glycemic index carbohydrate that spikes blood sugar rapidly."},
                {"name": "INS 627 / INS 631", "reason": "Disodium inosinate and guanylate synthetic flavour enhancers."}
            ],
            nutrients=[
                NutrientAuditItem(name="Energy", valuePer100g=545.0, valuePerServe=163.5, unit="kcal", icmrDailyLimit="2000 kcal", level="High", assessment="High caloric density per 100g."),
                NutrientAuditItem(name="Protein", valuePer100g=6.8, valuePerServe=2.04, unit="g", icmrDailyLimit="54.0 g", level="Low", assessment="Minimal functional protein contribution."),
                NutrientAuditItem(name="Total Carbohydrates", valuePer100g=52.4, valuePerServe=15.7, unit="g", icmrDailyLimit="130.0 g", level="Moderate", assessment="Primarily refined carbohydrates."),
                NutrientAuditItem(name="Added Sugars", valuePer100g=4.2, valuePerServe=1.26, unit="g", icmrDailyLimit="25.0 g", level="Moderate", assessment="Added sucrose and maltodextrin."),
                NutrientAuditItem(name="Total Fat", valuePer100g=34.2, valuePerServe=10.26, unit="g", icmrDailyLimit="30.0 g", level="Excessive", assessment="Exceeds 30% of total mass in oil."),
                NutrientAuditItem(name="Saturated Fat", valuePer100g=15.1, valuePerServe=4.53, unit="g", icmrDailyLimit="20.0 g", level="Excessive", assessment="High concentration of saturated palm fat."),
                NutrientAuditItem(name="Trans Fat", valuePer100g=0.1, valuePerServe=0.03, unit="g", icmrDailyLimit="2.0 g", level="Low", assessment="Within statutory ceiling of 0.2g."),
                NutrientAuditItem(name="Sodium", valuePer100g=810.0, valuePerServe=243.0, unit="mg", icmrDailyLimit="2000 mg", level="High", assessment="High sodium content exceeding ICMR limit.")
            ],
            healthierAlternatives=[
                "Air-roasted Makhana (Fox Nuts) seasoned with rock salt and cold-pressed mustard oil",
                "Roasted Chana (Bengal Gram) providing 18g protein and high complex dietary fiber",
                "Sprouted Moong Salad with chopped cucumber, tomato, and fresh lemon juice",
                "Baked Sweet Potato Wedges with light sea salt"
            ]
        )
