# MetroScan: Engineering Team Strategy & Execution Plan
**Project ID**: SIH26034  
**Project Title**: Software System to Check Compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by Scanning Products, Images and Labels  
**Document Classification**: Engineering Work Allocation and Technical Execution Strategy  
**Version**: 1.0.0 (Production Execution Plan)

---

## 1. Team Composition & Role Allocations

The development team consists of four technical members. All soft skills, slide presentations, and non-technical tasks are excluded. Every member owns concrete codebases, automated pipelines, and measurable engineering deliverables.

```
+---------------------------------------------------------------------------+
|                          FOUR-MEMBER TEAM MATRIX                          |
+---------------------+---------------------+-------------------------------+
| ROLE                | PRIMARY TECH STACK  | KEY OWNED DIRECTORIES         |
+---------------------+---------------------+-------------------------------+
| Member 1: Frontend  | React 19, TS, Vite, | /src/pages, /src/components,  |
| Developer           | Tailwind, Phosphor  | /src/services, /src/hooks     |
+---------------------+---------------------+-------------------------------+
| Member 2: Backend   | Python FastAPI,     | /backend/routers, /models,    |
| Developer           | SQLAlchemy, Alembic | /backend/schemas, /services   |
+---------------------+---------------------+-------------------------------+
| Member 3: Data      | PaddleOCR, OpenCV,  | /ml/ocr_engine, /declaration, |
| Analyst / ML Eng.   | Python, Regex NER   | /ml/nutrition, /ml/test_data  |
+---------------------+---------------------+-------------------------------+
| Member 4: Tester &  | Playwright, Pytest, | /tests/e2e, /tests/api,       |
| DevOps Engineer     | Docker, GitHub CI   | /.github/workflows, /deploy   |
+---------------------+---------------------+-------------------------------+
```

---

### Member 1: Frontend Developer
**Core Objective**: Maintain, extend, and integrate the client-side single page application (SPA) with backend REST APIs and live streaming feeds.

#### Primary Responsibilities
1. **API Integration & State Management**:
   - Replace mock datasets (`mockProducts.ts`, `mockViolations.ts`, `mockHealthData.ts`, `mockDashboard.ts`) with live asynchronous API queries.
   - Build a centralized API service module (`src/services/api.ts`) using native `fetch` or `axios` with interceptors for JWT injection.
   - Implement authentication state management (`src/context/AuthContext.tsx`) and persistent role authorization.
2. **Scan Workflow & Real-Time Visualization**:
   - Implement drag-and-drop dual-panel upload handlers on `ScannerPage.tsx` and `HealthCheckPage.tsx`.
   - Implement client-side canvas image downsampling (max 2048px along the longest dimension) to minimize payload size before upload.
   - Render interactive bounding boxes with overlay labels over packaging images via `AnnotatedImage.tsx`.
3. **Statutory Report Generation & Client Print Engine**:
   - Refine `ReportViewerPage.tsx` print stylesheets (`@media print`) to render statutory inspection certificate FORM LM-INSP-2011 to standard A4 dimensions.
4. **Client-Side Resilience & Offline Cache**:
   - Implement `localStorage` caching for recent scans and officer session state to allow offline inspection continuity.

#### Key Files Owned
- `src/pages/consumer/*` (LandingPage, ScannerPage, HealthCheckPage, ProductHistoryPage)
- `src/pages/officer/*` (OfficerDashboardPage, InspectionsPage, ReportViewerPage)
- `src/components/*` (All UI widgets, layouts, cards, and modal components)
- `src/services/api.ts` [NEW]
- `src/context/AuthContext.tsx` [NEW]
- `src/hooks/useScan.ts`, `src/hooks/useAuth.ts` [NEW]

---

### Member 2: Backend Developer
**Core Objective**: Architect, develop, and maintain the FastAPI backend application, PostgreSQL database, authentication mechanisms, and statutory report rendering engine.

#### Primary Responsibilities
1. **API Gateway & Service Layer**:
   - Scaffold production-grade FastAPI application with structured routers (`/api/v1/auth`, `/api/v1/scan`, `/api/v1/health`, `/api/v1/reports`, `/api/v1/dashboard`).
   - Implement request validation, exception handlers, and standard JSON response envelopes using Pydantic v2.
