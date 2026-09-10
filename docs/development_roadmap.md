# PackDrashiti (SIH26034) Master Development Roadmap

**Project Identifier**: SIH26034  
**Project Title**: Software System to Check Compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by Scanning Products, Images and Labels  
**Administering Ministry**: Ministry of Consumer Affairs, Food & Public Distribution, Department of Consumer Affairs (Legal Metrology Division), Government of India  
**Document Classification**: Engineering Master Development Roadmap & Progress Tracking Specification  
**Document Version**: 2.0.0 (Phase-Centric Architecture)  

---

## 1. Executive Status & Progress Dashboard

### 1.1 Overall Implementation Status

```
[====================--------------------------------] 38% Overall Completion
Total Defined Tasks: 66
Completed Tasks:      25
Pending Tasks:        41
```

### 1.2 Phase-by-Phase Progress Matrix

| Phase | Title | Completed | Pending | Total | Completion % | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Phase 1** | Environment & Project Scaffolding | 10 | 0 | 10 | 100% | Completed |
| **Phase 2** | Database Modeling, Supabase Persistence & Auth Core | 3 | 5 | 8 | 38% | In Progress |
| **Phase 3** | LangGraph Stateful RAG & Parallel Dual-LLM Pipeline | 0 | 10 | 10 | 0% | Pending |
| **Phase 4** | Frontend Live Integration & Scanner Flow | 2 | 6 | 8 | 25% | Pending |
| **Phase 5** | Consumer Health Engine & ICMR-NIN Table Parser | 3 | 4 | 7 | 43% | Pending |
| **Phase 6** | Officer Enforcement, FORM LM-INSP-2011 PDF & Analytics | 4 | 5 | 9 | 44% | Pending |
| **Phase 7** | Automated Testing Suites, Security Hardening & CI/CD | 3 | 5 | 8 | 38% | In Progress |
| **Phase 8** | Accuracy Benchmarking, Performance Tuning & Final SIH Freeze | 0 | 6 | 6 | 0% | Pending |
| **TOTAL** | **Full Engineering Lifecycle** | **25** | **41** | **66** | **38%** | **In Active Progress** |

---

## 2. Completed vs Pending Deliverables Audit

### 2.1 Completed Deliverables (What Is Done)

1. **Frontend Architecture & Scaffolding (Phase 1 & 2)**:
   - React 19 + TypeScript 6 + Vite 8.2.2 development and build setup (`frontend/`).
   - Tailwind CSS civic restrained color palette configuration (`frontend/tailwind.config.js`).
   - Phosphor Icons integration across navigation, dashboard, and report views.
   - Centralized Axios API client with request/response interceptors (`frontend/src/utils/apiClient.ts`).
   - Supabase JavaScript client initialization with session storage (`frontend/src/utils/supabaseClient.ts`).
   - Persistent authentication store built on Zustand (`frontend/src/store/authStore.ts`).
   - TypeScript domain models matching database schema (`frontend/src/types/models.ts`).

2. **Frontend User Interface & Views (Phase 4, 5 & 6 Prototype Pages)**:
   - Consumer Scanner Page with annotated image overlays (`frontend/src/pages/consumer/ScannerPage.tsx`).
   - Consumer Health Check Page with ICMR-NIN scoring cards (`frontend/src/pages/consumer/HealthCheckPage.tsx`).
   - Consumer Product History & Audit Ledger (`frontend/src/pages/consumer/ProductHistoryPage.tsx`).
   - Landing Page with feature showcases and compliance walkthroughs (`frontend/src/pages/consumer/LandingPage.tsx`).
   - Officer Dashboard with district enforcement KPIs and compliance charts (`frontend/src/pages/officer/OfficerDashboardPage.tsx`).
   - Officer Field Inspections Ledger with search and status filtering (`frontend/src/pages/officer/InspectionsPage.tsx`).
   - Officer FORM LM-INSP-2011 Inspection Report Viewer (`frontend/src/pages/officer/ReportViewerPage.tsx`).
   - Reusable atomic UI components: Badges, Buttons, Cards, Modals, Skeletons, Toasts, Charts.

