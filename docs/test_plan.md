# MetroScan: Quality Assurance, Verification & Test Strategy Matrix
**Project ID**: SIH26034  
**Project Title**: Software System to Check Compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by Scanning Products, Images and Labels  
**Administering Ministry**: Ministry of Consumer Affairs, Food & Public Distribution, Department of Consumer Affairs (Legal Metrology Division), Government of India  
**Document Classification**: Complete Quality Assurance and Automated Testing Plan  
**Version**: 1.0.0 (SIH Evaluation Release)  
**Target Repository**: /Users/lovejeetsingh1/Documents/SIH  

---

## 1. Document Header & Quality Objectives

### 1.1 Mission and Quality Policy
MetroScan is an automated legal compliance auditing engine and nutritional safety platform designed to inspect packaged commodities under the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011, as well as the Consumer Protection Act, 2019 and ICMR-NIN nutritional safety guidelines. Because the platform serves both enforcement officers (field inspectors issuing statutory notices under Section 36(1)) and everyday citizens, software reliability, mathematical accuracy, and deterministic rule validation are mission-critical.

This document establishes the comprehensive quality assurance architecture, test automation pyramid, detailed statutory test suites, cross-browser responsiveness standards, security penetration defenses, and CI/CD gatekeeper workflows. The overriding objective is to guarantee zero critical defects, eliminate statutory miscalculations, and ensure seamless performance during the Smart India Hackathon (SIH) live evaluation.

### 1.2 Core Quality Objectives
1. **Zero Critical Bugs (Severity-1)**: Zero tolerance for application crashes, unhandled 500 API exceptions, database deadlocks, memory exhaustion, or unrendered statutory violations during the live jury evaluation.
2. **Deterministic Statutory Rule Verification**: 100% deterministic, mathematically verifiable accuracy across all codified provisions of the Legal Metrology (Packaged Commodities) Rules, 2011:
   - Rule 6(1)(a): Complete manufacturer/packer/importer identity and postal address with valid PIN.
   - Rule 6(1)(aa): Country of origin for imported goods.
   - Rule 6(1)(b): Generic commodity nomenclature.
   - Rule 6(1)(c) & Rule 13: Net quantity declared strictly in standardized SI metric units without non-standard abbreviations.
   - Rule 6(1)(d): Month and year of manufacture, packing, or import.
   - Rule 6(1)(e): Maximum Retail Price (MRP) including the mandatory "inclusive of all taxes" clause.
   - Rule 6(1)(e) Second Proviso: Accurate Unit Sale Price (USP) computation and rounding within 1% statutory tolerance.
   - Rule 6(1)(n): Consumer care contact coordinates comprising all four mandatory elements.
   - Rule 7 Table-I: Physical letter/numeral height verification relative to Principal Display Panel (PDP) area and Net Quantity tier.
   - Rule 9: Minimum color contrast ratio (WCAG >= 3.0:1) for text conspicuousness against background.
   - Rule 18(2A): Detection of altered price stickers or dual-MRP infractions.
3. **Rigorous Test Coverage Thresholds**:
   - Backend Core Business Logic (Statutory Parsers, Font Engine, Health Scorer): >= 92% statement coverage.
   - Backend API Endpoints (FastAPI Integration Layer): >= 88% branch coverage.
   - Frontend UI Components and State Flows: >= 82% line coverage.
4. **Machine Learning Optical Extraction Thresholds**:
   - Character Error Rate (CER): <= 3.5% on standard packaging typography.
   - Word Error Rate (WER): <= 6.0% across multi-language and complex product backgrounds.
   - Statutory Entity Extraction F1-Score: >= 0.92 on the ground truth packaging dataset.
5. **System Response SLAs**:
   - Single-panel compliance verification roundtrip: <= 4.5 seconds on standard CPU infrastructure.
   - Dual-panel nutritional safety audit roundtrip: <= 3.2 seconds.
   - FORM LM-INSP-2011 PDF inspection docket compilation: <= 1.8 seconds.
   - Client-side initial render and First Contentful Paint (FCP): <= 1.2 seconds.
6. **Regression Prevention**: An automated CI gatekeeper enforcing 0 test failures, strict linting, and coverage thresholds prior to code merging.

### 1.3 Defect Severity Classification Matrix

| Severity Level | Definition | Technical Examples | Maximum Resolution Time | Release Gate Action |
|---|---|---|---|---|
| Critical (S1) | Complete system failure, crash on image upload, data corruption, erroneous statutory violation citation, or security breach. | Unhandled 500 error on `/api/v1/scan/upload`, SQL injection vulnerability, application white-screen crash on mobile viewport. | 4 Hours | Immediate blocker; deployment halted. |
| Major (S2) | Primary workflow obstructed with no workaround, incorrect font size boundary calculation under Rule 7, or missing PDF docket export. | Rule 7 Table-I miscalculating font height for PDP = 100 cm2, nutrition badge failing to flag trans-fat exceeding 0.2g, JWT token refresh failure. | 12 Hours | Blocker for SIH demo build. |
| Medium (S3) | Secondary feature impaired, UI layout misalignment, or non-critical statutory note missing. | Contrast ratio tooltips clipping on tablet viewport, search filter pagination lag, non-standard unit warning showing minor phrasing discrepancy. | 24 Hours | Allowed in staging; resolved before final cut. |
| Minor (S4) | Cosmetic glitch, typo in explanatory text, or non-functional styling quirk. | Minor spacing discrepancy on history card footer, minor CSS hover transition jitter. | 48 Hours | Low priority; resolved in polish cycle. |

---

## 2. Testing Pyramid and Strategy

MetroScan adheres to a structured testing pyramid where fast, deterministic unit tests form the broad foundation, followed by integration tests, machine learning benchmarking, and browser-driven end-to-end user journeys.

