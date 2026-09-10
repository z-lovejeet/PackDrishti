# MetroScan: Product Requirements Document & Master Blueprint
**Project ID**: SIH26034  
**Project Title**: Software System to Check Compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by Scanning Products, Images and Labels  
**Administering Ministry**: Ministry of Consumer Affairs, Food & Public Distribution, Department of Consumer Affairs (Legal Metrology Division), Government of India  
**Document Classification**: Master System Blueprint and Technical Reference  
**Version**: 1.0.0 (Production Blueprint)

---

## 1. Executive Summary and Statutory Context

### 1.1 Problem Statement
In India, packaged commodities across retail and e-commerce are governed by the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011. The law mandates explicit declarations on every package: complete manufacturer identity and address with postal PIN, generic commodity name, net quantity in standardized SI units, Maximum Retail Price (MRP inclusive of all taxes), month and year of manufacture/packing/import, consumer care contact coordinates, country of origin, and Unit Sale Price (USP). Currently, verification relies upon manual enforcement by field inspectors. Given the volume of stock keeping units (SKUs) in offline retail and millions of e-commerce listings, manual inspection cannot provide adequate coverage, leading to undetected violations, unfair trade practices, dual-pricing manipulation, non-standard metric declarations, and consumer deception. Consumers also lack an automated mechanism to verify statutory compliance, price fairness, and nutritional safety.

### 1.2 System Overview
MetroScan is an automated regulatory compliance verification and nutritional auditing platform designed for dual operating contexts: Enforcement Officials (Legal Metrology Inspectors) and Everyday Consumers. The platform consumes product packaging images, processes them through an optical and layout pipeline, validates extracted declarations against the statutory codification of the Legal Metrology (Packaged Commodities) Rules, 2011, and computes a comprehensive compliance dossier. For consumers, it extends label auditing to ICMR-NIN nutritional thresholds, alerting on excess sugar, saturated fat, sodium, and deceptive unit pricing. For inspectors, it measures physical font letter heights according to Principle Display Panel (PDP) areas under Rule 7 Table-I, identifies statutory violations under Section 36(1) of the Act, and compiles verifiable inspection dockets (FORM LM-INSP-2011) with photographic evidence.

### 1.3 Target Personas and Value Proposition
1. **Legal Metrology Inspector (Enforcement Officer)**:
   - Needs: Rapid field-level label auditing, precise font size verification, statutory citation lookup, digital notice generation, and unified inspection repository.
   - Value Proposition: Reduces inspection verification time from 15 minutes per product to under 8 seconds. Automates font height calculation without requiring manual micrometer tools. Automatically references legal sections and penalty clauses.
2. **Informed Consumer**:
   - Needs: Instant verification of fair pricing (MRP and Unit Sale Price), identification of misleading packaging, and health audits of processed foods.
   - Value Proposition: Provides immediate transparency on pricing tricks (e.g. non-standard weights, hidden taxes) and decodes complex nutritional information panels against national health benchmarks.

---

## 2. System Capabilities Matrix

| Ref | Statutory & Functional Requirement | Consumer Mode | Officer Mode | Frontend Status | Backend Required | ML Required |
|---|---|---|---|---|---|---|
| CAP-01 | Single and dual-panel label image capture/upload | Yes | Yes | Implemented | Yes | No |
| CAP-02 | Optical Character Recognition (OCR) with bounding box localization | Yes | Yes | UI Prototype | Yes | Yes |
| CAP-03 | Rule 6(1)(a) Manufacturer/Packer/Importer address verification with PIN | Yes | Yes | Implemented | Yes | Yes |
| CAP-04 | Rule 6(1)(aa) Country of Origin detection | Yes | Yes | Implemented | Yes | Yes |
| CAP-05 | Rule 6(1)(b) Common/Generic commodity name detection | Yes | Yes | Implemented | Yes | Yes |
| CAP-06 | Rule 6(1)(c) & Rule 13 Net quantity validation (Strict SI units) | Yes | Yes | Implemented | Yes | Yes |
| CAP-07 | Rule 6(1)(d) Month and Year of manufacture/packing/import parsing | Yes | Yes | Implemented | Yes | Yes |
| CAP-08 | Rule 6(1)(e) MRP verification ('inclusive of all taxes' clause) | Yes | Yes | Implemented | Yes | Yes |
| CAP-09 | Rule 6(1)(e) Second Proviso: Unit Sale Price (USP) validation | Yes | Yes | Implemented | Yes | Yes |
| CAP-10 | Rule 6(1)(n) Consumer care coordinates (4 mandatory elements) | Yes | Yes | Implemented | Yes | Yes |
| CAP-11 | Rule 7 Table-I Font height compliance against PDP area | No | Yes | Implemented | Yes | Yes |
| CAP-12 | Rule 9 Color contrast conspicuousness analysis (WCAG >= 3:1) | No | Yes | Implemented | Yes | Yes |
| CAP-13 | Rule 18(2A) Dual MRP and altered price sticker detection | Yes | Yes | Implemented | Yes | Yes |
| CAP-14 | Generation of statutory violation dockets & show-cause notices | No | Yes | Implemented | Yes | No |
| CAP-15 | FORM LM-INSP-2011 PDF export with photographic evidence | No | Yes | Implemented | Yes | No |
| CAP-16 | Searchable historical repository of scanned commodities | Yes | Yes | Implemented | Yes | No |
| CAP-17 | Officer enforcement KPI dashboard and district activity ledger | No | Yes | Implemented | Yes | No |
| CAP-18 | Role-based access control (RBAC) and authentication | Yes | Yes | Implemented | Yes | No |
| CAP-19 | ICMR-NIN 2024 nutritional profile and High-Fat-Sugar-Salt (HFSS) badges | Yes | No | Implemented | Yes | Yes |
| CAP-20 | Dietary advisory and contraindication generation | Yes | No | Implemented | Yes | No |