3. **Backend Application Core & Settings (Phase 1)**:
   - FastAPI application instance scaffolded with CORS and router mounting (`backend/src/main.py`).
   - Pydantic Settings management with environment variable validation (`backend/src/core/config.py`).
   - Subsystem diagnostic health check endpoint (`backend/src/api/v1/endpoints/health.py`).
   - Production Dockerfile for backend containerization (`backend/Dockerfile`).
   - Environment configuration templates (`backend/.env.template`, `backend/.env.example`).
   - Python dependencies configured for Supabase, LangGraph, LangChain, Google GenAI, and Groq (`backend/requirements.txt`).

4. **Testing, CI/CD & Local Infrastructure (Phase 1 & 7)**:
   - Pytest test suite for diagnostic health and settings validation (`backend/tests/test_health.py`).
   - Docker Compose local environment specification for PostgreSQL 16 with pgvector and Adminer (`docker-compose.yml`).
   - GitHub Actions CI workflow covering frontend lint/build and backend pytest (`.github/workflows/ci.yml`).

---

### 2.2 Pending Deliverables (What Needs To Be Done)

1. **Database Persistence & Migrations (Phase 2)**:
   - SQLAlchemy 2.0 ORM models in `backend/src/models/` for users, scans, declarations, violations, reports, and health audits.
   - Alembic migration environment and initial schema generation.
   - Connection to remote Supabase managed PostgreSQL instance and pgvector extension initialization.
   - Supabase Auth JWT verification middleware in `backend/src/core/security.py`.
   - In-memory asynchronous caching manager in `backend/src/core/cache.py` (`cachetools` / `async-lru`).

2. **LangGraph Stateful RAG & Parallel Dual-LLM Pipeline (Phase 3)**:
   - Multimodal VLM perception module with automated PaddleOCR fallback (`ai/src/pipeline/extractor.py`).
   - Deterministic Python Rule Engine (`ai/src/rules/deterministic.py`): USP calculation, Rule 7 Table-I font calibration step function, Rule 9 contrast ratio, SI units verification.
   - Supabase `pgvector` Statutory RAG indexing and semantic retrieval (`ai/src/rag/supabase_vector.py`).
   - Parallel Dual-LLM fallback engine (`ai/src/llm/dual_engine.py`): Gemini chain (`gemini-3.8-flash` -> `gemini-3.7-flash` -> `gemini-3.6-flash` -> `gemini-3.5-flash-lite`) and Groq chain (`gpt-oss-120b` -> `gpt-oss-20b`) executed via `asyncio.gather()`.
   - Stateful LangGraph workflow orchestrating tiers 1 through 4 (`ai/src/pipeline/langgraph_workflow.py`).

3. **Backend API Endpoints (Phase 3, 4, 5, 6)**:
   - `POST /api/v1/scan/upload` (multipart image ingestion and storage upload).
   - `POST /api/v1/scan/analyze` (end-to-end LangGraph execution).
   - `GET /api/v1/health/score/{scan_id}` (ICMR-NIN nutritional scoring endpoint).
   - `GET /api/v1/rules/search` (pgvector semantic rule search).
   - `POST /api/v1/violations/{id}/generate-notice` (formal statutory show-cause notice generation).
   - `GET /api/v1/reports/pdf/{scan_id}` (WeasyPrint FORM LM-INSP-2011 PDF generator).
   - `GET /api/v1/dashboard/metrics` (Officer aggregate statistics).

4. **Frontend Live Integration (Phase 4 & 5)**:
   - Connect live camera stream and canvas downsampling (< 2MB) in `frontend/src/components/scanner/Camera.tsx`.
   - Replace static mock data in `frontend/src/pages/consumer/ScannerPage.tsx` with live API calls.
   - Scanner finite state machine implementation (`frontend/src/store/scanMachine.ts`).
   - Connect Supabase Auth login and registration modals to live authentication state.

5. **Evaluation Benchmarks & Hardening (Phase 7 & 8)**:
   - 50-SKU golden ground-truth evaluation benchmark script (`ai/tests/benchmark.py`).
   - End-to-end integration and security test suites.
   - PWA offline fallback caching verification.

---

## 3. Core Engineering Tenets

