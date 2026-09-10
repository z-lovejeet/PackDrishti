# PackDrashiti (SIH26034) Development Roadmap

## 1. Executive Roadmap Overview & Engineering Tenets

**Current State vs Production Target Gap Analysis**
Currently, the PackDrashiti project consists of a React frontend and FastAPI backend skeleton. The production target requires a robust dual-audience architecture (Consumer vs Officer), complete with Supabase managed PostgreSQL persistence, Supabase native `pgvector` vector storage, Supabase Auth session security, zero-manual-step Python in-memory asynchronous caching (`cachetools` / `async-lru`), and a stateful LangGraph RAG workflow powered by a Parallel Dual-LLM engine (Gemini fallback chain: `gemini-3.8-flash` -> `gemini-3.7-flash` -> `gemini-3.6-flash` -> `gemini-3.5-flash-lite` and Groq fallback chain: `gpt-oss-120b` -> `gpt-oss-20b`).

**Dual-Audience Architecture Requirements**
1. **Consumer Portal:** Focuses on sub-500ms latency health metrics, nutritional scanning, allergen detection, and simplified compliance indicators.
2. **Officer Enforcement Portal:** Demands strict data integrity, chain-of-custody logging, complex aggregate queries, and automated statutory PDF generation (FORM LM-INSP-2011) for legal compliance.

**Engineering Tenets**
- Strict Type Safety: Shared types between TypeScript frontend, Supabase schemas, and FastAPI Pydantic models.
- Zero Manual Infrastructure Overhead: Eliminate Redis in favor of zero-configuration in-memory async caching (`cachetools` / `async-lru`) and FastAPI native `BackgroundTasks`.
- Parallel Dual-LLM Concurrency: Run Gemini and Groq fallback chains concurrently via `asyncio.gather()` for real-time consensus and zero hallucination.
- Deterministic Legal Verification: 100% auditable mathematical logic for legal math (USP arithmetic, font calibration, contrast ratio); never delegate math to an LLM.
- Stateless Backend: Core inference and rule parsing must be horizontally scalable and stateless.
- Traceable Enforcement: All officer actions require immutable audit logs.

## 2. Phase Breakdown

### Phase 1: Environment & Project Scaffolding
**Estimated Duration:** 2 Days | **Milestones:** Repository initialized, standard configs merged, Hello World deployed.
**Entry Pre-requisites:** Git access, local dev tools installed.

**Member 1 (Frontend Developer)**
- [x] Initialize React 19 + TypeScript 6 via Vite in `frontend/`.
- [x] Configure `frontend/tailwind.config.ts` and install Phosphor Icons.
- [x] Install `@supabase/supabase-js` and initialize Supabase client in `frontend/src/utils/supabaseClient.ts`.
- [x] Setup `frontend/src/utils/apiClient.ts` with Axios interceptors for Supabase JWT injection.
- [x] Configure `frontend/src/store/authStore.ts` with Supabase session synchronization.

**Member 2 (Backend Developer)**
- [x] Scaffold FastAPI project in `backend/src/main.py`.
- [x] Define environment variables in `backend/.env.template` (Supabase, Gemini fallback chain, Groq API, cache TTL).
- [x] Setup `backend/src/core/config.py` using Pydantic Settings for Supabase DB, pgvector, Auth, in-memory cache, and Dual-LLM fallback chains.
- [x] Implement comprehensive diagnostic health endpoint in `backend/src/api/v1/endpoints/health.py`.

**Member 3 (AI Engineer)**
- [ ] Scaffold LangGraph stateful RAG workflow in `ai/src/pipeline/langgraph_workflow.py`.
- [ ] Configure Primary Gemini fallback chain (`gemini-3.8-flash` -> `gemini-3.7-flash` -> `gemini-3.6-flash` -> `gemini-3.5-flash-lite`).
- [ ] Configure Secondary Groq API fallback chain (`gpt-oss-120b` -> `gpt-oss-20b`).
- [ ] Initialize Supabase `pgvector` database connection and HNSW cosine similarity query harness.

**Member 4 (Tester + DevOps Engineer)**
- [x] Scaffold `docker-compose.yml` for local PostgreSQL 16 with pgvector and Adminer (zero Redis dependency).
- [x] Create `.github/workflows/ci.yml` with linting and unit testing for frontend/backend.
- [x] Author and verify backend health test suite in `backend/tests/test_health.py`.

**Phase Verification Gate & Acceptance Criteria**
- Execution: `pytest backend/tests/test_health.py -v && curl -X GET http://localhost:8000/api/v1/health`
- Output: All tests pass; health payload reports `database: supabase_postgresql`, `vectordb: supabase_pgvector`, `auth: supabase_auth`, `cache: in_memory_async_lru`, `rag_framework: langgraph`.

### Phase 2: Database Schemas, Migrations & Backend Core
**Estimated Duration:** 4 Days | **Milestones:** Supabase migrations applied, CRUD endpoints for Users/Scans active.
**Entry Pre-requisites:** Phase 1 complete, `database_schema.md` finalized.

**Member 1 (Frontend Developer)**
- [x] Generate TypeScript interfaces in `frontend/src/types/models.ts` matching backend schemas.
- [x] Implement local state management (Zustand/Context) in `frontend/src/store/authStore.ts`.

**Member 2 (Backend Developer)**
- [ ] Define SQLAlchemy 2.0 models and Supabase client bindings in `backend/src/models/`.
- [ ] Enable `pgvector` extension and configure `statutory_knowledge_base` with HNSW index in Supabase.
- [ ] Implement Supabase Auth JWT verification middleware in `backend/src/core/security.py`.
- [ ] Implement in-memory async LRU cache (`cachetools`) for token denylist and static lookup tables.

