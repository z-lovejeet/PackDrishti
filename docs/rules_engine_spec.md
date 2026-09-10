# MetroScan: Statutory Rule Engine Logic & Heuristic Patterns Specification
**Document Reference**: MS-SPEC-RULE-2026-V1  
**Project ID**: SIH26034 (MetroScan)  
**Governing Act**: Legal Metrology Act, 2009 (Act No. 1 of 2010)  
**Governing Rules**: Legal Metrology (Packaged Commodities) Rules, 2011 (G.S.R. 202(E), as amended)  
**Administering Authority**: Ministry of Consumer Affairs, Food & Public Distribution, Department of Consumer Affairs (Legal Metrology Division), Government of India  
**Document Classification**: Statutory Algorithmic Codification & Technical Architecture  
**System Target**: Optical Engine, Heuristic Rule Evaluator, Legal Metrology Enforcement Portal  

---

## 1. Document Purpose and Statutory Authority

### 1.1 Statutory Authority and Regulatory Context
Under the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011 (hereinafter "LMPC Rules, 2011"), every pre-packaged commodity distributed, sold, or offered for sale across the territory of India is required to bear explicit statutory declarations. These declarations safeguard consumer rights, establish fair trade practices, and enforce standardization of weights and measures.

Enforcement of these provisions historically depended upon physical inspection by State Legal Metrology Officers utilizing manual micrometer calipers, optical comparator scales, and physical documentation. The **MetroScan Statutory Rule Engine** translates statutory text, legislative provisos, gazette notifications, and schedule tables into a deterministic, machine-executable validation pipeline. The engine ingests optical text, bounding box spatial coordinates, and calibrated visual features to produce legally defensible compliance adjudications.

### 1.2 System Execution Pipeline: The Four-Tier Architecture
The MetroScan statutory verification engine operates within a strict four-tier architecture designed to eliminate hallucinations, enforce mathematical determinism, and ground all legal actions in statutory law:

- **Tier 1: Multimodal VLM & High-Performance OCR (Perception & Spatial Token Stream)**
  High-accuracy extraction combining Multimodal Vision-Language Models (Google Gemini 1.5 Flash / OpenAI GPT-4o-mini) with structured Pydantic schemas, supplemented by PaddleOCR for low-latency edge/fallback processing. Extracts text tokens, bounding boxes `[ymin, xmin, ymax, xmax]`, and confidence metrics.
- **Tier 2: Deterministic Python Rule Engine (Mathematical & Statutory Adjudication)**
  100% deterministic, auditable code. Never let an LLM perform statutory math or font calculations! Implements Rule 6(1) mandatory declaration parsing, Rule 6(1)(e) Unit Sale Price arithmetic, Rule 7 Table-I font calibration step functions, Rule 9 WCAG 2.1 contrast formulas, and Rule 13 SI metric unit validation.
- **Tier 3: Statutory Legal RAG (pgvector Semantic Search & Precedent Citation)**
  PostgreSQL `pgvector` store indexing the Legal Metrology Act 2009, Packaged Commodities Rules 2011 (with all amendments up to 2024), gazette notifications, and compounding schedules. Automatically retrieves exact statutory sections and generates formal show-cause notices (FORM LM-INSP-2011).
- **Tier 4: LLM Consumer Synthesis (Advisory & Nutritional Synthesis)**
  Constrained LLM layer with strict Pydantic schemas translating deterministic findings into plain-language consumer cards, FSSAI nutritional audits, and ICMR-NIN 2024 dietary advisories.

```
+-------------------------------------------------------------------------+
|    Tier 1: Multimodal VLM & High-Performance OCR Extraction             |
|  - Gemini 1.5 Flash / GPT-4o-mini structured output + PaddleOCR local   |
|  - Spatial Bounding Boxes [ymin, xmin, ymax, xmax] + Confidence Scores  |
|  - Transcribed Text Token Stream & Normalized String Array              |
|  - Packaging Substrate Image & GS1 EAN-13 Barcode / Aspect Fiducial     |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|    Tier 2: Deterministic Python Rule Engine (100% Mathematical Logic)   |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | Section 2: Rule 6(1) Mandatory Declarations Parser & Regex Engine |  |
|  | - 6(1)(a): Manufacturer/Packer/Importer Details & 6-Digit PIN     |  |
|  | - 6(1)(aa): Country of Origin / Assembly Normalizer               |  |
|  | - 6(1)(b): Generic / Common Name Extraction & POS Filter           |  |
|  | - 6(1)(c) & Rule 13: Net Quantity & Strict Metric SI Unit Engine  |  |
|  | - 6(1)(d): Month & Year of Mfg / Pkd Chronological Bounds         |  |
|  | - 6(1)(e): MRP Price Extraction & Tax Inclusivity Mandatory Match |  |
|  | - 6(1)(e) Second Proviso: Unit Sale Price (USP) Mathematical Check|  |
|  | - 6(1)(n): Consumer Care Coordinates Quad-Component Matrix        |  |
|  +-------------------------------------------------------------------+  |
|  | Section 3: Rule 7 & Table-I Font Size & Spatial Compliance Engine |  |
|  | - Principal Display Panel (PDP) Geometric Area Engine             |  |
|  | - Table-I Step Function Lookup & Aspect Ratio (Width >= H/3)     |  |
|  | - Pixel-to-Millimeter (PPM) Scaling via EAN-13 Fiducial           |  |
|  +-------------------------------------------------------------------+  |
|  | Section 4: Rule 9 Color Contrast & Conspicuousness Analyzer       |  |
|  | - Bimodal Substrate vs Foreground Color Clustering (K-Means k=2) |  |
|  | - Linearized Relative Luminance & WCAG 2.1 Contrast Calculation   |  |
|  | - Minimum Conspicuousness Ratio Verification (CR >= 3.0:1)        |  |
|  +-------------------------------------------------------------------+  |
|  | Section 5: Rule 18(2A) Dual MRP & Tamper Detection Engine         |  |
|  | - Adhesive Sticker Edge Discontinuity & Elevation Shadow Profiler|  |
|  | - Multi-View Cross-Panel Price Discrepancy Matching               |  |
|  +-------------------------------------------------------------------+  |
|  | Section 6: Composite Compliance Scoring (100-Point Model)         |  |
|  | - Deductive Metric Formulation & Grade Categorization (A/B/C)     |  |
|  | - Zero Tolerance for Mathematical or Statutory Deviations         |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
         +---------------------------+---------------------------+
         |                                                       |
         v                                                       v
+------------------------------------+  +------------------------------------+
| Tier 3: Statutory RAG (pgvector)   |  | Tier 4: LLM Consumer Synthesis     |
| - Exact Section & Rule Retrieval   |  | - Plain-language Consumer Warnings |
| - Gazette Notifications & Precedent|  | - ICMR-NIN 2024 Dietary Advisories |
| - FORM LM-INSP-2011 Notice Drafting|  | - Healthier Indian Food Alternative|
+-----------------+------------------+  +-----------------+------------------+
                  |                                       |
                  +-------------------+-------------------+
                                      |
                                      v
+-------------------------------------------------------------------------+
|                  Downstream Adjudication & Action                       |
|  - Officer Mode: FORM LM-INSP-2011 Inspection Docket & Seizure Order    |
|  - Consumer Mode: Transparency Card, Deceptive Pricing Alert, USP Audit |
+-------------------------------------------------------------------------+
```

---

## 2. Rule 6(1) Mandatory Declarations Specification Engine

Rule 6(1) of the LMPC Rules, 2011 establishes that every package shall bear thereon legible, definite, plain, and conspicuous declarations. The statutory parameters for each declaration are codified below.