1. **Deterministic Legal Verification**: Legal math (Unit Sale Price arithmetic, Rule 7 Table-I font step function calibration, Rule 9 contrast ratio, SI metric unit validation) is 100% computed by pure Python deterministic logic. An LLM must never be permitted to calculate statutory arithmetic.
2. **Parallel Dual-LLM Consensus**: Google Gemini and Groq fallback chains run in parallel via `asyncio.gather()`. The fastest valid structured output is prioritized and validated against the deterministic rule engine to eliminate hallucinations.
3. **Unified Supabase Architecture**: Supabase managed PostgreSQL 16 houses relational records, `auth.users`, and native `pgvector` embeddings (`vector(1536)`). No external vector database is used.
4. **Zero-Manual-Step Infrastructure**: Redis is completely eliminated. Asynchronous caching and rate limiting are handled via Python in-memory async caches (`cachetools` / `async-lru`), and background tasks run on FastAPI native `BackgroundTasks`.
5. **Strict Type Safety**: All data structures are shared 1-to-1 between TypeScript frontend interfaces, Pydantic schemas, and Supabase database models.

---

## 4. Phase-by-Phase Roadmap

### Phase 1: Environment & Project Scaffolding
**Status:** Completed (10/10 Tasks Done)  
**Duration:** 2 Days  
**Milestones:** Repository initialized, standard configs merged, health endpoints verified.

#### Task Checklist
- [x] **Frontend Core Scaffolding**: Initialize React 19 + TypeScript 6 via Vite in `frontend/`.
- [x] **UI Styling & Design System**: Configure `frontend/tailwind.config.js` and install Phosphor Icons.
- [x] **HTTP Client & Interceptors**: Setup `frontend/src/utils/apiClient.ts` with Axios interceptors for JWT token injection and error handling.
- [x] **Supabase Client Setup**: Install `@supabase/supabase-js` and initialize client in `frontend/src/utils/supabaseClient.ts`.
- [x] **Client Auth State**: Scaffold Zustand persistent store in `frontend/src/store/authStore.ts`.
- [x] **Backend Project Scaffolding**: Scaffold FastAPI application in `backend/src/main.py`.
- [x] **Environment Configuration**: Define environment templates in `backend/.env.template` and `backend/.env.example`.
- [x] **Pydantic Settings**: Author `backend/src/core/config.py` with Supabase, cache, Gemini, and Groq fallback chain configurations.
- [x] **Diagnostic Health Endpoint**: Implement comprehensive health check in `backend/src/api/v1/endpoints/health.py`.
- [x] **Infrastructure & CI**: Scaffold `docker-compose.yml` for PostgreSQL 16 with pgvector, Author `.github/workflows/ci.yml`, author `backend/tests/test_health.py`.

#### Acceptance Criteria & Verification
- Execution: `pytest backend/tests/test_health.py -v && cd frontend && npm run build`
- Output: 4 of 4 tests pass; Vite builds production bundle in under 500ms with zero errors.

---

### Phase 2: Database Modeling, Supabase Persistence & Auth Core
**Status:** In Progress (3/8 Tasks Done | 38% Complete)  
**Duration:** 4 Days  
**Milestones:** Database schemas created, migrations verified, Supabase Auth integrated.

#### Task Checklist
- [x] **Frontend Domain Interfaces**: Generate TypeScript interfaces in `frontend/src/types/models.ts` matching backend relational schemas.
- [x] **Frontend Role Typing**: Define user roles and permission sets in `frontend/src/types/roles.ts`.
- [x] **Frontend Session Sync**: Integrate Supabase Auth sign-out and session sync in `frontend/src/store/authStore.ts`.
- [ ] **SQLAlchemy 2.0 ORM Models**: Define relational models in `backend/src/models/` (`users`, `product_scans`, `extracted_declarations`, `statutory_violations`, `compliance_reports`, `health_audits`).
- [ ] **Alembic Migration Setup**: Configure `alembic/` and generate initial schema revision: `alembic revision --autogenerate -m "initial_schema"`.
- [ ] **Supabase pgvector Activation**: Run migration on remote Supabase instance enabling `vector` extension and creating `statutory_knowledge_base` with HNSW cosine index.
- [ ] **Supabase Auth JWT Middleware**: Implement token verification and role validation dependencies in `backend/src/core/security.py`.
- [ ] **In-Memory Cache Manager**: Implement zero-manual-step in-memory async cache (`cachetools` / `async-lru`) in `backend/src/core/cache.py` for token denylisting and lookup tables.