```
                   /\
                  /  \
                 / E2E \             Playwright Cross-Browser Tests
                /-------\           (Consumer Flow, Health Audit, Officer Form)
               /         \
              /Integration\         FastAPI TestClient + In-Memory SQLite/PostgreSQL
             /-------------\       (Auth, Scan Upload, Health Analyze, Dashboard)
            /               \
           / ML Benchmarking \       50-Product Ground Truth Dataset
          /-------------------\     (CER, WER, IoU, Entity Extraction F1-Score)
         /                     \
        /      Unit Tests       \     Pytest (Backend) + Vitest (Frontend)
       /-------------------------\   (Rule 6, Rule 7, Font Calc, Health Engine, UI)
```

### 2.1 Layer Breakdown and Tooling Architecture

| Test Layer | Framework / Tools | Target Scope | Execution Environment | Target Frequency |
|---|---|---|---|---|
| Unit Testing (Backend) | Pytest, Pytest-Mock, Hypotheses | Rule 6 parser, Rule 7 Table-I mathematical calculator, Unit Sale Price (USP) calculator, ICMR-NIN nutrition classifier, JWT utility. | In-memory Python 3.11 virtualenv | Pre-commit hook & every file save |
| Unit Testing (Frontend) | Vitest, React Testing Library, jsdom | React components (`Scanner.tsx`, `HealthCheck.tsx`, `ComplianceCard.tsx`, `ReportModal.tsx`), Zustand state stores, utility helpers. | Node.js jsdom environment | Pre-commit hook & every file save |
| Integration Testing | FastAPI TestClient, SQLAlchemy, aiosqlite, pytest-asyncio | End-to-end API workflows, multipart file upload parsers, token authorization barriers, database transactions, PDF rendering. | Ephemeral SQLite / isolated PostgreSQL container | Every pull request & CI pipeline |
| ML Accuracy Benchmarking | Python 3.11, OpenCV, rapidfuzz, scikit-learn, jiwer | Optical recognition precision, bounding box localization (IoU), statutory field extraction F1-score, rule classification accuracy. | Benchmark container with test asset volume | Nightly CI & model update triggers |
| End-to-End (E2E) UI Testing | Playwright (TypeScript), Chromium, Firefox, WebKit | Complete browser simulation: Consumer label upload to report, Officer inspection to PDF print, mobile viewport touch workflows. | Headless multi-browser CI matrix & local browser UI | Pre-merge PR checks & staging deployment |
| Security & Penetration | OWASP ZAP, Bandit, Safety, Custom Payloads | SQL Injection, file upload MIME spoofing, directory traversal, vertical/horizontal privilege escalation, CORS/CSP enforcement. | Staging staging-api container | Weekly and pre-release audit |

---

## 3. Backend Unit & Integration Test Matrix

The backend test suite is organized under `/Users/lovejeetsingh1/Documents/SIH/backend/tests/` with strict separation between isolated unit tests and API integration workflows.

### 3.1 Authentication & RBAC Test Suite (`backend/tests/integration/test_auth_api.py`)

| Test ID | Test Scenario | Request Details | Mock / Preconditions | Expected Status | Statutory & Security Assertion Criteria |
|---|---|---|---|---|---|
| TC-AUTH-01 | Officer Login Success | `POST /api/v1/auth/login`<br>Payload: `{"email": "inspector.gupta@gov.in", "password": "ValidPassword123"}` | Seeded officer account in database with active status and zone assigned. | `200 OK` | Returns `access_token`, `token_type: "bearer"`, `role: "officer"`, and valid badge number. Token decodes with HMAC-SHA256. |
| TC-AUTH-02 | Consumer Registration | `POST /api/v1/auth/register`<br>Payload: `{"email": "citizen@example.com", "password": "SecurePassword88", "full_name": "Aarav Sharma"}` | User does not previously exist in database. | `201 Created` | User created with default role `consumer`. Access token issued. Password hash strictly verifies Argon2id / bcrypt. |
| TC-AUTH-03 | Login Invalid Password | `POST /api/v1/auth/login`<br>Payload: `{"email": "inspector.gupta@gov.in", "password": "WrongPassword999"}` | Valid registered email address. | `401 Unauthorized` | Response body contains `{"detail": "Invalid email or password"}`. No internal stack trace or DB hint leaked. |
| TC-AUTH-04 | Expired JWT Token | `GET /api/v1/dashboard/metrics`<br>Header: `Authorization: Bearer <expired_token>` | Token crafted with `exp` timestamp in epoch past (-3600 seconds). | `401 Unauthorized` | Token rejected by dependency handler. Response body: `{"detail": "Token expired"}`. |
| TC-AUTH-05 | Tampered JWT Signature | `GET /api/v1/dashboard/metrics`<br>Header: `Authorization: Bearer <modified_signature_token>` | Valid header and payload modified with forged signature. | `401 Unauthorized` | JWT cryptographic verification fails. Response body: `{"detail": "Could not validate credentials"}`. |
| TC-AUTH-06 | Duplicate Registration | `POST /api/v1/auth/register`<br>Payload: `{"email": "inspector.gupta@gov.in", ...}` | Email already exists in user database. | `409 Conflict` | Unique constraint caught cleanly. Response body: `{"detail": "Email already registered"}`. |
| TC-AUTH-07 | Weak Password Rejection | `POST /api/v1/auth/register`<br>Payload: `{"email": "test@domain.com", "password": "123"}` | New registration payload. | `422 Unprocessable Entity` | Pydantic validation fails; requires min 8 chars, 1 uppercase, 1 numeric, 1 special character. |

### 3.2 Scanning & Image Upload Test Suite (`backend/tests/integration/test_scan_api.py`)