```
+----------------------------------------------------------------------------------------------------+
|                               Rule 6(1) Declarations Summary Matrix                                |
+--------------+-------------------------------------+------------------+-----------------+----------+
| Clause       | Field Description                   | Statutory Type   | Error Severity  | Act Pen. |
+--------------+-------------------------------------+------------------+-----------------+----------+
| 6(1)(a)      | Manufacturer / Packer / Importer    | Text + 6-digit   | CRITICAL        | Sec 36(1)|
|              | Identity & Complete Postal Address  | Indian PIN code  |                 |          |
+--------------+-------------------------------------+------------------+-----------------+----------+
| 6(1)(aa)     | Country of Origin or Assembly       | ISO Country Text | MAJOR           | Sec 36(1)|
+--------------+-------------------------------------+------------------+-----------------+----------+
| 6(1)(b)      | Generic or Common Name of Commodity | Noun Phrase      | MAJOR           | Sec 36(1)|
+--------------+-------------------------------------+------------------+-----------------+----------+
| 6(1)(c) & 13 | Net Quantity in SI Metric Units     | Value + SI Unit  | CRITICAL        | Sec 36(1)|
|              | (Strict prohibition of gms/Kgs/etc) | (g, kg, ml, l, N)|                 | Sec 36(2)|
+--------------+-------------------------------------+------------------+-----------------+----------+
| 6(1)(d)      | Month & Year of Mfg / Pkd / Import  | MM/YYYY or Date  | CRITICAL        | Sec 36(1)|
+--------------+-------------------------------------+------------------+-----------------+----------+
| 6(1)(e)      | Maximum Retail Price (MRP)          | Currency Value + | CRITICAL        | Sec 36(1)|
|              | (Strict 'incl. of all taxes' clause)| Tax Inclusivity  |                 | Rule 18  |
+--------------+-------------------------------------+------------------+-----------------+----------+
| 6(1)(e) Prov | Unit Sale Price (USP)               | Computed Value / | MAJOR           | Sec 36(1)|
|              | (Mandatory price per g/kg/ml/l/N)   | Base Metric Unit |                 |          |
+--------------+-------------------------------------+------------------+-----------------+----------+
| 6(1)(n)      | Consumer Care Contact Coordinates   | 4-part structure | MAJOR           | Sec 36(1)|
|              | (Name, Address, Phone, Email)       | (All mandatory)  |                 |          |
+--------------+-------------------------------------+------------------+-----------------+----------+
```

---

### 2.1 Rule 6(1)(a): Manufacturer, Packer, or Importer Identification

#### 2.1.1 Statutory Mandate
The name and complete address of the manufacturer, or where the manufacturer is not the packer, the name and complete address of the manufacturer and the packer, or for imported packages, the name and complete address of the importer shall be declared on the package. The address must be complete and sufficient to enable a consumer to identify and reach the physical premises, including a valid 6-digit Indian Postal Index Number (PIN) code.

#### 2.1.2 Production Regular Expression Patterns

##### Primary Entity & Address Extraction Pattern (PCRE / Python `re`):
```regex
(?i)\b(?:mfd\.?\s*by|mfg\.?\s*by|manufactured\s*(?:&|and)?\s*packed\s*by|manufactured\s*by|packed\s*by|pkd\.?\s*by|imported\s*(?:&|and)?\s*marketed\s*by|imported\s*by|marketed\s*by)\s*[:-]?\s*([A-Za-z0-9\s.,&'()-]{3,100}?)(?:,\s*|\n|\r)([A-Za-z0-9\s.,#/'()-]{10,250}?)(?:\b(?:pin|pin\s*code|pincode|postal\s*code)?\s*[:-]?\s*)?\b([1-9][0-9]{2}\s?[0-9]{3})\b
```

##### Strict Indian Postal PIN Code Validation Pattern:
```regex
^[1-9][0-9]{5}$
```
*Note: Evaluated after stripping internal spaces. The first digit must be non-zero (1 to 9). Exactly 6 digits.*

##### Prohibited Post Office Box Only Pattern:
Under Rule 6(1)(a), specifying an isolated Post Office Box without physical street or premises identification constitutes an offence:
```regex
(?i)^\s*(?:p\.?o\.?\s*box|post\s*box)\s*(?:no\.?)?\s*\d+\s*(?:,\s*[a-zA-Z\s]+)?\s*([1-9][0-9]{5})?\s*$
```

#### 2.1.3 Extraction & Spatial Validation Heuristic Pipeline
```
Step 1: Anchor Keyword Scan:
        Scan OCR tokens for anchor triggers:
        T_anchor in ["manufactured by", "mfd by", "mfg by", "packed by", 
                     "pkd by", "imported by", "marketed by", "registered office"]

Step 2: Define Spatial Window:
        Create an oriented bounding box extending downward and rightward 
        up to 8 text lines or 220 vertical pixels from the anchor token.

Step 3: Entity Name Extraction:
        Isolate tokens between the anchor keyword and the first structural 
        delimiter (comma, semicolon, line-break, or street prefix).

Step 4: Municipal Premise Validation:
        Search text for mandatory physical identifiers:
        ["plot", "survey", "khasra", "industrial area", "phase", "sector", 
         "road", "street", "village", "taluk", "tehsil", "dist", "district", "state"]

Step 5: Postal PIN Extraction and Verification:
        Extract 6-digit candidate via pattern \b([1-9][0-9]{2}\s?[0-9]{3})\b.
        Normalize by removing whitespace.
        Validate against Department of Posts Postal Circle Registry:
        - 11 to 19: Northern Zone (Delhi, Haryana, Punjab, HP, J&K, Chandigarh)
        - 20 to 28: Central-North Zone (Uttar Pradesh, Uttarakhand)
        - 30 to 34: Western Zone (Rajasthan)
        - 36 to 39: Western Zone (Gujarat, Daman & Diu, Dadra & Nagar Haveli)
        - 40 to 44: Western Zone (Maharashtra, Goa)
        - 45 to 49: Central Zone (Madhya Pradesh, Chhattisgarh)
        - 50 to 53: Southern Zone (Andhra Pradesh, Telangana)
        - 56 to 64: Southern Zone (Karnataka)
        - 67 to 69: Southern Zone (Kerala, Lakshadweep)
        - 60 to 66: Southern Zone (Tamil Nadu, Puducherry)
        - 70 to 74: Eastern Zone (West Bengal, Sikkim, Andaman & Nicobar)
        - 75 to 77: Eastern Zone (Odisha)
        - 78 to 79: North Eastern Zone (Assam, Meghalaya, Mizoram, Manipur, Nagaland, Tripura, Arunachal)
        - 80 to 85: Eastern Zone (Bihar, Jharkhand)
```

#### 2.1.4 Edge Cases and Failure Modes
- **Imported Commodities**: Must declare both the overseas manufacturer identity/country and the Indian importer's registered commercial entity name, complete registered office address, and Indian PIN code.
- **Contract Manufacturing vs Marketing**: Stating only "Marketed by: [Brand Entity]" without declaring "Manufactured by: [Contract Packer]" is an actionable violation under Rule 6(1)(a).
- **OCR Normalization Rules**: In numeric strings matching `^[1-9OIl][0-9OIl]{5}$`, perform character correction: uppercase `O` to `0`, uppercase `I` and lowercase `l` to `1`.

#### 2.1.5 Enforcement Parameters
- **Failure Severity**: CRITICAL
- **Score Deduction**: -15 points (Missing manufacturer details); -10 points (Missing/invalid PIN)
- **Statutory Citation**: Section 36(1) of Legal Metrology Act, 2009
- **Statutory Penalty**: Fine up to Rs. 25,000 (first offence); up to Rs. 50,000 (second offence); up to Rs. 1,00,000 or imprisonment up to 1 year, or both (subsequent offences).

---

### 2.2 Rule 6(1)(aa): Country of Origin and Assembly

#### 2.2.1 Statutory Mandate
Every package must bear a conspicuous declaration of the country of origin, country of manufacture, or country of assembly. The mandate applies universally to both imported commodities and domestically manufactured goods.

#### 2.2.2 Production Regular Expression Patterns

##### Explicit Origin Declaration Pattern:
```regex
(?i)\b(?:country\s*of\s*origin|made\s*in|product\s*of|manufactured\s*in|produced\s*in|assembled\s*in|origin)\s*[:-]?\s*([A-Za-z\s]{2,40})\b
```

##### Domestic Assembly / Foreign Components Hybrid Pattern:
```regex
(?i)\b(?:assembled\s*in\s*([A-Za-z\s]+)\s*(?:from|with)\s*(?:imported|foreign)\s*(?:parts|components|ingredients))\b
```

#### 2.2.3 Extraction & Normalization Logic
Extracted country candidate tokens are normalized and mapped against the ISO 3166-1 standard database:
```
{
  "INDIA": ["IND", "IN", "BHARAT", "HINDUSTAN"],
  "CHINA": ["CHN", "CN", "PRC", "PEOPLE'S REPUBLIC OF CHINA"],
  "UNITED STATES": ["USA", "US", "UNITED STATES OF AMERICA"],
  "VIETNAM": ["VNM", "VN", "VIET NAM"],
  "THAILAND": ["THA", "TH"],
  "GERMANY": ["DEU", "DE", "DEUTSCHLAND"],
  "JAPAN": ["JPN", "JP"],
  "UNITED KINGDOM": ["GBR", "GB", "UK"],
  "BANGLADESH": ["BGD", "BD"],
  "INDONESIA": ["IDN", "ID"],
  "MALAYSIA": ["MYS", "MY"]
}
```

```
Step 1: Execute Explicit Origin Regex.
        If match found -> Strip punctuation -> Map to ISO 3166-1.
        If normalized country is identified -> COMPLIANT.

Step 2: Fallback Address Inference:
        If no explicit anchor exists, inspect the terminal line of the 
        Manufacturer Address identified under Rule 6(1)(a).
        If terminal token matches "India" or domestic Indian state ->
        Flag WARNING: "Inferred Origin: India. Explicit Country of Origin 
        declaration missing under Rule 6(1)(aa)."
```

