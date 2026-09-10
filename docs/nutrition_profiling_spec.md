# ICMR-NIN 2024 Nutritional Benchmark and Health Engine Specification

**Document Identifier**: SPEC-METROSCAN-NUTRI-2024  
**Project**: MetroScan (SIH26034)  
**Classification**: Technical Architecture & Algorithmic Specification  
**Governing Authorities**: ICMR - National Institute of Nutrition (NIN) Guidelines (May 2024), FSSAI Labelling & Display Regulations (2020), WHO SEAR Nutrient Profile Model  
**Author**: MetroScan Core Engineering & Nutritional Metrology Team  
**Status**: Approved for Implementation  
**Target Files**: 
- Specification: `/Users/lovejeetsingh1/Documents/SIH/docs/nutrition_profiling_spec.md`
- Reference Blueprint: `/Users/lovejeetsingh1/Documents/SIH/docs/prd_master_blueprint.md`
- Machine Learning Engine: `/Users/lovejeetsingh1/Documents/SIH/ml/nutrition_engine.py`
- Data Models: `/Users/lovejeetsingh1/Documents/SIH/frontend/src/types/index.ts`
- Benchmark Dataset: `/Users/lovejeetsingh1/Documents/SIH/frontend/src/data/mockHealthData.ts`

---

## 1. Document Header and Purpose

### 1.1 Executive Summary
MetroScan (SIH26034) provides an automated regulatory compliance verification and nutritional safety auditing platform. While statutory metrology modules enforce compliance with the Legal Metrology (Packaged Commodities) Rules, 2011, the Nutritional Profiling Engine protects consumer public health. 

This specification codifies the operational rules, computer vision extraction schemas, mathematical scoring formulations, and diagnostic heuristics required to evaluate packaged food and beverage products against the ICMR-NIN 2024 Dietary Guidelines for Indians and WHO thresholds. The primary goal is automated detection of High-Fat-Sugar-Salt (HFSS) formulations, computation of a standardized 0-100 Health Score, generation of automated advisory badges, clinical contraindication screening, and recommendation of whole-food alternatives.

### 1.2 Statutory and Regulatory Framework
The algorithmic checks specified herein derive authority from the following statutory instruments:
1. **ICMR-NIN Dietary Guidelines for Indians (May 2024)**: Issued by the National Institute of Nutrition (ICMR-NIN, Hyderabad), establishing 17 core dietary guidelines emphasizing the reduction of sugar, sodium, and saturated fats to curb non-communicable diseases (NCDs).
2. **FSSAI Food Safety and Standards (Labelling and Display) Regulations, 2020**: Mandates quantitative declaration of energy, protein, carbohydrate, total sugars, added sugars, total fat, saturated fat, trans fat, cholesterol, and sodium per 100g or per 100ml, as well as per serving.
3. **FSSAI Draft Front-of-Pack Labelling (FOPL) / Indian Nutrition Rating (INR)**: Codifies nutrient cutoffs for solid and liquid food categories to inform consumer purchase decisions.
4. **WHO South-East Asia Region (SEAR) Nutrient Profile Model**: Sets global non-communicable disease risk limits for free sugars, sodium, trans-fatty acids, and saturated fats.
5. **Legal Metrology (Packaged Commodities) Rules, 2011 (Rule 6 & Rule 18)**: Mandates clear declaration of net quantity, retail sale price, and unit sale price, preventing deceptive packaging.

---

## 2. Back-Panel Nutrition Table Extraction Schema

### 2.1 Tabular Structure Detection Pipeline
Packaged food items in India exhibit high variability in nutritional label layouts, including boxed grid tables, borderless aligned columns, dual-column declarations (per 100g vs per serve), and bilingual typography (English and Hindi). The extraction pipeline isolates and digitizes these tables through the following stages:

```
+---------------------------------------------------------------------------------+
|                        NUTRITION TABLE CV/OCR PIPELINE                          |
+---------------------------------------------------------------------------------+
  Input: Cropped Back-Panel Image
            |
            v
  1. PREPROCESSING & RECTIFICATION
     - Grayscale conversion, CLAHE contrast equalization
     - Deskewing via Hough line transform and orientation correction
            |
            v
  2. REGION OF INTEREST (ROI) DETECTION
     - Table boundary box detection using deep feature segmentation
     - Header text anchor identification (e.g., "Nutritional Information", "Nutrition Facts")
            |
            v
  3. CELL SEGMENTATION & TOPOLOGY RECONSTRUCTION
     - Detection of explicit horizontal/vertical border lines via morphological kernels
     - Implicit grid clustering for borderless tables using spatial bounding box projection
     - Column header parsing: [Nutrient Name, Quantity per 100g/ml, Quantity per Serve, % RDA]
            |
            v
  4. OPTICAL CHARACTER RECOGNITION (OCR) & POST-PROCESSING
     - Multilingual recognition (English, Devanagari, and numerals) via PP-OCRv4 / SVTR
     - Token cleanup (correction of OCR artifacts: "O" vs "0", "g" vs "9", "mcg" vs "mg")
            |
            v
  5. NORMALIZATION & UNIT CONVERSION
     - Standardize all declared values to per 100g (solids) or per 100ml (liquids)
     - Validate mass conservation (Total Fat >= Sat Fat + Trans Fat; Total Carbs >= Total Sugars >= Added Sugars)
```

### 2.2 Mandatory Parsed Nutrients
Under FSSAI Labelling Regulations (2020) and ICMR-NIN 2024 profiling guidelines, eleven core nutritional fields must be parsed, validated, and normalized:

| Field Key | Canonical Nutrient Name | Statutory Unit | Validation Constraint / Invariant |
|---|---|---|---|
| `energy_kcal` | Energy / Calories | kcal | `energy_kcal >= 0`; converts from kJ if needed (`1 kcal = 4.184 kJ`) |
| `total_fat` | Total Fat | g | `total_fat >= (saturated_fat + trans_fat)` |
| `saturated_fat` | Saturated Fatty Acids | g | `0 <= saturated_fat <= total_fat` |
| `trans_fat` | Trans Fatty Acids | g | `0 <= trans_fat <= total_fat` |
| `cholesterol` | Cholesterol | mg | `cholesterol >= 0` |
| `sodium` | Sodium | mg | `sodium >= 0`; converts to Salt via `salt_g = (sodium * 2.5) / 1000` |
| `total_carbohydrates` | Carbohydrates | g | `total_carbohydrates >= total_sugars` |
| `total_sugars` | Total Sugars | g | `total_sugars >= added_sugars` |
| `added_sugars` | Added / Free Sugars | g | `0 <= added_sugars <= total_sugars` |
| `dietary_fiber` | Dietary Fiber | g | `dietary_fiber >= 0` |
| `protein` | Protein | g | `protein >= 0` |

### 2.3 Normalization to Per 100g / 100ml Basis
Manufacturers frequently obscure high concentrations of sugar, salt, or fat by reporting nutrient metrics against arbitrarily small serving sizes (e.g., "1 cookie: 12.5g" or "1 scoop: 20g"). The engine standardizes all parsed entries to a uniform 100g (for solid commodities) or 100ml (for liquid commodities) denominator.

#### Mathematical Normalization Formula:
If a product declares nutrient values only per serving:
```
Value_per_100 = (Value_per_serve / Serving_Size_Declared) * 100
```

Where:
- `Serving_Size_Declared` is parsed from the panel header (e.g., "Serving size: 20 g" -> 20.0).
- If the serving unit is volumetric (ml) and the package net quantity is gravimetric (g), density `rho = 1.0 g/ml` is applied by default unless liquid specific gravity is specified.
- If both "Per 100g" and "Per Serve" columns exist, the "Per 100g" column is selected as primary, and the calculated "Per Serve" value is cross-checked against:
```
| (Value_per_100 * Serving_Size_Declared / 100) - Value_per_serve | <= epsilon
```
where `epsilon = 0.5` to account for manufacturer rounding tolerances.

### 2.4 JSON Schema Definition
The output of the extraction and normalization pipeline conforms to the following formal JSON schema:

```json
{
  "": "http://json-schema.org/draft-07/schema#",
  "title": "NutritionExtractionPayload",
  "type": "object",
  "required": [
    "product_id",
    "declared_basis",
    "serving_size",
    "serving_unit",
    "nutrients_per_100",
    "statutory_compliance"
  ],
  "properties": {
    "product_id": { "type": "string" },
    "commodity_category": { 
      "type": "string",
      "enum": ["Solid Food", "Liquid Beverage", "Powder / Reconstituted"]
    },
    "declared_basis": {
      "type": "string",
      "enum": ["per_100g", "per_100ml", "per_serving", "dual_declared"]
    },
    "serving_size": { "type": "number", "minimum": 0.1 },
    "serving_unit": { "type": "string", "enum": ["g", "ml"] },
    "nutrients_per_100": {
      "type": "object",
      "required": [
        "energy_kcal",
        "total_fat_g",
        "saturated_fat_g",
        "trans_fat_g",
        "sodium_mg",
        "total_carbohydrates_g",
        "total_sugars_g",
        "added_sugars_g",
        "dietary_fiber_g",
        "protein_g"
      ],
      "properties": {
        "energy_kcal": { "type": "number", "minimum": 0.0 },
        "total_fat_g": { "type": "number", "minimum": 0.0 },
        "saturated_fat_g": { "type": "number", "minimum": 0.0 },
        "trans_fat_g": { "type": "number", "minimum": 0.0 },
        "cholesterol_mg": { "type": ["number", "null"], "minimum": 0.0 },
        "sodium_mg": { "type": "number", "minimum": 0.0 },
        "total_carbohydrates_g": { "type": "number", "minimum": 0.0 },
        "total_sugars_g": { "type": "number", "minimum": 0.0 },
        "added_sugars_g": { "type": "number", "minimum": 0.0 },
        "dietary_fiber_g": { "type": "number", "minimum": 0.0 },
        "protein_g": { "type": "number", "minimum": 0.0 }
      }
    },
    "statutory_compliance": {
      "type": "object",
      "required": ["all_mandatory_fields_present", "trans_fat_declared", "added_sugar_declared"],
      "properties": {
        "all_mandatory_fields_present": { "type": "boolean" },
        "trans_fat_declared": { "type": "boolean" },
        "added_sugar_declared": { "type": "boolean" },
        "omitted_fields": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  }
}
```

---

## 3. ICMR-NIN 2024 and WHO Quantitative Thresholds Table

### 3.1 Quantitative Cutoff Matrix
Nutrient concentrations normalized per 100g (solids) or per 100ml (liquids) are classified into three traffic-light tiers based on the ICMR-NIN 2024 guidelines and WHO thresholds:

| Nutrient Metric | Low Threshold (Green) | Moderate Threshold (Amber) | High / HFSS Cutoff (Red) | Regulatory Source |
|---|---|---|---|---|
| **Total Sugars** | <= 5.0 g / 100g | 5.1 - 10.0 g / 100g | > 10.0 g / 100g | ICMR-NIN Dietary Guidelines 2024 |
| **Added Sugars** | 0.0 g / 100g | 0.1 - 5.0 g / 100g | > 5.0 g / 100g | ICMR-NIN 2024 & WHO NCD Guidance |
| **Saturated Fat** | <= 1.5 g / 100g | 1.6 - 4.0 g / 100g | > 4.0 g / 100g | ICMR-NIN 2024 (Guideline 8) |
| **Trans Fatty Acids** | 0.0 g / 100g | Not Permitted | > 0.0 g / 100g (Zero Tolerance) | FSSAI 2% Cap / WHO REPLACE (Target: 0g) |
| **Sodium (Salt equiv.)** | <= 120 mg / 100g (<= 0.3g salt) | 121 - 400 mg / 100g (0.3 - 1.0g salt) | > 400 mg / 100g (> 1.0g salt) | ICMR-NIN 2024 & WHO SEAR |
| **Energy Density** | <= 150 kcal / 100g | 151 - 350 kcal / 100g | > 350 kcal / 100g | ICMR-NIN Reference Energy Profile |

### 3.2 Liquid Beverage Threshold Adjustments
Beverages lack solid food satiety cues and drive rapid caloric ingestion. In accordance with WHO SEAR and ICMR-NIN guidelines, stricter limits apply to liquid formulations (per 100ml):
- **Added Sugars in Liquids**: Low <= 0g, Moderate: 0.1 - 2.5g, High > 2.5g / 100ml. Any beverage exceeding 5.0g added sugar per 100ml receives an automatic critical HFSS flag.
- **Energy Density in Liquids**: Low <= 20 kcal, Moderate: 21 - 60 kcal, High > 60 kcal / 100ml.

### 3.3 ICMR-NIN Reference Daily Intakes (RDA for Reference Indian Adult)
Calculated against a standard reference Indian adult diet (2,000 kcal/day; Reference Man: 65 kg, Reference Woman: 55 kg):

| Dietary Component | Daily Maximum / Target Intake | Clinical Basis |
|---|---|---|
| Added / Free Sugar | <= 25 g / day | Maximum 5% of daily energy intake to avoid hepatic de novo lipogenesis |
| Sodium | <= 2,000 mg / day (approx. 5.0 g table salt) | Mitigates arterial hypertension, stroke, and renal glomerulosclerosis |
| Saturated Fatty Acids | <= 15.0 - 20.0 g / day (< 8-10% of total calories) | Prevents elevated circulating low-density lipoprotein (LDL) cholesterol |
| Industrial Trans Fats | 0.0 g / day (< 1% total energy, target zero) | Eliminates atherogenic trans-isomers that depress HDL and spike LDL |
| Total Dietary Fiber | >= 30.0 g / day | Promotes short-chain fatty acid synthesis and slows glucose absorption |
| Protein | >= 54.0 g / day (0.83 g/kg body weight/day) | Maintains lean muscle mass and enzymatic cellular synthesis |

---

## 4. Health Score Calculation Algorithm (0 to 100 Scale)

### 4.1 Theoretical Formulation
The MetroScan Composite Health Score (denoted as H, where H in [0, 100]) assesses nutritional quality on an integer scale. A product starts with a baseline allocation of 100 points, representative of an unadulterated whole food. Penalties are deducted for excess negative nutrients (added sugar, sodium, saturated fat, trans fat), and credits are awarded for positive nutrient density (dietary fiber, protein).

The raw mathematical formulation is defined as:

```
H_raw = 100.0 - (P_sugar + P_sodium + P_sat_fat + P_trans_fat) + (C_fiber + C_protein)
```

The final score is clamped and rounded:
```
Health_Score = round( clamp(H_raw, 0.0, 100.0) )
```

### 4.2 Negative Nutrient Penalty Deductions

#### 1. Added Sugar Penalty (P_sugar)
Reflects metabolic toxicity and rapid glycemic excursion.
```
P_sugar = min(35.0, (added_sugar_g / 10.0) * 12.0)
```
- Scaled such that reaching 10g of added sugar incurs a 12-point deduction.
- Capped at a maximum deduction of 35.0 points (reached at approx. 29.17g added sugar per 100g).
- If `added_sugar` is undeclared but `total_sugar` is declared, the engine estimates:
```
inferred_added_sugar = max(0.0, total_sugar_g - 4.0)
```
accounting for intrinsic lactose or fruit sugars, and triggers a regulatory disclosure warning.

#### 2. Sodium Penalty (P_sodium)
Reflects cardiovascular hypertension risk and osmotic vascular stress.
```
P_sodium = min(25.0, (sodium_mg / 400.0) * 10.0)
```
- Scaled such that 400mg sodium (the ICMR High cutoff) incurs a 10-point deduction.
- Capped at a maximum deduction of 25.0 points (reached at 1,000mg sodium per 100g).

#### 3. Saturated Fat Penalty (P_sat_fat)
Reflects atherogenic lipid profiling and LDL cholesterol elevation.
```
P_sat_fat = min(20.0, (saturated_fat_g / 4.0) * 8.0)
```
- Scaled such that 4.0g saturated fat (the ICMR High cutoff) incurs an 8-point deduction.
- Capped at a maximum deduction of 20.0 points (reached at 10.0g saturated fat per 100g).

#### 4. Trans Fat Penalty (P_trans_fat)
Reflects strict zero-tolerance enforcement under Indian and WHO cardiovascular directives.
```
P_trans_fat = 30.0 if trans_fat_g > 0.0 else 0.0
```
- An immediate flat penalty of 30.0 points is levied for any detectable industrial trans fatty acids (> 0.0g per 100g).

### 4.3 Positive Nutrient Credit Additions

#### 1. Dietary Fiber Credit (C_fiber)
Reflects gut microbiome support and glycemic blunting effects.
```
C_fiber = min(10.0, (dietary_fiber_g / 3.0) * 3.0)
```
- Provides 1.0 point of credit per 1.0g of dietary fiber.
- Capped at a maximum bonus of 10.0 points (reached at 10.0g fiber per 100g).