| Test ID | Test Scenario | Request Details | Preconditions / Input Payload | Expected Status | Functional & Statutory Assertion Criteria |
|---|---|---|---|---|---|
| TC-SCAN-01 | Standard Valid Image Upload | `POST /api/v1/scan/upload`<br>Multipart form data | 1.8MB JPEG image of packaged almonds; `pdp_area_cm2: 180.0`. | `200 OK` | Scan ID generated (`scan_id`); image saved to storage; declarations list populated with extracted values and bounding boxes. |
| TC-SCAN-02 | Corrupted Image Stream | `POST /api/v1/scan/upload`<br>Multipart form data | 500KB file with arbitrary binary noise (non-decodable byte stream). | `400 Bad Request` | Pillow / OpenCV image decode raises `UnidentifiedImageError`. Clean error: `{"detail": "Corrupted or unreadable image file"}`. |
| TC-SCAN-03 | Oversized File Upload | `POST /api/v1/scan/upload`<br>Multipart form data | 14.5MB JPEG file exceeding statutory max threshold (10MB). | `413 Payload Too Large` | Request filtered at API gateway / middleware prior to OCR ingestion. Clean error message returned. |
| TC-SCAN-04 | Automatic PDP Estimation | `POST /api/v1/scan/upload`<br>Multipart form data | Valid 2MB image; `pdp_area_cm2` parameter omitted or set to `null`. | `200 OK` | Background contour analysis calculates bounding package area; `pdp_estimated: true` returned; font rules calculated against estimate. |
| TC-SCAN-05 | MIME Disguised Executable | `POST /api/v1/scan/upload`<br>Multipart form data | Shell script `exploit.sh` renamed to `exploit.jpg` with `Content-Type: image/jpeg`. | `415 Unsupported Media Type` | Magic byte inspection (`python-magic`) detects `text/x-shellscript` rather than `image/jpeg`. Upload rejected immediately. |
| TC-SCAN-06 | Low-Resolution Image Guard | `POST /api/v1/scan/upload`<br>Multipart form data | Low-res image (150x150 pixels, DPI < 72). | `200 OK` | Processed with low-confidence flag: `{"ocr_confidence": 0.42, "warnings": ["Image resolution below 300 DPI recommendation"]}`. |

### 3.3 Statutory Rule 6 Declarations Unit Suite (`backend/tests/unit/test_rules.py`)

| Test ID | Statutory Reference | Test Scenario & Synthetic Declaration | Expected Classification | Penalty & Legal Citation Assertion |
|---|---|---|---|---|
| TC-R6-01 | Rule 6(1)(a) | Manufacturer address: `"Pinnacle Foods Ltd, Plot 14, Phase II, IMT Manesar, Gurugram, Haryana - 122050"` | Compliant | PIN `122050` verified by regex `^[1-9][0-9]{5}$`. City, State, and corporate entity name identified. |
| TC-R6-02 | Rule 6(1)(a) | Manufacturer address: `"PureBliss Snacks, Industrial Area, Noida, Uttar Pradesh (No PIN)"` | Violation | Omission of 6-digit postal index number violates Rule 6(1)(a). Actionable under Section 36(1) of Legal Metrology Act, 2009. |
| TC-R6-03 | Rule 6(1)(c) & Rule 13 | Net Quantity declared as `"Net Weight: 250 gms"` | Violation | Rule 13 strictly prohibits plural or non-standard metric symbols (`gms`, `gm`, `g.`). Statutory unit must be strictly `"g"`. |
| TC-R6-04 | Rule 6(1)(c) & Rule 13 | Net Quantity declared as `"Volume: 1.5 ltrs"` | Violation | Non-standard symbol `"ltrs"`. Statutory metric unit under Schedule-II must be `"l"` or `"L"`. |
| TC-R6-05 | Rule 6(1)(c) & Rule 13 | Net Quantity declared as `"Net Qty: 500 g"` | Compliant | Standard symbol `"g"` preceded by space. Quantity parsed correctly into numeric 500 and unit `"g"`. |
| TC-R6-06 | Rule 6(1)(d) | Manufacturing date declared as `"MFD: 04/2026"` | Compliant | Valid month/year representation matching format `MM/YYYY` under Rule 6(1)(d). |
| TC-R6-07 | Rule 6(1)(d) | Manufacturing date declared as `"Packed: 2026"` | Violation | Omission of month violates Rule 6(1)(d). Must declare both month and year of manufacture/packing. |
| TC-R6-08 | Rule 6(1)(e) | MRP declared as `"MRP Rs. 199.00"` (Omission of tax clause) | Violation | Rule 6(1)(e) mandates the explicit qualifier `"(inclusive of all taxes)"` or equivalent statutory phrasing. |
| TC-R6-09 | Rule 6(1)(e) | MRP declared as `"MRP Rs. 199.00 (incl. of all taxes)"` | Compliant | Qualifying tax clause detected and validated. Clean float extracted: `199.00`. |
| TC-R6-10 | Rule 6(1)(e) 2nd Proviso | Package Net Qty: 400g, MRP: Rs. 200.00. Declared USP: `"Rs. 0.60 / g"` | Violation | Actual USP is Rs. 0.50 / g (`200 / 400`). Deviation = 20.0%, exceeding the maximum statutory tolerance of 1.0%. |
| TC-R6-11 | Rule 6(1)(e) 2nd Proviso | Package Net Qty: 2.5 kg, MRP: Rs. 350.00. Declared USP: `"Rs. 140.00 / kg"` | Compliant | Statutory USP for packages > 1kg declared in kilograms. Exact calculation: `350 / 2.5 = 140.00`. Zero deviation. |
| TC-R6-12 | Rule 6(1)(n) | Consumer Care: `"Email: care@company.in, Phone: 1800-200-1111"` (Missing postal address & executive name) | Violation | Rule 6(1)(n) mandates 4 distinct coordinates: Name/Designation, Address, Telephone, and Email. |
| TC-R6-13 | Rule 6(1)(aa) | Imported item without Country of Origin statement | Violation | Omission of Country of Origin violates Rule 6(1)(aa). Critical violation for customs and retail distribution. |

### 3.4 Statutory Rule 7 Table-I Font Calculations Suite (`backend/tests/unit/test_font_calc.py`)

Rule 7 Table-I establishes minimum letter and numeral heights (in millimeters) based on Principal Display Panel (PDP) area and Net Quantity. The test suite exercises exact boundary conditions.

#### Statutory Table-I Ground Truth Specification
- **PDP Area <= 50 cm2**:
  - Net Qty <= 200 g/ml: Minimum Height = **1.5 mm** (Normal) / **1.0 mm** (Blown/Formed)
  - Net Qty 200g - 1kg: Minimum Height = **2.0 mm** (Normal) / **1.5 mm** (Blown/Formed)
