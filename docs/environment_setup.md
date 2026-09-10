# MetroScan: Environment Configuration & Secrets Management Guide
**Project ID**: SIH26034  
**Project Title**: Software System to Check Compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by Scanning Products, Images and Labels  
**Administering Ministry**: Ministry of Consumer Affairs, Food & Public Distribution, Department of Consumer Affairs (Legal Metrology Division), Government of India  
**Document Classification**: Technical Operations and Infrastructure Standard  
**Document Version**: 1.0.0  
**Target Audience**: Software Engineers, ML Engineers, DevOps, System Administrators, Evaluation Judges

---

## 1. Document Purpose and Scope

### 1.1 Objective
This document defines the standardized environment configuration, runtime prerequisites, secrets management architecture, and local orchestration protocols for the **MetroScan** automated compliance verification platform. 

Adherence to this guide ensures deterministic, reproducible runtime behavior across:
- **Local Development**: Developer workstations (macOS Apple Silicon/Intel, Linux Ubuntu/Debian, Windows WSL2).
- **Automated Testing & CI/CD**: GitHub Actions workflows executing linting, unit tests, contract tests, and container builds.
- **Staging / Demonstration**: Isolated pre-production environments for ministry evaluation, hackathon judging, and end-to-end integration validation.
- **Production**: High-availability cloud deployment architectures with zero secret leakage and strict access boundaries.

### 1.2 Architectural Boundaries
The MetroScan platform comprises three primary sub-systems governed by this environment standard:
1. **Client Single Page Application (SPA)**: React 19 + TypeScript + Vite + Tailwind CSS (`/frontend`).
2. **Core Application Service**: Python 3.11+ FastAPI backend with SQLAlchemy 2.0 ORM, Alembic migrations, and Pydantic v2 schemas (`/backend`).
3. **Computer Vision & Inference Pipeline**: Optical Character Recognition (PaddleOCR / Tesseract), font letter height estimator (Rule 7 Table-I), and ICMR-NIN nutritional table parser (`/ml`).

---

## 2. System Hardware and Software Requirements

### 2.1 Core Runtime Dependencies

| Subsystem / Tool | Minimum Version | Recommended Version | Purpose |
|---|---|---|---|
| **Node.js** | v18.18.0 LTS | v20.11.0 LTS or v22.x | JavaScript runtime for Vite build tooling and React SPA development |
| **npm** | v9.5.0 | v10.2.0+ | Frontend package dependency manager (included with Node.js) |
| **Python** | v3.11.0 | v3.11.8 or v3.12.2 | Backend API runtime, asynchronous event loops, ML pipeline dependencies |
| **PostgreSQL** | v15.0 | v16.2 | Primary relational persistence for scans, violations, dockets, and audit trails |
| **Docker Engine** | v24.0.0 | v26.0.0+ | Containerized local service orchestration and reproducible builds |
| **Docker Compose** | v2.20.0 | v2.26.0+ | Multi-container local orchestration specification (Compose v2 spec) |
| **Git** | v2.38.0 | v2.43.0+ | Source control, submodules, and pre-commit secret scanning hooks |

### 2.2 System-Level OS Libraries (Machine Learning & Image Processing)
For native local development of the `/backend` and `/ml` services without Docker, the host operating system requires image manipulation and rendering libraries.

#### macOS (Homebrew)
```bash
brew install libmagic poppler tesseract opencv ffmpeg
```

#### Linux (Ubuntu 22.04 / 24.04 LTS)
```bash
sudo apt-get update && sudo apt-get install -y \
    build-essential \
    libpq-dev \
    libmagic1 \
    poppler-utils \
    tesseract-ocr \
    libgl1-mesa-glx \
    libglib2.0-0
```

#### Windows (WSL2 Ubuntu)
Execute the Linux (Ubuntu) package commands inside a WSL2 Ubuntu 22.04+ distribution. Direct Windows Command Prompt or PowerShell execution of Python ML dependencies is not recommended due to C-extension compilation mismatches.

