<div align="center">

<!-- BiteIQ Premium Hero Header -->
<p align="center">
  <img src="assets/hero-banner.svg" alt="BiteIQ Hero Banner" width="100%" />
</p>

# BiteIQ
### Precision Clinical Nutrition Engine · AI Plate Vision · Intelligent Food Scanner

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_pgvector-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Pytest Suite](https://img.shields.io/badge/Pytest-104%2F104_Passing-10B981?style=for-the-badge&logo=pytest&logoColor=white)](https://docs.pytest.org)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage_Runner-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-slate?style=for-the-badge)](LICENSE)

**Standards Compliance**: ICMR-NIN 2024 Dietary Guidelines for Indians · WHO NCD Nutrient Ceilings · NOVA Ultra-Processing Scale Group 4

[Production Web App](https://biteiq.vercel.app) · [Backend Health Check](https://biteiq-backend.onrender.com/health) · [Interactive OpenAPI Docs](https://biteiq-backend.onrender.com/api/v1/docs) · [Project Roadmap](docs/MIGRATION_ROADMAP.md)

---

</div>

## Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. System Architecture](#2-system-architecture)
- [3. Core Technical Pillars](#3-core-technical-pillars)
  - [Pillar I: Clinical Metabolic Engine](#pillar-i-clinical-metabolic-engine)
  - [Pillar II: AI Meal Plate Vision Pipeline](#pillar-ii-ai-meal-plate-vision-pipeline)
  - [Pillar III: Packaged Food Scanner & ICMR-NIN 2024 Profiling](#pillar-iii-packaged-food-scanner--icmr-nin-2024-profiling)
  - [Pillar IV: Multi-Modal Daily Food Diary & Hydration Bridge](#pillar-iv-multi-modal-daily-food-diary--hydration-bridge)
  - [Pillar V: Enterprise Security, RBAC & Multi-Tenant Isolation](#pillar-v-enterprise-security-rbac--multi-tenant-isolation)
- [4. AI Vision & Dual-LLM Fallback Pipeline](#4-ai-vision--dual-llm-fallback-pipeline)
- [5. Mathematical & Physical Conservation Invariants](#5-mathematical--physical-conservation-invariants)
- [6. Complete End-to-End User Journeys](#6-complete-end-to-end-user-journeys)
- [7. REST API Reference & Specification](#7-rest-api-reference--specification)
- [8. Repository Structure](#8-repository-structure)
- [9. Installation & Local Development](#9-installation--local-development)
- [10. Testing, Quality Assurance & Benchmarks](#10-testing-quality-assurance--benchmarks)
- [11. Production Cloud Deployment Blueprint](#11-production-cloud-deployment-blueprint)
- [12. Zero-Emoji Compliance & Design System](#12-zero-emoji-compliance--design-system)

---

## 1. Executive Summary

Everyday consumers and clinical patients encounter misleading food packaging, confusing nutrition facts panels, and complex dietary rules. Front-of-pack claims frequently promote *"High Protein"*, *"Zero Added Sugar"*, or *"Baked, Not Fried"*, while back-of-pack labels obscure high industrial palm oil, maltodextrin, excessive sodium, and synthetic azo dyes. Furthermore, traditional calorie trackers rely on tedious manual gram typing that fails to account for regional meal diversity (e.g. Indian thali meals) or patient comorbidities.

**BiteIQ** is an enterprise-grade nutrition intelligence platform engineered to bridge consumer perception and physiological reality:
1. **Clinical Metabolic Nutrition Engine**: Calculates individualized Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) via the Mifflin-St Jeor and Katch-McArdle equations, automatically enforcing clinical rulebooks for 8 chronic disease conditions (Type 2 Diabetes, Hypertension, CKD Stage 3+, Dyslipidemia, GERD, Celiac, Gout, and PCOS).
2. **AI Meal Plate Vision Pipeline**: Performs spatial food item segmentation from camera photographs, returning bounding box coordinates, estimated gram weights, macro splits, and Atwater thermodynamic energy corrections in under 2.5 seconds.
3. **Packaged Food Scanner & ICMR-NIN 2024 Profiling**: Analyzes front and back product labels, performs per-100g math normalization, grades palm oil and synthetic dye risks (Grade A/B/C), audits shelf-life expiry, and executes a one-tap bridge into daily macros.
4. **Multi-Modal Daily Food Diary**: Unifies manual food search, AI plate vision, and packaged scanner logs across 4 daily meal slots with atomic transaction recalculation and hydration tracking.
5. **Zero-Emoji Civic UI/UX**: Designed to civic engineering standards utilizing clean typography (`Plus Jakarta Sans` and `JetBrains Mono`), crisp Phosphor vector iconography, and high-contrast clinical dashboards.

---

## 2. System Architecture

The following diagram illustrates the topological structure of BiteIQ across its client layer, API gateway, dual-LLM perceptual inference pipelines, deterministic clinical engines, and relational persistence layer:

```mermaid
graph TB
    subgraph CLIENT["Client Tier (React 19 + TypeScript + Vite)"]
        DASH["Dashboard View<br/>Calorie Ring & Macro Bars"]
        DIARY["Diary Page<br/>4 Slots & Swipe Controls"]
        MODAL["Food Logger Drawer<br/>Search · Plate · Packaged"]
        REVIEW["Plate Review Modal<br/>Portion Steppers & Bounding Boxes"]
        SETTINGS["Profile Settings<br/>Biometrics & Clinical Conditions"]
    end

    subgraph GATEWAY["API Gateway & Middleware Layer (FastAPI 0.115)"]
        CORS["CORS Lockdown & Regex"]
        SEC_HEADERS["Security Headers Middleware<br/>nosniff · DENY · HSTS · Referrer"]
        RATE["Sliding-Window Rate Limiter<br/>In-Memory Cache (HTTP 429)"]
        AUTH_GUARD["JWT Supabase Auth Guard<br/>HS256 Verification & JTI Denylist"]
    end

    subgraph AI_PIPELINE["Perceptual Vision Tier (Dual-LLM Chain)"]
        GEMINI["Primary Chain: Google Gemini VLM<br/>Flash Lite -> Flash -> Flash 3.7"]
        GROQ["Secondary Chain: Groq Open-Weights<br/>High-Throughput Vision Fallback"]
        GROUND_TRUTH["Tertiary Deterministic Heuristics<br/>Guaranteed 100% Zero-500 SLA"]
    end

    subgraph ENGINE["Deterministic Clinical & Invariant Engines"]
        INVARIANT["Mass Invariant Validator<br/>Lipid · Carb · Atwater Laws"]
        METABOLIC["Metabolic Calculator<br/>Mifflin-St Jeor · Katch-McArdle"]
        CLINICAL_ENG["Clinical Contraindication Engine<br/>8-Condition Comorbid Rulebooks"]
        ICMR["ICMR-NIN 2024 Profiler<br/>0-100 Score · 3-Tier Dye Grading"]
    end

    subgraph DATA["Persistence Layer (PostgreSQL 16 + pgvector)"]
        USERS[("users<br/>Auth & Roles")]
        PROFILES[("user_profiles<br/>Biometrics & TDEE")]
        CONDITIONS[("user_conditions<br/>Medical Comorbidities")]
        DIARIES[("daily_food_diaries<br/>Daily Totals & Water")]
        ENTRIES[("meal_entries<br/>Portions & Macros")]
        AUDITS[("packaged_audits<br/>ICMR Scores & Additives")]
    end

    CLIENT --> GATEWAY
    GATEWAY --> ENGINE
    GATEWAY --> AI_PIPELINE
    AI_PIPELINE --> ENGINE
    ENGINE --> DATA

    classDef clientStyle fill:#0F172A,stroke:#38BDF8,stroke-width:1.5px,color:#F8FAFC;
    classDef gatewayStyle fill:#022C22,stroke:#10B981,stroke-width:1.5px,color:#F8FAFC;
    classDef aiStyle fill:#1E1B4B,stroke:#818CF8,stroke-width:1.5px,color:#F8FAFC;
    classDef engineStyle fill:#311042,stroke:#C084FC,stroke-width:1.5px,color:#F8FAFC;
    classDef dataStyle fill:#18181B,stroke:#F59E0B,stroke-width:1.5px,color:#F8FAFC;

    class DASH,DIARY,MODAL,REVIEW,SETTINGS clientStyle;
    class CORS,SEC_HEADERS,RATE,AUTH_GUARD gatewayStyle;
    class GEMINI,GROQ,GROUND_TRUTH aiStyle;
    class INVARIANT,METABOLIC,CLINICAL_ENG,ICMR engineStyle;
    class USERS,PROFILES,CONDITIONS,DIARIES,ENTRIES,AUDITS dataStyle;
```

---

## 3. Core Technical Pillars

<div align="center">
  <img src="assets/pillars.svg" alt="BiteIQ Core Technical Pillars" width="100%" />
</div>

<br />

### Pillar I: Clinical Metabolic Engine

The metabolic engine calculates precision energy expenditure rather than applying static population averages:

1. **Basal Metabolic Rate (BMR)**:
   - **Katch-McArdle Formula** (Applied when body fat percentage is known, $3.0\% \le \text{BF} \le 60.0\%$):
     $$\text{LBM} = \text{Weight}_{\text{kg}} \times \left(1.0 - \frac{\text{Body Fat } \%}{100.0}\right)$$
     $$\text{BMR} = 370.0 + (21.6 \times \text{LBM})$$
   - **Mifflin-St Jeor Formula** (Applied when body fat is absent):
     $$\text{BMR}_{\text{Male}} = (10.0 \times \text{Weight}_{\text{kg}}) + (6.25 \times \text{Height}_{\text{cm}}) - (5.0 \times \text{Age}) + 5.0$$
     $$\text{BMR}_{\text{Female}} = (10.0 \times \text{Weight}_{\text{kg}}) + (6.25 \times \text{Height}_{\text{cm}}) - (5.0 \times \text{Age}) - 161.0$$

2. **Total Daily Energy Expenditure (TDEE)**:
   Calculated using validated Physical Activity Level (PAL) coefficients:
   - *Sedentary*: $1.200\times$
   - *Lightly Active*: $1.375\times$
   - *Moderately Active*: $1.550\times$
   - *Very Active*: $1.725\times$
   - *Extra Active*: $1.900\times$

3. **Physiological Safety Floors**:
   Caloric targets derived from aggressive deficits are clamped to prevent endocrine and thyroid downregulation:
   - Male floor: strictly $\ge 1500\text{ kcal/day}$
   - Female floor: strictly $\ge 1200\text{ kcal/day}$

4. **The 8 Clinical Condition Rulebooks**:
   - **Type 2 Diabetes**: Carbohydrates capped at $\le 130\text{g/day}$, free sugars $\le 10\text{g/day}$, glycemic spike alerts triggered on net carbs $> 35\text{g/meal}$, maltodextrin/liquid glucose interception.
   - **Hypertension**: Sodium ceiling capped at $\le 1500\text{mg/day}$ (strict) or $\le 2000\text{mg/day}$ (mild), monosodium glutamate (INS 621) and sodium benzoate interception.
   - **CKD Stage 3+**: Protein restricted to $0.8\text{g/kg}$ dry body weight, potassium flags enabled, phosphorus additive scrutiny.
   - **Dyslipidemia / Atherosclerosis**: Saturated fat capped at $\le 7\%$ total daily calories, zero trans fat allowance ($0.0\text{g}$), palmolein detection.
   - **GERD**: Interception of high citric acid, peppermint oils, and hyper-spiced items.
   - **Celiac Disease / Gluten Sensitivity**: Zero tolerance for wheat, barley, rye, and malt derivatives.
   - **Gout / Hyperuricemia**: High-purine penalty applied to organ meats, yeast extracts, and high-fructose corn syrup.
   - **PCOS**: Insulin sensitivity focus with low-glycemic load carb prioritization and saturated fat moderation.

---

### Pillar II: AI Meal Plate Vision Pipeline

The meal plate vision agent (`PlateVisionAgent`) eliminates tedious manual entry for multi-item thalis and composite meals:

```
[Camera Snapshot] ──> [Transient RAM Buffer] ──> [Dual-LLM Inference] ──> [Spatial Bounding Boxes]
                                                                                │
[Committed to Diary] <── [Portion Steppers] <── [Atwater Validation] <── [Segmented Grams]
```

- **Spatial Bounding Box Normalization**: Bounding coordinates are strictly normalized to a $[0, 1000]$ integer grid (`[ymin, xmin, ymax, xmax]`).
- **Interactive Portion Review**: Users can review detected items in the `PlateReviewModal`, adjust portion quantities (e.g. from 1 roti to 2 rotis) using stepper controls, and observe live macronutrient recalculation before committing.
- **Atwater Energy Correction**: Declared or predicted calories are checked against $4P + 4C + 9F$. If discrepancy exceeds $20\%$, the system automatically reconciles calories to preserve thermodynamic consistency.

---

### Pillar III: Packaged Food Scanner & ICMR-NIN 2024 Profiling

The packaged scanner (`POST /api/v1/packaged/analyze`) performs forensic audits of commercial consumer packaged goods:

```
                  Packaged Food Dual-Panel Input
                 (Front Branding + Back Nutrition)
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       Front-Panel Analysis            Back-Panel Extraction
       - Commodity & Brand Name        - Per-Serving Nutrition Facts
       - FSSAI License Number          - Ingredients Statement
       - Net Quantity & MRP            - Manufacturing & Expiry Dates
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                     ICMR-NIN 2024 Profiler
            ┌─────────────────────────────────────────┐
            │ 1. Math Normalization to 100g / 100ml   │
            │ 2. Palm Oil & Industrial Fat Audit      │
            │ 3. 3-Tier Artificial Dye Classification │
            │ 4. Shelf-Life Expiry Date Validation    │
            │ 5. Normalized Price per 100g Value Check│
            └─────────────────────────────────────────┘
                                 │
                                 ▼
                    0–100 Product Health Score
                                 │
                                 ▼
                   One-Tap Diary Bridge (POST)
```

#### 3-Tier Artificial Color Additive Grading

<div align="center">
  <img src="assets/colors.svg" alt="BiteIQ 3-Tier Food Color Additive Grading" width="100%" />
</div>

<br />

| Grade | Tier Classification | Chemical Identifiers & INS Numbers | Clinical Advisory |
|:---|:---|:---|:---|
| **Grade A** | Wholesome Natural Extracts | Curcumin (INS 100), Annatto (INS 160b), Beetroot Red (INS 162), Chlorophyll (INS 140) | Approved for regular consumption across all ages. |
| **Grade B** | Permitted Synthetic Colorants | Caramel (INS 150d), Brilliant Blue FCF (INS 133), Fast Green FCF (INS 143) | Permitted in moderation. Monitor daily cumulative intake. |
| **Grade C** | High-Concern Synthetic Azo Dyes | Tartrazine (INS 102), Sunset Yellow FCF (INS 110), Carmoisine (INS 122), Allura Red (INS 129), Ponceau 4R (INS 124) | High pediatric concern. Associated with hyperactivity and allergic reactions in children. |

#### ICMR-NIN 2024 Deduction Formula

$$\text{Health Score} = \text{clamp}\left(0, 100, 100 - \sum \text{Deductions} + \sum \text{Credits}\right)$$

- **Added Sugar Deduction**: Up to $-35\text{ points}$ when free sugars exceed $10\text{g}/100\text{g}$ (solids) or $5\text{g}/100\text{ml}$ (liquids).
- **Sodium Deduction**: Up to $-25\text{ points}$ when sodium exceeds $600\text{mg}/100\text{g}$.
- **Saturated Fat Deduction**: Up to $-20\text{ points}$ when saturated fat exceeds $4\text{g}/100\text{g}$.
- **Trans Fat Flat Penalty**: $-30\text{ points}$ flat deduction for any detectable trans fat ($> 0.0\text{g}$).
- **Ultra-Processing Deduction**: $-10\text{ points}$ for NOVA Group 4 cosmetic additives.
- **Critical Expiry Penalty**: $\text{Score} = 0$ if product manufacturing and expiry dates show product is expired.
- **Nutritional Credits**: $+10\text{ points}$ for dietary fiber ($\ge 3\text{g}/100\text{g}$) and $+10\text{ points}$ for protein ($\ge 5\text{g}/100\text{g}$) (applied only to minimally processed foods).

---

### Pillar IV: Multi-Modal Daily Food Diary & Hydration Bridge

The food diary unifies three distinct logging channels into an integrated ledger:

1. **Manual Food Database Search**: Sub-80ms autocomplete queries against the seed database of reference foods and recipes.
2. **AI Plate Vision Scan**: Seamlessly transforms segmented plate photos into discrete meal item rows.
3. **Packaged Scanner One-Tap Bridge** (`POST /api/v1/packaged/log-to-diary`): Scales per-100g nutrients to exact consumer serving weights (e.g. $27.5\text{g}$) and logs directly to the target meal slot.
4. **Water Hydration Logging**: Daily water tracking with 250ml quick increments, target water budget visualization, and adherence status checks.
5. **Transactional Recalculation**: Every create, update, or delete operation triggers an atomic database recalculation of consumed macros, calories, and remaining budgets.

---

### Pillar V: Enterprise Security, RBAC & Multi-Tenant Isolation

1. **JWT Authentication & Token Lifecycle**:
   - Supabase Auth JWT validation using HS256/RS256 algorithms.
   - Rejection of tampered signatures, expired tokens, and `alg: none` attacks.
2. **In-Memory JTI Session Denylist**:
   - Sliding-window in-memory cache tracks revoked session IDs. Tokens flagged as revoked receive immediate `HTTP 401 Unauthorized` responses without database roundtrips.
3. **Multi-Tenant Row-Level Data Isolation**:
   - Every database query strictly filters by `user_id == current_user.id`.
   - User B attempting to read, update, or delete User A's diary entries, profile, or scans receives `HTTP 404 Not Found`, completely preventing cross-tenant leakage.
4. **Sliding-Window Rate Limiting**:
   - Sliding-window algorithm blocks endpoint abuse. Exceeding thresholds returns `HTTP 429 Too Many Requests` with a compliant `Retry-After` header.
5. **Input Sanitization & Injection Defense**:
   - All string inputs (search queries, notes, brand names) are sanitized against script injection (`<script>`) and malicious markup. Database queries use parameterized SQLAlchemy queries to prevent SQL injection.
6. **Container Security**:
   - Docker container runs under an unprivileged non-root user `biteiq` (`uid 10001`), protecting the host system from container breakout vulnerabilities.

---

## 4. AI Vision & Dual-LLM Fallback Pipeline

To ensure $99.9\%$ operational uptime under third-party LLM rate limits or network disruptions, BiteIQ implements a 3-tier resilient perceptual pipeline:

```mermaid
sequenceDiagram
    autonumber
    participant Client as Consumer Client
    participant API as FastAPI Gateway
    participant Chain as PlateVisionAgent / HealthAgent
    participant G as Google Gemini VLM
    participant Q as Groq Open-Weights
    participant M as Deterministic Engine

    Client->>API: Upload Image Bytes (RAM Only)
    API->>Chain: Ingest Image Buffer
    Chain->>G: Attempt Primary Call (Gemini Flash Lite Chain)
    alt Gemini Call Succeeds
        G-->>Chain: Return Structured JSON Predictions
    else Gemini Times Out / Returns 429 / 503
        Chain->>Q: Fallback to Secondary Chain (Groq Vision)
        alt Groq Call Succeeds
            Q-->>Chain: Return Structured JSON Predictions
        else Groq Fails / Deprecated
            Chain->>M: Fallback to Deterministic Clinical Heuristics
            M-->>Chain: Return Safe Validated Clinical Envelope
        end
    end
    Chain->>Chain: Apply Mass Invariants & Atwater Corrections
    Chain-->>API: Validated Output Envelope
    API-->>Client: HTTP 200 / 201 Response
```

---

## 5. Mathematical & Physical Conservation Invariants

<div align="center">
  <img src="assets/invariants.svg" alt="BiteIQ Mathematical and Physical Conservation Invariants" width="100%" />
</div>

<br />

All nutrition facts parsed from packaging panels or predicted by vision models must conform to physical conservation laws verified by `MassInvariantValidator`:

### 1. Lipid Conservation Law
$$\text{Saturated Fat}_{\text{g}} + \text{Trans Fat}_{\text{g}} \le \text{Total Fat}_{\text{g}} + \epsilon \quad (\epsilon = 0.2\text{g})$$
*Rationale*: Saturated and trans fatty acids are sub-constituents of total lipids. Their sum cannot physically exceed the total lipid mass.

### 2. Carbohydrate Conservation Law
$$\text{Added Sugars}_{\text{g}} \le \text{Total Sugars}_{\text{g}} \le \text{Total Carbohydrates}_{\text{g}} + \epsilon$$
*Rationale*: Added sugars are a subset of total sugars, and total sugars are a subset of total carbohydrates.

### 3. Mass Summation Ceiling
$$\text{Protein}_{\text{g}} + \text{Carbohydrates}_{\text{g}} + \text{Fat}_{\text{g}} + \text{Fiber}_{\text{g}} \le \text{Serving Mass}_{\text{g}} + \epsilon$$
*Rationale*: The macronutrient constituents cannot physically exceed the total dry weight of the food sample.

### 4. Atwater Thermodynamic Energy Invariant
$$\text{Energy}_{\text{Atwater}} = (4.0 \times \text{Protein}_{\text{g}}) + (4.0 \times \text{Carbohydrates}_{\text{g}}) + (9.0 \times \text{Fat}_{\text{g}})$$
$$|\text{Declared Calories} - \text{Energy}_{\text{Atwater}}| \le \max\left(20.0, 0.20 \times \text{Energy}_{\text{Atwater}}\right)$$
*Rationale*: Food energy is derived from biological macronutrient oxidation. Declared caloric values that diverge by $> 20\%$ indicate mislabeling or analytical error.

---

## 6. Complete End-to-End User Journeys

### Journey A: Clinical Biometric Onboarding & Calibration
```
[User Registration] ──> [Biometric Form] ──> [Select Conditions] ──> [Dynamic BMR/TDEE] ──> [Target Budget]
```
1. Consumer registers or signs in via Supabase Auth.
2. Enters demographic biometrics: Age (28), Sex (Male), Height (178cm), Weight (76.5kg), Target Weight (72.0kg), Activity (Moderately Active), Goal (Moderate Fat Loss).
3. Selects active clinical condition: *Hypertension (Stage 1)*.
4. Engine calculates BMR ($1742.5\text{ kcal}$), TDEE ($2700.9\text{ kcal}$), sets fat-loss caloric target ($2214\text{ kcal}$), and clamps daily sodium ceiling to $1500\text{mg}$.

### Journey B: Multi-Modal Daily Food Logging
```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Breakfast:      │  ==>  │ Lunch:          │  ==>  │ Afternoon Snack:│  ==>  │ Evening Wrap-Up:│
│ Manual Search   │       │ AI Plate Vision │       │ Packaged 1-Tap  │       │ Water & Insights│
│ Moong Chilla    │       │ Thali Photo     │       │ Tedhe Medhe     │       │ 750ml Hydration │
│ 240 kcal logged │       │ 352 kcal logged │       │ 134 kcal logged │       │ Insights Alert  │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```
1. **Breakfast**: User searches *"Moong"* $\rightarrow$ logs 2 Moong Dal Chillas ($240\text{ kcal}$, $14\text{g}$ protein) to `breakfast` slot.
2. **Lunch**: User takes a photo of a lunch thali $\rightarrow$ `POST /meals/scan-plate` segments Toor Dal, Roti, and Salad $\rightarrow$ User adjusts portion grams in `PlateReviewModal` $\rightarrow$ commits via `POST /meals/confirm-plate-log` to `lunch` slot ($352\text{ kcal}$).
3. **Snack**: User scans a packaged snack $\rightarrow$ `POST /packaged/analyze` generates ICMR score ($42/100$, Palm Oil detected) $\rightarrow$ User logs half a pack ($25\text{g}$) to `snack` slot via `POST /packaged/log-to-diary`.
4. **Hydration & Insights**: User logs $750\text{ml}$ water $\rightarrow$ views daily diary totals ($726\text{ kcal}$, $750\text{ml}$ water) and retrieves clinical insights (`GET /api/v1/insights/daily`).

---

## 7. REST API Reference & Specification

All API endpoints follow the standardized BiteIQ envelope format:

### Standard Response Envelope
```json
{
  "status": "success",
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-13T16:00:00Z",
    "version": "0.1.0"
  }
}
```

### Route Catalog

| HTTP Method | Route Endpoint | Auth Required | Description |
|:---|:---|:---|:---|
| `GET` | `/health` | No | Root liveness diagnostic probe |
| `GET` | `/api/v1/health` | No | Subsystem readiness probe (database, cache) |
| `GET` | `/api/v1/profile` | Bearer JWT | Retrieve user biometrics, conditions, and active macro budget |
| `PUT` | `/api/v1/profile` | Bearer JWT | Upsert biometrics, recalculate BMR/TDEE and clinical ceilings |
| `GET` | `/api/v1/profile/macro-budget` | Bearer JWT | Retrieve today's effective macro budget and clinical limits |
| `GET` | `/api/v1/diary` | Bearer JWT | Retrieve full daily diary (totals consumed, remaining, 4 meal slots) |
| `POST` | `/api/v1/diary/log-item` | Bearer JWT | Log an individual food item to a meal slot |
| `PUT` | `/api/v1/diary/entry/{entry_id}` | Bearer JWT | Update quantity/portion of an existing logged entry |
| `DELETE` | `/api/v1/diary/entry/{entry_id}` | Bearer JWT | Delete a logged entry and atomically recalculate totals |
| `POST` | `/api/v1/diary/water` | Bearer JWT | Log water hydration increment in milliliters |
| `POST` | `/api/v1/meals/scan-plate` | Bearer JWT | Analyze meal plate photograph via multimodal vision pipeline |
| `POST` | `/api/v1/meals/confirm-plate-log` | Bearer JWT | Confirm and commit reviewed meal plate items to food diary |
| `POST` | `/api/v1/packaged/analyze` | Bearer JWT | Analyze front and back packaged food images for ICMR profiling |
| `POST` | `/api/v1/packaged/log-to-diary` | Bearer JWT | One-tap bridge logging a scanned packaged food into a meal slot |
| `GET` | `/api/v1/packaged/history` | Bearer JWT | Retrieve historical packaged food audits |
| `GET` | `/api/v1/foods/search` | Bearer JWT | Autocomplete search across verified Indian reference food database |
| `GET` | `/api/v1/insights/daily` | Bearer JWT | Retrieve personalized clinical health insights and contraindications |

### Example Request & Response: Packaged Food Analysis

```bash
curl -X POST "http://localhost:8000/api/v1/packaged/analyze" \
  -H "Authorization: Bearer <JWT_ACCESS_TOKEN>" \
  -F "front_image=@snack_front.jpg;type=image/jpeg" \
  -F "back_image=@snack_back.jpg;type=image/jpeg" \
  -F "product_name_hint=Bingo! Tedhe Medhe"
```

```json
{
  "status": "success",
  "data": {
    "audit_id": "8f3b2c1a-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    "product_name": "Bingo! Tedhe Medhe Masala Tadka",
    "brand_name": "Bingo! (ITC)",
    "health_score": 42.0,
    "has_palm_oil": true,
    "nutrients_per_100g": {
      "energy_kcal": 536.0,
      "protein_g": 6.8,
      "carbs_g": 54.0,
      "fat_g": 32.5,
      "saturated_fat_g": 14.8,
      "sodium_mg": 890.0
    },
    "badges": [
      {
        "label": "Industrial Palm Oil Detected",
        "type": "danger",
        "description": "Contains Palmolein, increasing saturated fatty acid intake."
      },
      {
        "label": "High Sodium Item",
        "type": "warning",
        "description": "Sodium concentration exceeds 600mg per 100g."
      }
    ],
    "healthier_alternatives": [
      "Roasted Makhana with mild Himalayan pink salt and turmeric",
      "Air-Popped Spiced Chana (Bengal Gram)"
    ]
  }
}
```

---

## 8. Repository Structure

```text
BiteIQ/
├── frontend/                          # React 19 + TypeScript + Vite SPA
│   ├── e2e/                           # Playwright End-to-End Test Suite
│   │   ├── scan_flow.spec.ts          # Scanner UI flow specs
│   │   └── user_journeys.spec.ts      # Core user journey automated specs
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                # Button, Badge, Card, Modal, Toast
│   │   │   ├── diary/                 # FoodLoggerModal, MealSlotCard, WaterTracker
│   │   │   ├── health/                # HealthBadgeGroup, NutrientRow, ColorsAudit
│   │   │   ├── layout/                # Navbar, BottomNav, PageContainer
│   │   │   ├── meals/                 # PlateReviewModal, BoundingBoxOverlay
│   │   │   └── scanner/               # Camera capture and downsampling modal
│   │   ├── pages/consumer/            # Dashboard, Diary, Settings, Audit Result
│   │   ├── store/                     # useProfileStore, useDiaryStore (Zustand)
│   │   ├── types/                     # TypeScript clinical & API data models
│   │   └── utils/                     # Axios API client, formatting utilities
│   ├── nginx.conf                     # Production container Nginx SPA routing
│   ├── vercel.json                    # Vercel SPA rewrites & security headers
│   └── package.json
│
├── backend/                           # Python FastAPI REST Core
│   ├── src/
│   │   ├── api/v1/                    # Version 1 Router & Endpoints
│   │   │   ├── endpoints/             # diary, foods, health, insights, meals, packaged, profile
│   │   │   └── router.py              # Central API v1 router mounting
│   │   ├── core/                      # Config (Pydantic Settings), DB, Security, Cache
│   │   ├── models/                    # SQLAlchemy ORM Models (User, Profile, Diary, Meal)
│   │   ├── schemas/                   # Pydantic v2 Request/Response Validation Envelopes
│   │   └── services/                  # ClinicalEngine, MassInvariants, NutritionCalc
│   ├── tests/                         # Pytest Comprehensive Test Suite (104 Tests)
│   │   ├── conftest.py                # In-memory async SQLite engine & JWT fixtures
│   │   ├── test_clinical_engine.py    # 8 disease rulebook unit assertions
│   │   ├── test_e2e_journeys.py       # Full lifecycle Journey A & B integration test
│   │   ├── test_edge_cases_phase6.py  # Mass invariants, comorbidity & fallback edge cases
│   │   ├── test_security_phase6.py    # JWT, JTI denylist, RBAC, tenant isolation tests
│   │   └── ...                        # Additional endpoint and database tests
│   ├── alembic/                       # Database schema migration scripts
│   └── requirements.txt
│
├── ai/                                # Perceptual Vision & Label Intelligence
│   └── src/
│       └── pipeline/
│           ├── plate_agent.py         # AI Meal Plate Vision Agent (PlateVisionAgent)
│           └── health_agent.py        # Packaged Food Multimodal Agent (MultimodalHealthAgent)
│
├── Dockerfile                         # Production multi-stage backend container (unprivileged user)
├── docker-compose.yml                 # Local multi-service production parity stack
├── render.yaml                        # Render cloud deployment specification
└── README.md
```

---

## 9. Installation & Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+ and npm 10+
- Docker & Docker Compose (optional, for containerized local stack)

### 1. Clone the Repository
```bash
git clone https://github.com/z-lovejeet/PackDrishti.git biteiq
cd biteiq
```

### 2. Backend Setup
```bash
# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment variables
cp backend/.env.example backend/.env

# Run database migrations
cd backend && alembic upgrade head && cd ..

# Start the FastAPI development server
uvicorn backend.src.main:app --host 0.0.0.0 --port 8000 --reload
```
The API is available at `http://localhost:8000`. Swagger documentation is accessible at `http://localhost:8000/api/v1/docs`.

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Configure environment variables
cp .env.example .env

# Launch the Vite development server
npm run dev
```
The React frontend is available at `http://localhost:5173`.

### 4. Running the Complete Stack with Docker Compose
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Database Adminer GUI: `http://localhost:8080`

---

## 10. Testing, Quality Assurance & Benchmarks

The BiteIQ test suite enforces complete coverage across security, clinical algorithms, and end-to-end user journeys:

### Run Complete Pytest Suite
```bash
python3 -m pytest backend/tests/ -v
```
**Results**:
- `test_security_phase6.py`: 11 passed (JWT forgery, expiration, JTI denylist, RBAC, tenant isolation, rate limit 429, XSS/SQLi sanitization, multipart MIME check).
- `test_edge_cases_phase6.py`: 9 passed (Mass invariant fuzzing, thermodynamic laws, Atwater auto-correction, comorbidity resolution, extreme biometrics, dual-LLM fallback).
- `test_e2e_journeys.py`: 1 passed (Complete multi-step simulation of Journeys A, B.1, B.2, B.3, B.4).
- Total: **104 passed in ~31s with zero failures**.

### Run Frontend Lint & Build Benchmarks
```bash
cd frontend

# Run Oxlint
npm run lint

# Run Production TypeScript Build
npm run build
```
**Results**:
- Oxlint: **0 errors**.
- Vite Build: Compiles in **$393\text{ms}$** with zero TypeScript errors.

---

## 11. Production Cloud Deployment Blueprint

```
                      GitHub Repository (origin/main)
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
        Vercel Cloud CI/CD                      Render Cloud CI/CD
     (Frontend React 19 SPA)                 (Backend FastAPI Container)
     - Root Directory: frontend/             - Config: render.yaml / Dockerfile
     - Build: npm run build                  - Port: 8000 (Dynamic $PORT)
     - Static Rewrites: vercel.json          - Health Check: /health
     - Cache: /assets/ (immutable)           - Region: Singapore
                 │                                       │
                 └───────────────────┬───────────────────┘
                                     ▼
                        BiteIQ Production Ecosystem
```

### Environment Variables Matrix

| Variable Name | Service | Description | Example / Default |
|:---|:---|:---|:---|
| `APP_ENV` | Backend | Environment flag | `production` |
| `DEBUG` | Backend | Debug mode toggle | `false` |
| `PORT` | Backend | HTTP server port | `8000` |
| `DATABASE_URL` | Backend | PostgreSQL connection URI | `postgresql://user:pass@host:5432/biteiq_db` |
| `JWT_SECRET_KEY` | Backend | HS256 JWT signature secret | `64-character-hex-secret` |
| `CORS_ORIGINS` | Backend | Permitted client origins | `https://biteiq.vercel.app,http://localhost:5173` |
| `GEMINI_API_KEY` | Backend | Google Gemini API key | `AIzaSy...` |
| `GROQ_API_KEY` | Backend | Groq Cloud API key | `gsk_...` |
| `VITE_API_BASE_URL` | Frontend | Target backend API URL | `https://biteiq-backend.onrender.com/api/v1` |

---

## 12. Zero-Emoji Compliance & Design System

In compliance with civic software engineering standards:
- **Iconography**: Powered exclusively by the Phosphor icon family (`@phosphor-icons/react`), using structured weights (`regular`, `bold`, `fill`).
- **Typography**: 
  - Headings & Labels: `Plus Jakarta Sans` (geometric, modern, authoritative).
  - Numeric Stats & Nutrients: `JetBrains Mono` (tabular, monospace clarity).
- **Color Palette**:
  - Backgrounds: Dark Slate `#090D16`, `#0F172A`, `#1E293B`.
  - Brand Accents: Emerald `#10B981`, Mint `#34D399`.
  - Clinical Alerts: Rose `#F43F5E`, Amber `#F59E0B`, Sky `#38BDF8`.
- **Zero-Emoji Policy**: Zero unicode emojis exist in source code, user interfaces, logs, or commit messages.

---

## 13. License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>BiteIQ Systems</b> · Engineered for Consumer Transparency & Clinical Precision
</div>
