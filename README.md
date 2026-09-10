# PackDrashiti: Packaged Commodities Legal Metrology Compliance System

**Problem Statement ID**: SIH26034  
**Title**: Software System to Check Compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by Scanning Products, Images and Labels  
**Administering Ministry**: Ministry of Consumer Affairs, Food & Public Distribution, Department of Consumer Affairs (Legal Metrology Division), Government of India  
**Team**: 4 Members (Frontend Developer, Backend Developer, Data Analyst / ML Engineer, Tester + DevOps Engineer)

---

## 1. Overview

PackDrashiti is an automated regulatory compliance verification and nutritional auditing platform. It is engineered to detect mandatory packaging declarations, verify dimensional font height compliance, identify illegal units or price tampering, and conduct nutritional health assessments for Indian retail commodities.

The platform serves two primary audiences:
1. **Legal Metrology Inspectors (Enforcement Officers)**: Automates field label scrutiny, validates letter/numeral heights against Principal Display Panel (PDP) area under Rule 7 Table-I, flags statutory violations under Section 36(1) of the Legal Metrology Act, 2009, and generates formal inspection dockets (FORM LM-INSP-2011) with photographic evidence.
2. **Everyday Consumers**: Scans packaging front and back panels to verify fair Maximum Retail Price (MRP), validates mandatory Unit Sale Price (USP), and audits nutritional values against ICMR-NIN 2024 thresholds (flagging High Sugar, Saturated Fat, Sodium, and Trans Fat).

---

## 2. Repository Structure

This repository is structured as a monorepo containing frontend client applications, backend application services, machine learning pipelines, and testing suites:

```
.
|-- README.md                     # Repository root overview and temporary guide
|-- frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS SPA
|   |-- src/
|   |   |-- pages/
|   |   |   |-- consumer/         # Consumer portals (Scanner, Health Check, History)
|   |   |   `-- officer/          # Enforcement portals (Dashboard, Inspections, Reports)
|   |   |-- components/           # Modular UI widgets and layout elements
|   |   |-- data/                 # Statutory rules, ICMR benchmarks, mock datasets
|   |   |-- types/                # TypeScript domain models and interfaces
|   |   `-- utils/                # Compliance scoring and formatting utilities
|   |-- tailwind.config.js        # Restrained Civic color palette definition
|   `-- package.json              # Frontend dependencies and scripts
|-- backend/                      # Python FastAPI application services (in development)
|   |-- routers/                  # API endpoints (auth, scan, health, reports, violations)
|   |-- models/                   # SQLAlchemy 2.0 ORM relational models
|   |-- schemas/                  # Pydantic v2 validation contracts
|   `-- services/                 # Compliance checker, PDF generator, storage service
|-- ai/                           # Modern AI pipeline (OCR + VLM + Rules Engine + RAG)
|   |-- vlm_extractor.py          # Multimodal VLM (Gemini 1.5 Flash) & PaddleOCR structured extraction
|   |-- rules_engine.py           # Deterministic Python validation (USP math, SI units, Rule 7 Table-I)
|   |-- statutory_rag.py          # PostgreSQL pgvector semantic search over Legal Metrology Acts
|   |-- contrast_analyzer.py      # Rule 9 WCAG 2.1 color contrast calculator
|   |-- nutrition_engine.py       # ICMR-NIN 2024 back-panel nutritional table parser and health scoring
|   `-- benchmark_data/           # 50-SKU physical packaging ground-truth evaluation benchmark
`-- tests/                        # Automated testing harness (in development)
    |-- e2e/                      # Playwright frontend end-to-end test specs
    |-- api/                      # Pytest backend REST API integration tests
    `-- ai/                       # RAG retrieval precision and extraction accuracy benchmarks
```

---

## 3. Statutory Rules Engine Summary

The verification pipeline cross-references packaging imagery against the Legal Metrology (Packaged Commodities) Rules, 2011:

- **Rule 6(1)(a)**: Complete name and address of manufacturer, packer, or importer with 6-digit postal PIN.
- **Rule 6(1)(aa)**: Mandatory Country of Origin declaration for imported and domestic goods.
- **Rule 6(1)(b)**: Common or generic name of the commodity contained in the package.
- **Rule 6(1)(c) & Rule 13**: Net quantity in standard SI metric units (`g`, `kg`, `ml`, `l`). Non-standard units (`gms`, `Kgs`, `ltrs`) are flagged as illegal.
- **Rule 6(1)(d)**: Month and year of manufacture, packing, or import (`MM/YYYY` or `Month Year`).
- **Rule 6(1)(e)**: Maximum Retail Price (MRP) in the mandatory format: `inclusive of all taxes`.
- **Rule 6(1)(e) Second Proviso**: Unit Sale Price (USP) per g/ml/100g/kg/litre mandatory since October 2022.
- **Rule 6(1)(n)**: Consumer care coordinates (contact person/office, address, telephone, email).
- **Rule 7 & Table-I**: Minimum font height of letters and numerals proportional to Principal Display Panel (PDP) area (1.0 mm to 6.0 mm).
- **Rule 9(1)**: Conspicuousness and color contrast between text and background substrate (WCAG contrast ratio >= 3.0:1).
- **Rule 18(2A)**: Strict prohibition of dual MRP stickers and price alteration.
- **Act Section 36(1)**: Statutory penalty provisions for non-compliant packaged commodities.

---

## 4. Getting Started (Frontend Prototype)

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup & Local Execution
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be accessible at `http://localhost:5173/`.