#### 2.2.4 Enforcement Parameters
- **Failure Severity**: MAJOR
- **Score Deduction**: -10 points
- **Statutory Citation**: Section 36(1) of Legal Metrology Act, 2009

---

### 2.3 Rule 6(1)(b): Generic or Common Name of Commodity

#### 2.3.1 Statutory Mandate
The common or generic name of the commodity contained in the package shall be declared. The generic name must be unambiguous and distinguish the actual identity of the goods from promotional trade names, registered trademarks, or fanciful branding.

#### 2.3.2 Production Regular Expression Patterns

##### Prefixed Generic Name Pattern:
```regex
(?i)\b(?:generic\s*name|common\s*name|commodity|product\s*name|name\s*of\s*(?:the\s*)?commodity)\s*[:-]?\s*([A-Za-z0-9\s,/'()-]{2,60})\b
```

##### Trademark and Brand Demarcation Pattern:
```regex
(?i)\b([A-Za-z0-9\s]{3,40})(?:\s*(?:tm|®|©|\(r\)|\(tm\)))\b
```

#### 2.3.3 Algorithmic Classification Pipeline
```
Step 1: Search for explicit anchor using Prefixed Generic Name Pattern.
        If found -> Extract string -> Validate against Commodity Gazetteer -> COMPLIANT.

Step 2: If explicit anchor is absent:
        Isolate Principal Display Panel (PDP) OCR text hierarchy.
        Extract top 3 largest font text lines.
        Line 0 (Dominant Font) = Brand Name / Trademark.
        Lines 1-2 (Subordinate Font) = Candidate Generic Name.

Step 3: Natural Language Processing Filter:
        Perform Part-of-Speech (POS) tagging on candidate tokens.
        Assert that the candidate string contains a valid Noun Phrase:
        e.g., [Adjective + Noun] or [Noun + Noun] ("Almond Cookies", "Detergent Powder").
        Reject candidate if composed exclusively of marketing adjectives 
        ("Crispy", "Delicious", "Ultra-Smooth", "Supreme").
```

#### 2.3.4 Enforcement Parameters
- **Failure Severity**: MAJOR
- **Score Deduction**: -10 points
- **Statutory Citation**: Section 36(1) of Legal Metrology Act, 2009

---

### 2.4 Rule 6(1)(c) & Rule 13: Net Quantity & Metric SI Unit Validation

#### 2.4.1 Statutory Mandate
The net quantity in terms of standard units of weight or measure shall be declared on each package. Under Rule 13, all declarations of quantity shall be expressed in standard SI units:
- **Mass**: gram (`g`), kilogram (`kg`).
- **Volume**: millilitre (`ml` or `mL`), litre (`l` or `L`).
- **Length**: centimetre (`cm`), metre (`m`).
- **Area**: square centimetre (`cm²`), square metre (`m²`).
- **Count / Number**: `N` or `U` or word expressions ("units", "pieces").

**Strict Rule 13 Prohibitions**:
- Unit symbols must be lowercase (except `L` or `l` for litre).
- Symbols must NOT be pluralized by adding `s`.
- Symbols must NOT have trailing punctuation periods (e.g., `g.` is prohibited).
- Non-standard abbreviations (`gms`, `gm`, `Kgs`, `KG`, `ltrs`, `ML`, `mls`, `kilos`) are **illegal and actionable**.
- Declarations like "Net weight when packed" or "approximate weight" are prohibited under Rule 13 Proviso.

#### 2.4.2 Production Regular Expression Patterns

##### Standard Compliant Net Quantity Pattern:
```regex
(?i)\b(?:net\s*(?:wt\.?|weight|qty\.?|quantity|content|contents)?\s*[:-]?\s*)(\d+(?:\.\d+)?)\s*(kg|g|ml|mL|l|L|m|cm|mm|N|units?|pieces?)\b
```

##### Strict Detection of Prohibited / Non-Standard Unit Abbreviations:
```regex
\b(\d+(?:\.\d+)?)\s*(gms|gm|g\.m\.s|Kgs|KGS|kgs|KG|Kg|ltrs|ltr|LTR|LTRS|ML|mls|Mls|Gms|GMS|kilos|kilo|Kilos|cc|cu\.cm)\b
```

##### Prohibited "When Packed" Condition Pattern:
```regex
(?i)\bnet\s*(?:wt\.?|weight)\s*(?:when\s*packed|approx(?:imate)?)\b
```

#### 2.4.3 Permitted vs. Prohibited Units Matrix
```
+------------------+-----------------------+---------------------+-------------------------------+
| Physical Metric  | Permitted SI Symbol   | Permitted Word Form | Illegal Non-Standard Formats  |
+------------------+-----------------------+---------------------+-------------------------------+
| Mass (< 1 kg)    | g                     | gram, grams         | gm, gms, gm., gms., Gms, GMS  |
| Mass (>= 1 kg)   | kg                    | kilogram, kilograms | kg., Kgs, kgs, KG, Kilos      |
| Volume (< 1 L)   | ml, mL                | millilitre          | ML, mls, Mls, ml., ML.        |
| Volume (>= 1 L)  | l, L                  | litre, litres       | ltr, ltrs, LTR, LTRS, Lt, lt. |
| Length (< 1 m)   | cm, mm                | centimetre          | cms, mms, CMS                 |
| Length (>= 1 m)  | m                     | metre, metres       | mtr, mtrs, MTR                |
| Number / Items   | N, U                  | number, units       | nos, nos., PCS, pcs, Pcs      |
+------------------+-----------------------+---------------------+-------------------------------+
```

#### 2.4.4 Maximum Permissible Error (MPE) Verification
Under the First Schedule of the LMPC Rules, 2011, commodities pre-packed in designated quantities must not exceed the specified Maximum Permissible Error limits:

```
+------------------------------------+---------------------------------------------------------------+
| Declared Net Quantity (q)          | Maximum Permissible Error (MPE) in Excess or Deficiency       |
|                                    | As % of declared quantity     | In g or ml                    |
+------------------------------------+---------------------------------------------------------------+
| Up to 50 g or ml                   | 9.0 %                         | -                             |
| 50 to 100 g or ml                  | -                             | 4.5 g or ml                   |
| 100 to 200 g or ml                 | 4.5 %                         | -                             |
| 200 to 300 g or ml                 | -                             | 9.0 g or ml                   |
| 300 to 500 g or ml                 | 3.0 %                         | -                             |
| 500 to 1000 g or ml                | -                             | 15.0 g or ml                  |
| 1000 to 10000 g or ml (1 - 10 kg)  | 1.5 %                         | -                             |
| 10000 to 15000 g or ml (10 - 15 kg)| -                             | 150.0 g or ml                 |
| More than 15000 g or ml (> 15 kg)  | 1.0 %                         | -                             |
+------------------------------------+---------------------------------------------------------------+
```

#### 2.4.5 Enforcement Parameters
- **Failure Severity**: CRITICAL
- **Score Deduction**: -15 points (Missing Net Quantity); -10 points (Illegal non-standard unit symbol)
- **Statutory Citation**: Section 36(1) (Symbol violation) and Section 36(2) (Short quantity deficiency) of Legal Metrology Act, 2009.
- **Statutory Penalty**: Fine up to Rs. 25,000 for symbol misuse; fine up to Rs. 50,000 for actual net quantity shortfall.

---

### 2.5 Rule 6(1)(d): Month & Year of Manufacture, Packing, or Import

#### 2.5.1 Statutory Mandate
The month and year in which the commodity is manufactured, packed, or imported shall be clearly stated on the package. The declaration enables validation of statutory shelf life, consumer freshness, and retroactive regulatory applicability.

#### 2.5.2 Production Regular Expression Patterns

##### Numeric Format (`MM/YYYY` or `MM/YY`):
```regex
(?i)\b(?:mfd\.?|mfg\.?|manufactured|packed|pkd\.?|imported|pkg\.?|date\s*of\s*(?:mfg|pkd|packing|manufacture))\s*[:-]?\s*(0[1-9]|1[0-2])\s*[-/., ]\s*(20\d{2}|\d{2})\b
```

##### Alphabetical Month Format (`Month Year` or `MMM YYYY`):
```regex
(?i)\b(?:mfd\.?|mfg\.?|manufactured|packed|pkd\.?|imported|pkg\.?|date\s*of\s*(?:mfg|pkd|packing|manufacture))\s*[:-]?\s*(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*[-/., ]\s*(20\d{2}|\d{2})\b
```