**Member 3 (AI Engineer)**
- [ ] Structure the Pydantic response schema mapping to `backend/src/schemas/ai_results.py`.
- [ ] Prototype Deterministic Rule Engine logic in `ai/src/rules/deterministic.py`.

**Member 4 (Tester + DevOps Engineer)**
- [ ] Write Pytest fixtures for Supabase DB sessions in `backend/tests/conftest.py`.
- [ ] Verify remote Supabase PostgreSQL instance and pgvector extension for staging.

**Phase Verification Gate & Acceptance Criteria**
- Execution: `pytest backend/tests/test_db.py`
- Output: 100% pass on Supabase DB model validation, pgvector indexing, and relations.

### Phase 3: LangGraph Stateful RAG & Parallel Dual-LLM Pipeline
**Estimated Duration:** 6 Days | **Milestones:** VLM spatial perception, deterministic rules, Supabase pgvector RAG, and parallel LLMs active.
**Entry Pre-requisites:** Supabase pgvector configured, Gemini API key, and Groq API key available.

**Member 1 (Frontend Developer)**
- [ ] Build camera module in `frontend/src/components/Scanner/Camera.tsx`.
- [ ] Implement canvas downsampling algorithm in `frontend/src/utils/imageProc.ts` to reduce payload size to < 2MB.

**Member 2 (Backend Developer)**
- [ ] Create `POST /api/v1/scans/analyze` endpoint accepting multipart/form-data.
- [ ] Implement Cloudflare R2 / S3 / Supabase Storage upload function in `backend/src/services/storage.py`.

**Member 3 (AI Engineer)**
- [ ] Tier 1: Implement Multimodal VLM visual perception with automated PaddleOCR fallback.
- [ ] Tier 2: Build Deterministic Python Rule Engine for legal math in `ai/src/rules/deterministic.py`.
- [ ] Tier 3: Implement LangGraph stateful RAG workflow querying Supabase pgvector in `ai/src/rag/supabase_vector.py`.
- [ ] Tier 4: Implement Parallel Dual-LLM execution via `asyncio.gather()` orchestrating Gemini and Groq fallback chains with consensus validation.

**Member 4 (Tester + DevOps Engineer)**
- [ ] Create AI benchmark runner script `ai/tests/benchmark.py` verifying precision/recall against rule logic.
- [ ] Containerize AI pipeline in `backend/Dockerfile`.

**Phase Verification Gate & Acceptance Criteria**
- Execution: `python ai/tests/benchmark.py`
- Output: Strict deterministic rule passes without LLM math errors, parallel LLM execution latency < 2.5s, 0 hallucinations.

### Phase 4: Frontend API Integration & Scanner Flow Refinement
**Estimated Duration:** 4 Days | **Milestones:** Real-time scanning feedback loop completed without mock data.
**Entry Pre-requisites:** `POST /api/v1/scans/analyze` endpoint deployed to staging.

**Member 1 (Frontend Developer)**
- [ ] Replace `frontend/src/data/mock.ts` with API calls in `frontend/src/pages/ConsumerScan.tsx`.
- [ ] Build finite state machine for scanner flow (Idle, Capturing, Uploading, Processing, Complete) in `frontend/src/store/scanMachine.ts`.
- [ ] Connect Supabase Auth login and registration modals with persistent token refresh.

**Member 2 (Backend Developer)**
- [ ] Optimize response latency on inference endpoint using in-memory async caching (`async-lru`).
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
- [ ] Integrate ICMR-NIN nutrition standards database in Supabase PostgreSQL.
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
**Entry Pre-requisites:** Supabase Auth RBAC operational, substantial scan data available.

**Member 1 (Frontend Developer)**
- [ ] Build `frontend/src/pages/OfficerDashboard.tsx` with aggregate charts.
- [ ] Implement print CSS for reports in `frontend/src/styles/print.css`.

**Member 2 (Backend Developer)**
- [ ] Create aggregate statistics endpoints in `backend/src/api/admin.py`.
- [ ] Implement WeasyPrint PDF generator in `backend/src/services/pdf_gen.py` outputting FORM LM-INSP-2011.

**Member 3 (AI Engineer)**
- [ ] Implement non-compliance classification model outputting exact legal clauses violated in `ai/src/rules/compliance_checker.py`.
- [ ] Connect LangGraph statutory RAG node to draft formal legal notices citing Legal Metrology Act 2009 sections.

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
- [ ] Audit Supabase queries and API routes for injection flaws.
- [ ] Verify Supabase JWT expiration, role claim validation, and secret management.

**Member 3 (AI Engineer)**
- [ ] Harden API boundaries to prevent adversarial image attacks (excessive resolution handling).

**Member 4 (Tester + DevOps Engineer)**
- [ ] Finalize GitHub Actions CI/CD in `.github/workflows/main.yml` covering lint, test, build, and deploy.
- [ ] Configure Render/Railway/Supabase deployments for the FastAPI backend and database.

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
- [ ] Implement zero-manual-step in-memory caching layer (`cachetools` / `async-lru`) for static lookup tables.
- [ ] Tune Supabase PostgreSQL connection pooling settings.

**Member 3 (AI Engineer)**
- [ ] Freeze prompt templates, LangGraph nodes, and rule parameters.
- [ ] Run final 50-SKU benchmark and document metrics for judges.

**Member 4 (Tester + DevOps Engineer)**
- [ ] Perform load testing on deployed staging environment.
- [ ] Backup final Supabase PostgreSQL state.

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