- **50 cm2 < PDP Area <= 100 cm2**:
  - Net Qty <= 200 g/ml: Minimum Height = **2.0 mm** (Normal) / **1.5 mm** (Blown/Formed)
  - Net Qty 200g - 1kg: Minimum Height = **3.0 mm** (Normal) / **2.0 mm** (Blown/Formed)
  - Net Qty > 1kg: Minimum Height = **4.0 mm** (Normal) / **3.0 mm** (Blown/Formed)
- **100 cm2 < PDP Area <= 500 cm2**:
  - Net Qty <= 200 g/ml: Minimum Height = **2.5 mm** (Normal) / **2.0 mm** (Blown/Formed)
  - Net Qty 200g - 1kg: Minimum Height = **4.0 mm** (Normal) / **3.0 mm** (Blown/Formed)
  - Net Qty > 1kg: Minimum Height = **6.0 mm** (Normal) / **4.0 mm** (Blown/Formed)
- **PDP Area > 500 cm2**:
  - Net Qty <= 200 g/ml: Minimum Height = **4.0 mm**
  - Net Qty > 200g: Minimum Height = **6.0 mm**

| Test ID | PDP Area (cm2) | Net Qty (g/ml) | Measured Font (mm) | Packaging Type | Expected Threshold (mm) | Compliance Verdict |
|---|---|---|---|---|---|---|
| TC-FNT-01 | 50.0 (Boundary) | 150 g | 1.4 mm | Standard Printed | 1.5 mm | Violation (-0.1 mm) |
| TC-FNT-02 | 50.0 (Boundary) | 150 g | 1.5 mm | Standard Printed | 1.5 mm | Compliant (Exact boundary) |
| TC-FNT-03 | 50.1 (Boundary) | 150 g | 1.8 mm | Standard Printed | 2.0 mm | Violation (Stepped into > 50 tier) |
| TC-FNT-04 | 100.0 (Boundary) | 500 g | 3.0 mm | Standard Printed | 3.0 mm | Compliant (Exact boundary) |
| TC-FNT-05 | 100.1 (Boundary) | 500 g | 3.8 mm | Standard Printed | 4.0 mm | Violation (Stepped into > 100 tier) |
| TC-FNT-06 | 180.0 | 200 g | 2.8 mm | Standard Printed | 2.5 mm | Compliant (+0.3 mm buffer) |
| TC-FNT-07 | 500.0 (Boundary) | 1200 g | 6.0 mm | Standard Printed | 6.0 mm | Compliant (Exact boundary) |
| TC-FNT-08 | 500.1 (Boundary) | 1200 g | 5.8 mm | Standard Printed | 6.0 mm | Violation (-0.2 mm) |
| TC-FNT-09 | 75.0 | 500 g | 2.2 mm | Blown / Molded Glass | 2.0 mm | Compliant (Table-I Footnote allowance) |
| TC-FNT-10 | 250.0 | 500 g | Width/Height = 0.25 | Standard Printed | Width >= 0.33 Height | Violation under Rule 7(3) (Narrow font) |

### 3.5 Consumer Health & Nutritional Audit Test Suite (`backend/tests/unit/test_health_engine.py`)

| Test ID | Test Case Description | Input Nutritional Values (per 100g) | Evaluated Thresholds | Expected Badges & Output Score |
|---|---|---|---|---|
| TC-HLTH-01 | High Sugar Threshold Exceeded | Sugar: 34.5g, Added Sugar: 28.0g, Sodium: 120mg, Trans Fat: 0.0g | ICMR limit for Sugar: 10.0g/100g. Added sugar exceeds by 460%. | Badge: `High Sugar` (Danger). Health Score: <= 45/100. Dietary advisory flags diabetes risk. |
| TC-HLTH-02 | Critical Industrial Trans Fat | Sugar: 5.0g, Saturated Fat: 4.0g, Trans Fat: 0.8g, Sodium: 200mg | FSSAI statutory maximum limit: 0.2g / 100g. | Badge: `Contains Industrial Trans Fat` (Critical Danger). Health Score penalized to <= 30/100. |
| TC-HLTH-03 | Excessive Sodium (Salt Hazard) | Sugar: 2.0g, Sodium: 650.0mg, Saturated Fat: 3.0g, Trans Fat: 0.0g | ICMR benchmark limit: 400.0mg / 100g. Exceeded by 62.5%. | Badge: `High Sodium` (Danger). Contraindication: Hypertension alert. |
| TC-HLTH-04 | High Saturated Fat Trigger | Sugar: 6.0g, Saturated Fat: 11.2g, Sodium: 180mg, Trans Fat: 0.1g | ICMR benchmark limit: 5.0g / 100g. | Badge: `High Saturated Fat` (Amber Warning). |
| TC-HLTH-05 | NOVA-4 Ultra-Processed Foods | Additives detected: Maltodextrin, INS 471, INS 621, High Fructose Corn Syrup | Synthetic emulsifiers + flavor enhancers. | Badge: `Ultra Processed Food` (Danger). Processing density: Level 4. |
| TC-HLTH-06 | Clean Whole Food Nutritional Profile | Sugar: 1.2g, Added Sugar: 0.0g, Sodium: 8mg, Trans Fat: 0.0g, Protein: 13.5g | All parameters below warning thresholds. | Health Score: >= 92/100. Badge: `Clean Nutritional Profile` (Green Compliant). |

---

## 4. Frontend E2E Playwright Test Scenarios

The E2E suite is implemented using Playwright with TypeScript under `/Users/lovejeetsingh1/Documents/SIH/frontend/e2e/`. Tests run headlessly in CI and capture trace logs and screenshots upon any failure.

### 4.1 Spec 1: Consumer Scanning Flow (`frontend/e2e/consumer_scan.spec.ts`)
- **Objective**: Validate that a citizen can access the portal, upload an image, review declarations, inspect compliance status, and view the saved scan record in history.
- **Preconditions**: Web application running at `http://localhost:5173/`. Clean state.