2. **Database Modeling & Relational Integrity**:
   - Write SQLAlchemy 2.0 ORM models corresponding to the PRD schema (`users`, `product_scans`, `extracted_declarations`, `statutory_violations`, `compliance_reports`, `health_audits`).
   - Configure Alembic database migration scripts with automated rollback support.
3. **Authentication & Role-Based Access Control (RBAC)**:
   - Implement JWT token generation (HMAC-SHA256), bcrypt password hashing, and role verification dependencies (`verify_officer`, `verify_consumer`).
4. **Object Storage & File Handling**:
   - Implement multipart image upload streaming directly into Cloudflare R2 / AWS S3 storage buckets with SHA-256 integrity checks.
5. **Server-Side PDF Generation**:
   - Implement headless WeasyPrint or ReportLab PDF generator service to dynamically produce FORM LM-INSP-2011 certificates with embedded scan photos and legal violation notices.

#### Key Files Owned
- `backend/main.py`
- `backend/routers/` (auth.py, scan.py, health.py, reports.py, dashboard.py, violations.py)
- `backend/models/` (user.py, scan.py, violation.py, report.py, health.py)
- `backend/schemas/` (auth_schema.py, scan_schema.py, health_schema.py, report_schema.py)
- `backend/services/` (compliance_engine.py, pdf_generator.py, storage_service.py)
- `backend/core/` (security.py, config.py, database.py)
- `alembic/` (migration scripts)

---

### Member 3: Data Analyst / Machine Learning Engineer
**Core Objective**: Build, calibrate, and benchmark the computer vision, OCR, layout extraction, and legal metrology rules inference engine.

#### Primary Responsibilities
1. **Optical Character Recognition (OCR) Pipeline**:
   - Implement PaddleOCR (PP-OCRv4 with DBNet detection and SVTR recognition) optimized for English and Devnagari packaging text.
   - Implement image preprocessing pipeline using OpenCV: deskewing, noise filtering, and Adaptive CLAHE for reflective foil/plastic packaging.
2. **Statutory Entity Extraction & Rule 6 Parsing**:
   - Develop regex and heuristic Named Entity Recognition (NER) pipeline to parse:
     - Manufacturer names, addresses, and 6-digit PIN codes.
     - Net quantity with strict metric validation (flagging `gms`, `Kgs`, `ltrs`).
     - MRP with mandatory "inclusive of all taxes" clause.
     - Unit Sale Price (USP) and mathematical verification against net quantity.
     - Month and year of manufacture/packing.
     - Consumer care coordinates (department, address, phone, email).
3. **Physical Font Height Estimation & Rule 7 Table-I Engine**:
   - Develop pixel-to-millimeter calibration algorithm using standardized barcode (EAN-13) detection or container aspect ratio.
   - Compare measured letter heights against Table-I minimum thresholds for given PDP area.
4. **Rule 9 Contrast Ratio & Rule 18 Tamper Detection**:
   - Implement text foreground/background color extraction and WCAG 2.1 relative luminance calculation.
   - Build edge-discontinuity and sticker boundary detection algorithm to flag dual-MRP labels.
5. **Nutrition Table Parser & ICMR Health Engine**:
   - Detect tabular bounding boxes on packaging back panels.
   - Extract nutrient figures (sugars, sodium, fats) per 100g/ml and map to ICMR-NIN 2024 thresholds.
6. **Dataset Collection & Ground Truth Benchmarking**:
   - Curate a benchmark dataset of 50+ real Indian packaged commodities across food, cosmetics, and household categories.
   - Establish ground-truth annotations and run automated accuracy benchmarking.

#### Key Files Owned
- `ml/ocr_engine.py` (PaddleOCR inference wrapper)
- `ml/preprocessor.py` (OpenCV CLAHE, deskewing, binarization)
- `ml/declaration_extractor.py` (Rule 6 entity recognition)
- `ml/font_analyzer.py` (Rule 7 Table-I pixel-to-mm calculation)
- `ml/contrast_analyzer.py` (Rule 9 WCAG contrast engine)
- `ml/nutrition_parser.py` (Nutritional table detection and extraction)
- `ml/tamper_detector.py` (Rule 18 sticker/dual-MRP detection)
- `ml/compliance_pipeline.py` (Unified orchestrator)
- `ml/test_data/` (Annotated images, ground truth JSON)
- `ml/benchmarks/run_benchmarks.py` (Evaluation script)

---

### Member 4: Tester + DevOps Engineer
**Core Objective**: Maintain repository integrity, automated testing suites, continuous integration/deployment (CI/CD) pipelines, and cloud environments.