---

## 3. Technical Architecture

### 3.1 Architecture Overview
The platform uses a decoupled client-server architecture:
- **Client Tier**: Single Page Application (SPA) built with React 19, TypeScript, and Tailwind CSS.
- **Application Tier**: RESTful API built with Python FastAPI, providing asynchronous pipeline execution, request validation, and auth enforcement.
- **AI & Compliance Tier**: 4-Tier Hybrid Pipeline: Tier 1: Multimodal VLM (Gemini 1.5 Flash / GPT-4o-mini) + High-Performance OCR (PaddleOCR) with Pydantic structured output. Tier 2: Deterministic Python Rule Engine for audited legal verification. Tier 3: Statutory Legal RAG powered by PostgreSQL pgvector for automatic retrieval of statutory sections. Tier 4: LLM Consumer Synthesis for translating nutritional audits into plain-language warnings.
- **Persistence Tier**: PostgreSQL 16 relational database for transactional integrity, coupled with S3-compatible object storage (Cloudflare R2 or AWS S3) for high-resolution packaging imagery.

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|   React 19 SPA + TypeScript + Tailwind CSS + Phosphor Icons              |
|   - Consumer Portal (Scanner, Health Check, Scan History)               |
|   - Enforcement Portal (Dashboard, Inspections Ledger, FORM LM-INSP)    |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTPS / JSON & Multipart
                                     v
+-------------------------------------------------------------------------+
|                           API GATEWAY / BACKEND                         |
|   Python FastAPI + Uvicorn + Pydantic v2 + SQLAlchemy 2.0               |
|   - Auth & RBAC (/api/v1/auth)                                          |
|   - Scan Orchestration (/api/v1/scan)                                   |
|   - Health Engine (/api/v1/health)                                      |
|   - Compliance & Violations (/api/v1/violations)                        |
|   - Official Reports & PDF Engine (/api/v1/reports)                     |
+-------------------+--------------------------------+--------------------+
                    |                                |
         SQL Queries|                      Inference | Raw Image Stream
                    v                                v
+-------------------+---------+    +-----------------+--------------------+
|       DATA PERSISTENCE      |    |        CV & ML PIPELINE             |
|   PostgreSQL 16 Engine      |    |   - Image Preprocessor (Deskew/CLAHE)|
|   - Users & Officer Profiles|    |   - PaddleOCR (DBNet Text Detection) |
|   - Product Scans & History |    |   - SVTR Text Recognition            |
|   - Extracted Declarations  |    |   - Statutory Rule 6 NER Engine      |
|   - Statutory Violations    |    |   - Rule 7 Table-I Font Estimator    |
|   - Health & Nutrition Data |    |   - Rule 9 Contrast Ratio Engine     |
|   Cloudflare R2 Object Store|    |   - Rule 18 Dual-MRP Tamper Detector |
|   - High-Res Package Photos |    |   - ICMR-NIN Nutrition Table Parser  |
+-----------------------------+    +--------------------------------------+
```

### 3.2 Frontend Architecture (Current State)
- **Framework**: React 19.2.8 with TypeScript 6.0.2 compiled via Vite 8.2.2.
- **Styling**: Tailwind CSS 3.4.19 with a civic color palette:
  - Primary Civic Teal: `#1B5E7B` (Dark: `#13465C`, Light: `#E8F1F5`)
  - Statutory Violation Red: `#C0392B` (Dark: `#962D22`, Light: `#FDEDEC`)
  - Compliance Success Green: `#27AE60` (Dark: `#1E8449`, Light: `#EAFAF1`)
  - Warning Amber: `#F39C12` (Dark: `#D68910`, Light: `#FEF9E7`)
  - Neutral Backgrounds: Slate `#F8FAFC`, `#F1F5F9`, `#FFFFFF`
- **Iconography**: `@phosphor-icons/react` exclusively (no Lucide icons, zero emojis).
- **Typography**: DM Sans (statutory headings), Source Sans 3 (tabular and legal body), JetBrains Mono (measurements, barcodes, and currency figures).
- **State Management**: React state hooks with centralized session persistence.
- **Routing**: Explicit role-based tab routing (`LandingPage`, `ScannerPage`, `HealthCheckPage`, `ProductHistoryPage`, `OfficerDashboardPage`, `InspectionsPage`, `ReportViewerPage`).

---

## 4. Legal Metrology Rules Engine Specification

The compliance engine tests package imagery against the Legal Metrology (Packaged Commodities) Rules, 2011.

