# PackDrashiti (SIH26034) Development Roadmap

## 1. Executive Roadmap Overview & Engineering Tenets

**Current State vs Production Target Gap Analysis**
Currently, the PackDrashiti project consists of a React frontend prototype utilizing mock data. The production target requires a robust dual-audience architecture (Consumer vs Officer), complete with an integrated FastAPI backend, a 4-tier hybrid AI pipeline, and PostgreSQL persistence. The gap involves migrating away from static `frontend/src/data/mock.ts` stubs to live API endpoints, implementing role-based access control (RBAC), setting up real-time AI processing for packaging rule verification, and deploying automated CI/CD pipelines.

**Dual-Audience Architecture Requirements**
1. **Consumer Portal:** Focuses on sub-500ms latency health metrics, nutritional scanning, allergen detection, and simplified compliance indicators.
2. **Officer Enforcement Portal:** Demands strict data integrity, chain-of-custody logging, complex aggregate queries, and automated statutory PDF generation (FORM LM-INSP-2011) for legal compliance.

**Engineering Tenets**
- Strict Type Safety: Shared types between TypeScript frontend and FastAPI Pydantic models.
- Predictable State: Frontend state transitions must follow finite state machine principles.
- Stateless Backend: Core inference and rule parsing must be horizontally scalable and stateless.
- Traceable Enforcement: All officer actions require immutable audit logs.

## 2. Phase Breakdown

### Phase 1: Environment & Project Scaffolding
**Estimated Duration:** 2 Days | **Milestones:** Repository initialized, standard configs merged, Hello World deployed.
**Entry Pre-requisites:** Git access, local dev tools installed.

**Member 1 (Frontend Developer)**
- [ ] Initialize React 19 + TypeScript 6 via Vite in `frontend/`.
- [ ] Configure `frontend/tailwind.config.ts` and install Phosphor Icons.
- [ ] Setup `frontend/src/utils/apiClient.ts` with Axios interceptors for JWT injection.

**Member 2 (Backend Developer)**
- [x] Scaffold FastAPI project in `backend/src/main.py`.
- [x] Define environment variables in `backend/.env.template`.
- [x] Setup `backend/src/core/config.py` using Pydantic Settings.

**Member 3 (AI Engineer)**
- [ ] Define Python environment with Poetry or conda in `ai/`.
- [ ] Setup VLM API keys and PaddleOCR locally.
- [ ] Initialize pgvector database connections for RAG testing.

**Member 4 (Tester + DevOps Engineer)**
- [x] Scaffold `docker-compose.yml` for local PostgreSQL 16 and Redis.
- [x] Create `.github/workflows/ci.yml` with basic linting for frontend/backend.

**Phase Verification Gate & Acceptance Criteria**
- Execution: `docker-compose up -d && curl -X GET http://localhost:8000/health`
- Output: `{"status": "ok", "version": "0.1.0"}`

### Phase 2: Database Schemas, Migrations & Backend Core
**Estimated Duration:** 4 Days | **Milestones:** Alembic migrations applied, CRUD endpoints for Users/Scans active.
**Entry Pre-requisites:** Phase 1 complete, `database_schema.md` finalized.

**Member 1 (Frontend Developer)**
- [ ] Generate TypeScript interfaces in `frontend/src/types/models.ts` matching backend schemas.
- [ ] Implement local state management (Zustand/Context) in `frontend/src/store/authStore.ts`.

**Member 2 (Backend Developer)**
- [ ] Define SQLAlchemy 2.0 models in `backend/src/models/`.
- [ ] Generate initial Alembic migration: `alembic revision --autogenerate -m "init"`.
- [ ] Implement JWT RBAC utilities in `backend/src/core/security.py`.

**Member 3 (AI Engineer)**
- [ ] Structure the Pydantic response schema mapping to `backend/src/schemas/ai_results.py`.
- [ ] Prototype Deterministic Rule Engine logic in `ai/scripts/rule_engine.py`.

**Member 4 (Tester + DevOps Engineer)**
- [ ] Write Pytest fixtures for DB sessions in `backend/tests/conftest.py`.
- [ ] Provision remote Supabase PostgreSQL instance for staging.

**Phase Verification Gate & Acceptance Criteria**
- Execution: `alembic upgrade head && pytest backend/tests/test_db.py`
- Output: 100% pass on DB model validation and relationships.

### Phase 3: 4-Tier Hybrid AI Pipeline & Rules Engine
**Estimated Duration:** 6 Days | **Milestones:** VLM/OCR operational, deterministic rules running, pgvector indexed.
**Entry Pre-requisites:** VLM API access and statutory texts available for RAG.