```typescript
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Consumer Label Verification Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('TC-E2E-01: Full scanning, compliance card rendering, and history logging', async ({ page }) => {
    // Step 1: Verify landing in Consumer Mode
    await expect(page.locator('header')).toContainText('MetroScan');
    const roleBadge = page.locator('[data-testid="current-role-badge"]');
    await expect(roleBadge).toContainText('Consumer Mode');

    // Step 2: Navigate to Scanner module
    const navScanner = page.locator('[data-testid="nav-scanner"]');
    await navScanner.click();
    await expect(page).toHaveURL(/.*scanner/);

    // Step 3: Trigger file upload with sample packaging image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('[data-testid="file-upload-dropzone"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, '../fixtures/sample_almonds_label.jpg'));

    // Step 4: Verify loading and optical processing state
    const processingBanner = page.locator('[data-testid="scan-processing-indicator"]');
    await expect(processingBanner).toBeVisible();

    // Step 5: Verify compliance dossier rendering
    const resultsContainer = page.locator('[data-testid="scan-results-container"]');
    await expect(resultsContainer).toBeVisible({ timeout: 8000 });

    // Verify statutory declaration rows
    const mfgDeclaration = page.locator('[data-testid="dec-row-manufacturer"]');
    await expect(mfgDeclaration).toContainText('SunLite Organics Pvt Ltd');
    await expect(mfgDeclaration.locator('[data-testid="status-chip"]')).toHaveText('Compliant');

    const netQtyDeclaration = page.locator('[data-testid="dec-row-net-quantity"]');
    await expect(netQtyDeclaration).toContainText('200 g');

    const mrpDeclaration = page.locator('[data-testid="dec-row-mrp"]');
    await expect(mrpDeclaration).toContainText('Rs. 240.00');

    // Verify overall compliance scorecard
    const scoreCard = page.locator('[data-testid="compliance-score-card"]');
    await expect(scoreCard).toBeVisible();
    await expect(scoreCard.locator('[data-testid="score-value"]')).toContainText('78.5');

    // Step 6: Verify navigation to History Ledger
    const navHistory = page.locator('[data-testid="nav-history"]');
    await navHistory.click();
    await expect(page).toHaveURL(/.*history/);

    // Confirm that the newly scanned item appears in the historical audit ledger
    const latestHistoryRow = page.locator('[data-testid="history-ledger-table"] tbody tr').first();
    await expect(latestHistoryRow).toContainText('SunLite Roasted Almonds');
    await expect(latestHistoryRow).toContainText('LM-SCAN-2026-9042');
  });
});
```

### 4.2 Spec 2: Consumer Health Check Flow (`frontend/e2e/health_audit.spec.ts`)
- **Objective**: Validate dual-panel image upload, extraction of nutritional facts table, computation of ICMR-NIN thresholds, and display of HFSS danger badges.

```typescript
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Consumer Nutritional Safety & Health Audit Flow', () => {
  test('TC-E2E-02: Dual panel upload, nutrient table parsing, and HFSS badge alerts', async ({ page }) => {
    await page.goto('/health');

    // Step 1: Upload Front Panel Image
    const frontUpload = page.locator('[data-testid="upload-front-panel"] input[type="file"]');
    await frontUpload.setInputFiles(path.join(__dirname, '../fixtures/cereal_front.jpg'));

    // Step 2: Upload Back Panel (Nutrition Table) Image
    const backUpload = page.locator('[data-testid="upload-back-panel"] input[type="file"]');
    await backUpload.setInputFiles(path.join(__dirname, '../fixtures/cereal_nutrition_back.jpg'));

    // Step 3: Trigger Audit Action
    const analyzeBtn = page.locator('[data-testid="btn-run-health-audit"]');
    await expect(analyzeBtn).toBeEnabled();
    await analyzeBtn.click();

    // Step 4: Verify Nutrition Table Extraction
    const nutrientTable = page.locator('[data-testid="nutrition-breakdown-table"]');
    await expect(nutrientTable).toBeVisible({ timeout: 7000 });

    // Validate Sugar row showing violation status
    const sugarRow = nutrientTable.locator('tr:has-text("Total Sugars")');
    await expect(sugarRow).toContainText('34.5 g');
    await expect(sugarRow.locator('.status-violation')).toBeVisible();

    // Step 5: Verify HFSS Badges
    const badgeContainer = page.locator('[data-testid="hfss-badge-container"]');
    await expect(badgeContainer.locator('[data-testid="badge-high-sugar"]')).toBeVisible();
    await expect(badgeContainer.locator('[data-testid="badge-ultra-processed"]')).toBeVisible();

    // Step 6: Verify Dietary Warnings Accordion
    const advisory = page.locator('[data-testid="dietary-advisory-section"]');
    await expect(advisory).toContainText('Individuals with Type-1 or Type-2 Diabetes');
  });
});
```