### 4.1 Rule 6 Mandatory Declarations

#### Rule 6(1)(a): Manufacturer, Packer, or Importer Details
- **Requirement**: Full corporate identity and complete postal address including premises/plot number, street, city, state, and 6-digit Postal Index Number (PIN).
- **Evaluation Logic**:
  - Regex pattern checks for corporate prefixes: `(Manufactured|Packed|Marketed|Imported|Mfg by|Pkd by|Mkt by)`.
  - Geographic verification checks for valid Indian PIN code regex `\b[1-9][0-9]{5}\b`.
- **Violation Classification**:
  - Missing declaration: Complete omission of manufacturer or packer details.
  - Incomplete declaration: Address lacks PIN code or recognizable premises description.
- **Penalty Provision**: Section 36(1) of Legal Metrology Act, 2009 (Fine up to Rs. 25,000 for first offence).

#### Rule 6(1)(aa): Country of Origin
- **Requirement**: Every imported package must declare the country of origin. Domestic packages must state "Made in India" or "Country of Origin: India".
- **Evaluation Logic**: Extraction matches against ISO 3166-1 country names list and phrases: `(Country of Origin|Made in|Product of) [A-Za-z ]+`.

#### Rule 6(1)(b): Generic or Common Commodity Name
- **Requirement**: The standard commercial or generic designation of the commodity contained in the package.
- **Evaluation Logic**: Verification that the declared commodity descriptor is not obscured by promotional brand slogans.

#### Rule 6(1)(c) & Rule 13: Net Quantity and Standard Units
- **Requirement**: Net quantity must be declared in metric units of mass or volume.
- **Strict SI Units Allowed**:
  - Mass: `g`, `kg`
  - Volume: `ml`, `l`, `L`
  - Length: `mm`, `cm`, `m`
  - Area: `sq cm`, `sq m`
  - Number: `N`, `U`
- **Prohibited Non-Standard Symbols**: The system flags the following illegal abbreviations: `gms`, `gm`, `Kgs`, `KG`, `kg.`, `ML`, `mls`, `ltrs`, `ltr`, `Ltr`, `pcs`, `Pkts`.
- **Statutory Reference**: Rule 13 Third Schedule non-compliance constitutes an offence under Section 36(1).

#### Rule 6(1)(d): Month and Year of Manufacture / Packing / Import
- **Requirement**: Month and year of packing or manufacturing must be stated.
- **Permitted Formats**: `MM/YYYY`, `MM/YY`, `Month Year` (e.g. `05/2026`, `May 2026`).
- **Prohibited Patterns**: Ambiguous alphanumeric codes or obscure Julian date encodings without clear legend.

#### Rule 6(1)(e): Maximum Retail Price (MRP)
- **Requirement**: Must be declared in the exact format: `Maximum Retail Price Rs. XX.XX (inclusive of all taxes)` or `MRP Rs. XX.XX incl. of all taxes`.
- **Prohibited Patterns**:
  - Statements like "Local taxes extra", "Taxes applicable", or "VAT extra".
  - Absence of the rupee symbol (`Rs.` or `INR`).
- **Rounding Rule**: Fractional paise must follow statutory rounding specifications.

#### Rule 6(1)(e) Second Proviso: Unit Sale Price (USP)
- **Mandate**: Mandatory since October 1, 2022 for all commodities containing more than 1 kg or 1 litre (must declare price per 100g / 100ml or per kg / per litre). For packages under 1 kg/litre, must state price per g/ml.
- **Evaluation Logic**: Validates both presence of USP declaration and mathematical consistency:
  $$\text{Expected USP} = \frac{\text{Declared MRP}}{\text{Net Quantity in Base Units}}$$
  Any discrepancy exceeding 1% is flagged as a computational violation.

#### Rule 6(1)(n): Consumer Care Coordinates
- **Requirement**: Mandatory inclusion of at least four specific contact coordinates:
  1. Designated official/department name (e.g., Consumer Care Cell, Manager)
  2. Complete postal address
  3. Working telephone number or toll-free helpline
  4. Active electronic mail (email) address or web URL
- **Evaluation Logic**: Parser checks for valid email pattern `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`, Indian telephone patterns (1800 numbers or 10-digit STD formats), and contact office name.

---

### 4.2 Rule 7 & Table-I: Physical Font Size Verification

The rules prescribe minimum height of numerals and letters depending on the Principal Display Panel (PDP) area:

$$\text{PDP Area (Rectangular Package)} = \text{Height} \times \text{Width}$$
$$\text{PDP Area (Cylindrical Container)} = 40\% \times (\text{Height} \times \text{Circumference})$$

#### Statutory Minimum Letter/Numeral Height Table (Rule 7, Table-I)

| Principal Display Panel Area ($A$ in $\text{cm}^2$) | Normal Packaging Minimum Height ($h$ in mm) | Blown, Formed, Molded, Embossed or Perforated ($h$ in mm) |
|---|---|---|
| $A \le 50$ | 1.0 mm | 2.0 mm |
| $50 < A \le 100$ | 1.5 mm | 3.0 mm |
| $100 < A \le 500$ | 2.5 mm | 4.0 mm |
| $500 < A \le 2500$ | 4.0 mm | 6.0 mm |
| $A > 2500$ | 6.0 mm | 6.0 mm |