##### Expiry Date Isolation (Disambiguation Heuristic):
Rule 6(1)(d) mandates the date of manufacturing/packing. Declaring only "Best Before" or "Use By" without the manufacturing date is non-compliant:
```regex
(?i)\b(?:best\s*before|use\s*by|exp(?:iry)?\.?\s*date)\s*[:-]?\s*(?:(?:0[1-9]|1[0-2]|[a-zA-Z]{3,9})\s*[-/., ]\s*(?:20\d{2}|\d{2}))\b
```

#### 2.5.3 Chronological Validation Logic
```
Step 1: Extract Date of Mfg/Pkd (D_mfg).
Step 2: Validate temporal sanity:
        Year(D_mfg) >= 2011 (Baseline enactment of LMPC Rules)
        D_mfg <= Current_Date + 30 Days (Logistical forward-dating tolerance).
Step 3: If D_mfg > Current_Date + 30 Days:
        Flag CRITICAL VIOLATION: "Fraudulent post-dated manufacturing stamp".
```

#### 2.5.4 Enforcement Parameters
- **Failure Severity**: CRITICAL
- **Score Deduction**: -10 points
- **Statutory Citation**: Section 36(1) of Legal Metrology Act, 2009

---

### 2.6 Rule 6(1)(e): Maximum Retail Price (MRP) & Tax Inclusivity Mandate

#### 2.6.1 Statutory Mandate
The retail sale price of the package shall clearly indicate the Maximum Retail Price in the format:
```
Maximum or Max. Retail Price Rs. ...... / ₹ ...... inclusive of all taxes
```
or
```
MRP Rs. ...... / ₹ ...... incl. of all taxes
```
Under Rule 6(1)(e) and Rule 18, it is **strictly illegal** to publish conditions such as "taxes extra", "local taxes extra", or "plus VAT/GST".

#### 2.6.2 Production Regular Expression Patterns

##### Fully Compliant MRP Declaration Pattern:
```regex
(?i)\b(?:m\.?r\.?p\.?|max(?:imum)?\s*retail\s*price)\s*[:-]?\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d{1,2})?)\s*(?:\([^\)]*incl(?:usive)?\.?\s*(?:of\s*)?all\s*taxes[^\)]*\)|incl(?:usive)?\.?\s*(?:of\s*)?all\s*taxes)\b
```

##### Strict Detection of Prohibited "Taxes Extra" Statements:
```regex
(?i)\b(?:taxes\s*extra|local\s*taxes\s*extra|plus\s*taxes|taxes\s*applicable|vat\s*extra|gst\s*extra)\b
```

##### Isolated Price Value Extraction (Spatial Search Fallback):
```regex
(?i)\b(?:m\.?r\.?p\.?|max(?:imum)?\s*retail\s*price)\s*[:-]?\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d{1,2})?)\b
```
Companion Search within 120-pixel Radius:
```regex
(?i)\bincl(?:usive)?\.?\s*(?:of\s*)?all\s*taxes\b
```

#### 2.6.3 Enforcement Parameters
- **Failure Severity**: CRITICAL
- **Score Deduction**: -15 points (Missing MRP); -15 points ("Taxes Extra" or missing tax inclusivity)
- **Statutory Citation**: Section 36(1) and Rule 18(2) of LMPC Rules, 2011
- **Statutory Penalty**: Fine up to Rs. 25,000 for non-standard labeling; selling above declared MRP attracts fine up to Rs. 50,000 under Section 36(2).

---

### 2.7 Rule 6(1)(e) Second Proviso: Unit Sale Price (USP) Mathematical Engine

#### 2.7.1 Statutory Mandate
Introduced via the Legal Metrology (Packaged Commodities) Amendment Rules (effective October 1, 2022), the declaration of **Unit Sale Price (USP)** is mandatory on all pre-packaged commodities:
1. For packages containing net quantity **greater than 1 kg or 1 litre**: USP shall be expressed as **₹ per kg** or **₹ per litre**.
2. For packages containing net quantity **less than 1 kg or 1 litre**: USP shall be expressed as **₹ per gram (g)**, **₹ per millilitre (ml)**, or **₹ per 100g / 100ml** (as permitted under specific circulars).
3. For commodities sold by **number or length**: USP shall be expressed as **₹ per piece / per number (N)** or **₹ per metre (m)**.

#### 2.7.2 Mathematical Verification Formulation
Let declared Maximum Retail Price be $P_{MRP}$ (in Indian Rupees).  
Let declared Net Quantity be $Q_{net}$ accompanied by its declared unit $U_{net}$.

##### Standardization of Physical Quantity:
The quantity is normalized to statutory base denominator units ($Q_{base}$):
$$Q_{base} = \begin{cases} 
\frac{Q_{net}}{1000} & \text{if } U_{net} \in \{\text{'g'}\} \text{ and target is kg} \\
Q_{net} & \text{if } U_{net} \in \{\text{'kg', 'l', 'L', 'm', 'N', 'piece'}\} \\
\frac{Q_{net}}{1000} & \text{if } U_{net} \in \{\text{'ml', 'mL'}\} \text{ and target is L} \\
Q_{net} & \text{if } U_{net} \in \{\text{'g', 'ml'}\} \text{ and target is per g / ml} \\
\frac{Q_{net}}{100} & \text{if target is per 100g or 100ml}
\end{cases}$$

##### Statutory Unit Sale Price Computation:
$$USP_{computed} = \frac{P_{MRP}}{Q_{base}}$$

##### Currency Precision and Rounding:
Under Indian accounting and metrological conventions, $USP_{computed}$ must be rounded to two decimal places (nearest paise):
$$USP_{rounded} = \frac{\lfloor (USP_{computed} \times 100) + 0.5 \rfloor}{100}$$

##### Discrepancy Percentage Verification Formula:
Let $USP_{declared}$ be the value extracted from the package. The percentage discrepancy $\Delta_{USP}$ is:
$$\Delta_{USP} = \frac{|USP_{declared} - USP_{rounded}|}{USP_{rounded}} \times 100\%$$

**Statutory Tolerance Criterion**:
$$\Delta_{USP} \le 1.0\% \implies \mathbf{COMPLIANT}$$
$$\Delta_{USP} > 1.0\% \implies \mathbf{STATUTORY\ VIOLATION\ (INCORRECT\ USP)}$$

#### 2.7.3 Regular Expression Specifications
```regex
(?i)\b(?:u\.?s\.?p\.?|unit\s*sale\s*price)\s*[:-]?\s*(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d{1,2})?)\s*(?:per|\/)\s*(kg|g|gm|100g|100\s*g|l|L|ml|mL|100ml|100\s*ml|m|cm|piece|pc|item|unit|N)\b
```

#### 2.7.4 Python Implementation of Verification Logic
```python
def verify_unit_sale_price(mrp: float, net_qty: float, unit: str, declared_usp: float, declared_usp_unit: str) -> dict:
    unit_lower = unit.lower().strip()
    usp_unit_lower = declared_usp_unit.lower().strip()
    
    # Calculate base quantity according to statutory denominator
    if unit_lower in ['g', 'gram', 'grams']:
        if usp_unit_lower in ['g', '/g', 'per g', 'gram']:
            base_qty = net_qty
            statutory_unit = "₹/g"
        elif usp_unit_lower in ['100g', '/100g', 'per 100g']:
            base_qty = net_qty / 100.0
            statutory_unit = "₹/100g"
        else:
            base_qty = net_qty / 1000.0
            statutory_unit = "₹/kg"
    elif unit_lower in ['kg', 'kilogram']:
        base_qty = net_qty
        statutory_unit = "₹/kg"
    elif unit_lower in ['ml', 'millilitre']:
        if usp_unit_lower in ['ml', '/ml', 'per ml']:
            base_qty = net_qty
            statutory_unit = "₹/ml"
        elif usp_unit_lower in ['100ml', '/100ml', 'per 100ml']:
            base_qty = net_qty / 100.0
            statutory_unit = "₹/100ml"
        else:
            base_qty = net_qty / 1000.0
            statutory_unit = "₹/L"
    elif unit_lower in ['l', 'litre']:
        base_qty = net_qty
        statutory_unit = "₹/L"
    elif unit_lower in ['n', 'u', 'piece', 'pieces', 'unit', 'units']:
        base_qty = net_qty
        statutory_unit = "₹/piece"
    else:
        return {"status": "error", "message": f"Unsupported net quantity unit: {unit}"}
        
    expected_usp = round(mrp / base_qty, 2)
    discrepancy_pct = abs(declared_usp - expected_usp) / expected_usp * 100.0
    
    is_compliant = discrepancy_pct <= 1.0
    
    return {
        "status": "compliant" if is_compliant else "violation",
        "expected_usp": expected_usp,
        "declared_usp": declared_usp,
        "discrepancy_pct": round(discrepancy_pct, 3),
        "statutory_unit": statutory_unit,
        "tolerance_limit_pct": 1.0,
        "violation_details": None if is_compliant else f"Declared USP ₹{declared_usp} deviates by {discrepancy_pct:.2f}% from computed ₹{expected_usp}"
    }
```