### 4.3 Spec 3: Officer Enforcement Flow (`frontend/e2e/officer_inspection.spec.ts`)
- **Objective**: Validate role switching to Legal Metrology Inspector, KPI dashboard rendering, violation filtering, and statutory FORM LM-INSP-2011 docket generation with print stylesheets.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Legal Metrology Officer Enforcement Flow', () => {
  test('TC-E2E-03: Officer authentication, KPI ledger filtering, and FORM LM-INSP-2011 docket print', async ({ page }) => {
    await page.goto('/');

    // Step 1: Open Role Switcher and select Officer Mode
    await page.locator('[data-testid="role-selector-button"]').click();
    await page.locator('[data-testid="role-option-officer"]').click();

    // Step 2: Authenticate in modal with officer credentials
    const loginModal = page.locator('[data-testid="officer-auth-modal"]');
    await expect(loginModal).toBeVisible();
    await page.locator('input[name="badge_number"]').fill('LM-DEL-2024-8841');
    await page.locator('input[name="password"]').fill('InspectorPass2026');
    await page.locator('[data-testid="btn-submit-officer-login"]').click();

    // Step 3: Verify Officer Dashboard UI and KPIs
    await expect(page).toHaveURL(/.*officer\/dashboard/);
    const kpiSummary = page.locator('[data-testid="officer-kpi-summary"]');
    await expect(kpiSummary).toContainText('Total Inspections');
    await expect(kpiSummary).toContainText('Violations Flagged');

    // Step 4: Filter ledger for violations in Food & Beverage
    await page.locator('[data-testid="filter-status-select"]').selectOption('violation');
    await page.locator('[data-testid="filter-category-select"]').selectOption('Food & Beverage');

    const inspectionRow = page.locator('[data-testid="inspection-row-LM-SCAN-2026-9042"]');
    await expect(inspectionRow).toBeVisible();
    await inspectionRow.click();

    // Step 5: Open Statutory Inspection Docket Modal
    const generateDocketBtn = page.locator('[data-testid="btn-generate-docket"]');
    await generateDocketBtn.click();

    const docketModal = page.locator('[data-testid="modal-form-lm-insp-2011"]');
    await expect(docketModal).toBeVisible();

    // Assert statutory citation headings and details inside docket
    await expect(docketModal).toContainText('FORM LM-INSP-2011');
    await expect(docketModal).toContainText('Rule 6(1)(n) & Rule 7 Table-I');
    await expect(docketModal).toContainText('Section 36(1) of Legal Metrology Act, 2009');
    await expect(docketModal).toContainText('Fine up to Rs. 25,000 for first offence');

    // Step 6: Emulate print media type and verify UI buttons are hidden
    await page.emulateMedia({ media: 'print' });
    const printButton = docketModal.locator('[data-testid="btn-execute-print"]');
    await expect(printButton).toBeHidden();
    const officialDocketHeader = docketModal.locator('[data-testid="docket-gov-header"]');
    await expect(officialDocketHeader).toBeVisible();
  });
});
```

---

## 5. Security & Penetration Testing Cases

To protect governmental enforcement records and ensure compliance with the Digital Personal Data Protection (DPDP) Act, 2023, MetroScan undergoes automated security and penetration test vectors.

| Test ID | Vulnerability Vector | Target Endpoint / Input | Attack Payload / Method | Severity | Security Countermeasure | Expected System Defense |
|---|---|---|---|---|---|---|
| TC-SEC-01 | SQL Injection (SQLi) | `GET /api/v1/dashboard/inspections` | Query parameter: `?category=Food' OR '1'='1' --` | High | SQLAlchemy Core ORM parameterization with prepared statements. | Query treated as literal string; returns 0 matches. No syntax error or data leakage. |
| TC-SEC-02 | SQL Injection via Stacked Queries | `GET /api/v1/history/search` | Query parameter: `?q=almonds'; DROP TABLE scans; --` | Critical | Read-only connection pools for search; parameterized input binding. | Query executed safely as plain text search; database structure unaffected. |
| TC-SEC-03 | Polyglot File Upload Shell Exploit | `POST /api/v1/scan/upload` | Valid JPEG header containing appended PHP webshell payload (`<?php system($_GET['cmd']); ?>`) or shell script `.sh`. | Critical | Byte inspection verifies strict image format; Pillow re-encodes image buffer, stripping foreign byte streams. | Malicious payload stripped; storage volume mounted with `noexec` flags. |
| TC-SEC-04 | Path Traversal via Filename | `POST /api/v1/scan/upload` | Multipart filename: `../../../../etc/passwd` or `..\\..\\windows\\system32\\cmd.exe`. | High | Backend discards user-supplied filenames; generates cryptographically random UUIDv4 identifiers. | File saved strictly as `<uuid4>.jpg` in sandboxed storage bucket. |
| TC-SEC-05 | Vertical Privilege Escalation | `GET /api/v1/dashboard/metrics` | Authorization header: `Bearer <consumer_token>` | High | Role-Based Access Control (RBAC) guard: `Depends(require_officer_role)`. | Request rejected with `403 Forbidden`: `{"detail": "Operation requires enforcement officer privileges"}`. |
| TC-SEC-06 | Horizontal Privilege Escalation (IDOR) | `GET /api/v1/scan/{scan_id}` | Consumer A attempts to fetch private scan report belonging to Consumer B. | Medium | Ownership verification query: `WHERE scan_id = :id AND user_id = :current_user`. | Request rejected with `404 Not Found` or `403 Forbidden`. |
| TC-SEC-07 | Cross-Site Scripting (Stored XSS) | `POST /api/v1/scan/upload` | Manufacturer name injected with script tag: `<script>alert(document.cookie)</script>` via mock OCR. | High | React DOM JSX automatic string escaping; Backend Pydantic sanitization filters. | Script rendered strictly as sanitized plain text; script execution prevented. |
| TC-SEC-08 | DoS / Unrestricted File Upload Bomb | `POST /api/v1/scan/upload` | Gzip decompression bomb (42KB compressed expanding to 10GB in memory). | High | Streaming upload size delimiter; Pillow decompression bomb protection: `Image.MAX_IMAGE_PIXELS = 89478485`. | Upload terminates when memory limit exceeded; returns `413 Payload Too Large`. |
| TC-SEC-09 | API Rate Limiting Bypass | `POST /api/v1/auth/login` | 150 login attempts within 30 seconds from single IP address. | Medium | Redis sliding-window rate limiter configured for max 10 requests / min on auth endpoints. | Requests exceeding 10 receive `429 Too Many Requests` with `Retry-After` header. |

---

## 6. Cross-Browser & Viewport Responsiveness Matrix

MetroScan must function seamlessly on field tablets and budget smartphones used by Legal Metrology inspectors, as well as high-resolution desktop displays used in enforcement headquarters.

### 6.1 Viewport Breakpoints and Hardware Target Matrix