#### Measurement and Calibration Methodology
1. **Calibration Scale Factor**: The system establishes the spatial scale ($S$ in $\text{mm/pixel}$) via:
   - Known bounding box of standardized barcode (EAN-13 nominal dimensions: 37.29 mm width $\times$ 25.93 mm height).
   - Alternatively, user-entered container dimensions (height and width) from the officer field input.
2. **Text Bounding Height**:
   $$h_{\text{measured}} = (\text{Bounding Box Pixel Height}) \times S$$
3. **Threshold Check**: If $h_{\text{measured}} < h_{\text{required}}$, flag violation under Rule 7 Table-I.

---

### 4.3 Rule 9: Conspicuousness and Color Contrast
- **Requirement**: Declarations must be clearly legible and visually prominent against the background substrate.
- **Evaluation Engine**:
  1. The text region is segmented into foreground text pixels and background substrate pixels via Otsu thresholding or K-means clustering ($k=2$).
  2. Relative luminance ($L$) is calculated according to WCAG 2.1:
     $$L = 0.2126 R' + 0.7152 G' + 0.0722 B'$$
  3. The contrast ratio is computed:
     $$\text{Contrast Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05} \quad (\text{where } L_1 > L_2)$$
  4. Standard: Declarations with contrast ratio $< 3.0:1$ are flagged as non-conspicuous violations under Rule 9(1).

---

### 4.4 Rule 18(2A): Prohibition of Dual MRP and Price Tampering
- **Requirement**: No person shall alter, obliterate or smudge the retail sale price indicated on the package; no package shall carry more than one retail sale price sticker.
- **CV Verification Engine**:
  - Scans packaging image for overlapping rectangular patches, edge anomalies, sticker borders, or adhesive displacement near the MRP text.
  - Detects duplicate MRP declarations with conflicting values across multiple panels.

---

## 5. Consumer Health and Nutrition Engine Specification

For everyday consumers, MetroScan performs an automated nutritional safety and price-fairness audit on food and beverage commodities.

### 5.1 Dual-Panel Capture Requirement
The consumer interface requires:
- **Front Panel Image**: Contains product brand, generic name, net weight, FSSAI logo, and primary claims.
- **Back Panel Image**: Contains mandatory Nutritional Information Table, Ingredients list, allergen declarations, and manufacturing dates.

### 5.2 ICMR-NIN 2024 Dietary Benchmarks & WHO Thresholds

The system parses the nutritional information panel per 100g or 100ml and classifies nutrients:

| Nutrient | Low Threshold (Green) | Moderate Threshold (Amber) | High/HFSS Threshold (Red) | Source Standard |
|---|---|---|---|---|
| Total Sugars | $\le 5.0\text{ g} / 100\text{g}$ | $5.1 - 10.0\text{ g} / 100\text{g}$ | $> 10.0\text{ g} / 100\text{g}$ | ICMR-NIN 2024 |
| Added Sugars | $0\text{ g} / 100\text{g}$ | $0.1 - 5.0\text{ g} / 100\text{g}$ | $> 5.0\text{ g} / 100\text{g}$ | ICMR-NIN 2024 / WHO |
| Saturated Fat | $\le 1.5\text{ g} / 100\text{g}$ | $1.6 - 4.0\text{ g} / 100\text{g}$ | $> 4.0\text{ g} / 100\text{g}$ | ICMR-NIN Guidelines |
| Trans Fat | $0\text{ g} / 100\text{g}$ | - | $> 0\text{ g} / 100\text{g}$ (Zero Tolerance) | FSSAI 2% Regulation |
| Sodium | $\le 120\text{ mg} / 100\text{g}$ | $121 - 400\text{ mg} / 100\text{g}$ | $> 400\text{ mg} / 100\text{g}$ | ICMR-NIN 2024 |
| Energy | $\le 150\text{ kcal} / 100\text{g}$ | $151 - 350\text{ kcal} / 100\text{g}$ | $> 350\text{ kcal} / 100\text{g}$ | Standard Profile |

### 5.3 Health Score Computation Algorithm
The Composite Health Score ($H \in [0, 100]$) is computed using a base score penalized by excess nutrients and credited for positive dietary factors:

$$H = 100 - \sum (\text{Penalty Points}) + \sum (\text{Credit Points})$$

Where:
- **Sugar Penalty**: $P_{\text{sugar}} = \min\left(35, \frac{\text{Added Sugar (g)}}{10\text{g}} \times 12\right)$
- **Sodium Penalty**: $P_{\text{sodium}} = \min\left(25, \frac{\text{Sodium (mg)}}{400\text{mg}} \times 10\right)$
- **Saturated Fat Penalty**: $P_{\text{fat}} = \min\left(20, \frac{\text{Sat Fat (g)}}{4\text{g}} \times 8\right)$
- **Trans Fat Penalty**: If $\text{Trans Fat} > 0$, immediate 30-point deduction.
- **Dietary Fiber Credit**: $C_{\text{fiber}} = \min\left(10, \frac{\text{Fiber (g)}}{3\text{g}} \times 3\right)$
- **Protein Credit**: $C_{\text{protein}} = \min\left(10, \frac{\text{Protein (g)}}{5\text{g}} \times 2\right)$