#### 2.7.5 Enforcement Parameters
- **Failure Severity**: MAJOR
- **Score Deduction**: -10 points (Missing USP); -10 points (Mathematically incorrect USP)
- **Statutory Citation**: Section 36(1) of Legal Metrology Act, 2009 read with Rule 6(1)(e) Second Proviso.

---

### 2.8 Rule 6(1)(n): Consumer Care Coordinates Quad-Component Engine

#### 2.8.1 Statutory Mandate
Every package shall bear the name, address, telephone number, and e-mail address of the person who, or the office which, can be contacted in case of consumer complaints. The engine requires the **simultaneous presence of all four mandatory components**:
1. Designated Person / Department Name
2. Complete Postal Address (with PIN code)
3. Working Telephone / Toll-Free Helpline Number
4. Active Email Address

```
+----------------------------------------------------------------------------------------------------+
|                         Rule 6(1)(n) Quad-Component Verification Model                             |
+---+----------------------------+-----------------------------------+-------------------------------+
| # | Component Requirement      | Target Pattern / Identification   | Statutory Status If Missing   |
+---+----------------------------+-----------------------------------+-------------------------------+
| 1 | Designation / Office Name  | Consumer Care Executive / Cell    | Partial Defect (-2.5 pts)     |
| 2 | Complete Postal Address    | Physical address + 6-digit PIN    | Partial Defect (-2.5 pts)     |
| 3 | Telephone / Toll-Free Num  | 1800-XXX-XXXX or landline/mobile  | Partial Defect (-2.5 pts)     |
| 4 | Electronic Mail Address    | Active RFC 5322 compliant email   | Partial Defect (-2.5 pts)     |
+---+----------------------------+-----------------------------------+-------------------------------+
```

#### 2.8.2 Production Regular Expression Patterns

##### Component 1: Designation Anchor:
```regex
(?i)\b(?:consumer\s*(?:care|service|cell|helpline|support)|customer\s*(?:care|service|support|grievance)|grievance\s*officer|nodal\s*officer|manager\s*[-–]\s*(?:consumer|customer)\s*care)\b
```

##### Component 2: Complete Postal Address & PIN:
```regex
(?i)(?:write\s*to\s*(?:us\s*at)?|address\s*[:-]?)\s*([A-Za-z0-9\s.,#/'()-]{10,150})\b([1-9][0-9]{2}\s?[0-9]{3})\b
```

##### Component 3: Telephone / Toll-Free Number:
```regex
(?i)(?:tel|phone|toll\s*free|call|helpline|contact\s*no\.?)\s*[:-]?\s*(?:(1800[- ]?\d{3}[- ]?\d{3,4})|(?:\+?91[- ]?|0)?([1-9]\d{1,4}[- ]?\d{6,8}))\b
```

##### Component 4: RFC 5322 Compliant Email Address:
```regex
\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b
```

#### 2.8.3 Algorithmic Evaluation Logic
```
Step 1: Isolate the "Consumer Care" bounding box region via Anchor Regex.

Step 2: Initialize boolean verification tuple:
        T_care = (has_designation, has_address, has_phone, has_email)

Step 3: Component Evaluation:
        - has_designation = Match(Regex 1) != None
        - has_phone = Match(Regex 3) != None
        - has_email = Match(Regex 4) != None
        - has_address = Match(Regex 2) != None OR 
          ("same as manufacturer address" in text AND Rule 6(1)(a) address passed)

Step 4: Scoring:
        missing_count = 4 - sum(T_care)
        if missing_count == 0 -> COMPLIANT
        if missing_count > 0  -> VIOLATION (Rule 6(1)(n)), Deduction = missing_count * 2.5 pts
```

#### 2.8.4 Enforcement Parameters
- **Failure Severity**: MAJOR
- **Score Deduction**: Up to -10 points (-2.5 points per missing element)
- **Statutory Citation**: Section 36(1) of Legal Metrology Act, 2009

---

## 3. Rule 7 & Table-I Spatial and Font Size Compliance Engine

Under Rule 7 and the Sixth Schedule of the LMPC Rules, 2011, every mandatory declaration must be printed in a numeral and letter height not less than the minimum height specified in **Table-I**. The minimum statutory height is a step function of the **Principal Display Panel (PDP) area**.

---

### 3.1 Principal Display Panel (PDP) Geometric Calculation Models

The Principal Display Panel is defined under Rule 2(h) as the part of the package that is intended or likely to be displayed, presented, or shown to the consumer under customary conditions of display.

```
+----------------------------------------------------------------------------------------------------+
|                         Principal Display Panel (PDP) Geometric Models                             |
+-------------------+--------------------------------------------+-----------------------------------+
| Container Shape   | Statutory Formula                          | Parameters                        |
+-------------------+--------------------------------------------+-----------------------------------+
| Rectangular       | A_pdp = H x W                              | H = Height of container face      |
|                   |                                            | W = Width of container face       |
+-------------------+--------------------------------------------+-----------------------------------+
| Cylindrical or    | A_pdp = 0.40 x H x C                       | H = Height of container           |
| Nearly Cylindrical| A_pdp = 0.40 x H x (pi x D)                | C = Circumference, D = Diameter   |
+-------------------+--------------------------------------------+-----------------------------------+
| Any Other Shape   | A_pdp = 0.20 x A_total                     | A_total = Total external surface  |
| (Irregular/Poly)  |                                            | area of the container             |
+-------------------+--------------------------------------------+-----------------------------------+
```

#### Rectangular Container Formulation:
$$A_{pdp} = H \times W$$
*Where $H$ is the total vertical height of the package face in cm, and $W$ is the total horizontal width in cm.*

#### Cylindrical Container Formulation:
Under Rule 7(1)(b), for a cylindrical package, the PDP area shall be **40 percent of the product of the height and circumference of the container**:
$$A_{pdp} = 0.40 \times H \times C = 0.40 \times H \times (\pi \times D)$$
*Where $H$ is the cylinder height in cm, $C$ is the circumference in cm, and $D$ is the outer diameter in cm.*

#### Irregular / Any Other Shape:
$$A_{pdp} = 0.20 \times A_{total}$$
*Where $A_{total}$ is the sum of all external surface areas in $\text{cm}^2$.*

---

### 3.2 Table-I Step-Function Matrix & Aspect Ratio Constraints

```
+----------------------------------------------------------------------------------------------------+
|                       Table-I: Minimum Height of Numerals and Letters                              |
+---+---------------------------------+--------------------------------+-----------------------------+
|   | Area of Principal Display Panel | Minimum Height: Normal Case    | Minimum Height: Blown,      |
|Row| (A_pdp in cm^2)                 | (Printed / Labeled)            | Formed, Molded, Embossed,   |
|   |                                 |                                | or Perforated Substrates    |
+---+---------------------------------+--------------------------------+-----------------------------+
| 1 | A_pdp <= 50 cm^2                | 1.0 mm                         | 2.0 mm                      |
| 2 | 50 cm^2 < A_pdp <= 100 cm^2     | 1.5 mm                         | 3.0 mm                      |
| 3 | 100 cm^2 < A_pdp <= 500 cm^2    | 2.5 mm                         | 4.0 mm                      |
| 4 | 500 cm^2 < A_pdp <= 2500 cm^2   | 4.0 mm                         | 6.0 mm                      |
| 5 | A_pdp > 2500 cm^2               | 6.0 mm                         | 6.0 mm                      |
+---+---------------------------------+--------------------------------+-----------------------------+
```

#### Letter Aspect Ratio Constraint (Width-to-Height Rule)
Rule 7(3) dictates that the width of the letter or numeral must not be less than **one-third (1/3)** of its height:
$$\frac{W_{char}}{H_{char}} \ge \frac{1}{3} \approx 0.333$$
*Exemption: Numeral `1` and lowercase/uppercase letter `I` / `i` are exempt from this ratio requirement.*

---

### 3.3 Optical Spatial Calibration Algorithm (GS1 EAN-13 Barcode Fiducial)

To compute the physical millimeter height of a character from camera sensor pixels, the system requires a calibrated pixel-to-metric ratio. The primary metric fiducial is the **standard GS1 EAN-13 barcode symbol**, universally present on retail packaging.

```
+-------------------------------------------------------------------------+
|                  GS1 EAN-13 Standard Calibration Symbol                 |
|                                                                         |
|        |<---------------------- 37.29 mm ---------------------->|       |
|        +--------------------------------------------------------+       |
|        | | | |   || ||| | ||| || ||| | || | ||| || |||| | | | | |       |
| 25.93  | | | |   || ||| | ||| || ||| | || | ||| || |||| | | | | |       |
|   mm   | | | |   || ||| | ||| || ||| | || | ||| || |||| | | | | |       |
|        | | | |   || ||| | ||| || ||| | || | ||| || |||| | | | | |       |
|        +--------------------------------------------------------+       |
|        |   8 9 0 1 0 3 0 1 2 3 4 5 >                            |       |
+-------------------------------------------------------------------------+
```