| Device Profile | Viewport Resolution | Target Aspect Ratio | Primary Representative Device | Mandatory Layout Requirements |
|---|---|---|---|---|
| Desktop Large | 1920 x 1080 | 16:9 | 24-inch Office Monitor / Inspection Workstation | 3-column dashboard layout; sticky statutory reference drawer; side-by-side original label vs OCR overlay. |
| Desktop Standard | 1440 x 900 | 16:10 | Standard MacBook / ThinkPad Laptop | 2-column layout; compliance cards flex wrapped; responsive table with full column visibility. |
| Tablet Landscape | 1024 x 768 | 4:3 | iPad 10th Gen / Samsung Galaxy Tab A8 | Collapsed secondary sidebar; full width scanner viewport; touch-optimized buttons (min 44px). |
| Tablet Portrait | 768 x 1024 | 3:4 | Field Inspector Tablet (Portrait mount) | Stacked inspection cards; floating action button for camera shutter; modal dockets adapt to 95vw. |
| Mobile Large | 412 x 915 | 20:9 | Samsung Galaxy S23 / Pixel 8 | Single column vertical stream; bottom navigation bar; camera capture controls docked at bottom thumb zone. |
| Mobile Compact | 375 x 667 | 16:9 | iPhone SE (3rd Gen) / Budget Android Device | Hamburger navigation; compact nutrient status badges; horizontal scroll on raw OCR text dump. |

### 6.2 Browser Engine Compatibility Matrix

| Browser Engine | Representative Browsers | Minimum Tested Version | CSS Feature Testing Requirements | Pass Criteria |
|---|---|---|---|---|
| Chromium / Blink | Google Chrome, Microsoft Edge, Brave | Chrome 120+, Edge 120+ | CSS Grid, Flexbox gap, Backdrop Filter, CSS Container Queries. | Zero console warnings, 60fps scrolling, all modals correctly centered. |
| Gecko | Mozilla Firefox | Firefox 122+ | Form control styling, `@media print` layout rendering, PDF preview blob handling. | Accurate font metrics, print preview pagination matches specifications. |
| WebKit | Apple Safari, iOS Mobile Safari | Safari 16.4+, iOS 16.4+ | Safe area insets (`env(safe-area-inset-bottom)`), camera stream permission handler. | No 100vh viewport clipping on mobile address bar collapse. |

---

## 7. ML Accuracy Benchmarking Against 50-Product Ground Truth Dataset

To ensure optical parsing and statutory classification meet judicial standards, MetroScan is evaluated against a curated 50-product packaging ground truth dataset located in `/Users/lovejeetsingh1/Documents/SIH/ml/test_data/`.

### 7.1 Dataset Composition and Categorical Diversity
The benchmark suite consists of 50 high-resolution photographic captures representing standard Indian retail commodities across complex packaging topologies:
- **Food & Beverage (20 SKUs)**: Edible oils (flexible pouches), confectionery (foil wraps), spices (corrugated cartons), health drinks (cylindrical tins), extruded snacks (metallic bags).
- **Personal Care & Cosmetics (10 SKUs)**: Shampoos (curved plastic bottles), soaps (waxed paper), toothpaste (collapsible laminate tubes), face creams (jars with small PDP area < 50 cm2).
- **Home & Cleaning Products (8 SKUs)**: Detergent powders (heavy polybags), floor cleaners (handled bottles), insect repellents (cylindrical aerosol cans).
- **Pharmaceutical & Wellness (7 SKUs)**: OTC syrups (amber glass bottles), vitamin supplements (blister packs inside outer cartons).
- **Consumer Electronics & Accessories (5 SKUs)**: USB charging bricks, data cables, LED bulbs (small rectangular boxes with dense statutory declarations).

### 7.2 Optical & Statutory Evaluation Formulas
- **Character Error Rate (CER)**: Ratio of character substitutions, deletions, and insertions to total ground truth characters.
- **Word Error Rate (WER)**: Ratio of word substitutions, deletions, and insertions to total ground truth words.
- **Bounding Box Localization (Intersection-over-Union)**: Area of Overlap divided by Area of Union between predicted bounding polygon and annotated polygon.

### 7.3 Benchmark Acceptance Thresholds

| Pipeline Stage / Statutory Field | Primary Metric | Minimum Acceptance Threshold | SIH Demo Target |
|---|---|---|---|
| Bounding Box Localization (All Declarations) | mAP @ IoU 0.50 | >= 0.85 | >= 0.90 |
| Raw OCR Text Transcription | Character Error Rate (CER) | <= 4.0% | <= 2.8% |
| Raw OCR Word Transcription | Word Error Rate (WER) | <= 7.0% | <= 4.8% |
| Rule 6(1)(a) Manufacturer Name & Address | Entity Extraction F1-Score | >= 0.90 | >= 0.94 |
| Rule 6(1)(c) Net Quantity & Unit | Entity Extraction F1-Score | >= 0.95 | >= 0.98 |
| Rule 6(1)(e) Maximum Retail Price (MRP) | Entity Extraction F1-Score | >= 0.94 | >= 0.97 |
| Rule 6(1)(d) Month & Year of Packing | Entity Extraction F1-Score | >= 0.90 | >= 0.93 |
| Rule 6(1)(n) Consumer Care Coordinates | Entity Extraction F1-Score | >= 0.88 | >= 0.92 |
| Rule 7 Table-I Font Physical Measurement | Mean Absolute Error (MAE) | <= 0.25 mm | <= 0.15 mm |
| Overall Statutory Violation Classification | Accuracy / F1-Score | >= 0.92 | >= 0.96 |

### 7.4 Automated Evaluation Script Architecture (`ml/benchmark_eval.py`)
The benchmark script evaluates model predictions against ground truth JSON annotations:
1. Loads annotations from `ml/test_data/annotations/*.json`.
2. Passes corresponding images from `ml/test_data/images/*.jpg` through the optical pipeline.
3. Computes bounding box IoU and text similarity using Levenshtein distance.
4. Compiles an executive summary report and exits with non-zero exit code if the composite F1-score falls below 0.90.

---

## 8. CI/CD Automated Execution Workflow

The CI/CD pipeline enforces automated quality checks on every pull request targeting `main` or `develop`.

### 8.1 GitHub Actions Workflow Specification (`.github/workflows/qa_gatekeeper.yml`)