### 2.3 Recommended Hardware Specifications
- **CPU**: 4 Cores minimum (8 Cores recommended for parallel OCR image processing).
- **RAM**: 8 GB RAM minimum (16 GB recommended for concurrent Vite dev server, FastAPI server, Docker PostgreSQL, and PaddleOCR pipeline).
- **Disk**: 15 GB free disk space for Docker containers, node_modules, Python virtual environments, and sample packaging benchmark datasets.

---

## 3. Monorepo Directory Topology

MetroScan employs a unified monorepo structure. Environment configurations are scoped at the component boundary to prevent accidental leaks of backend service credentials into client-facing bundles.

```
/Users/lovejeetsingh1/Documents/SIH/
|-- .git/                              # Git metadata and repository hooks
|-- .gitignore                         # Root git exclusion rules (enforces zero .env leaks)
|-- .oxlintrc.json                     # Static code analysis configuration
|-- README.md                          # Repository overview and master documentation link
|-- docker-compose.yml                 # Local multi-container database & tooling configuration
|
|-- docs/                              # Formal system documentation
|   |-- prd_master_blueprint.md        # Comprehensive system specification (Rule 6, Rule 7, Rule 9)
|   |-- team_strategy.md               # Team roles, 24-hour sprint milestones, submission checklist
|   `-- environment_setup.md           # This specification
|
|-- frontend/                          # Client Web Application (Vite + React 19 + TypeScript)
|   |-- .env.example                   # Client-side environment template
|   |-- .env                           # Local client environment (Git-ignored)
|   |-- package.json                   # Node dependencies and scripts
|   |-- vite.config.ts                 # Vite bundler configuration & reverse proxy routing
|   |-- tailwind.config.js             # Civic Restrained color palette and UI typography
|   |-- index.html                     # Single-page application root entrypoint
|   |-- src/                           # Client source code
|   |   |-- pages/                     # Consumer and Officer routes
|   |   |-- components/                # Reusable UI widgets and layout containers
|   |   |-- types/                     # Shared TypeScript domain contracts
|   |   `-- utils/                     # Compliance verification and statutory formatting logic
|   `-- public/                        # Static client assets (logos, fallback images)
|
|-- backend/                           # Core REST API Service (FastAPI + SQLAlchemy + Alembic)
|   |-- .env.example                   # Backend environment template
|   |-- .env                           # Local backend environment (Git-ignored)
|   |-- requirements.txt               # Pinned Python package dependencies
|   |-- main.py                        # FastAPI application instantiation and middleware
|   |-- config.py                      # Pydantic BaseSettings environment parsing & validation
|   |-- database.py                    # SQLAlchemy engine and sessionmaker configuration
|   |-- alembic.ini                    # Database migration configuration
|   |-- alembic/                       # Schema migration version scripts
|   |-- routers/                       # Endpoint controllers (auth, scan, officer, consumer, reports)
|   |-- models/                        # SQLAlchemy database models
|   |-- schemas/                       # Pydantic request/response validation contracts
|   |-- services/                      # Compliance calculation, PDF generation, cloud storage
|   `-- uploads/                       # Local file storage directory (Git-ignored)
|
|-- ml/                                # Optical Processing and Legal Metrology Analysis Pipeline
|   |-- requirements.txt               # Computer vision & OCR dependencies (PaddleOCR, OpenCV)
|   |-- ocr_engine.py                  # Multi-engine OCR extraction with bounding box coordinates
|   |-- declaration_extractor.py       # Rule 6 statutory field extraction regex and heuristics
|   |-- font_analyzer.py               # Rule 7 Table-I physical font height estimator
|   |-- contrast_analyzer.py           # Rule 9 WCAG 2.1 color contrast calculation
|   |-- nutrition_parser.py            # ICMR-NIN back-panel nutritional table extractor
|   `-- test_data/                     # Packaged goods test images and label benchmarks
|
`-- tests/                             # Automated Test Suites
    |-- frontend/                      # Vitest / React Testing Library unit tests
    |-- backend/                       # Pytest API integration and unit tests
    `-- ml/                            # Accuracy benchmark tests on statutory detection