#### GS1 Standard Nominal Dimensions (at 1.0x Magnification):
- **Nominal Width ($W_{ref}$)**: $37.29\text{ mm}$ (including Quiet Zones: $3.63\text{ mm}$ left + $2.31\text{ mm}$ right).
- **Nominal Height ($H_{ref}$)**: $25.93\text{ mm}$ (bar height $22.85\text{ mm}$ + text legend).
- **Permissible Magnification Range**: $0.80\times$ ($29.83\text{ mm} \times 20.74\text{ mm}$) to $2.00\times$ ($74.58\text{ mm} \times 51.86\text{ mm}$).

#### Spatial Scaling Algorithm:
```
Step 1: Detect EAN-13 Barcode:
        Locate bounding box using barcode detector.
        Extract pixel dimensions: B_w (width in px), B_h (height in px).

Step 2: Aspect Ratio Consistency Check:
        AR_detected = B_w / B_h
        AR_nominal = 37.29 / 25.93 = 1.438
        if |AR_detected - 1.438| / 1.438 > 0.15:
            Apply perspective rectification transform (homography) to eliminate camera tilt.

Step 3: Calculate Metric Scale Factor (Pixels Per Millimeter - PPM):
        PPM_x = B_w / 37.29
        PPM_y = B_h / 25.93
        PPM_mean = (PPM_x + PPM_y) / 2.0

Step 4: Alternative Container Dimension Scaling (Fallback if Barcode Truncated):
        If container physical dimensions are provided via SKU master database:
        PPM = Container_Height_px / Container_Height_mm
```

---

### 3.4 Bounding Box to Physical Font Height Execution Pipeline

```python
def verify_font_height_compliance(
    char_bbox_px: tuple, 
    ppm: float, 
    pdp_area_cm2: float, 
    is_embossed: bool = False
) -> dict:
    # char_bbox_px: (x_min, y_min, x_max, y_max)
    # ppm: Calibrated Pixels-Per-Millimeter from EAN-13 fiducial
    # pdp_area_cm2: Area of Principal Display Panel in cm^2
    # is_embossed: Boolean flag for molded/embossed packaging
    _, y_min, _, y_max = char_bbox_px
    h_px = y_max - y_min
    
    # Cap-height estimation: bounding box includes ascenders/descenders.
    # In standard Latin / Devanagari fonts, cap-height = 0.72 of total line-box height.
    cap_height_px = h_px * 0.72
    h_measured_mm = round(cap_height_px / ppm, 2)
    
    # Step function lookup for Table-I
    if pdp_area_cm2 <= 50.0:
        h_required_mm = 2.0 if is_embossed else 1.0
    elif pdp_area_cm2 <= 100.0:
        h_required_mm = 3.0 if is_embossed else 1.5
    elif pdp_area_cm2 <= 500.0:
        h_required_mm = 4.0 if is_embossed else 2.5
    elif pdp_area_cm2 <= 2500.0:
        h_required_mm = 6.0 if is_embossed else 4.0
    else:
        h_required_mm = 6.0
        
    is_compliant = h_measured_mm >= h_required_mm
    
    return {
        "status": "compliant" if is_compliant else "violation",
        "measured_height_mm": h_measured_mm,
        "required_height_mm": h_required_mm,
        "pdp_area_cm2": pdp_area_cm2,
        "is_embossed": is_embossed,
        "deficit_mm": max(0.0, round(h_required_mm - h_measured_mm, 2)),
        "rule_reference": "Rule 7 Table-I of LMPC Rules, 2011"
    }
```

#### Enforcement Parameters
- **Failure Severity**: MAJOR
- **Score Deduction**: -10 points per non-compliant mandatory field
- **Statutory Citation**: Section 36(1) of Legal Metrology Act, 2009

---

## 4. Rule 9 Color Contrast & Conspicuousness Engine

Under Rule 9(1), every declaration required to be made under these rules shall be printed in a color that **contrasts conspicuously with the background of the package**. Printing text in low-contrast ink (e.g., light gray on white, dark brown on black, transparent embossing on transparent plastic) impedes consumer readability and constitutes a statutory infraction.

---

### 4.1 Substrate vs. Text Foreground Color Extraction

To evaluate contrast mathematically, the system isolates the foreground (ink) and background (packaging substrate) color distributions from the cropped region of interest (ROI) of each declaration.

```
+-------------------------------------------------------------------------+
|                  Color Decomposition Pipeline (Bimodal K-Means)         |
|                                                                         |
|   +-----------------------+           +-----------------------------+   |
|   | Raw Crop Bounding Box |  ======>  | Convert sRGB to CIELAB      |   |
|   | (Text ROI)            |           | (Perceptually Uniform Space)|   |
|   +-----------------------+           +--------------+--------------+   |
|                                                      |                  |
|                                                      v                  |
|   +-----------------------+           +-----------------------------+   |
|   | Classify Cluster Role |  <======  | K-Means Clustering (k=2)    |   |
|   | (Border = Substrate,  |           | Split Text vs Substrate     |   |
|   | Center = Text Ink)    |           +-----------------------------+   |
+-------------------------------------------------------------------------+
```

#### Algorithmic Workflow:
1. **Color Space Conversion**: The RGB crop is converted to CIELAB space to ensure perceptual distance clustering.
2. **K-Means Clustering ($k=2$)**:
   - Cluster 0: Centroid $\mu_0 = (L_0, a_0, b_0)$
   - Cluster 1: Centroid $\mu_1 = (L_1, a_1, b_1)$
3. **Substrate vs. Foreground Identification**:
   Packaging text occupies the interior of the bounding box, whereas the substrate occupies the perimeter. Pixels located along the outer 2-pixel border of the ROI are sampled:
   $$\text{Substrate Cluster } C_{bg} = \arg\max_{k \in \{0, 1\}} \left( \sum_{p \in \text{border}} \mathbb{I}(p \in C_k) \right)$$
   $$\text{Foreground Cluster } C_{fg} = \{0, 1\} \setminus \{C_{bg}\}$$
4. **Centroid Extraction**: Calculate the mean sRGB coordinates for $C_{bg}$ and $C_{fg}$:
   $$(R_{bg}, G_{bg}, B_{bg}), \quad (R_{fg}, G_{fg}, B_{fg})$$

---

### 4.2 WCAG 2.1 Relative Luminance and Contrast Ratio Mathematics

The engine adopts the standardized ISO/IEC and WCAG 2.1 relative luminance formulation for calibrated sRGB color coordinates.

#### A. Linearization of 8-Bit sRGB Channels:
For each channel $C \in \{R, G, B\}$, normalize integer value $[0, 255]$ to floating point $[0.0, 1.0]$:
$$c = \frac{C}{255}$$

Apply inverse gamma transformation:
$$c_{linear} = \begin{cases} 
\frac{c}{12.92} & \text{if } c \le 0.04045 \\
\left(\frac{c + 0.055}{1.055}\right)^{2.4} & \text{if } c > 0.04045 
\end{cases}$$

#### B. Relative Luminance ($L$) Equation:
Using the ITU-R Recommendation BT.709 coefficients:
$$L = 0.2126 \times R_{linear} + 0.7152 \times G_{linear} + 0.0722 \times B_{linear}$$
*Luminance $L$ is bounded in the interval $[0.0, 1.0]$, where $0.0$ represents absolute black and $1.0$ represents spectral white.*

#### C. Contrast Ratio ($CR$) Formulation:
Let $L_1$ be the relative luminance of the lighter color, and $L_2$ be the relative luminance of the darker color:
$$L_1 = \max(L_{fg}, L_{bg})$$
$$L_2 = \min(L_{fg}, L_{bg})$$

The contrast ratio is defined as:
$$CR = \frac{L_1 + 0.05}{L_2 + 0.05}$$
*The addition of the $0.05$ offset models ambient flare and glare reflecting off packaging films.*

---

### 4.3 Statutory Conspicuousness Thresholds & Surface Artifact Heuristics

```
+----------------------------------------------------------------------------------------------------+
|                       Color Contrast Evaluation & Decision Matrix                                  |
+-----------------------+----------------------+-----------------------------+-----------------------+
| Contrast Ratio (CR)   | Statutory Status     | Conspicuousness Rating      | Regulatory Action     |
+-----------------------+----------------------+-----------------------------+-----------------------+
| CR >= 4.50 : 1        | Fully Compliant      | High Conspicuousness        | Cleared               |
| 3.00 <= CR < 4.50     | Marginally Compliant | Standard Minimum Conspic.   | Cleared (Advisory)    |
| CR < 3.00 : 1         | Statutory Violation  | Inconspicuous / Illegible   | Section 36(1) Notice  |
+-----------------------+----------------------+-----------------------------+-----------------------+
```