**Member 1 (Frontend Developer)**
- [ ] Build camera module in `frontend/src/components/Scanner/Camera.tsx`.
- [ ] Implement canvas downsampling algorithm in `frontend/src/utils/imageProc.ts` to reduce payload size to < 2MB.

**Member 2 (Backend Developer)**
- [ ] Create `POST /api/v1/scans/analyze` endpoint accepting multipart/form-data.
- [ ] Implement Cloudflare R2 / S3 upload function in `backend/src/services/storage.py`.

**Member 3 (AI Engineer)**
- [ ] Tier 1: Implement VLM + PaddleOCR extraction in `ai/src/pipeline/extractor.py`.
- [ ] Tier 2: Build Deterministic Python Rule Engine for legal math in `ai/src/rules/deterministic.py`.
- [ ] Tier 3: Setup pgvector Statutory RAG in `ai/src/rag/indexer.py`.

**Member 4 (Tester + DevOps Engineer)**
- [ ] Create AI benchmark runner script `ai/tests/benchmark.py` verifying precision/recall against rule logic.
- [ ] Containerize AI pipeline in `backend/Dockerfile`.

**Phase Verification Gate & Acceptance Criteria**
- Execution: `python ai/tests/benchmark.py`
- Output: Strict deterministic rule passes without LLM math errors.

### Phase 4: Frontend API Integration & Scanner Flow Refinement
**Estimated Duration:** 4 Days | **Milestones:** Real-time scanning feedback loop completed without mock data.
**Entry Pre-requisites:** `POST /api/v1/scans/analyze` endpoint deployed to staging.

**Member 1 (Frontend Developer)**
- [ ] Replace `frontend/src/data/mock.ts` with API calls in `frontend/src/pages/ConsumerScan.tsx`.
- [ ] Build finite state machine for scanner flow (Idle, Capturing, Uploading, Processing, Complete) in `frontend/src/store/scanMachine.ts`.

**Member 2 (Backend Developer)**
- [ ] Optimize response latency on inference endpoint.
- [ ] Implement rate limiting middleware in `backend/src/core/middleware.py`.

**Member 3 (AI Engineer)**
- [ ] Handle edge cases (motion blur, low light) based on frontend staging feedback.
- [ ] Deliver fallback heuristic rules to `backend/src/services/rules_engine.py`.

**Member 4 (Tester + DevOps Engineer)**
- [ ] Write Playwright E2E tests for the scanning flow in `frontend/e2e/scan_flow.spec.ts`.
- [ ] Set up Vercel deployment pipeline for frontend.

**Phase Verification Gate & Acceptance Criteria**
- Execution: `npx playwright test e2e/scan_flow.spec.ts`
- Output: Successful mock-camera upload and results rendering.

### Phase 5: Consumer Health Engine & Nutrition Table Parser
**Estimated Duration:** 5 Days | **Milestones:** Nutritional scoring and allergen warnings active.
**Entry Pre-requisites:** OCR engine successfully reading tabular data.

**Member 1 (Frontend Developer)**
- [ ] Develop `frontend/src/components/Results/HealthScoreCard.tsx`.
- [ ] Implement dynamic allergen highlighting in `frontend/src/components/Results/IngredientList.tsx`.

**Member 2 (Backend Developer)**
- [ ] Integrate ICMR-NIN nutrition standards database in PostgreSQL.
- [ ] Create `GET /api/v1/health/score/{scan_id}` endpoint in `backend/src/api/health.py`.

**Member 3 (AI Engineer)**
- [ ] Build structural table parser for nutrition facts in `ai/src/rules/nutrition_parser.py`.
- [ ] Map extracted text to structured JSON schema matching ICMR-NIN format.

**Member 4 (Tester + DevOps Engineer)**
- [ ] Add integration tests for scoring logic in `backend/tests/test_scoring.py`.

**Phase Verification Gate & Acceptance Criteria**
- Execution: `pytest backend/tests/test_scoring.py`
- Output: Accurate scoring validation against known good manual calculations.

### Phase 6: Officer Enforcement, FORM LM-INSP-2011 PDF Generator & Dashboard Aggregates
**Estimated Duration:** 6 Days | **Milestones:** Officer dashboard live, PDF generation working.
**Entry Pre-requisites:** RBAC operational, substantial scan data available.

**Member 1 (Frontend Developer)**
- [ ] Build `frontend/src/pages/OfficerDashboard.tsx` with aggregate charts.
- [ ] Implement print CSS for reports in `frontend/src/styles/print.css`.