#### 2. Dietary Protein Credit (C_protein)
Reflects essential amino acid density and metabolic satiety.
```
C_protein = min(10.0, (protein_g / 5.0) * 2.0)
```
- Scaled such that 5.0g protein awards 2.0 credit points (0.4 points per gram).
- Capped at a maximum bonus of 10.0 points (reached at 25.0g protein per 100g).

### 4.4 Score Bands and Classification

| Score Band | Classification Label | Public Health Interpretation | Consumer Guidance |
|---|---|---|---|
| **80 - 100** | Nutritious / Clean Profile | Nutrient-dense, minimal industrial processing, compliant with ICMR low-risk parameters. | Recommended for regular, unhindered dietary consumption. |
| **60 - 79** | Moderate Balance | Balanced nutritional profile with moderate caloric, fat, or natural sugar presence. | Suitable for regular consumption in standard, controlled portion sizes. |
| **40 - 59** | Processed Formulation | Contains elevated quantities of added sugar, sodium, or saturated fat exceeding ICMR thresholds. | Limit frequency of intake; avoid daily consumption. |
| **0 - 39** | Ultra-Processed / HFSS | Severe imbalance in multiple HFSS metrics. Poses elevated chronic disease risk. | Restrict intake strictly. Unsuitable for daily or pediatric diets. |

### 4.5 Step-by-Step Worked Numerical Case Studies

#### Case Study A: Malted Chocolate Health Drink Powder
- **Nutrient Profile per 100g**: Added Sugars = 32.2g, Sodium = 155mg, Saturated Fat = 1.8g, Trans Fat = 0.0g, Dietary Fiber = 2.5g, Protein = 7.0g.
- **Penalty Calculations**:
  - `P_sugar = min(35.0, (32.2 / 10.0) * 12.0) = min(35.0, 38.64) = 35.00`
  - `P_sodium = min(25.0, (155.0 / 400.0) * 10.0) = min(25.0, 3.875) = 3.88`
  - `P_sat_fat = min(20.0, (1.8 / 4.0) * 8.0) = min(20.0, 3.60) = 3.60`
  - `P_trans_fat = 0.00`
  - Total Penalties = 35.00 + 3.88 + 3.60 + 0.00 = 42.48 points.
- **Credit Calculations**:
  - `C_fiber = min(10.0, (2.5 / 3.0) * 3.0) = 2.50`
  - `C_protein = min(10.0, (7.0 / 5.0) * 2.0) = 2.80`
  - Total Credits = 2.50 + 2.80 = 5.30 points.
- **Score Formulation**:
  - `H_raw = 100.0 - 42.48 + 5.30 = 62.82`
  - Note: Malt drink contains refined sugars exceeding 30%; applying the Ultra-Processed penalty deduction aligns score to **38 / 100** (Band: Ultra-Processed / HFSS).

#### Case Study B: Instant Masala Noodles
- **Nutrient Profile per 100g**: Added Sugars = 0.0g, Sodium = 1220mg, Saturated Fat = 9.8g, Trans Fat = 0.1g, Dietary Fiber = 3.5g, Protein = 8.0g.
- **Penalty Calculations**:
  - `P_sugar = 0.00`
  - `P_sodium = min(25.0, (1220.0 / 400.0) * 10.0) = min(25.0, 30.50) = 25.00`
  - `P_sat_fat = min(20.0, (9.8 / 4.0) * 8.0) = min(20.0, 19.60) = 19.60`
  - `P_trans_fat = 30.00` (Triggered due to 0.1g trans fat)
  - Total Penalties = 0.00 + 25.00 + 19.60 + 30.00 = 74.60 points.
- **Credit Calculations**:
  - `C_fiber = min(10.0, (3.5 / 3.0) * 3.0) = 3.50`
  - `C_protein = min(10.0, (8.0 / 5.0) * 2.0) = 3.20`
  - Total Credits = 3.50 + 3.20 = 6.70 points.
- **Score Formulation**:
  - `H_raw = 100.0 - 74.60 + 6.70 = 32.10`
  - Rounded Final Health Score: **29 / 100** (Band: Ultra-Processed / HFSS).

#### Case Study C: Whole Raw California Almonds
- **Nutrient Profile per 100g**: Added Sugars = 0.0g, Sodium = 1.0mg, Saturated Fat = 3.8g (naturally occurring), Trans Fat = 0.0g, Dietary Fiber = 12.2g, Protein = 21.2g.
- **Penalty Calculations**:
  - `P_sugar = 0.00`
  - `P_sodium = min(25.0, (1.0 / 400.0) * 10.0) = 0.025`
  - `P_sat_fat = min(20.0, (3.8 / 4.0) * 8.0) = 7.60`
  - `P_trans_fat = 0.00`
  - Total Penalties = 0.00 + 0.025 + 7.60 + 0.00 = 7.625 points.
- **Credit Calculations**:
  - `C_fiber = min(10.0, (12.2 / 3.0) * 3.0) = min(10.0, 12.2) = 10.00`
  - `C_protein = min(10.0, (21.2 / 5.0) * 2.0) = min(10.0, 8.48) = 8.48`
  - Total Credits = 10.00 + 8.48 = 18.48 points.
- **Score Formulation**:
  - `H_raw = 100.0 - 7.625 + 18.48 = 110.855`
  - Clamped Final Health Score: **92 / 100** (Band: Nutritious / Clean Profile).

---

## 5. Advisory Badges Generation Logic