#### Packaging Texture & Specular Glare Heuristics:
- **Metallic & Foil Films**: Highly reflective metallized polypropylene films cast specular highlights that artificially inflate luminance. The engine masks out saturated specular pixels ($R > 250 \land G > 250 \land B > 250$ with local standard deviation $< 3$) prior to clustering.
- **Transparent Bottles with Dark Liquids**: For clear PET bottles, the effective background is the liquid contents behind the bottle wall. The engine samples the local substrate immediately flanking the text characters rather than empty bottle zones.

#### Enforcement Parameters
- **Failure Severity**: MAJOR
- **Score Deduction**: -5 points per non-conspicuous mandatory field
- **Statutory Citation**: Section 36(1) of Legal Metrology Act, 2009 read with Rule 9(1).

---

## 5. Rule 18(2A) Dual MRP & Price Tampering Engine

Rule 18(2A) of the LMPC Rules, 2011 explicitly prohibits the affixing of an additional price sticker over the pre-printed Maximum Retail Price:
> *"No person shall alter, obliterate or smudge the retail sale price indicated on the package by the manufacturer or the packer or the importer, as the case may be."*

Furthermore, charging a price higher than the declared MRP or maintaining dual MRPs across identical packages distributed within the same market is a direct offence under Section 36(2) of the Act.

---

### 5.1 Sticker Overlay and Boundary Gradient Detection

Retail price tampering typically involves pasting a thermal or paper adhesive label over the manufacturer's printed price deck. MetroScan deploys an edge-artifact and texture-discontinuity pipeline on the MRP bounding region.

```
+-------------------------------------------------------------------------+
|                  Price Tamper & Sticker Detection Pipeline              |
|                                                                         |
|   +-----------------------+           +-----------------------------+   |
|   | Expanded MRP ROI      |  ======>  | Sobel / Canny Edge Gradient |   |
|   | (125% bounding margin)|           | Multi-scale Edge Extraction |   |
|   +-----------------------+           +--------------+--------------+   |
|                                                      |                  |
|                                                      v                  |
|   +-----------------------+           +-----------------------------+   |
|   | Sticker Edge Verdict: |  <======  | Morphological Rectangular   |   |
|   | Discontinuity Confirmed           | Contour Analysis & Shadow   |   |
|   | Elevation > Threshold |           | Gradient Profiling          |   |
+-------------------------------------------------------------------------+
```

#### Mathematical Steps:
1. **ROI Expansion**: The MRP bounding box $B = (x, y, w, h)$ is expanded by a 25% boundary margin:
   $$B_{expanded} = \left(x - 0.25w, y - 0.25h, 1.50w, 1.50h\right)$$
2. **Canny Gradient Magnitude**:
   $$G = \sqrt{G_x^2 + G_y^2}$$
   where $G_x, G_y$ are Sobel convolutions with kernel size $k=3$.
3. **Rectangular Contour Fitting**:
   Apply morphological closing to connect edge segments, followed by contour extraction. Filter contours matching sticker aspect criteria:
   $$\text{Area}(Contour) \in [0.4 \times \text{Area}(B_{exp}), 0.95 \times \text{Area}(B_{exp})]$$
   $$\text{Solidity}(Contour) > 0.88$$
4. **Shadow & Elevation Profiling**:
   Adhesive stickers have a physical thickness ($80-120\ \mu\text{m}$) that casts a directional micro-shadow along the lower and lateral perimeter. A 1D intensity cross-section perpendicular to the candidate contour boundary is evaluated for an abrupt luminance trough ($L_{trough} < 0.70 \times L_{substrate}$).
5. **Texture Disparity Metric**:
   Local Binary Patterns (LBP) entropy is computed for the region inside the contour versus the surrounding substrate. If Jensen-Shannon divergence $D_{JS}(LBP_{inside} \parallel LBP_{outside}) > 0.35$, an overlay sticker of foreign material is confirmed.

---

### 5.2 Multi-View Cross-Panel Price Reconciliation

Where an inspector or consumer uploads multi-panel images of a package (e.g., Front panel and Back panel, or Top carton flap and Inner tray):
```python
def reconcile_cross_panel_mrp(panel_scan_results: list) -> dict:
    # Detects dual MRP or contradictory price declarations across multiple panels.
    # panel_scan_results: list of dicts containing extracted MRP values and panel IDs.
    mrp_declarations = []
    for panel in panel_scan_results:
        if panel.get("mrp_value") is not None:
            mrp_declarations.append({
                "panel_id": panel["panel_id"],
                "mrp": float(panel["mrp_value"])
            })
            
    if len(mrp_declarations) < 2:
        return {"status": "single_mrp_verified", "dual_mrp_detected": False}
        
    prices = [d["mrp"] for d in mrp_declarations]
    min_price = min(prices)
    max_price = max(prices)
    price_delta = round(max_price - min_price, 2)
    
    if price_delta > 0.00:
        return {
            "status": "violation",
            "dual_mrp_detected": True,
            "min_mrp": min_price,
            "max_mrp": max_price,
            "discrepancy": price_delta,
            "violating_panels": mrp_declarations,
            "rule_violated": "Rule 18(2A) and Section 36(2) of Legal Metrology Act, 2009",
            "charge": "Dual MRP manipulation / Unlawful price differentiation"
        }
        
    return {"status": "compliant", "dual_mrp_detected": False, "verified_mrp": min_price}
```

#### Enforcement Parameters
- **Failure Severity**: CRITICAL
- **Score Deduction**: -40 points (Immediate Failure / Red Alert)
- **Statutory Citation**: Rule 18(2A) of LMPC Rules, 2011 and Section 36(2) of Legal Metrology Act, 2009.

---

## 6. Composite Statutory Compliance Scoring Algorithm

The MetroScan platform computes a standardized **Compliance Index (0 - 100)** representing the overall legal defensibility of the scanned product packaging.

### 6.1 Deductive Mathematical Formulation
The scoring pipeline initializes the package at a baseline score of $S_0 = 100$ points and deducts points for detected statutory infractions:

$$S = \max\left(0, S_0 - \sum_{i \in \mathcal{D}_{missing}} D_i - \sum_{j \in \mathcal{D}_{unit}} D_j - \sum_{k \in \mathcal{D}_{font}} D_k - \sum_{m \in \mathcal{D}_{contrast}} D_m - D_{tamper}\right)$$

---

### 6.2 Complete Penalty Deduction Schedule

```
+----------------------------------------------------------------------------------------------------+
|                             Complete Statutory Penalty Deduction Schedule                          |
+------------------+------------------------------------+-----------------+---------------+----------+
| Statutory Rule   | Violation Description              | Deduction (Pts) | Severity Tier | Legal Ref|
+------------------+------------------------------------+-----------------+---------------+----------+
| Rule 6(1)(a)     | Missing Manufacturer/Packer Details| -15 points      | CRITICAL      | Sec 36(1)|
| Rule 6(1)(a)     | Missing or Invalid Postal PIN code | -10 points      | MAJOR         | Sec 36(1)|
| Rule 6(1)(aa)    | Missing Country of Origin          | -10 points      | MAJOR         | Sec 36(1)|
| Rule 6(1)(b)     | Missing Generic / Common Name      | -10 points      | MAJOR         | Sec 36(1)|
| Rule 6(1)(c)     | Missing Net Quantity Declaration   | -15 points      | CRITICAL      | Sec 36(1)|
| Rule 13          | Illegal Metric Unit Symbol         | -10 points      | MAJOR         | Sec 36(1)|
|                  | (e.g., 'gms', 'Kgs', 'ML', 'ltrs') |                 |               |          |
| Rule 6(1)(d)     | Missing Month & Year of Mfg/Pkd    | -10 points      | CRITICAL      | Sec 36(1)|
| Rule 6(1)(e)     | Missing Maximum Retail Price (MRP) | -15 points      | CRITICAL      | Sec 36(1)|
| Rule 6(1)(e)     | Missing "incl. of all taxes" clause| -15 points      | CRITICAL      | Sec 36(1)|
| Rule 6(1)(e)     | Illegal "Taxes Extra" Statement    | -15 points      | CRITICAL      | Sec 36(1)|
| Rule 6(1)(e) Prov| Missing Unit Sale Price (USP)      | -10 points      | MAJOR         | Sec 36(1)|
| Rule 6(1)(e) Prov| Mathematically Incorrect USP (>1%) | -10 points      | MAJOR         | Sec 36(1)|
| Rule 6(1)(n)     | Incomplete Consumer Care (per item)| -2.5 points/item| MAJOR         | Sec 36(1)|
| Rule 7 Table-I   | Deficient Font Height (per field)  | -10 points/field| MAJOR         | Sec 36(1)|
| Rule 9(1)        | Low Color Contrast Ratio (< 3.0:1) | -5 points/field | MINOR         | Sec 36(1)|
| Rule 18(2A)      | Altered Price Sticker / Dual MRP   | -40 points      | CRITICAL      | Sec 36(2)|
+------------------+------------------------------------+-----------------+---------------+----------+
```