```

---

## 4. Complete Environment Variable Specifications

### 4.1 Frontend Environment Configuration (`frontend/.env.example`)

In client applications built with Vite, only environment variables prefixed with `VITE_` are statically embedded into the client bundle at build time. Never expose API secrets, database passwords, or private encryption keys in any `VITE_` variable.

#### File: `/Users/lovejeetsingh1/Documents/SIH/frontend/.env.example`
```dotenv
# ==============================================================================
# MetroScan Frontend Client Environment Configuration Template
# Project ID: SIH26034
# ==============================================================================

# Base URL for the Backend REST API
# In local development: http://localhost:8000/api/v1
# In production: https://api.metroscan.gov.in/api/v1 or relative /api/v1 (behind reverse proxy)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Target application runtime environment
# Allowed values: development | staging | production
VITE_APP_ENV=development

# Offline Demonstration and Fallback Mode
# Set to true to bypass backend network requests and use embedded static mock data
# Set to false to enforce live network calls to the FastAPI backend service
VITE_ENABLE_MOCK_DATA=false

# Application Display Title
VITE_APP_TITLE=MetroScan - Legal Metrology Compliance Engine

# Optional: Map / Analytics Service Configurations (if enabled for field officer geolocation)
VITE_MAP_TILES_PROVIDER=osm
```

#### Frontend Variable Dictionary

| Variable Name | Type | Allowed Values | Default (Dev) | Description & Security Impact |
|---|---|---|---|---|
| `VITE_API_BASE_URL` | String (URL) | Valid HTTP/HTTPS URI | `http://localhost:8000/api/v1` | Target endpoint for all axios/fetch client requests. Must include version prefix `/api/v1`. Publicly visible in browser bundle. |
| `VITE_APP_ENV` | String | `development`, `staging`, `production` | `development` | Dictates logging verbosity, React Error Boundary behavior, and UI environment banner. |
| `VITE_ENABLE_MOCK_DATA` | Boolean | `true`, `false` | `false` | Controls whether the frontend uses static JSON mock fallbacks for offline demo presentations or live API responses. |
| `VITE_APP_TITLE` | String | Alphanumeric string | `MetroScan` | Browser document title and top navigation bar display branding. |
| `VITE_MAP_TILES_PROVIDER` | String | `osm`, `carto` | `osm` | Provider identifier for map rendering in the Officer Inspection cluster view. |

---

### 4.2 Backend Environment Configuration (`backend/.env.example`)

The backend service utilizes Pydantic `BaseSettings` for type-safe environment variable parsing, casting, and validation upon process startup. If any required variable is missing or malformed, the application will terminate immediately with an explicit validation error.

#### File: `/Users/lovejeetsingh1/Documents/SIH/backend/.env.example`
```dotenv
# ==============================================================================
# MetroScan Backend Core Service Environment Configuration Template
# Project ID: SIH26034
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Application Runtime Settings
# ------------------------------------------------------------------------------
APP_ENV=development
DEBUG=true
PORT=8000
HOST=0.0.0.0

# ------------------------------------------------------------------------------
# 2. Relational Database Configuration (PostgreSQL)
# ------------------------------------------------------------------------------
# Standard Connection URI Format:
# postgresql://<username>:<password>@<host>:<port>/<database_name>
DATABASE_URL=postgresql://metroscan_user:metroscan_pass@localhost:5432/metroscan_db

# Connection Pool Configurations
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20
DATABASE_POOL_TIMEOUT=30

# ------------------------------------------------------------------------------
# 3. Authentication, Tokenization & Security
# ------------------------------------------------------------------------------
# Generate a cryptographically secure 256-bit key using: openssl rand -hex 32
JWT_SECRET_KEY=4a2e8c1f9b3d7a6e508192c73e4b5a6f80192837465019283746501928374650
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7

# Bcrypt password hashing rounds (12 is industry standard)
BCRYPT_ROUNDS=12

# ------------------------------------------------------------------------------
# 4. Storage Architecture (Packaging Images & Inspection Dockets)
# ------------------------------------------------------------------------------
# Provider options: local | s3 | cloudflare_r2
STORAGE_PROVIDER=local

# Local Storage Directory (used when STORAGE_PROVIDER=local)
STORAGE_LOCAL_DIR=./uploads

# S3 or Cloudflare R2 Settings (used when STORAGE_PROVIDER=s3 or cloudflare_r2)
S3_ENDPOINT_URL=
S3_BUCKET_NAME=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_REGION=auto

# ------------------------------------------------------------------------------
# 5. Cross-Origin Resource Sharing (CORS)
# ------------------------------------------------------------------------------
# Comma-separated origins allowed to perform cross-origin XMLHttpRequests
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# ------------------------------------------------------------------------------
# 6. Computer Vision & ML Subsystem Integration
# ------------------------------------------------------------------------------
# OCR execution mode: paddleocr | tesseract | mock
OCR_ENGINE=paddleocr
OCR_USE_GPU=false
OCR_CONFIDENCE_THRESHOLD=0.60

# Physical reference calibration: default packaging pixel-to-millimeter ratio
# Calibrated for standard smartphone camera at 30cm distance (300 DPI)
CALIBRATION_PIXEL_PER_MM=11.81
```