#### Primary Responsibilities
1. **Automated Testing Suites**:
   - Frontend E2E Testing: Implement Playwright test suites covering consumer scan flow, officer dashboard review, and report PDF export.
   - Backend Testing: Write comprehensive `pytest` test suites covering API endpoints, JWT authorization guards, and validation schemas.
   - ML Regression Testing: Build an automated evaluation harness that runs against the 50-product benchmark dataset to detect accuracy regressions.
2. **Continuous Integration & Delivery (CI/CD)**:
   - Configure GitHub Actions workflows:
     - Pull Request Checks: ESLint, TypeScript compiler check (`tsc --noEmit`), Python `flake8`, `mypy`, and pytest.
     - Staging Deployment: Automated deployment on merge to `dev` branch.
     - Production Release: Automated deployment on tagged releases to `main`.
3. **Containerization & Deployment Architecture**:
   - Write multi-stage `Dockerfile` for the backend application ensuring minimal image footprint.
   - Author `docker-compose.yml` orchestrating FastAPI, PostgreSQL, and local blob storage emulator for local development.
   - Configure hosting on Vercel/Netlify (Frontend) and Railway/Render (Backend).
4. **Security & Performance Auditing**:
   - Run automated security scans: OWASP Top 10 vulnerabilities, SQL injection checks, dependency vulnerability scanning (`npm audit`, `pip-audit`).
   - Execute load testing with Locust or k6 simulating concurrent image upload requests.

#### Key Files Owned
- `tests/e2e/*` (Playwright test specs)
- `tests/api/*` (Pytest API test modules)
- `tests/ml/*` (Accuracy verification tests)
- `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`
- `Dockerfile`, `docker-compose.yml`
- `scripts/seed_database.py`
- `scripts/load_test.py`

---

## 2. Sprint Calendar & Dependency Roadmap

The implementation plan spans five 2-week sprints (10 weeks total), starting 10 September 2026.

```
+---------------------------------------------------------------------------+
|                          10-WEEK SPRINT CALENDAR                          |
+---------------------------------------------------------------------------+
| SPRINT 1: Setup & Data Foundation      | 10 Sep 2026 - 23 Sep 2026       |
| SPRINT 2: Core APIs & Base OCR         | 24 Sep 2026 - 07 Oct 2026       |
| SPRINT 3: Legal Metrology Rule Engine  | 08 Oct 2026 - 21 Oct 2026       |
| SPRINT 4: Health Engine & Reports      | 22 Oct 2026 - 04 Nov 2026       |
| SPRINT 5: Hardening, Benchmarks & Demo | 05 Nov 2026 - 19 Nov 2026       |
+---------------------------------------------------------------------------+
```

### Sprint 1: Infrastructure, Schema & Baseline Setup (10 Sep - 23 Sep 2026)
- **Member 1 (Frontend)**: Scaffold `src/services/api.ts`, configure strict TypeScript interfaces matching backend models, and setup mock API interceptors.
- **Member 2 (Backend)**: Initialize FastAPI repository, configure PostgreSQL on Supabase/Railway, write SQLAlchemy models, and run initial Alembic migrations.
- **Member 3 (ML/Data)**: Setup PaddleOCR local inference pipeline; collect and annotate the first 25 real packaging label images.
- **Member 4 (Tester/DevOps)**: Setup GitHub repository with branch rules (`main`, `dev`); write Dockerfile; configure GitHub Actions CI workflow for linting and type checks.
- **Dependencies**: Backend needs PostgreSQL instance from DevOps. ML needs test images.
- **Sprint Goal**: Working CI pipeline, database provisioned, baseline ML OCR script running on sample images.

### Sprint 2: Core Authentication, Upload & OCR Ingestion (24 Sep - 07 Oct 2026)
- **Member 1 (Frontend)**: Implement login/registration UI; wire `AuthContext`; integrate image drag-and-drop file upload handler to call backend endpoint.
- **Member 2 (Backend)**: Implement `/api/v1/auth` endpoints; implement multipart `/api/v1/scan/upload` endpoint; connect file storage to Cloudflare R2 / S3.
- **Member 3 (ML/Data)**: Build OpenCV preprocessing module (CLAHE, deskewing); implement bounding box extraction and text extraction pipeline.
- **Member 4 (Tester/DevOps)**: Write `pytest` test suite for auth and upload endpoints; create database seeding script (`scripts/seed_database.py`).
- **Dependencies**: Frontend requires Backend auth endpoints. Backend requires ML OCR wrapper function.
- **Sprint Goal**: User can register, authenticate, and upload an image that stores in R2 and returns raw OCR text.