---

### 6.3 Enforcement Classification Tiers and Action Protocols

The computed composite score maps into three statutory disposition categories:

```
+----------------------------------------------------------------------------------------------------+
|                               Statutory Disposition & Action Protocols                             |
+-----------+---------------+---------------+--------------------------------------------------------+
| Score Tier| Grade & Band  | Visual Badge  | Prescribed Regulatory Action Protocol                  |
+-----------+---------------+---------------+--------------------------------------------------------+
| 90 - 100  | Grade A       | GREEN         | Package fully cleared for retail commercial sale.      |
|           | Fully Compliant|               | No legal impediment under LMPC Rules, 2011.            |
+-----------+---------------+---------------+--------------------------------------------------------+
| 70 - 89   | Grade B       | AMBER / YELLOW| Minor non-critical or procedural deficiencies detected. |
|           | Rectification |               | Issue Statutory Advisory Notice. Manufacturer given    |
|           | Required      |               | 14 calendar days to correct subsequent packaging runs. |
+-----------+---------------+---------------+--------------------------------------------------------+
| 0 - 69    | Grade C       | RED           | Actionable statutory non-compliance. Trigger immediate |
|           | Statutory Non-|               | generation of FORM LM-INSP-2011 Inspection Docket.     |
|           | Compliance    |               | Issue Show-Cause Notice under Section 36(1) or 36(2).   |
|           |               |               | Order physical seizure of violating stock batches.     |
+-----------+---------------+---------------+--------------------------------------------------------+
```

---

## 7. Legal Metrology Act, 2009 Statutory Enforcement Catalog

The statutory penalties prescribed under the Legal Metrology Act, 2009 are codified below for automatic reference in inspection notices.

```
+----------------------------------------------------------------------------------------------------+
|                         Legal Metrology Act, 2009 Penalty Schedule Catalog                         |
+-------------------+--------------------+--------------------------+--------------------------------+
| Statutory Section | Offence Category   | Incidence / Occurrence   | Maximum Prescribed Penalty     |
+-------------------+--------------------+--------------------------+--------------------------------+
| Section 36(1)     | Non-Standard       | First Offence            | Fine up to ₹25,000             |
|                   | Packaging /        | Second Offence           | Fine up to ₹50,000             |
|                   | Label Deficiencies | Subsequent Offences      | Fine up to ₹1,00,000 OR        |
|                   |                    |                          | Imprisonment up to 1 year,     |
|                   |                    |                          | or both                        |
+-------------------+--------------------+--------------------------+--------------------------------+
| Section 36(2)     | Selling above MRP  | Any Offence              | Fine up to ₹50,000 per SKU     |
|                   | or Dual Pricing    |                          | prosecution of store manager   |
+-------------------+--------------------+--------------------------+--------------------------------+
| Section 48        | Compounding of     | First / Non-Aggravated   | Summary compounding settlement |
|                   | Offences           | Offences                 | by Director / Controller       |
+-------------------+--------------------+--------------------------+--------------------------------+
| Section 49        | Corporate Offence  | Corporate Liability      | Joint liability of Nominated   |
|                   | (Director Liability|                          | Director & Operating Officers  |
+-------------------+--------------------+--------------------------+--------------------------------+
```

### 7.1 Section 36(1): Penalty for Manufacture, Sale, etc., of Non-Standard Packages
> *"Whoever manufactures, packs, imports, sells, distributes, delivers or offers or exposes for sale any pre-packaged commodity which does not conform to the declarations on the package as provided in this Act or any rule made thereunder, shall be punished with fine which may extend to twenty-five thousand rupees, for the second offence, with fine which may extend to fifty thousand rupees and for the subsequent offence, with fine which shall not be less than fifty thousand rupees but which may extend to one lakh rupees or with imprisonment for a term which may extend to one year or with both."*

### 7.2 Section 36(2): Penalty for Selling at Price Higher than Declared MRP
> *"Whoever manufactures, packs, or imports for sale or sells any pre-packaged commodity at a price higher than the retail sale price thereof indicated on the package shall be punished with fine which may extend to fifty thousand rupees."*

### 7.3 Section 48: Compounding of Offences
Any offence punishable under Section 36 may, either before or after the institution of the prosecution, be compounded by the Director or Legal Metrology Controller on payment for credit to the Government of such sum as may be specified. When an offence has been compounded, no further proceedings shall be taken against the offender in respect of the offence so compounded.

### 7.4 Section 49: Offences by Companies and Director Nomination
Under Section 49, where an offence is committed by a company:
1. The company may nominate one of its Directors under Section 49(2) as the designated responsible officer for legal metrology compliance.
2. If no director is nominated, every person who at the time the offence was committed was in charge of, and was responsible to the company for the conduct of the business, shall be deemed guilty of the offence.
3. Under the *Jan Vishwas (Amendment of Provisions) Act, 2023*, first-time minor procedural labeling violations under Rule 6 are eligible for statutory improvement notices prior to criminal prosecution, provided net quantity and MRP are untampered.

---

## 8. Software Architecture & Implementation Reference

### 8.1 VerificationDocket Output Schema (JSON)
The statutory verification pipeline outputs an auditable JSON docket structured as follows:

```json
{
  "scan_id": "SCAN-2026-DL-890123",
  "timestamp": "2026-09-10T12:45:00+05:30",
  "inspector_id": "LM-OFFICER-DL-042",
  "product_metadata": {
    "brand_name": "NutriLife",
    "generic_name": "Roasted Almond Cookies",
    "barcode_ean13": "8901030123456",
    "container_type": "Rectangular Box",
    "pdp_area_cm2": 187.5
  },
  "compliance_summary": {
    "overall_score": 65,
    "grade": "Grade C",
    "verdict": "Actionable Statutory Violations",
    "total_declarations_checked": 8,
    "compliant_count": 5,
    "violation_count": 3,
    "warning_count": 0
  },
  "declarations": [
    {
      "clause": "Rule 6(1)(a)",
      "field": "Manufacturer Address",
      "extracted_value": "NutriLife Foods Ltd, Plot 42, Okhla Ind Area, New Delhi - 110020",
      "status": "compliant",
      "measured_font_mm": 2.8,
      "required_font_mm": 2.5,
      "contrast_ratio": 6.8
    },
    {
      "clause": "Rule 6(1)(c) & Rule 13",
      "field": "Net Quantity",
      "extracted_value": "200 gms",
      "status": "violation",
      "error_code": "ILLEGAL_SI_UNIT_SYMBOL",
      "details": "Use of prohibited symbol 'gms'. Required metric symbol: 'g'.",
      "statutory_deduction": 10
    },
    {
      "clause": "Rule 6(1)(e)",
      "field": "Maximum Retail Price",
      "extracted_value": "MRP Rs. 120.00 (Taxes Extra)",
      "status": "violation",
      "error_code": "PROHIBITED_TAX_EXTRA_CLAUSE",
      "details": "Declaration of 'Taxes Extra' violates Rule 6(1)(e) and Rule 18.",
      "statutory_deduction": 15
    },
    {
      "clause": "Rule 6(1)(e) Second Proviso",
      "field": "Unit Sale Price",
      "extracted_value": "₹ 0.60 / g",
      "computed_expected": "₹ 0.60 / g",
      "status": "compliant"
    }
  ],
  "statutory_charges": [
    {
      "charge_id": "CHG-01",
      "act_section": "Section 36(1) of Legal Metrology Act, 2009",
      "rule_clause": "Rule 13 of LMPC Rules, 2011",
      "allegation": "Use of illegal non-standard unit 'gms'",
      "penalty_range": "Fine up to ₹25,000"
    },
    {
      "charge_id": "CHG-02",
      "act_section": "Section 36(1) of Legal Metrology Act, 2009",
      "rule_clause": "Rule 6(1)(e) & Rule 18",
      "allegation": "Conditioning retail sale price on additional taxes ('Taxes Extra')",
      "penalty_range": "Fine up to ₹25,000"
    }
  ]
}
```

### 8.2 Repository Code Integration Paths
The specifications in this document are implemented across the following codebase modules:
- Spatial calibration & Table-I font evaluator: `frontend/src/utils/complianceEngine.ts` and `frontend/src/data/legalMetrologyRules.ts`
- Data contract definitions: `frontend/src/types/index.ts`
- Backend machine learning & OCR pipeline: `ml/`
- Report & inspection docket generator: `frontend/src/pages/InspectionNoticePage.tsx` and `frontend/src/pages/ReportsPage.tsx`