#### Backend Variable Dictionary

| Variable Name | Type | Required | Default (Dev) | Description & Operational Guidance |
|---|---|---|---|---|
| `APP_ENV` | String | Yes | `development` | Operating context (`development`, `staging`, `production`). In production, interactive tracebacks are disabled. |
| `DEBUG` | Boolean | Yes | `true` | Enables FastAPI auto-reloading and verbose exception payloads. Must be `false` in production. |
| `PORT` | Integer | Yes | `8000` | TCP port on which the Uvicorn ASGI server binds. |
| `HOST` | String | Yes | `0.0.0.0` | Network interface binding. `0.0.0.0` allows Docker bridge and container connectivity. |
| `DATABASE_URL` | String | Yes | `postgresql://...` | Full PostgreSQL connection string with authentication credentials, host, and database name. |
| `DATABASE_POOL_SIZE` | Integer | No | `10` | Number of persistent connections maintained in the SQLAlchemy connection pool. |
| `DATABASE_MAX_OVERFLOW` | Integer | No | `20` | Max overflow connections created during burst traffic above `POOL_SIZE`. |
| `JWT_SECRET_KEY` | Hex String | Yes | N/A | HMAC SHA-256 private key for signing authentication tokens. Must be at least 32 bytes (64 hex characters). |
| `JWT_ALGORITHM` | String | Yes | `HS256` | Cryptographic algorithm for JWT verification. Must remain `HS256` or `RS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| Integer | Yes | `1440` | Lifetime of Officer session tokens (1440 min = 24 hours). |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Integer | Yes | `7` | Refresh token lifecycle before re-authentication is mandated. |
| `STORAGE_PROVIDER` | String | Yes | `local` | Target binary storage mechanism: `local` filesystem, AWS `s3`, or `cloudflare_r2`. |
| `STORAGE_LOCAL_DIR` | Path | If local | `./uploads` | Relative or absolute path where uploaded packaging scans and generated PDF dockets reside. |
| `S3_ENDPOINT_URL` | URL | If s3/r2 | Empty | Custom S3 endpoint URL (mandatory for Cloudflare R2 or MinIO). |
| `S3_BUCKET_NAME` | String | If s3/r2 | Empty | Destination bucket name for packaging images. |
| `S3_ACCESS_KEY` | String | If s3/r2 | Empty | IAM Access Key ID with write access to the S3 bucket. |
| `S3_SECRET_KEY` | String | If s3/r2 | Empty | IAM Secret Key. Strictly protected. |
| `CORS_ORIGINS` | Comma List | Yes | Localhost | Comma-separated whitelist of HTTP Origin headers permitted to access the API. |
| `OCR_ENGINE` | String | Yes | `paddleocr` | Primary text detection model (`paddleocr`, `tesseract`, or `mock`). |
| `OCR_USE_GPU` | Boolean | No | `false` | Enables CUDA acceleration for PaddleOCR inference if NVIDIA GPU is present. |
| `CALIBRATION_PIXEL_PER_MM` | Float | Yes | `11.81` | Dimensional calibration coefficient for converting pixel measurements to physical millimeters under Rule 7 Table-I. |

---

## 5. Docker Compose Infrastructure Configuration

To eliminate local environment discrepancy ("it works on my machine"), MetroScan provides a validated Docker Compose infrastructure configuration containing a dedicated PostgreSQL 16 container, automated healthchecks, volume persistence, and an optional database administration utility.

### 5.1 Docker Compose Specification File (`docker-compose.yml`)

The following configuration file is placed directly in the repository root (`/Users/lovejeetsingh1/Documents/SIH/docker-compose.yml`).

```yaml
version: "3.8"