### Build Verification
```bash
# Run TypeScript compilation and production build
npm run build
```

---

## 5. Development Roles & Responsibilities

1. **Frontend Developer**: React 19 SPA, API client layer (`src/services/api.ts`), AuthContext state, canvas image downsampling, dynamic bounding box overlays, and print stylesheets for statutory certificates.
2. **Backend Developer**: FastAPI application gateway, PostgreSQL relational schema with pgvector, SQLAlchemy 2.0 ORM, JWT RBAC security, multipart file streaming, and headless WeasyPrint PDF generator for FORM LM-INSP-2011.
3. **Data Analyst / AI Engineer**: Multimodal VLM/OCR prompt engineering with Pydantic structured output, Statutory RAG indexing using PostgreSQL pgvector, deterministic Python Rule Engine (USP math, SI unit validation, Rule 7 Table-I font calibration), and ICMR-NIN nutrition profiling engine.
4. **Tester + DevOps Engineer**: Playwright E2E test suites, Pytest API integration tests, RAG retrieval precision and VLM extraction benchmark harness, Docker containerization, GitHub Actions CI/CD pipelines, and cloud deployment.

---

## 6. Project Documentation Reference

Comprehensive system specifications and execution guidelines are located in the `docs/` directory:

### Core Architecture & Strategy
- [Master Blueprint & PRD](docs/prd_master_blueprint.md): Complete statutory cross-walk, PostgreSQL 16 schema DDL, REST API contracts, CV/ML pipeline architecture, and risk register.
- [Development Roadmap](docs/development_roadmap.md): 8-phase implementation roadmap with specific tasks, target file paths, and deliverables for each of the 4 team members.
- [Team Strategy & Execution Plan](docs/team_strategy.md): 10-week sprint calendar (Sprints 1 through 5), integration touchpoints, tech stack rationale, and engineering standards.

### Backend & Infrastructure Specifications
- [RESTful API Contract Specification](docs/api_specification.md): Complete OpenAPI specification with request/response JSON schemas, pagination, and error catalogs.
- [Database Schema & Migrations](docs/database_schema.md): Production PostgreSQL 16 DDL, foreign keys, B-Tree/GIN indexes, Alembic migration runbooks, and seed data.
- [Authentication, RBAC & Security Specification](docs/security_and_auth.md): Dual-token JWT lifecycle, single-use refresh token rotation, RBAC matrix, and Section 63 BSA evidence chain.
- [Object Storage & Asset Conventions](docs/storage_specification.md): S3/Cloudflare R2 bucket taxonomy, magic byte validation, EXIF scrubbing, and SHA-256 evidence hashing.
- [Environment Configuration & Secrets Guide](docs/environment_setup.md): Complete `.env.example` templates, Docker Compose configuration, and local quickstart runbooks.

### Machine Learning, Rules Engine & Dataset
- [Statutory Rules Engine Specification](docs/rules_engine_spec.md): Exact RegEx patterns, Rule 6 statutory clauses, Rule 7 Table-I font calibration, and Rule 9 contrast algorithms.
- [Packaging Dataset Collection & Annotation Guide](docs/dataset_annotation_guide.md): 50-SKU physical packaging sampling matrix, 19 entity classes, JSON annotation schema, and digital caliper QA.
- [ICMR-NIN Nutritional Benchmark & Health Engine](docs/nutrition_profiling_spec.md): Tabular nutrition parsing, ICMR-NIN 2024 & WHO cutoffs, 100-point Health Score algorithm, and clinical contraindications.
- [ML Benchmarking & Evaluation Protocol](docs/ml_benchmark_protocol.md): CER, WER, entity F1-score, font height MAE metrics, and automated benchmark runner architecture.

### Frontend & Quality Assurance
- [Design System & Visual Standards](docs/design_system.md): Civic teal color tokens, typography scale, component blueprints, and @phosphor-icons/react dictionary.
- [Frontend State & Navigation Flow Map](docs/frontend_flow_and_state.md): Centralized state routing, scanner state machine, canvas downsampling, and offline caching schema.
- [Quality Assurance & Test Strategy Matrix](docs/test_plan.md): Testing pyramid, Pytest API integration tests, Playwright E2E suites, and CI gatekeeper workflows.

---

*Note: This is a temporary root overview document for initial setup and repository navigation. Full technical specifications are maintained in the system master blueprints.*