### Sprint 3: Legal Metrology Rules Engine Integration (08 Oct - 21 Oct 2026)
- **Member 1 (Frontend)**: Update `ScannerPage.tsx` to render dynamic bounding boxes on the packaging image and display real compliance declaration cards.
- **Member 2 (Backend)**: Implement compliance scoring service; build violation tracking endpoints (`/api/v1/violations`); link scan records to database.
- **Member 3 (ML/Data)**: Complete Rule 6 entity parser (MRP, net quantity, PIN, manufacturer); implement Rule 7 Table-I font height estimator and Rule 9 contrast calculator.
- **Member 4 (Tester/DevOps)**: Implement automated ML accuracy benchmark runner (`run_benchmarks.py`); write Playwright test for end-to-end scanner flow.
- **Dependencies**: Backend depends on ML rule parsing logic. Frontend depends on Backend `/api/v1/scan/upload` response schema.
- **Sprint Goal**: Full end-to-end scanner flow functioning with live OCR, Rule 6 validation, and Rule 7 font measurement.

### Sprint 4: Nutrition Health Engine & Statutory Report Generation (22 Oct - 04 Nov 2026)
- **Member 1 (Frontend)**: Wire `HealthCheckPage.tsx` to live health API; integrate `OfficerDashboardPage.tsx` with live analytics endpoints.
- **Member 2 (Backend)**: Implement WeasyPrint PDF generation for FORM LM-INSP-2011; build `/api/v1/dashboard/metrics` aggregation endpoints; build `/api/v1/health/analyze`.
- **Member 3 (ML/Data)**: Build back-panel nutrition table detection and value parser; map nutrients to ICMR-NIN thresholds and badge generator.
- **Member 4 (Tester/DevOps)**: Write Playwright tests for officer dashboard and PDF download; run security audit (SQL injection, XSS checks).
- **Dependencies**: Backend PDF generator depends on Frontend HTML/CSS certificate template. Backend health endpoint depends on ML nutrition parser.
- **Sprint Goal**: Health check scanning live; officer dashboard showing live aggregates; downloadable PDF inspection certificates.

### Sprint 5: Hardening, Optimization & Release Freeze (05 Nov - 19 Nov 2026)
- **Member 1 (Frontend)**: Optimize image upload compression; ensure responsive layout across tablet/mobile viewports; execute final cross-browser testing.
- **Member 2 (Backend)**: Add rate limiting (`slowapi`), optimize database indexes, implement payload caching for dashboard endpoints.
- **Member 3 (ML/Data)**: Optimize inference latency (target $< 8.0\text{s}$ total scan time); compile final benchmark accuracy report across 50 products.
- **Member 4 (Tester/DevOps)**: Conduct load testing (k6); verify production deployment on cloud infrastructure; prepare demo dataset and freeze release.
- **Dependencies**: All members dependent on DevOps green validation suite.
- **Sprint Goal**: Stable, verified production platform deployed with verified benchmark accuracy ready for SIH evaluation.

---

## 3. Technical Integration Touchpoints

```
+-----------------------------------------------------------------------------------------+
|                              INTEGRATION TOUCHPOINTS                                    |
+---------------------+-------------+-------------+------------+--------------------------+
| INTERFACE           | LEAD        | REVIEWER    | DEADLINE   | DELIVERABLE SPEC         |
+---------------------+-------------+-------------+------------+--------------------------+
| API Data Contract   | Backend     | Frontend    | Sprint 1   | OpenAPI JSON schema for  |
|                     |             |             |            | all request/responses    |
+---------------------+-------------+-------------+------------+--------------------------+
| ML Output Format    | ML Engineer | Backend     | Sprint 2   | JSON schema with text,   |
|                     |             |             |            | coords, and confidences  |
+---------------------+-------------+-------------+------------+--------------------------+
| Image Storage Keys  | Backend     | Frontend/ML | Sprint 2   | S3 bucket structure and  |
|                     |             |             |            | signed URL conventions   |
+---------------------+-------------+-------------+------------+--------------------------+
| Benchmark Data      | ML Engineer | Tester      | Sprint 2   | 50-product ground truth  |
|                     |             |             |            | dataset and JSON labels  |
+---------------------+-------------+-------------+------------+--------------------------+
| PDF Template Contract| Backend    | Frontend    | Sprint 4   | HTML/CSS template for    |
|                     |             |             |            | FORM LM-INSP-2011 PDF    |
+---------------------+-------------+-------------+------------+--------------------------+
| Production Config   | DevOps      | All Members | Sprint 5   | Environment secrets and  |
|                     |             |             |            | cloud domain deployment  |
+---------------------+-------------+-------------+------------+--------------------------+
```