services:
  # ----------------------------------------------------------------------------
  # PostgreSQL 16 Relational Database Engine
  # ----------------------------------------------------------------------------
  metroscan-db:
    image: postgres:16-alpine
    container_name: metroscan-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-metroscan_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-metroscan_pass}
      POSTGRES_DB: ${POSTGRES_DB:-metroscan_db}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - metroscan_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER:-metroscan_user} -d $${POSTGRES_DB:-metroscan_db}"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - metroscan-network

  # ----------------------------------------------------------------------------
  # Optional Database GUI Administration (Adminer)
  # Accessible via http://localhost:8080
  # ----------------------------------------------------------------------------
  metroscan-adminer:
    image: adminer:latest
    container_name: metroscan-adminer
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: metroscan-db
    depends_on:
      metroscan-db:
        condition: service_healthy
    networks:
      - metroscan-network

volumes:
  metroscan_postgres_data:
    driver: local

networks:
  metroscan-network:
    driver: bridge
```

### 5.2 Docker Compose Management Commands

```bash
# Start PostgreSQL in the background
docker compose up -d metroscan-db

# Check status and verify container health
docker compose ps

# View database live logs
docker compose logs -f metroscan-db

# Access interactive PostgreSQL shell inside container
docker exec -it metroscan-postgres psql -U metroscan_user -d metroscan_db

# Stop services without deleting database volume
docker compose down

# Stop services and purge all persisted database volumes (clean reset)
docker compose down -v
```

---

## 6. Step-by-Step Local Development Quickstart

Follow this sequential sequence to bootstrap an operational development environment from scratch.

### 6.1 Phase 1: Database Initialization

#### Option A: Docker Compose (Recommended)
Ensure Docker Desktop or Docker Engine is running on your machine:
```bash
cd /Users/lovejeetsingh1/Documents/SIH
docker compose up -d metroscan-db
```
Verify the container is healthy:
```bash
docker compose ps
# Expected output: metroscan-postgres ... (healthy)
```

#### Option B: Native macOS PostgreSQL (Homebrew)
```bash
brew install postgresql@16
brew services start postgresql@16

# Create database and application user
psql postgres -c "CREATE USER metroscan_user WITH PASSWORD 'metroscan_pass';"
psql postgres -c "CREATE DATABASE metroscan_db OWNER metroscan_user;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE metroscan_db TO metroscan_user;"
```

---

### 6.2 Phase 2: Backend & ML Pipeline Setup

The backend service requires Python 3.11+ and an isolated virtual environment (`.venv`).

#### Step 1: Create and Activate Python Virtual Environment
```bash
cd /Users/lovejeetsingh1/Documents/SIH/backend

# Create virtual environment
python3.11 -m venv .venv