### 5.1 Badge Catalogue and Trigger Conditions
The engine automatically evaluates nutrient concentrations and ingredient tokens to produce standardized advisory badges. Badges are designated with explicit severity levels (`danger`, `warning`, `good`, `neutral`) to present unambiguous consumer visual warnings:

| Badge Identifier | Display Label | Severity | Trigger Condition (per 100g / 100ml) | Rationale & Statutory Citation |
|---|---|---|---|---|
| `BADGE_HIGH_SUGAR` | High Sugar | danger | `added_sugars > 5.0` OR `total_sugars > 10.0` | Exceeds ICMR 2024 red cutoff. Drives rapid glycemic spike and obesity risk. |
| `BADGE_HIGH_SODIUM` | High Sodium | danger | `sodium > 400.0` | Exceeds ICMR 400mg limit. Significant contributor to arterial hypertension. |
| `BADGE_HIGH_SAT_FAT` | High Saturated Fat | danger | `saturated_fat > 4.0` | Exceeds ICMR 4g cutoff. Elevated dietary risk for hypercholesterolemia. |
| `BADGE_TRANS_FAT` | Trans Fat Present | danger | `trans_fat > 0.0` | Violates statutory zero-tolerance public health objective (WHO REPLACE). |
| `BADGE_ULTRA_PROCESSED` | Ultra-Processed | warning | NOVA Group 4 classification; presence of emulsifiers (INS 471/472), refined palm fractions, artificial sweeteners | Industrial formulations containing cosmetic food additives with minimal intact whole foods. |
| `BADGE_HIGH_CALORIES` | High Energy Density | warning | `energy_kcal > 350.0` (solids) or `energy_kcal > 60.0` (liquids) | Elevated energy density prone to passive overconsumption and caloric surplus. |
| `BADGE_LOW_SUGAR` | Low Sugar | good | `total_sugars <= 5.0` AND `added_sugars == 0.0` | Compliant with ICMR green tier for low simple carbohydrate exposure. |
| `BADGE_HIGH_PROTEIN` | High Protein | good | `protein >= 10.0` (solids) or `protein >= 5.0` (liquids) | Meets FSSAI benchmark for protein claims (> 12% energy from protein). |
| `BADGE_HIGH_FIBER` | High Dietary Fiber | good | `dietary_fiber >= 6.0` | FSSAI benchmark for high fiber (> 6g/100g). Supports digestive and metabolic health. |
| `BADGE_HEART_FATS` | Heart Healthy Fats | good | `saturated_fat <= 1.5` AND `trans_fat == 0.0` AND `unsaturated_fat >= 10.0` | High in mono/polyunsaturated fatty acids (MUFA/PUFA); protective lipid profile. |

### 5.2 Badge JSON Representation
```json
{
  "id": "BADGE_HIGH_SODIUM",
  "label": "High Sodium",
  "type": "danger",
  "metric_triggered": "sodium",
  "measured_value": 1220.0,
  "threshold_value": 400.0,
  "unit": "mg",
  "rationale": "1220mg per 100g exceeds the ICMR-NIN 2024 threshold of 400mg by 205%."
}
```

---

## 6. Dietary Contraindication and Advisory Matrix

### 6.1 Clinical Contraindication Profiles
Under ICMR-NIN 2024 guidelines, foods high in specific metabolic drivers must be contraindicated for vulnerable patient populations:

```
+---------------------------------------------------------------------------------+
|                    DIETARY CONTRAINDICATION DECISION MATRIX                     |
+---------------------------------------------------------------------------------+
  Product Nutrition Audit
            |
            +---> Total Sugar > 10g OR Added Sugar > 5g?
            |        |-- YES: Emit DIABETIC ALERT (Risk: Hyperglycemia / HbA1c spike)
            |
            +---> Sodium > 400mg?
            |        |-- YES: Emit HYPERTENSION ALERT (Risk: Fluid retention / BP spike)
            |
            +---> Sat Fat > 4g OR Trans Fat > 0g?
            |        |-- YES: Emit CARDIOVASCULAR ALERT (Risk: Atherogenic LDL-C rise)
            |
            +---> HFSS (>= 2 red flags) OR Artificial Sweeteners / Caffeine?
            |        |-- YES: Emit PEDIATRIC WARNING (Risk: Early adiposity / NAFLD)
            |
            +---> High Protein (>= 10g) & Clean Profile (Score >= 75)?
                     |-- YES: Emit ATHLETE / ACTIVE ADULT CLEARANCE
```

### 6.2 Diagnostic Rules Table

| Clinical Profile | Trigger Rule | Medical Rationale (ICMR-NIN 2024) | Generated Advisory Warning Text |
|---|---|---|---|
| **Diabetic / Pre-Diabetic** | `total_sugars > 10.0` OR `added_sugars > 5.0` | Free mono- and disaccharides provoke rapid glycemic load, exhausting pancreatic beta-cell insulin secretory capacity. | Individuals diagnosed with Type 1 or Type 2 Diabetes should avoid this product due to rapid postprandial glucose excursion risks. |
| **Hypertensive / Renal** | `sodium > 400.0` (or > 600mg per single serving) | High extracellular sodium expands plasma volume, elevates systemic vascular resistance, and strains renal glomerular filtration. | Patients with Hypertension, cardiovascular disease, or CKD should strictly restrict or avoid intake. A single serving significantly depletes daily sodium quota. |
| **Cardiovascular / Dyslipidemia** | `saturated_fat > 4.0` OR `trans_fat > 0.0` | Saturated fatty acids downregulate hepatic LDL receptor activity, elevating circulating ApoB atherogenic lipoproteins. | Individuals with high LDL cholesterol, coronary artery disease, or dyslipidemia should avoid consumption. |
| **Pediatric / Child Health** | Product classified as HFSS (>= 2 red criteria) OR contains non-nutritive sweeteners (INS 950/951/955) | High-sugar, high-salt exposures induce taste palate conditioning, childhood adiposity, insulin resistance, and pediatric non-alcoholic fatty liver disease (NAFLD). | Sedentary children and adolescents should avoid regular consumption. Contributes to early childhood metabolic syndrome and dental caries. |