#### Acceptance Criteria & Verification
- Execution: `alembic upgrade head && pytest backend/tests/test_db.py`
- Output: 100% pass on model integrity, foreign key constraints, and Supabase pgvector connection.

---

### Phase 3: LangGraph Stateful RAG & Parallel Dual-LLM Pipeline
**Status:** Pending (0/10 Tasks Done | 0% Complete)  
**Duration:** 6 Days  
**Milestones:** Multimodal perception active, deterministic rule engine running, LangGraph state machine operational.

#### Task Checklist
- [ ] **Camera Ingestion Module**: Build camera capture interface in `frontend/src/components/scanner/Camera.tsx`.
- [ ] **Client Image Downsampler**: Implement canvas compression algorithm in `frontend/src/utils/imageProc.ts` ensuring uploads remain < 2MB.
- [ ] **Scan Ingestion Endpoint**: Implement `POST /api/v1/scan/upload` accepting multipart image files and storing to S3/Cloudflare R2/Supabase.
- [ ] **Tier 1 Visual Perception**: Implement VLM spatial extraction with automated local PaddleOCR fallback in `ai/src/pipeline/extractor.py`.
- [ ] **Tier 2 Rule Engine (Legal Math)**: Build deterministic Python rule verification module in `ai/src/rules/deterministic.py` (USP calculation, Rule 7 Table-I font calibration, Rule 9 contrast, SI units).
- [ ] **Tier 3 Supabase pgvector RAG**: Implement statutory retrieval module in `ai/src/rag/supabase_vector.py` indexing Legal Metrology Act 2009 and PCR 2011.
- [ ] **Tier 4 Parallel Dual-LLM Engine**: Implement `ai/src/llm/dual_engine.py` orchestrating Gemini fallback chain and Groq fallback chain via `asyncio.gather()`.
- [ ] **LangGraph Workflow Coordinator**: Implement stateful graph in `ai/src/pipeline/langgraph_workflow.py` linking perception, rules, retrieval, and synthesis.
- [ ] **Scan Analysis Endpoint**: Implement `POST /api/v1/scan/analyze` triggering the LangGraph workflow and returning structured compliance results.
- [ ] **AI Benchmark Harness**: Create evaluation script in `ai/tests/benchmark.py` validating extraction against 50 golden benchmark SKUs.

#### Acceptance Criteria & Verification
- Execution: `python ai/tests/benchmark.py`
- Output: 100% mathematical accuracy on USP and font sizing; parallel LLM consensus latency < 2.5 seconds; 0 hallucinations.

---

### Phase 4: Frontend Live Integration & Scanner Flow
**Status:** Pending (2/8 Tasks Done | 25% Complete)  
**Duration:** 4 Days  
**Milestones:** Mock data replaced by live API endpoints, end-to-end scanner flow operational.

#### Task Checklist
- [x] **Scanner View & Overlay Components**: Build scanner interface with bounding box display in `frontend/src/pages/consumer/ScannerPage.tsx`.
- [x] **Annotated Image Viewer**: Author bounding box and polygon rendering component in `frontend/src/components/scanner/AnnotatedImage.tsx`.
- [ ] **Scanner Finite State Machine**: Implement state machine (Idle, Capturing, Compressing, Uploading, Processing, Complete, Error) in `frontend/src/store/scanMachine.ts`.
- [ ] **Live API Integration (Consumer Scan)**: Connect `frontend/src/pages/consumer/ScannerPage.tsx` to `POST /api/v1/scan/analyze`.
- [ ] **Auth Modal Integration**: Wire login and registration forms to Supabase Auth client with session token storage.
- [ ] **Scan History Live Integration**: Connect `frontend/src/pages/consumer/ProductHistoryPage.tsx` to `GET /api/v1/scan/history`.
- [ ] **Rate Limiting Handling**: Add UI notifications and cooldown timers for HTTP 429 rate limit responses.
- [ ] **Playwright E2E Scanner Tests**: Author end-to-end browser test in `frontend/e2e/scan_flow.spec.ts`.