# Activate virtual environment
# On macOS / Linux:
source .venv/bin/activate
# On Windows (PowerShell):
# .venv\Scripts\Activate.ps1
```

#### Step 2: Install Core Python Dependencies
Ensure `pip`, `setuptools`, and `wheel` are updated, then install dependencies:
```bash
pip install --upgrade pip setuptools wheel
pip install fastapi uvicorn[standard] sqlalchemy psycopg2-binary alembic pydantic pydantic-settings python-jose[cryptography] passlib[bcrypt] python-multipart pillow
```

#### Step 3: Configure Backend Environment Variables
Copy the template file to active `.env`:
```bash
cp .env.example .env
```
Generate a fresh cryptographic secret key for JWT authentication:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```
Edit `backend/.env` and replace `JWT_SECRET_KEY` with the generated 64-character hex string.

#### Step 4: Execute Database Migrations
Initialize the schema and create all tables:
```bash
# Verify connection and apply all Alembic migrations up to head
alembic upgrade head
```

#### Step 5: Start FastAPI Development Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Verify the backend is live:
- Swagger Interactive API Docs: `http://localhost:8000/docs`
- ReDoc Technical Reference: `http://localhost:8000/redoc`
- System Health Endpoint: `http://localhost:8000/api/v1/health`

---

### 6.3 Phase 3: Frontend Client Setup

The frontend is a modern single-page application built with React 19, TypeScript, and Vite.

#### Step 1: Navigate to Frontend Directory and Install Dependencies
```bash
cd /Users/lovejeetsingh1/Documents/SIH/frontend

# Install pinned dependencies using npm
npm install
```

#### Step 2: Configure Frontend Environment Variables
```bash
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` points to your running FastAPI backend:
```ini
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_ENV=development
VITE_ENABLE_MOCK_DATA=false
VITE_APP_TITLE=MetroScan
```

#### Step 3: Run Code Quality Checks
Verify code formatting and linting:
```bash
# Run oxlint for ultrafast static analysis
npx oxlint .

# Run TypeScript type checker
npx tsc --noEmit
```

#### Step 4: Start Vite Development Server
```bash
npm run dev
```
The application will bind to `http://localhost:5173`. Open this URL in Google Chrome or Safari to interact with the MetroScan platform.

---

### 6.4 Phase 4: Verification and Smoke Testing Checklist

Execute the following verification script from your terminal to validate cross-subsystem communication:

```bash
# 1. Test Backend Health Probe
curl -s http://localhost:8000/api/v1/health | grep -q "healthy" && echo "[OK] Backend is healthy" || echo "[FAIL] Backend healthcheck failed"

# 2. Test CORS Headers on Backend
curl -s -I -X OPTIONS http://localhost:8000/api/v1/health \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" | grep -i "Access-Control-Allow-Origin"

# 3. Test Frontend Dev Server HTTP Response
curl -s -I http://localhost:5173 | grep -q "200 OK" && echo "[OK] Frontend is serving HTTP 200" || echo "[FAIL] Frontend unreachable"
```

---

## 7. Secrets Management & Multi-Stage Deployment

### 7.1 Secret Classification Taxonomy

| Classification Level | Sensitivity | Examples | Storage Location | Permitted Access |
|---|---|---|---|---|
| **Public Config** | Low | `VITE_APP_TITLE`, `VITE_API_BASE_URL`, `CORS_ORIGINS` | `.env.example`, Git repo | Publicly readable in client bundle |
| **Operational Params** | Medium | `PORT`, `DATABASE_POOL_SIZE`, `CALIBRATION_PIXEL_PER_MM` | `.env`, CI environment variables | Internal processes |
| **Private Credentials** | High | `DATABASE_URL`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | GitHub Secrets, Railway/Render dashboard | Backend server processes only |
| **Cryptographic Root** | Critical | `JWT_SECRET_KEY`, Master Database Encryption Keys | Cloud Key Vaults (AWS Secrets Manager, KMS) | Strictly injected at container launch |

---

### 7.2 Git Leakage Prevention & Security Enforcement Rules

1. **Zero `.env` Commit Rule**:
   Under no circumstances should any `.env`, `.env.local`, `.env.production`, or private key files be tracked in git. All `.gitignore` files must explicitly contain:
   ```gitignore
   # Environment files
   .env
   .env.*
   !.env.example
   ```