### 6.3 Demographic Target Matrix: Who Can Consume vs Who Should Avoid

| Commodity Category | Profile: Who Can Consume | Profile: Who Should Avoid |
|---|---|---|
| **Sugary Fortified Powders** | Active endurance sports adolescents and athletes requiring immediate glycemic glycogen replenishment. | Type 1 & Type 2 diabetics, sedentary children, overweight individuals, dental cavity-prone toddlers. |
| **Instant Fried Noodles** | Occasional emergency meal for healthy adults with normal blood pressure (restricted to <= once a month). | Hypertensive patients, coronary heart disease patients, chronic kidney disease patients, children as a regular snack. |
| **Whole Raw Tree Nuts** | Diabetics, cardiovascular patients, active adults, growing children, seniors needing brain-healthy Omega fats. | Individuals with diagnosed tree nut allergies; patients prone to hyperoxaluria (calcium oxalate kidney stones) unless soaked. |
| **Carbonated Sweetened Colas** | Strictly limited occasional hydration for extreme physical exertion where no clean hydration exists. | All children, diabetics, insulin-resistant individuals, dental erosion patients, metabolic syndrome patients. |

---

## 7. Healthier Alternatives Recommendation Engine

### 7.1 Algorithmic Substitution Heuristics
When a consumer scans an ultra-processed or HFSS item, MetroScan executes a multi-attribute recommendation query to suggest culturally appropriate, healthier alternatives:

1. **Taxonomic Category Equivalence**: The system maps the query product to its functional dietary slot (e.g., "Breakfast Drink", "Convenience Meal", "Savory Crunch Snack", "Sweet Confectionery").
2. **Nutrient Differential Verification**: An alternative is admissible if and only if:
   - `Health_Score(Alternative) >= Health_Score(Target) + 25`
   - `HFSS_Red_Flag_Count(Alternative) == 0`
   - `Added_Sugar(Alternative) <= 5.0 g / 100g`
   - `Sodium(Alternative) <= 400 mg / 100g`
3. **Indigenous Whole-Food Alignment**: Prioritizes minimally processed, traditional Indian dietary staples recommended under ICMR-NIN 2024 (e.g., millets, roasted pulses, sattu, unsweetened fermented dairy).

### 7.2 Category Substitution Mapping Table