**Member 2 (Backend Developer)**
- [ ] Create aggregate statistics endpoints in `backend/src/api/admin.py`.
- [ ] Implement WeasyPrint PDF generator in `backend/src/services/pdf_gen.py` outputting FORM LM-INSP-2011.

**Member 3 (AI Engineer)**
- [ ] Implement non-compliance classification model outputting exact legal clauses violated in `ai/src/rules/compliance_checker.py`.

**Member 4 (Tester + DevOps Engineer)**
- [ ] Validate PDF outputs against legal format requirements.
- [ ] Write DB query performance tests for aggregate endpoints.

**Phase Verification Gate & Acceptance Criteria**
- Execution: `curl -X GET http://localhost:8000/api/v1/reports/pdf/123 -o report.pdf`
- Output: Valid PDF file conforming to FORM LM-INSP-2011 formatting rules.

### Phase 7: Automated Testing Suites, Security Hardening & CI/CD Pipelines
**Estimated Duration:** 3 Days | **Milestones:** Full test coverage, secure deployment, zero known vulnerabilities.
**Entry Pre-requisites:** All core features functionally complete.

**Member 1 (Frontend Developer)**
- [ ] Sanitize all user inputs and outputs (XSS prevention).
- [ ] Ensure strict Content Security Policy (CSP) in `frontend/index.html`.

**Member 2 (Backend Developer)**
- [ ] Audit SQLAlchemy queries for injection flaws.
- [ ] Verify JWT expiration, rotation, and secret management.

**Member 3 (AI Engineer)**
- [ ] Harden API boundaries to prevent adversarial image attacks (excessive resolution handling).

**Member 4 (Tester + DevOps Engineer)**
- [ ] Finalize GitHub Actions CI/CD in `.github/workflows/main.yml` covering lint, test, build, and deploy.
- [ ] Configure Railway/Render deployments for the FastAPI backend.

**Phase Verification Gate & Acceptance Criteria**
- Execution: CI/CD Pipeline Run on GitHub.
- Output: Green checkmarks on all matrix jobs, zero critical security alerts in dependabot.

### Phase 8: Accuracy Benchmarking, Performance Tuning & Final SIH Freeze
**Estimated Duration:** 2 Days | **Milestones:** SIH demo ready, offline mode verified.
**Entry Pre-requisites:** Application deployed to production domains.

**Member 1 (Frontend Developer)**
- [ ] Bundle service workers for basic PWA offline fallback in `frontend/src/sw.ts`.
- [ ] Verify UI rendering across target mobile resolutions.

**Member 2 (Backend Developer)**
- [ ] Implement caching layer (Redis) for static lookup tables.
- [ ] Tune PostgreSQL connection pooling settings.

**Member 3 (AI Engineer)**
- [ ] Freeze model weights and rule parameters.
- [ ] Run final 50-SKU benchmark and document metrics for judges.

**Member 4 (Tester + DevOps Engineer)**
- [ ] Perform load testing on deployed staging environment.
- [ ] Backup final PostgreSQL state.

**Phase Verification Gate & Acceptance Criteria**
- Execution: Offline loading test and full 5-product demo dry run.
- Output: Smooth presentation sequence without crashes.

## 3. Cross-Team Integration Protocol & Hand-off Contracts

- **AI to Backend:** Member 3 delivers inference logic as a Python module in the shared `backend/src/services/ai/` directory or as a separate internal microservice API. Interface schema defined via Pydantic in `backend/src/schemas/ml.py`.
- **Backend to Frontend:** Member 2 maintains strict OpenAPI specs available at `/docs`. Member 1 generates frontend types directly from the OpenAPI `openapi.json` file.
- **Merge & Deployment:** All PRs must target the `main` branch and require review from at least one other member. Member 4's GitHub Actions act as the ultimate gatekeeper, preventing merges that fail tests or decrease coverage below 80%. Staging deployments happen automatically on push to `main`.

## 4. SIH Evaluation Readiness Checklist

- [ ] **5 Live Demo Test Commodities:** Procure physical samples representing clear passes, clear failures, and marginal edge cases.
- [ ] **Offline Contingency Mode:** Prepare a pre-recorded video of the entire flow. Run a local offline stack via `docker-compose` as a backup.
- [ ] **Judge Walkthrough Script:** Documented narrative flow highlighting technical complexity (OCR -> Rules -> DB -> UI) and societal impact.
- [ ] **Architecture Diagram:** Printed and digital high-level system overview.
- [ ] **Performance Metrics Summary:** 1-pager on latency, OCR accuracy, and rule parsing precision.