Score Bands:
- **80 to 100**: Nutritious (Clean profile, minimal processing)
- **60 to 79**: Moderate (Consume in controlled portions)
- **40 to 59**: Processed (High in sugar, fat, or salt)
- **0 to 39**: Ultra-Processed / HFSS (Restrict consumption)

### 5.4 Automated Dietary Advisory Matrix
- **Diabetic Warning**: Triggered if Total Sugars $> 10\text{g}$ or Glycemic Index $> 70$.
- **Hypertension Warning**: Triggered if Sodium $> 400\text{mg}/100\text{g}$.
- **Cardiovascular Warning**: Triggered if Saturated Fat $> 4\text{g}$ or Trans Fat $> 0\text{g}$.
- **Safe For**: Children, athletes, seniors (conditioned upon nutrient profile).

---

## 6. 4-Tier Hybrid AI & Rules Pipeline

Instead of brittle custom computer vision models, MetroScan uses a modern 4-tier hybrid pipeline to ensure 100% auditable mathematical logic for legal verification.

### 6.1 Tier 1: Multimodal VLM & High-Performance OCR
- **Engine**: Gemini 1.5 Flash / GPT-4o-mini coupled with PaddleOCR.
- **Function**: Extracts spatial text, bounding boxes, and image layout data.
- **Output**: Strict Pydantic structured output for downstream processing.

### 6.2 Tier 2: Deterministic Python Rule Engine
- **Engine**: Pure Python Mathematical Logic Engine.
- **Function**: 100% auditable mathematical logic for legal verification. Performs Unit Sale Price calculations, strict SI metric units filtering, Rule 7 Table-I font height step function evaluation, and Rule 9 contrast checking.
- **Constraint**: Never let an LLM do legal math! All verifications are deterministic.

### 6.3 Tier 3: Statutory Legal RAG
- **Engine**: PostgreSQL pgvector.
- **Function**: Indexes the Legal Metrology Act 2009, Packaged Commodities Rules 2011 (with all amendments up to 2024), and court precedents.
- **Output**: Automatically retrieves exact statutory sections and generates formal show-cause notices (FORM LM-INSP-2011).

### 6.4 Tier 4: LLM Consumer Synthesis
- **Engine**: Secondary LLM Prompt Chain.
- **Function**: Translates complex ICMR-NIN nutritional audits into plain-language warnings and healthy Indian food recommendations for everyday consumers.

---

## 7. Database Schema (PostgreSQL 16)

The schema enforces relational constraints and audit trails across scans, violations, and enforcement logs.

```sql
-- Core User and Officer Tables
CREATE TYPE user_role AS ENUM ('consumer', 'officer', 'admin');
CREATE TYPE compliance_status AS ENUM ('compliant', 'violation', 'warning', 'pending');
CREATE TYPE violation_severity AS ENUM ('high', 'medium', 'low');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'consumer',
    full_name VARCHAR(255) NOT NULL,
    badge_number VARCHAR(100),
    designation VARCHAR(150),
    zone VARCHAR(150),
    jurisdiction VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Product Scan Records
CREATE TABLE product_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_code VARCHAR(64) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    barcode VARCHAR(64),
    pdp_area_cm2 NUMERIC(8, 2) NOT NULL,
    net_quantity VARCHAR(64) NOT NULL,
    mrp VARCHAR(64) NOT NULL,
    mfg_date VARCHAR(64) NOT NULL,
    overall_status compliance_status NOT NULL,
    compliance_score NUMERIC(5, 2) NOT NULL,
    image_url TEXT NOT NULL,
    location VARCHAR(255),
    inspector_notes TEXT,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Individual Extracted Declarations per Scan
CREATE TABLE extracted_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES product_scans(id) ON DELETE CASCADE,
    rule_clause VARCHAR(100) NOT NULL,
    field_name VARCHAR(150) NOT NULL,
    extracted_value TEXT NOT NULL,
    status compliance_status NOT NULL,
    status_note TEXT,
    measured_font_height_mm NUMERIC(5, 2),
    required_font_height_mm NUMERIC(5, 2),
    contrast_ratio NUMERIC(5, 2),
    bounding_box_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Statutory Violations Identified per Scan
CREATE TABLE statutory_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES product_scans(id) ON DELETE CASCADE,
    rule_reference VARCHAR(100) NOT NULL,
    act_section VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    penalty_clause TEXT NOT NULL,
    severity violation_severity NOT NULL,
    corrective_action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enforcement Violation Registry & Timeline Tracking
CREATE TABLE violation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES product_scans(id) ON DELETE RESTRICT,
    violation_code VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    assigned_officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    timeline_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Official Statutory Inspection Reports (FORM LM-INSP-2011)
CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number VARCHAR(100) UNIQUE NOT NULL,
    officer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    scan_id UUID REFERENCES product_scans(id) ON DELETE SET NULL,
    report_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    district VARCHAR(150) NOT NULL,
    total_products_scanned INT NOT NULL DEFAULT 1,
    compliant_count INT NOT NULL DEFAULT 0,
    violation_count INT NOT NULL DEFAULT 0,
    pdf_url TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Consumer Health and Nutrition Audits
CREATE TABLE health_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(150) NOT NULL,
    front_image_url TEXT NOT NULL,
    back_image_url TEXT NOT NULL,
    health_score NUMERIC(5, 2) NOT NULL,
    nutrients_json JSONB NOT NULL,
    badges_json JSONB NOT NULL,
    dietary_advisory_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Fast Query Performance
CREATE INDEX idx_product_scans_code ON product_scans(scan_code);
CREATE INDEX idx_product_scans_user ON product_scans(user_id);
CREATE INDEX idx_extracted_declarations_scan ON extracted_declarations(scan_id);
CREATE INDEX idx_statutory_violations_scan ON statutory_violations(scan_id);
CREATE INDEX idx_violation_records_code ON violation_records(violation_code);
CREATE INDEX idx_compliance_reports_number ON compliance_reports(report_number);
```