```yaml
name: MetroScan QA Gatekeeper & Automated Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  code-quality-lint:
    name: Code Quality & Static Analysis
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install Python Linters
        run: |
          pip install ruff bandit safety

      - name: Run Ruff Linter & Formatter Check
        run: |
          ruff check backend/
          ruff format --check backend/

      - name: Run Bandit Security Analysis
        run: |
          bandit -r backend/ -ll -ii

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Frontend Dependencies
        working-directory: frontend
        run: npm ci

      - name: Run Oxlint & TypeScript Typecheck
        working-directory: frontend
        run: |
          npx oxlint
          npx tsc --noEmit

  backend-unit-and-integration:
    name: Backend Pytest Suite & Coverage
    needs: code-quality-lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install Dependencies
        run: |
          pip install -r backend/requirements.txt
          pip install pytest pytest-cov pytest-asyncio httpx

      - name: Execute Pytest Suite with Coverage Enforcement
        run: |
          pytest backend/tests \
            --cov=backend/app \
            --cov-report=term-missing \
            --cov-report=xml \
            --cov-fail-under=85

  frontend-unit-tests:
    name: Frontend Vitest Suite
    needs: code-quality-lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Dependencies
        working-directory: frontend
        run: npm ci

      - name: Run Vitest Suite with Coverage
        working-directory: frontend
        run: npm run test:coverage

  playwright-e2e-matrix:
    name: Playwright E2E (${{ matrix.browser }})
    needs: [backend-unit-and-integration, frontend-unit-tests]
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Frontend Dependencies
        working-directory: frontend
        run: npm ci

      - name: Install Playwright Browsers
        working-directory: frontend
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Setup Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Start Backend Mock Server
        run: |
          pip install -r backend/requirements.txt
          uvicorn backend.app.main:app --port 8000 &
          sleep 3

      - name: Build and Serve Frontend
        working-directory: frontend
        run: |
          npm run build
          npx vite preview --port 5173 &
          sleep 2

      - name: Run Playwright Tests
        working-directory: frontend
        run: npx playwright test --project=${{ matrix.browser }}

      - name: Upload Playwright Failure Artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-artifacts-${{ matrix.browser }}
          path: frontend/playwright-report/

  ml-accuracy-regression:
    name: ML Model Accuracy Benchmarking
    needs: backend-unit-and-integration
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install ML Benchmark Dependencies
        run: |
          pip install opencv-python-headless rapidfuzz scikit-learn jiwer

      - name: Run ML Benchmark Regression
        run: |
          python ml/benchmark_eval.py --dataset ml/test_data --min-f1 0.90
```

---

## 9. SIH Live Evaluation Protocols & Jury Demonstration Checklist

During the Smart India Hackathon final evaluation, jury members perform rapid, rigorous assessments of software stability, legal accuracy, and real-world utility. This protocol ensures operational readiness.

### 9.1 Pre-Evaluation Environment Warmup Checklist

| Checkpoint | Action / Command | Expected Output | Contingency Plan |
|---|---|---|---|
| Server Health Check | `curl -f http://localhost:8000/api/v1/health` | `{"status": "healthy", "version": "1.0.0"}` | Restart backend container: `docker compose restart backend`. |
| Frontend Assets | `curl -I http://localhost:5173/` | `HTTP/1.1 200 OK` | Re-run `npm run build && npm run preview`. |
| Memory Overhead | `top -l 1 \| grep PhysMem` | Memory utilization < 65% | Flush caches, kill orphaned processes. |
| Camera Permission | Browser settings check on test device | Camera permission allowed for `localhost` | Fall back to pre-loaded high-resolution image gallery. |
| Test Asset Directory | `ls ml/test_data/images/ \| wc -l` | Count == 50 images | Test assets verified in persistent cache. |

### 9.2 Curated Live Test Pack Catalog
Five real-world physical commodities prepared for instant jury demonstration:
1. **Product Pack 1 (SunLite Roasted Almonds)**: Minor violation case. Compliant MRP and Net Quantity, but consumer care address is missing postal PIN, and letter height is 1.6mm against statutory 2.5mm under Rule 7 Table-I. Demonstrates font calculator and Section 36(1) show-cause notice generation.
2. **Product Pack 2 (Crunchy Choco Flakes)**: Health & Nutrition audit case. Sugar content 34.5g / 100g (exceeds ICMR 10g threshold). Demonstrates instant red HFSS warning badges and dietary risk profiling.
3. **Product Pack 3 (PureSpice Black Pepper)**: Strict Unit Violation case. Net quantity declared as `"50 gms"` rather than standard metric symbol `"g"`. Demonstrates Rule 13 detection engine.
4. **Product Pack 4 (Golden Valley Edible Mustard Oil)**: Deceptive Pricing case. Net volume 910ml, MRP Rs. 165. USP declared as Rs. 0.22/ml instead of true Rs. 0.181/ml (deviation > 1%). Demonstrates Rule 6(1)(e) Second Proviso auditing.
5. **Product Pack 5 (Pristine Organic Rolled Oats)**: Fully Compliant case. All mandatory Rule 6 declarations present, font size exceeds Table-I minimums, 0g added sugar, 0g trans fat. Demonstrates 100% compliance certificate generation.

### 9.3 Fallback and Resilience Protocols
- **Offline Mode Fallback**: If internet connectivity drops during venue evaluation, all ML inference automatically switches to local quantized OCR and rule models running on the evaluation host.
- **Latency Protection**: In the event of high OCR queue latency (> 5.0 seconds), client displays an animated progress bar indicating active statutory extraction phases: "Localizing Principal Display Panel" -> "Measuring Character Height" -> "Validating Rule 6 Citations".
- **Instant Reset Capability**: Single command `./scripts/reset_demo_state.sh` purges demo scans, resets officer test metrics, and repopulates the clean inspection ledger in under 3 seconds.

---

## 10. Summary and Sign-Off Matrix

| Role | Name | Responsibilities Verified | Status | Date |
|---|---|---|---|---|
| Technical Lead | Lead Developer | Overall architectural test strategy, CI gatekeeper rules | Verified | 2026-09-10 |
| Backend & Statutory Lead | Backend Architect | Rule 6, 7, 13, 18 parsers, font calculation boundary suites | Verified | 2026-09-10 |
| QA & E2E Engineer | Test Automation Lead | Playwright cross-browser matrix, responsiveness suite | Verified | 2026-09-10 |
| ML & Vision Engineer | Computer Vision Lead | 50-product ground truth dataset, CER/WER/F1 benchmarks | Verified | 2026-09-10 |