2. **Pre-Commit Secret Scanning**:
   All developers and automated agents must install and enable git pre-commit hooks to detect accidentally staged secrets:
   ```bash
   pip install pre-commit detect-secrets
   pre-commit install
   ```

3. **CI/CD Build Secret Verification**:
   The GitHub Actions workflow includes a security audit step that scans git history for high-entropy strings and known token signatures before executing builds.

---

### 7.3 Staging and Production Cloud Deployment

#### 7.3.1 Railway / Render Platform Configuration
When deploying the FastAPI backend to PaaS providers (e.g. Railway or Render):
- Set build command: `pip install -r backend/requirements.txt`
- Set start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Configure environment variables directly in the provider dashboard under Environment Variables:
  - `APP_ENV`: `production`
  - `DEBUG`: `false`
  - `DATABASE_URL`: Set to the managed PostgreSQL connection string provided by the cloud provider.
  - `JWT_SECRET_KEY`: Set to a newly generated 64-character hex key.
  - `CORS_ORIGINS`: Set to your production frontend domain (e.g. `https://metroscan.gov.in`).

#### 7.3.2 Supabase Database Connection Guidelines
When utilizing Supabase as the managed PostgreSQL backend:
- **Direct Connection (Session Mode)**: Port `5432` — used for Alembic schema migrations:
  `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
- **Transaction Pooling Mode (PgBouncer)**: Port `6543` — used for application runtime query pooling:
  `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`

#### 7.3.3 GitHub Actions CI/CD Pipeline Secrets
In your GitHub repository settings under **Settings > Secrets and variables > Actions**, configure the following required repository secrets:

| GitHub Secret Name | Description | Used In Workflow |
|---|---|---|
| `PROD_DATABASE_URL` | Production PostgreSQL connection string | Database migration and deployment jobs |
| `PROD_JWT_SECRET_KEY` | Production HMAC signing key | Integration test suite and runtime config |
| `CLOUDFLARE_R2_ACCESS_KEY` | Storage Access Key for image bucket | Build and upload verification |
| `CLOUDFLARE_R2_SECRET_KEY` | Storage Secret Key | Storage integration tests |
| `RENDER_DEPLOY_HOOK` | Webhook URL to trigger automatic cloud deployment | CD CD Release pipeline |

---

### 7.4 Compromised Secret Rotation Runbook

In the event that an active secret (such as `JWT_SECRET_KEY` or `DATABASE_URL`) is accidentally committed to a public repository:

1. **Immediate Revocation**:
   - Invalidate the database credentials immediately in the database control console.
   - Update the password and re-issue the connection string.
2. **Re-key Application JWT**:
   - Generate a new secret: `openssl rand -hex 32`.
   - Update `JWT_SECRET_KEY` across all production runtime nodes.
   - Note: This will invalidate all active inspector sessions, requiring users to log in again.
3. **Purge Git History**:
   - Use `git-filter-repo` or BFG Repo-Cleaner to permanently scrub the sensitive commit from git reflogs:
   ```bash
   pip install git-filter-repo
   git-filter-repo --invert-paths --path backend/.env
   git push origin --force --all
   ```
4. **Audit Access Logs**:
   - Inspect PostgreSQL connection logs and cloud audit trails for unauthorized IP addresses during the exposure window.

---

## 8. Summary of Ports, Protocols, and Default Credentials

| Service | Port | Protocol | Default Dev Credentials | Accessible From |
|---|---|---|---|---|
| Frontend Vite Server | `5173` | HTTP | None | Host Machine / Browser |
| Backend FastAPI Server | `8000` | HTTP | None | Host Machine / Frontend |
| PostgreSQL Database | `5432` | TCP / PostgreSQL | `metroscan_user` / `metroscan_pass` | Backend / Docker Bridge |
| Adminer Database GUI | `8080` | HTTP | (Connects to metroscan-db:5432) | Host Machine / Browser |
| Backend OpenAPI Docs | `8000/docs` | HTTP | None | Host Machine / Browser |

---
**MetroScan Engineering Team (SIH26034)**  
*Approved for Implementation and Evaluation Standardization*\n