#### Acceptance Criteria & Verification
- Execution: `npx playwright test e2e/scan_flow.spec.ts`
- Output: Image upload, state machine transitions, and result rendering pass with zero mock data.

---

### Phase 5: Consumer Health Engine & ICMR-NIN Table Parser
**Status:** Pending (3/7 Tasks Done | 43% Complete)  
**Duration:** 5 Days  
**Milestones:** Tabular nutrition parsing active, ICMR-NIN 2024 dietary scoring operational.

#### Task Checklist
- [x] **Health Check UI View**: Implement consumer health page in `frontend/src/pages/consumer/HealthCheckPage.tsx`.
- [x] **Nutritional Breakdown Card**: Implement nutrient row widget in `frontend/src/components/health/NutrientRow.tsx`.
- [x] **Dietary Advisory UI**: Author advisory warning component in `frontend/src/components/health/DietaryAdvisory.tsx`.
- [ ] **Tabular Nutrition Extractor**: Author OCR/VLM tabular data parser in `ai/src/rules/nutrition_parser.py` converting nutrition panels to structured JSON.
- [ ] **ICMR-NIN 2024 Scoring Engine**: Implement nutritional scoring algorithms and High-Fat-Sugar-Salt (HFSS) thresholds in `backend/src/services/health_engine.py`.
- [ ] **Health Audit API Endpoint**: Implement `GET /api/v1/health/score/{scan_id}` returning health scores, nutrient breakdown, and contraindications.
- [ ] **Health Scoring Test Suite**: Add unit tests in `backend/tests/test_scoring.py` verifying nutrition calculations against reference standards.

#### Acceptance Criteria & Verification
- Execution: `pytest backend/tests/test_scoring.py`
- Output: 100% agreement between automated health scores and benchmark manual calculations.

---

### Phase 6: Officer Enforcement, FORM LM-INSP-2011 PDF & Analytics
**Status:** Pending (4/9 Tasks Done | 44% Complete)  
**Duration:** 6 Days  
**Milestones:** Enforcement dashboard live, automated legal PDF generation working.

#### Task Checklist
- [x] **Officer Dashboard UI**: Build officer overview with KPI cards in `frontend/src/pages/officer/OfficerDashboardPage.tsx`.
- [x] **Inspections Ledger UI**: Implement search and filter table in `frontend/src/pages/officer/InspectionsPage.tsx`.
- [x] **Report Viewer UI**: Build docket viewer interface in `frontend/src/pages/officer/ReportViewerPage.tsx`.
- [x] **Violation Card Widget**: Implement legal clause citation display in `frontend/src/components/reports/ViolationCard.tsx`.
- [ ] **Aggregate Analytics Endpoints**: Implement `GET /api/v1/dashboard/metrics` and `GET /api/v1/dashboard/activity` in `backend/src/api/v1/endpoints/dashboard.py`.
- [ ] **WeasyPrint PDF Service**: Implement statutory inspection certificate generator in `backend/src/services/pdf_generator.py` formatting FORM LM-INSP-2011.
- [ ] **PDF Export API Endpoint**: Implement `GET /api/v1/reports/pdf/{scan_id}` streaming printable PDF documents.
- [ ] **Statutory Notice Draft Endpoint**: Implement `POST /api/v1/violations/{id}/generate-notice` utilizing LangGraph RAG synthesis to generate formal Section 36(1) notices.
- [ ] **Print CSS Styling**: Author optimized print stylesheet in `frontend/src/styles/print.css`.

#### Acceptance Criteria & Verification
- Execution: `curl -X GET http://localhost:8000/api/v1/reports/pdf/{scan_id} -o test_docket.pdf`
- Output: Valid PDF conforming to FORM LM-INSP-2011 formatting, embedding product imagery and statutory citations.

---

### Phase 7: Automated Testing Suites, Security Hardening & CI/CD
**Status:** In Progress (3/8 Tasks Done | 38% Complete)  
**Duration:** 3 Days  
**Milestones:** Full test coverage, security audit passed, automated cloud deployment active.