---

## 4. Technology Selection Rationale

| Architecture Layer | Selected Technology | Alternate Evaluated | Technical Rationale |
|---|---|---|---|
| Frontend Framework | React 19 + TypeScript | Next.js / Vue | SPA structure provides fast client-side state handling and zero SSR complexity; TypeScript enforces strict typing. |
| Styling Framework | Tailwind CSS | Material UI / AntD | Utility classes enable precise civic design without overriding heavy default themes. |
| Icons Library | @phosphor-icons/react | Lucide / Heroicons | Consistent icon weights, professional statutory aesthetic, zero emoji dependencies. |
| Backend Framework | FastAPI (Python) | Django / Express | Native asynchronous handling, auto-generated OpenAPI documentation, direct interop with Python ML packages. |
| Relational Database | PostgreSQL 16 | MongoDB | Strong foreign-key constraints, ACID compliance for legal violation logs, native JSONB support for bounding boxes. |
| ORM Layer | SQLAlchemy 2.0 | Tortoise / Peewee | Industry-standard async ORM with robust Alembic migration management and connection pooling. |
| OCR Engine | PaddleOCR (PP-OCRv4) | Tesseract / Google Vision | Significantly higher accuracy on low-contrast curved text and Indian scripts than Tesseract; zero per-call API cost unlike Google Vision. |
| Object Storage | Cloudflare R2 / S3 | Local Disk | S3-compatible API with zero egress fees, crucial for heavy image scanning workloads. |
| PDF Engine | WeasyPrint | ReportLab | Uses standard HTML5 and CSS Paged Media to render pixel-perfect statutory forms without complex canvas scripting. |
| E2E Testing | Playwright | Cypress / Selenium | Cross-browser, native multi-tab support, and fast headless execution in GitHub Actions. |
| Containerization | Docker | Bare Metal VM | Predictable multi-stage builds ensuring identical environments across local dev, staging, and cloud production. |

---

## 5. Development Standards & Engineering Hygiene

1. **Git Branching Strategy**:
   - `main`: Protected production branch. Requires passing CI and 1 approving review. No direct pushes.
   - `dev`: Active integration branch. Deployed automatically to staging environment.
   - `feature/<name>`: Individual work branches branched off `dev`.
   - `fix/<name>`: Bugfix branches.
2. **Commit Conventions**:
   - Format: `[scope] Short imperative summary`
   - Allowed scopes: `frontend`, `backend`, `ml`, `devops`, `schema`, `tests`, `docs`
   - Example: `[backend] implement Rule 6 PIN verification in scan router`
3. **Pull Request Protocol**:
   - Every PR must link to a specific capability ID or task.
   - All automated CI checks (linter, unit tests, build validation) must be green.
   - Must be reviewed and approved by at least one peer developer.
4. **Code Quality & Type Enforcement**:
   - Frontend: ESLint with zero-warning threshold, TypeScript strict mode enabled (`noImplicitAny: true`).
   - Backend: PEP 8 adherence verified via `flake8`, types verified via `mypy`.
   - Python code formatted via `black` (line length 100) and `isort`.
5. **Environment Configuration**:
   - No hardcoded secrets, database URLs, or API keys in source code.
   - All configurations read from environment variables via Pydantic `BaseSettings`.
   - Keep `.env.example` updated with mock values for developer onboarding.

---

## 6. Technical Synchronization Protocol

To maintain maximum velocity without unnecessary overhead:
- **Daily 10-Minute Standup**: Focused exclusively on technical blockers, merged PRs, and day's integration goals.
- **Friday Staging Verification**: Every Friday at 17:00, all members test the unified system on the staging environment to verify end-to-end integration.
- **Schema Lock Rule**: Any proposed changes to the database schema or API JSON contracts require a written proposal in a GitHub Issue and agreement between Frontend, Backend, and ML before implementation.