---

## 8. Backend RESTful API Contract Specification

All API responses use standard HTTP status codes and JSON payloads. All protected endpoints require a Bearer token: `Authorization: Bearer <jwt_token>`.

### 8.1 Authentication Endpoints

#### `POST /api/v1/auth/login`
- **Request**:
```json
{
  "email": "inspector.gupta@gov.in",
  "password": "SecurePassword123"
}
```
- **Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "e4b2d184-729c-48be-8f3b-5517226084cb",
    "email": "inspector.gupta@gov.in",
    "role": "officer",
    "full_name": "Rajesh Gupta",
    "badge_number": "LM-DEL-2024-8841",
    "designation": "Legal Metrology Inspector",
    "zone": "Delhi Central Zone"
  }
}
```

---

### 8.2 Label Compliance Scanning Endpoints

#### `POST /api/v1/scan/upload`
- **Method**: Multipart Form Upload
- **Headers**: `Content-Type: multipart/form-data`
- **Form Data Fields**:
  - `file`: Raw binary image file (JPEG/PNG, max 10MB)
  - `pdp_area_cm2`: Optional numeric PDP area in square cm (if known by officer)
  - `category`: Optional string category (Food, Cosmetics, Electronics, etc.)
- **Response (200 OK)**:
```json
{
  "scan_id": "4b87f8aa-46ef-46c5-926b-fa9c687e1488",
  "scan_code": "LM-SCAN-2026-9042",
  "product_name": "SunLite Roasted Almonds",
  "brand": "SunLite Organics",
  "category": "Food & Beverage",
  "barcode": "8901030928192",
  "pdp_area_cm2": 180.0,
  "net_quantity": "200 g",
  "mrp": "Rs. 240.00",
  "mfg_date": "04/2026",
  "overall_status": "violation",
  "compliance_score": 78.5,
  "image_url": "https://storage.metroscan.gov.in/scans/LM-SCAN-2026-9042.jpg",
  "declarations": [
    {
      "id": "dec-001",
      "rule_clause": "Rule 6(1)(a)",
      "field_name": "Manufacturer Name & Address",
      "extracted_value": "SunLite Organics Pvt Ltd, Plot 42, Okhla Phase III, New Delhi 110020",
      "status": "compliant",
      "measured_font_height_mm": 2.8,
      "required_font_height_mm": 2.5,
      "contrast_ratio": 5.4,
      "bounding_box": { "x": 12.5, "y": 74.2, "width": 45.0, "height": 6.8 }
    },
    {
      "id": "dec-002",
      "rule_clause": "Rule 6(1)(e)",
      "field_name": "Maximum Retail Price (MRP)",
      "extracted_value": "MRP Rs. 240.00 (inclusive of all taxes)",
      "status": "compliant",
      "measured_font_height_mm": 3.1,
      "required_font_height_mm": 2.5,
      "contrast_ratio": 7.2,
      "bounding_box": { "x": 62.0, "y": 80.5, "width": 28.0, "height": 4.5 }
    },
    {
      "id": "dec-003",
      "rule_clause": "Rule 6(1)(n)",
      "field_name": "Consumer Care Details",
      "extracted_value": "care@sunlite.in, Tel: 1800-11-2233 (Address missing)",
      "status": "violation",
      "status_note": "Lacks complete postal contact coordinates required under Rule 6(1)(n)",
      "measured_font_height_mm": 1.6,
      "required_font_height_mm": 2.5,
      "contrast_ratio": 4.1,
      "bounding_box": { "x": 15.0, "y": 85.0, "width": 40.0, "height": 5.0 }
    }
  ],
  "violations": [
    {
      "id": "viol-001",
      "rule_reference": "Rule 6(1)(n) & Rule 7 Table-I",
      "act_section": "Section 36(1)",
      "title": "Incomplete Consumer Care Declaration & Sub-standard Font Size",
      "description": "The consumer care coordinates omit a physical address and letter height is 1.6mm against statutory minimum 2.5mm for PDP of 180 cm2.",
      "penalty_clause": "Fine up to Rs. 25,000 for first offence under Legal Metrology Act, 2009",
      "severity": "high",
      "corrective_action": "Issue formal show-cause notice under Section 36(1) to manufacturer"
    }
  ]
}
```

---

### 8.3 Consumer Health Check Endpoints

#### `POST /api/v1/health/analyze`
- **Method**: Multipart Form Upload
- **Form Data Fields**:
  - `front_image`: Binary image file of front panel
  - `back_image`: Binary image file of back panel (nutrition table)
- **Response (200 OK)**:
```json
{
  "audit_id": "h-91823-ad81",
  "product_name": "Crunchy Choco Flakes",
  "brand": "Breakfast Delight",
  "health_score": 38.0,
  "nutritional_density": "Poor / Ultra-Processed",
  "nutrients": [
    { "name": "Total Sugars", "value": 34.5, "unit": "g", "per": "100g", "threshold": "High", "status": "violation", "icmr_limit": 10.0 },
    { "name": "Added Sugars", "value": 28.0, "unit": "g", "per": "100g", "threshold": "High", "status": "violation", "icmr_limit": 5.0 },
    { "name": "Total Fat", "value": 4.2, "unit": "g", "per": "100g", "threshold": "Moderate", "status": "warning", "icmr_limit": 8.0 },
    { "name": "Sodium", "value": 520.0, "unit": "mg", "per": "100g", "threshold": "High", "status": "violation", "icmr_limit": 400.0 }
  ],
  "badges": [
    { "badge": "High Sugar", "severity": "danger", "rationale": "34.5g per 100g exceeds ICMR threshold of 10g by 245%" },
    { "badge": "High Sodium", "severity": "danger", "rationale": "520mg per 100g exceeds threshold of 400mg" },
    { "badge": "Ultra Processed", "severity": "danger", "rationale": "Contains 4 synthetic additives and inverted sugar syrup" }
  ],
  "dietary_advisory": {
    "who_should_avoid": [
      "Individuals with Type-1 or Type-2 Diabetes",
      "Patients with Hypertension or Cardiac conditions",
      "Children under 5 years (excessive sucrose density)"
    ],
    "who_can_consume": [
      "Endurance athletes pre-workout (controlled portion under 30g)"
    ],
    "healthier_alternatives": [
      "Rolled Oats with Cinnamon",
      "Unsweetened Whole Grain Muesli"
    ]
  }
}
```

---

### 8.4 Enforcement Dashboard and Reporting Endpoints

#### `GET /api/v1/dashboard/metrics`
- **Headers**: Requires Officer Token
- **Response (200 OK)**:
```json
{
  "total_inspections": 342,
  "compliant_products": 248,
  "violation_count": 94,
  "compliance_rate_percentage": 72.5,
  "notices_issued": 38,
  "compounded_penalties_inr": 845000,
  "monthly_trend": [
    { "month": "May", "scanned": 82, "violations": 24 },
    { "month": "Jun", "scanned": 94, "violations": 26 },
    { "month": "Jul", "scanned": 88, "violations": 22 },
    { "month": "Aug", "scanned": 78, "violations": 22 }
  ],
  "top_infringing_rules": [
    { "rule": "Rule 7 Table-I", "title": "Sub-standard Font Size", "occurrences": 41 },
    { "rule": "Rule 6(1)(e)", "title": "Missing USP Declaration", "occurrences": 29 },
    { "rule": "Rule 13", "title": "Non-standard Metric Unit (gms/ltrs)", "occurrences": 18 },
    { "rule": "Rule 6(1)(n)", "title": "Incomplete Consumer Care Coordinates", "occurrences": 16 }
  ]
}
```

#### `POST /api/v1/reports/generate`
- **Request**:
```json
{
  "scan_id": "4b87f8aa-46ef-46c5-926b-fa9c687e1488",
  "report_type": "FORM_LM_INSP_2011",
  "include_photographic_evidence": true
}
```
- **Response (200 OK)**:
```json
{
  "report_number": "REP-DEL-2026-0812",
  "download_url": "https://storage.metroscan.gov.in/reports/REP-DEL-2026-0812.pdf",
  "generated_at": "2026-09-10T12:00:00Z"
}
```

---

## 9. Security, Authentication and Governance

### 9.1 Authentication & RBAC Matrix
- **Stateless Authentication**: Tokens issued using JWT (HMAC-SHA256) with 24-hour expiration and 7-day refresh tokens.
- **Role Permissions**:
  - `consumer`: Can execute scan uploads, view own scan history, and run health audits. Cannot access officer dashboard, inspection ledgers, or penalty notice generation.
  - `officer`: Full access to scanning, Rule 7 Table-I font analysis, notice generation, dashboard analytics, district violation ledger, and PDF certificate export.
  - `admin`: Manages officer verification, district allocations, and system configuration.

### 9.2 Data Protection and Evidence Chain
- **Evidence Integrity**: All captured packaging photographs are stored with SHA-256 cryptographic hashes to prevent tampering in statutory enforcement proceedings.
- **PII Redaction**: Consumer email and device IDs are stripped from aggregated inspection reports.
- **Input Sanitization**: File uploads are restricted to standard image formats (JPEG, PNG, WEBP), passed through image re-compression to strip malicious EXIF metadata, and capped at 10 MB.

---

## 10. Deployment and Infrastructure

```
+-------------------------------------------------------------------------+
|                          HOSTING ARCHITECTURE                           |
+-------------------------------------------------------------------------+
  FRONTEND SPA                   BACKEND CLUSTER             PERSISTENCE
  +--------------------+        +--------------------+     +-------------+
  | Vercel / Netlify   |  HTTP  | Railway / Render   | SQL | Supabase    |
  | Edge CDN           |=======>| FastAPI Cluster    |====>| PostgreSQL  |
  | Static Assets      |        | Dockerized (Gunicorn     | v16 Cluster |
  +--------------------+        | + Uvicorn Workers) |     +-------------+
                                +---------+----------+
                                          |
                                          | S3 API
                                          v
                                +--------------------+
                                | Cloudflare R2 / S3 |
                                | Secure Blob Bucket |
                                +--------------------+