#### Task Checklist
- [x] **Backend Health Test**: Diagnostic tests verified in `backend/tests/test_health.py`.
- [x] **Frontend Oxlint Checks**: Static lint analysis passing with 0 errors across 46 modules.
- [x] **Continuous Integration Pipeline**: GitHub Actions workflow running lint and unit tests (`.github/workflows/ci.yml`).
- [ ] **Database & Endpoint Test Suite**: Comprehensive tests for all REST endpoints in `backend/tests/test_api.py`.
- [ ] **Input Sanitization & CSP**: Enforce Content Security Policy in `frontend/index.html` and Pydantic sanitization filters in backend schemas.
- [ ] **In-Memory Rate Limiting Verification**: Verify token bucket sliding-window rate limiting on public endpoints.
- [ ] **Dependency Security Audit**: Execute `npm audit` and `pip-audit` to confirm zero critical vulnerabilities.
- [ ] **Cloud Deployment Configurations**: Configure automated staging deployment to Vercel (Frontend) and Render/Railway/Supabase (Backend).

#### Acceptance Criteria & Verification
- Execution: Full GitHub Actions run on `main` branch.
- Output: All matrix checks green; zero critical security warnings.

---

### Phase 8: Accuracy Benchmarking, Performance Tuning & Final SIH Freeze
**Status:** Pending (0/6 Tasks Done | 0% Complete)  
**Duration:** 2 Days  
**Milestones:** SIH demo dry run validated, offline contingency verified, code freeze.

#### Task Checklist
- [ ] **50-SKU Benchmark Evaluation**: Execute evaluation benchmark against the 50 ground-truth physical commodity samples and document metrics.
- [ ] **Response Latency Tuning**: Ensure sub-2.5s end-to-end response on full scanning pipeline using in-memory async caching.
- [ ] **PWA Offline Contingency**: Configure service worker in `frontend/src/sw.ts` for offline presentation mode.
- [ ] **Physical Packaging Samples Prep**: Procure and test 5 live physical commodity packaging samples (Bournvita, Maggi, Whole Almonds, plus compliant/non-compliant edge cases).
- [ ] **SIH Jury Presentation Dry Run**: Conduct dry run of 5-minute inspector and consumer demonstration flow.
- [ ] **Repository & Documentation Freeze**: Finalize all markdown documents, tag release commit `v1.0.0`, and backup database state.

#### Acceptance Criteria & Verification
- Execution: 5-product live scan dry run with jury script.
- Output: Instantaneous UI rendering, 100% legal math accuracy, zero unhandled errors.

---

## 5. Immediate Next Priority Tasks

To advance the project toward production readiness, the immediate development sequence is:

1. **Implement Backend Models & Supabase Migration (Phase 2)**:
   - Create SQLAlchemy 2.0 models in `backend/src/models/`.
   - Setup Alembic and apply migrations to remote Supabase instance.
   - Author Supabase Auth JWT verification in `backend/src/core/security.py`.
2. **Implement LangGraph RAG & Parallel Dual-LLM Pipeline (Phase 3)**:
   - Author `ai/src/rules/deterministic.py` for legal math (USP, Rule 7 font calibration, Rule 9 contrast).
   - Implement Supabase `pgvector` retrieval node.
   - Implement Parallel Dual-LLM dispatcher (`asyncio.gather()` between Gemini and Groq).
   - Wire LangGraph workflow in `ai/src/pipeline/langgraph_workflow.py`.
3. **Connect Frontend Scanner to Live Backend API (Phase 4)**:
   - Implement `POST /api/v1/scan/upload` and `analyze`.
   - Replace mock data in `frontend/src/pages/consumer/ScannerPage.tsx`.

---

## 6. SIH Evaluation Readiness Checklist

- [ ] **5 Physical Packaging Commodities**: Procured samples representing clear violations, full compliance, and dual MRP tampering.
- [ ] **Offline Contingency Backup**: Pre-recorded walkthrough video and offline local Docker stack.
- [ ] **Judge Presentation Script**: Step-by-step 5-minute presentation script emphasizing societal impact and deterministic legal math.
- [ ] **High-Level System Architecture Diagram**: Printable and digital architecture visual.
- [ ] **1-Page Performance & Accuracy Sheet**: Summary of OCR accuracy, rule precision, and sub-2.5s latency metrics.