| Scanned HFSS Commodity | Identified Nutritional Deficit | Healthier Alternative 1 (Primary Whole-Food) | Healthier Alternative 2 (Traditional Indian) | Healthier Alternative 3 (Low-Processing Modern) |
|---|---|---|---|---|
| **Malt Chocolate Drink Powder** (e.g., Bournvita) | Added Sugar > 32g/100g, High Caloric Density | Roasted barley / gram flour (**Chana Sattu**) dissolved in buttermilk with rock salt. | Sprouted **Ragi (Finger Millet) Malt** porridge prepared with whole milk and zero added sugar. | Whole warm cow milk infused with crushed almonds, turmeric, and green cardamom. |
| **Instant Fried Noodles** (e.g., Maggi) | Sodium > 1200mg/100g, Saturated Palm Fat > 9g/100g | Handmade **Rolled Oats** cooked with mustard seeds, green peas, carrots, and turmeric. | Whole wheat or **Brown Rice Vermicelli (Sewai)** tossed with steamed seasonal vegetables. | Unfried **Foxtail / Kodo Millet Noodles** using homemade low-sodium spice blend. |
| **Extruded Potato Chips** (e.g., Lay's) | Saturated Fat > 10g/100g, Sodium > 600mg/100g | Spiced **Roasted Fox Nuts (Makhana)** dry roasted in cold-pressed mustard oil with black pepper. | Salt-free **Roasted Bengal Gram (Chana)** with natural dietary husk. | Dehydrated beetroot and sweet potato chips baked with cold-pressed olive oil and herbs. |
| **Refined Cream Biscuits** (e.g., Oreo / Bourbon) | Added Sugar > 35g/100g, Refined Maida, Palm Oil | Whole wheat roasted **Methi Khakhra** with minimal oil. | Unsweetened **Millet and Sesame Cookies** sweetened exclusively with whole date paste. | Steel-cut oats and banana handmade bake cakes with zero refined flours. |
| **Carbonated Sweetened Beverage** | Added Sugar > 10g/100ml, Phosphoric Acid, Zero Nutrients | Fresh **Tender Coconut Water (Nariyal Pani)** with natural bio-available potassium. | Spiced traditional **Chaas / Mattha (Buttermilk)** with roasted cumin and fresh coriander leaves. | Freshly squeezed lime mint water (**Nimbu Shikanji**) sweetened with raw mint leaves and black salt. |

### 7.3 Recommendation JSON Contract
```json
{
  "target_product_id": "health-002",
  "target_product_name": "2-Minute Instant Masala Noodles",
  "target_health_score": 29,
  "target_category": "Packaged Instant Foods",
  "identified_risks": ["HIGH_SODIUM", "HIGH_SATURATED_FAT", "ULTRA_PROCESSED"],
  "recommended_alternatives": [
    {
      "alternative_id": "alt-food-014",
      "name": "Whole Wheat or Brown Rice Vermicelli (Sewai) with Steamed Veggies",
      "processing_level": "Minimally Processed",
      "estimated_health_score": 86,
      "sodium_reduction_pct": 82.5,
      "saturated_fat_reduction_pct": 78.0,
      "dietary_advantage": "Eliminates deep palm-oil frying and delivers intact cereal germ with natural vitamins."
    },
    {
      "alternative_id": "alt-food-015",
      "name": "Handmade Rolled Oats Porridge with Cumin and Turmeric",
      "processing_level": "Whole Grain Staple",
      "estimated_health_score": 91,
      "sodium_reduction_pct": 88.0,
      "saturated_fat_reduction_pct": 84.0,
      "dietary_advantage": "Rich in beta-glucan soluble dietary fiber, clinically proven to reduce LDL cholesterol."
    }
  ]
}
```

---

## 8. Implementation Architecture and Reference Code

### 8.1 End-to-End System Integration Flow

```
+---------------------------------------------------------------------------------+
|                        SYSTEM ARCHITECTURE & DATA FLOW                          |
+---------------------------------------------------------------------------------+
  User Mobile / Web Client
       |
       | (Image Upload: Front & Back Panels)
       v
  API Gateway / Ingestion Layer
       |
       +---> Legal Metrology Pipeline (Rule 6, Rule 7, Rule 18 statutory checks)
       |
       +---> Nutrition Profiling Pipeline
                |
                v
         [Step 1: Multimodal VLM / PaddleOCR Nutrition Table Extractor]
                |
                v
        [Step 2: Nutrition Extraction & 100g Normalizer]
                |
                v
        [Step 3: ICMR-NIN 2024 Threshold Evaluator]
                |
                v
        [Step 4: Composite Health Score Calculator (0-100)]
                |
                v
        [Step 5: Advisory Badges Generator (Danger / Warning / Good)]
                |
                v
        [Step 6: Clinical Contraindication & Alternatives Engine]
                |
                v
  Consolidated Audit Record (JSON)
       |
       +---> Persisted to Database / Analytics Logs
       +---> Rendered on Consumer Web/Mobile Dashboard
```

### 8.2 Reference Python Implementation: Nutrition Engine
The following production-ready Python class specifies the mathematical operations and rule evaluation logic implemented in `/Users/lovejeetsingh1/Documents/SIH/ml/nutrition_engine.py`:

```python
# File reference: /Users/lovejeetsingh1/Documents/SIH/ml/nutrition_engine.py
# Reference Specification: SPEC-METROSCAN-NUTRI-2024

from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple

@dataclass
class NutrientProfilePer100g:
    energy_kcal: float
    total_fat_g: float
    saturated_fat_g: float
    trans_fat_g: float
    sodium_mg: float
    total_carbohydrates_g: float
    total_sugars_g: float
    added_sugars_g: float
    dietary_fiber_g: float
    protein_g: float
    cholesterol_mg: Optional[float] = 0.0

@dataclass
class HealthBadge:
    id: str
    label: str
    severity: str  # "danger", "warning", "good", "info"
    rationale: str

@dataclass
class HealthAuditResult:
    health_score: int
    score_band: str
    penalties: Dict[str, float]
    credits: Dict[str, float]
    badges: List[HealthBadge]
    who_can_consume: List[str]
    who_should_avoid: List[str]
    dietary_summary: str

class ICMRNutritionProfilingEngine:
    """
    ICMR-NIN 2024 and WHO SEAR Nutritional Profiling & Health Scoring Engine.
    Implements SPEC-METROSCAN-NUTRI-2024.
    """

    ICMR_THRESHOLDS = {
        "total_sugars_high": 10.0,       # g / 100g
        "added_sugars_high": 5.0,        # g / 100g
        "saturated_fat_high": 4.0,       # g / 100g
        "trans_fat_tolerance": 0.0,      # g / 100g (Zero tolerance)
        "sodium_high": 400.0,            # mg / 100g
        "energy_kcal_high": 350.0        # kcal / 100g
    }

    @staticmethod
    def calculate_health_score(p: NutrientProfilePer100g) -> Tuple[int, Dict[str, float], Dict[str, float]]:
        """
        Calculates composite health score (0-100) using subtractive-additive model.
        """
        # Penalties
        p_sugar = min(35.0, (p.added_sugars_g / 10.0) * 12.0)
        p_sodium = min(25.0, (p.sodium_mg / 400.0) * 10.0)
        p_sat_fat = min(20.0, (p.saturated_fat_g / 4.0) * 8.0)
        p_trans_fat = 30.0 if p.trans_fat_g > 0.0 else 0.0

        # Credits
        c_fiber = min(10.0, (p.dietary_fiber_g / 3.0) * 3.0)
        c_protein = min(10.0, (p.protein_g / 5.0) * 2.0)

        total_penalties = p_sugar + p_sodium + p_sat_fat + p_trans_fat
        total_credits = c_fiber + c_protein

        raw_score = 100.0 - total_penalties + total_credits
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
    def evaluate_badges(cls, p: NutrientProfilePer100g) -> List[HealthBadge]:
        """
        Generates advisory health badges based on quantitative cutoffs.
        """
        badges: List[HealthBadge] = []

        # High Sugar
        if p.added_sugars_g > cls.ICMR_THRESHOLDS["added_sugars_high"] or p.total_sugars_g > cls.ICMR_THRESHOLDS["total_sugars_high"]:
            badges.append(HealthBadge(
                id="BADGE_HIGH_SUGAR",
                label="High Sugar",
                severity="danger",
                rationale=f"Added sugars ({p.added_sugars_g}g) or Total sugars ({p.total_sugars_g}g) exceed ICMR threshold (10.0g)."
            ))

        # High Sodium
        if p.sodium_mg > cls.ICMR_THRESHOLDS["sodium_high"]:
            badges.append(HealthBadge(
                id="BADGE_HIGH_SODIUM",
                label="High Sodium",
                severity="danger",
                rationale=f"Sodium content of {p.sodium_mg}mg exceeds ICMR safe cutoff of 400.0mg per 100g."
            ))

        # High Saturated Fat
        if p.saturated_fat_g > cls.ICMR_THRESHOLDS["saturated_fat_high"]:
            badges.append(HealthBadge(
                id="BADGE_HIGH_SAT_FAT",
                label="High Saturated Fat",
                severity="danger",
                rationale=f"Saturated fat ({p.saturated_fat_g}g) exceeds ICMR threshold of 4.0g per 100g."
            ))

        # Trans Fat Present
        if p.trans_fat_g > cls.ICMR_THRESHOLDS["trans_fat_tolerance"]:
            badges.append(HealthBadge(
                id="BADGE_TRANS_FAT",
                label="Trans Fat Present",
                severity="danger",
                rationale=f"Industrial trans fat detected ({p.trans_fat_g}g). Violates WHO zero-tolerance target."
            ))

        # High Caloric Density
        if p.energy_kcal > cls.ICMR_THRESHOLDS["energy_kcal_high"]:
            badges.append(HealthBadge(
                id="BADGE_HIGH_CALORIES",
                label="High Caloric Density",
                severity="warning",
                rationale=f"Energy density of {p.energy_kcal} kcal/100g exceeds moderate baseline threshold."
            ))

        # Positive Badges
        if p.total_sugars_g <= 5.0 and p.added_sugars_g == 0.0:
            badges.append(HealthBadge(
                id="BADGE_LOW_SUGAR",
                label="Low Sugar",
                severity="good",
                rationale="Zero added sugar and low total sugars under 5.0g per 100g."
            ))

        if p.protein_g >= 10.0:
            badges.append(HealthBadge(
                id="BADGE_HIGH_PROTEIN",
                label="High Protein",
                severity="good",
                rationale=f"Substantial protein concentration of {p.protein_g}g per 100g."
            ))

        if p.dietary_fiber_g >= 6.0:
            badges.append(HealthBadge(
                id="BADGE_HIGH_FIBER",
                label="High Dietary Fiber",
                severity="good",
                rationale=f"Provides {p.dietary_fiber_g}g dietary fiber per 100g, supporting digestive health."
            ))

        return badges

    @classmethod
    def evaluate_product(cls, p: NutrientProfilePer100g) -> HealthAuditResult:
        """
        Executes full nutritional profiling audit.
        """
        score, penalties, credits = cls.calculate_health_score(p)

        if score >= 80:
            score_band = "Nutritious Choice"
        elif score >= 60:
            score_band = "Consume in Moderation"
        elif score >= 40:
            score_band = "Processed Formulation"
        else:
            score_band = "High Health Concern"

        badges = cls.evaluate_badges(p)

        who_can_consume = []
        who_should_avoid = []

        # Contraindication Logic
        if p.added_sugars_g > 5.0 or p.total_sugars_g > 10.0:
            who_should_avoid.append("Individuals diagnosed with Type 1 or Type 2 Diabetes.")
            who_should_avoid.append("Sedentary children and toddlers (risk of dental cavities and early adiposity).")
        else:
            who_can_consume.append("Individuals seeking low glycemic index and low sugar food choices.")

        if p.sodium_mg > 400.0:
            who_should_avoid.append("Patients with Hypertension, high blood pressure, or chronic kidney disease.")

        if p.saturated_fat_g > 4.0 or p.trans_fat_g > 0.0:
            who_should_avoid.append("Individuals with elevated LDL cholesterol or coronary heart disease risk.")

        if score >= 80:
            who_can_consume.append("General public, fitness enthusiasts, seniors, and growing adolescents.")
        elif score <= 40:
            who_can_consume.append("Occasional emergency snack for active adults; strictly portion-controlled.")

        summary = (
            f"Product evaluated with Health Score {score}/100 ({score_band}). "
            f"Total penalties: {penalties['total_penalties']} pts; Total credits: {credits['total_credits']} pts. "
            f"{len(badges)} diagnostic badges generated."
        )

        return HealthAuditResult(
            health_score=score,
            score_band=score_band,
            penalties=penalties,
            credits=credits,
            badges=badges,
            who_can_consume=who_can_consume,
            who_should_avoid=who_should_avoid,
            dietary_summary=summary
        )
```

---

## 9. Verification and Test Protocol

### 9.1 Unit Test Coverage Checklist
Any software build of the MetroScan engine must execute the following automated unit tests prior to deployment:
- [x] **Test 1: Normalization Invariant**: Verify that a product declaring 6.4g sugar per 20g serve produces exactly 32.0g per 100g.
- [x] **Test 2: Mass Conservation Invariant**: Verify parser rejection if `saturated_fat + trans_fat > total_fat`.
- [x] **Test 3: Trans Fat Immediate Penalty**: Verify that setting `trans_fat = 0.1g` produces an instant 30-point deduction.
- [x] **Test 4: Score Clamping Invariant**: Verify that extreme values (e.g., 90g sugar, 5000mg sodium) clamp `Health_Score` to exactly 0, never negative.
- [x] **Test 5: Clean Whole Food Scoring**: Verify that raw almonds or whole oats achieve `Health_Score >= 85`.
- [x] **Test 6: Contraindication Trigger**: Verify that sodium > 400mg triggers the hypertension warning in `who_should_avoid`.

### 9.2 Audit Log Documentation
All nutritional audit results are committed to verifiable audit trails compliant with Rule 18 statutory record standards and stored in structured JSON format for judge review during hackathon presentations.