```

- **Frontend Hosting**: Static SPA hosted on edge CDN (Vercel or Netlify) with automated preview builds per Git branch.
- **Backend Hosting**: Containerized Python service hosted on Railway or Render using multi-stage Docker builds.
- **Database**: Managed PostgreSQL instance hosted on Supabase or Railway with automatic daily snapshots.
- **Continuous Integration**: GitHub Actions runs automated linting, TypeScript verification, Python pytest suite, and image build validation on every pull request.

---

## 11. Development Phases & Implementation Roadmap

```
PHASE 1 (COMPLETED)    PHASE 2 (SPRINTS 1-2)    PHASE 3 (SPRINT 3)     PHASE 4 (SPRINT 4)     PHASE 5 (SPRINT 5)
+------------------+   +--------------------+   +------------------+   +------------------+   +------------------+
| Frontend Web App |   | Backend & Storage  |   | ML Engine Core   |   | End-to-End Link  |   | Hardening & Demo |
| - React 19 UI    |   | - FastAPI scaffold |   | - PaddleOCR live |   | - Live API hook  |   | - Load testing   |
| - Dual navigation|   | - PostgreSQL DDL   |   | - Rule 6 Regex   |   | - Dynamic report |   | - Field accuracy |
| - Civic Palette  |   | - JWT Auth engine  |   | - Font estimator |   | - Notice builder |   | - SIH deployment |
| - Mock datasets  |   | - File upload API  |   | - Nutrition table|   | - Health engine  |   | - Freeze release |
+------------------+   +--------------------+   +------------------+   +------------------+   +------------------+
```

- **Phase 1 (Completed)**: Complete UI/UX prototype in React 19, TypeScript, and Tailwind CSS. All 7 screens and modular components built and verified.
- **Phase 2 (Sprints 1-2)**: Backend foundational services: FastAPI, SQLAlchemy models, Alembic migrations, JWT authentication, and image storage upload endpoints.
- **Phase 3 (Sprint 3)**: AI Pipeline core: VLM prompt tuning, pgvector RAG indexing, deterministic rule engine verification, Rule 7 Table-I font calibration, and WCAG contrast calculator.
- **Phase 4 (Sprint 4)**: System Integration: Connect frontend to real backend endpoints, live image upload workflow, dynamic FORM LM-INSP-2011 PDF generation, and ICMR-NIN nutrition parser.
- **Phase 5 (Sprint 5)**: Hardening & SIH Presentation: Benchmark accuracy testing on 50+ real Indian packaging samples, latency optimization, mobile layout verification, and final deployment.

---

## 12. Risk Management Matrix

| Risk ID | Risk Description | Severity | Probability | Mitigation Strategy |
|---|---|---|---|---|
| RSK-01 | Low OCR accuracy on curved, reflective, or cylindrical packaging | High | High | Integrate contrast-limited adaptive histogram equalization (CLAHE) and cylindrical unwarping before text detection. |
| RSK-02 | Inaccurate font height measurement due to unknown camera distances | High | Medium | Use standardized EAN-13 barcode dimensions as reference scale factor; provide officer manual calibration fallback. |
| RSK-03 | Processing latency exceeding 10 seconds for dual-panel uploads | Medium | Medium | Optimize model inference using ONNX Runtime; run OCR and nutrition extraction asynchronously. |
| RSK-04 | E-commerce API rate limiting or anti-scraping blocks | Low | High | Use headless Playwright browser rotation and static HTML parsing for marketplace checks. |
| RSK-05 | Regulatory ambiguities across differing state metrology notifications | Medium | Low | Align baseline rule validation strictly with Central Legal Metrology (Packaged Commodities) Rules, 2011. |

---

## 13. Measurable Success Metrics & SIH Acceptance Criteria

1. **OCR Character Recognition Rate**: $\ge 88\%$ character-level accuracy on clear packaging label images.
2. **Mandatory Declaration Detection Rate**: Accurately detect and classify at least 9 out of 11 mandatory statutory declarations across benchmark test products.
3. **Font Size Measurement Precision**: Calculated letter height must be within $\pm 0.4\text{ mm}$ of manual physical micrometer measurements.
4. **End-to-End Processing Latency**: Complete image upload, OCR extraction, rule compliance scoring, and response generation in $< 8.0\text{ seconds}$ on standard GPU/CPU cloud instances.
5. **False Positive Rate for Violations**: Statutory non-compliance false positive rate $< 5\%$ on ground-truth verified compliant products.
