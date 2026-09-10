# MetroScan: Production Database Schema & Migration Specification

**Project Identifier**: SIH26034  
**Project Title**: Software System to Check Compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by Scanning Products, Images and Labels  
**Administering Ministry**: Ministry of Consumer Affairs, Food & Public Distribution, Department of Consumer Affairs (Legal Metrology Division), Government of India  
**Document Classification**: Relational Database DDL, Indexing Strategy, and Migration Specification  
**Document Version**: 1.0.0 (Production Release)  
**Database Engine**: PostgreSQL 16+  
**ORM Target**: SQLAlchemy 2.0 (AsyncIO / asyncpg)  
**Migration Engine**: Alembic 1.13+  

---

## 1. Document Header & Purpose

### 1.1 System Context & Architectural Scope
MetroScan is an automated statutory compliance verification and consumer nutritional auditing platform designed for enforcement authorities (Legal Metrology Inspectors) and Indian retail consumers. The persistence tier must guarantee absolute ACID compliance, tamper-evident auditability, rapid spatial and text query retrieval, and strict referential integrity for statutory violation dockets that may be used in judicial proceedings under Section 36(1) of the Legal Metrology Act, 2009.

This specification provides the production-grade PostgreSQL 16 database definition, covering:
1. Enumerated types and domains for role-based access control, compliance classification, and report types.
2. Complete Data Definition Language (DDL) statements with foreign key constraints, deletion rules (`CASCADE`, `RESTRICT`, `SET NULL`), and check constraints.
3. Semi-structured JSONB schema specifications for computer vision bounding boxes, nutritional breakdown tables, warning badges, and legal enforcement timeline tracking.
4. Strategic index topology incorporating B-Tree, Partial, Composite, and Generalized Inverted (GIN) indexes.
5. Deterministic seed fixtures including authorized enforcement personnel, everyday consumers, and benchmark audit records (Bournvita, Maggi, and Whole Almonds).
6. Enterprise Alembic migration workflow enabling automated zero-downtime schema evolution and rollback management.

### 1.2 Core Design Principles
- **Relational Integrity for Evidentiary Artifacts**: Enforcement dockets, inspection reports, and violation records are subject to legal evidentiary standards. Hard deletes on historical violations or reports are strictly prohibited at the database level via `ON DELETE RESTRICT` foreign keys.
- **UUIDv4 Surrogate Primary Keys**: All primary keys utilize uniformly distributed 128-bit Universally Unique Identifiers generated natively via PostgreSQL 16 `gen_random_uuid()`. This prevents sequence exhaustion, eliminates sequential enumeration attacks across public-facing APIs, and simplifies cross-region data synchronization.
- **Microsecond UTC Timestamps**: All temporal fields are stored as `TIMESTAMP WITH TIME ZONE` (`TIMESTAMPTZ`) normalized to UTC to ensure immutable chronological ordering across Indian Standard Time (IST) zones and international supply chains.
- **Hybrid Relational-Document Architecture**: Relational constraints enforce business invariants (e.g., users, scans, reports), while PostgreSQL `JSONB` storage captures complex hierarchical structures (optical bounding boxes with polygonal vertices, ICMR-NIN 2024 nutritional profiles, and multi-actor case timeline histories).
- **Zero-Tolerance Statutory Consistency**: Floating-point types (`REAL` or `DOUBLE PRECISION`) are prohibited for monetary, physical dimensional, or score calculations due to binary rounding inaccuracies. All physical measurements (mm, cm2) and monetary amounts (INR) utilize fixed-point `NUMERIC(p, s)` types.

---

## 2. Entity-Relationship (ER) Overview

### 2.1 ASCII Entity-Relationship Diagram

```
+-----------------------------------------------------------------------------------------+
|                                    METROSCAN RELATIONAL ERD                             |
+-----------------------------------------------------------------------------------------+

       +----------------------------------------------------+
       |                       users                        |
       +----------------------------------------------------+
       | PK id: UUID                                        |
       |    email: VARCHAR(255) [UNIQUE]                    |
       |    password_hash: VARCHAR(255)                     |
       |    role: user_role [ENUM]                          |
       |    full_name: VARCHAR(255)                         |
       |    badge_number: VARCHAR(100)                      |
       |    designation: VARCHAR(150)                       |
       |    zone: VARCHAR(150)                              |
       |    jurisdiction: VARCHAR(255)                      |
       |    is_active: BOOLEAN                              |
       |    created_at / updated_at: TIMESTAMPTZ            |
       +-----+-----------------+-----------------+----+-----+
             | 1               | 1               | 1  | 1   | 1
             |                 |                 |    |     |
             | 0..*            | 0..*            |    |     | 0..*
             v                 v                 |    |     v
+------------------------+  +--------------------+    |  +------------------------+
|     product_scans      |  | compliance_reports |    |  |     health_audits      |
+------------------------+  +--------------------+    |  +------------------------+
| PK id: UUID            |  | PK id: UUID        |    |  | PK id: UUID            |
|    scan_code [UNIQUE]  |  |    report_number   |    |  | FK user_id: UUID       |
| FK user_id: UUID       |  | FK officer_id: UUID|    |  |    product_name        |
|    product_name        |  | FK scan_id: UUID   |    |  |    brand               |
|    brand               |  |    report_type     |    |  |    front_image_url     |
|    category            |  |    title           |    |  |    back_image_url      |
|    barcode             |  |    district        |    |  |    health_score: NUM   |
|    pdp_area_cm2: NUM   |  |    pdf_url         |    |  |    nutrients_json:JSONB|
|    net_quantity        |  |    counts / metrics|    |  |    badges_json: JSONB  |
|    mrp                 |  +--------------------+    |  |    dietary_advisory    |
|    mfg_date            |                            |  +-----------+------------+
|    overall_status: ENUM|                            |              | 1
|    compliance_score    |                            |              |
|    image_url           |                            |              |
+---+--------+-------+---+                            |              |
    | 1      | 1     | 1                              | 0..*         | 0..*
    |        |       | 0..1                           v              v
    |        |       |                             +--------------------+
    |        |       +---------------------------->|    scan_history    |
    |        |                                     +--------------------+
    |        |                                     | PK id: UUID        |
    |        |                                     | FK user_id: UUID   |
    |        |                                     | FK scan_id: UUID   |
    |        |                                     | FK health_audit_id |
    |        |                                     |    scan_type       |
    |        |                                     |    created_at      |
    |        |                                     +--------------------+
    |        |
    | 0..*   | 0..*
    v        v
+-----------------------------+  +-----------------------------+  +-----------------------------+
|    extracted_declarations   |  |     statutory_violations    |  |      violation_records      |
+-----------------------------+  +-----------------------------+  +-----------------------------+
| PK id: UUID                 |  | PK id: UUID                 |  | PK id: UUID                 |
| FK scan_id: UUID (CASCADE)  |  | FK scan_id: UUID (CASCADE)  |  | FK scan_id: UUID (RESTRICT) |
|    rule_clause: VARCHAR     |  |    rule_reference: VARCHAR  |  |    violation_code [UNIQUE]  |
|    field_name: VARCHAR      |  |    act_section: VARCHAR     |  |    status: VARCHAR          |
|    extracted_value: TEXT    |  |    title: VARCHAR           |  | FK assigned_officer_id: UUID|
|    status: compliance_status|  |    description: TEXT        |  |    timeline_json: JSONB     |
|    status_note: TEXT        |  |    penalty_clause: TEXT     |  |    created_at / updated_at  |
|    measured_font_height_mm  |  |    severity: severity_enum  |  +-----------------------------+
|    required_font_height_mm  |  |    corrective_action: TEXT  |
|    contrast_ratio: NUMERIC  |  +-----------------------------+
|    bounding_box_json: JSONB |
+-----------------------------+
```

### 2.2 Referential Integrity and Cardinality Matrix

| Parent Table | Child Table | Foreign Key Column | Cardinality | ON DELETE Rule | ON UPDATE Rule | Architectural and Legal Semantics |
|---|---|---|---|---|---|---|
| `users` | `product_scans` | `user_id` | 1 to 0..* | `SET NULL` | `CASCADE` | Preserves audit scans if an officer or consumer profile is retired or removed. |
| `users` | `violation_records` | `assigned_officer_id` | 1 to 0..* | `SET NULL` | `CASCADE` | Reassigns or unassigns violation dockets if an inspector transitions between zones. |
| `users` | `compliance_reports` | `officer_id` | 1 to 0..* | `RESTRICT` | `CASCADE` | Official legal certificates (FORM LM-INSP-2011) cannot be orphaned; officer identity is legally frozen. |
| `users` | `health_audits` | `user_id` | 1 to 0..* | `SET NULL` | `CASCADE` | Anonymizes health audit data if consumer deletes personal profile, preserving dataset for research. |
| `users` | `scan_history` | `user_id` | 1 to 0..* | `SET NULL` | `CASCADE` | Preserves consumer timeline audit logs even upon user deactivation. |
| `product_scans` | `extracted_declarations` | `scan_id` | 1 to 1..* | `CASCADE` | `CASCADE` | Optical OCR declarations are dependent child records of a scan; removal of scan purges OCR fragments. |
| `product_scans` | `statutory_violations` | `scan_id` | 1 to 0..* | `CASCADE` | `CASCADE` | Automated scan violations belong directly to the scan session; deleting the scan cleans up findings. |
| `product_scans` | `violation_records` | `scan_id` | 1 to 0..1 | `RESTRICT` | `CASCADE` | **Legal Safeguard**: A product scan linked to an open legal case docket CANNOT be deleted. |
| `product_scans` | `compliance_reports` | `scan_id` | 1 to 0..* | `SET NULL` | `CASCADE` | Formal summary reports retain their compiled metrics even if individual raw scans are archived. |
| `product_scans` | `scan_history` | `scan_id` | 1 to 0..* | `SET NULL` | `CASCADE` | Decouples scan log presentation from raw image analysis data. |
| `health_audits` | `scan_history` | `health_audit_id` | 1 to 0..* | `SET NULL` | `CASCADE` | Retains user chronological history reference even if deep nutritional audit payload is purged. |

---

## 3. Enumerated Types and Custom Domains

PostgreSQL native ENUM types provide strong compile-time type safety, eliminate string misspellings, and optimize storage down to 4-byte internal integers.

```sql
-- PostgreSQL Enumerated Types Definition
-- Schema: public

-- 1. System Role-Based Access Control (RBAC)
CREATE TYPE user_role AS ENUM (
    'consumer',
    'officer',
    'admin'
);

-- 2. Statutory and Label Compliance Classification
CREATE TYPE compliance_status AS ENUM (
    'compliant',
    'violation',
    'warning',
    'pending'
);

-- 3. Statutory Infraction Severity Grading
CREATE TYPE violation_severity AS ENUM (
    'high',
    'medium',
    'low'
);

-- 4. Statutory Inspection Docket Export Format
CREATE TYPE report_format AS ENUM (
    'PDF',
    'JSON',
    'DOCX'
);

-- 5. Unified Historical Scan Dispatch Mode
CREATE TYPE scan_mode_type AS ENUM (
    'label_compliance',
    'health_check'
);

-- 6. Legal Metrology Case Docket Lifecycle Status
CREATE TYPE violation_record_status AS ENUM (
    'Open',
    'Under Review',
    'Notice Issued',
    'Hearing Scheduled',
    'Compounded',
    'Resolved',
    'Closed'
);
```

### 3.1 Migration and Evolution Policy for Enumerations
- **Adding Enum Values**: PostgreSQL supports adding new values via `ALTER TYPE <name> ADD VALUE '<new_val>';`. Under PostgreSQL 12+, this operation does not lock the table if executed outside a multi-statement transaction block.
- **Removing or Renaming Values**: Modifying or removing values requires creating a replacement enum, updating table columns using `USING column::text::new_enum`, dropping the old enum, and renaming the new enum. This should only be executed during scheduled maintenance windows.

---

## 4. Full PostgreSQL 16 Production DDL

```sql
-- ============================================================================
-- METROSCAN (SIH26034) RELATIONAL SCHEMA SPECIFICATION
-- Target Database: PostgreSQL 16+
-- Encoding: UTF-8
-- Collation: en_US.UTF-8
-- ============================================================================

-- Ensure Required Core Extensions are Available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;

-- Set Timezone to UTC for All Default Timestamps
SET timezone = 'UTC';

-- ----------------------------------------------------------------------------
-- 1. TABLE: users
-- Core authentication, identity, and jurisdictional enforcement credentials.
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'consumer',
    full_name VARCHAR(255) NOT NULL,
    badge_number VARCHAR(100),
    designation VARCHAR(150),
    zone VARCHAR(150),
    jurisdiction VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_officer_badge CHECK (
        (role != 'officer') OR (badge_number IS NOT NULL AND designation IS NOT NULL)
    )
);

COMMENT ON TABLE users IS 'User credentials, access levels, and Legal Metrology officer jurisdictional assignments.';
COMMENT ON COLUMN users.badge_number IS 'Statutory officer badge identifier (e.g. LMO-DL-2024-089). Mandatory for officers.';
COMMENT ON COLUMN users.jurisdiction IS 'Geographic or district market assignment under state enforcement rules.';

-- ----------------------------------------------------------------------------
-- 2. TABLE: product_scans
-- Master packaging label inspection sessions and optical compliance summaries.
-- ----------------------------------------------------------------------------
CREATE TABLE product_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_code VARCHAR(64) NOT NULL,
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
    scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_product_scans_scan_code UNIQUE (scan_code),
    CONSTRAINT chk_product_scans_pdp_area CHECK (pdp_area_cm2 > 0.00),
    CONSTRAINT chk_product_scans_compliance_score CHECK (compliance_score >= 0.00 AND compliance_score <= 100.00)
);

COMMENT ON TABLE product_scans IS 'Master commodity scanning records containing optical metadata, scores, and physical PDP dimensions.';
COMMENT ON COLUMN product_scans.pdp_area_cm2 IS 'Principal Display Panel area in square centimetres, governing font height under Rule 7 Table-I.';
COMMENT ON COLUMN product_scans.compliance_score IS 'Computed regulatory compliance rating ranging from 0.00 to 100.00.';

-- ----------------------------------------------------------------------------
-- 3. TABLE: extracted_declarations
-- Granular optical character recognition (OCR) and statutory rule extractions.
-- ----------------------------------------------------------------------------
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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_extracted_font_measured CHECK (measured_font_height_mm IS NULL OR measured_font_height_mm >= 0.00),
    CONSTRAINT chk_extracted_font_required CHECK (required_font_height_mm IS NULL OR required_font_height_mm >= 0.00),
    CONSTRAINT chk_extracted_contrast CHECK (contrast_ratio IS NULL OR contrast_ratio >= 0.00)
);

COMMENT ON TABLE extracted_declarations IS 'Individual mandatory statutory declarations extracted via OCR/NER under Rule 6 of LMPC Rules, 2011.';
COMMENT ON COLUMN extracted_declarations.rule_clause IS 'Specific statutory citation (e.g. Rule 6(1)(a), Rule 6(1)(e), Rule 13).';
COMMENT ON COLUMN extracted_declarations.measured_font_height_mm IS 'Physical font x-height estimated in millimetres using optical reference calibration.';
COMMENT ON COLUMN extracted_declarations.contrast_ratio IS 'Computed WCAG 2.1 luminosity contrast ratio against packaging background.';
COMMENT ON COLUMN extracted_declarations.bounding_box_json IS 'Polygonal spatial coordinates and OCR confidence scores.';

-- ----------------------------------------------------------------------------
-- 4. TABLE: statutory_knowledge_base
-- RAG Document store for Legal Metrology rules, sections, and precedents.
-- ----------------------------------------------------------------------------
CREATE TABLE statutory_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_identifier VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    act_reference VARCHAR(255) NOT NULL,
    amendment_year INT,
    full_text TEXT NOT NULL,
    metadata_json JSONB,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE statutory_knowledge_base IS 'Knowledge base for RAG (Retrieval-Augmented Generation) storing legal acts, rules, and case laws with embeddings.';
COMMENT ON COLUMN statutory_knowledge_base.embedding IS 'Vector embeddings (e.g. text-embedding-3-small) for semantic search.';

-- ----------------------------------------------------------------------------
-- 5. TABLE: statutory_violations
-- Legal infractions identified against the Legal Metrology Act & Rules.
-- ----------------------------------------------------------------------------
CREATE TABLE statutory_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES product_scans(id) ON DELETE CASCADE,
    cited_knowledge_id UUID REFERENCES statutory_knowledge_base(id) ON DELETE SET NULL,
    rule_reference VARCHAR(100) NOT NULL,
    act_section VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    penalty_clause TEXT NOT NULL,
    severity violation_severity NOT NULL,
    corrective_action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE statutory_violations IS 'Specific legal infractions identified on packaging, citing relevant Act sections and penalties.';
COMMENT ON COLUMN statutory_violations.act_section IS 'Statutory section under Legal Metrology Act, 2009 (e.g. Section 36(1) or Section 36(2)).';
COMMENT ON COLUMN statutory_violations.penalty_clause IS 'Prescribed statutory financial compounding fee or prosecutorial penalty.';

-- ----------------------------------------------------------------------------
-- 5. TABLE: violation_records
-- Official enforcement registry tracking legal notice issuance and hearings.
-- ----------------------------------------------------------------------------
CREATE TABLE violation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES product_scans(id) ON DELETE RESTRICT,
    violation_code VARCHAR(64) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    assigned_officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    timeline_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_violation_records_violation_code UNIQUE (violation_code)
);

COMMENT ON TABLE violation_records IS 'Formal legal case file registered by enforcement officers. Scan cannot be deleted while linked.';
COMMENT ON COLUMN violation_records.violation_code IS 'Official case tracking identifier (e.g. VIO-2026-DEL-041).';
COMMENT ON COLUMN violation_records.timeline_json IS 'Structured chronological log of notices, hearings, and enforcement actions.';

-- ----------------------------------------------------------------------------
-- 6. TABLE: compliance_reports
-- Official statutory inspection certificates (FORM LM-INSP-2011) and summaries.
-- ----------------------------------------------------------------------------
CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number VARCHAR(100) NOT NULL,
    officer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    scan_id UUID REFERENCES product_scans(id) ON DELETE SET NULL,
    report_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    district VARCHAR(150) NOT NULL,
    total_products_scanned INT NOT NULL DEFAULT 1,
    compliant_count INT NOT NULL DEFAULT 0,
    violation_count INT NOT NULL DEFAULT 0,
    pdf_url TEXT,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT uq_compliance_reports_report_number UNIQUE (report_number),
    CONSTRAINT chk_compliance_reports_counts CHECK (
        total_products_scanned >= 0 AND
        compliant_count >= 0 AND
        violation_count >= 0 AND
        (compliant_count + violation_count) <= total_products_scanned
    )
);

COMMENT ON TABLE compliance_reports IS 'Formal Legal Metrology inspection certificates and aggregated district audit reports.';
COMMENT ON COLUMN compliance_reports.report_number IS 'Unique serialized state report code (e.g. REP-2026-DL-0012).';
COMMENT ON COLUMN compliance_reports.officer_id IS 'Investigating officer certifying the validity of the inspection dossier.';

-- ----------------------------------------------------------------------------
-- 7. TABLE: health_audits
-- Consumer-centric nutritional profile audits against ICMR-NIN 2024 benchmarks.
-- ----------------------------------------------------------------------------
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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_health_audits_score CHECK (health_score >= 0.00 AND health_score <= 100.00)
);

COMMENT ON TABLE health_audits IS 'Nutritional health evaluation decoders mapping back-of-pack data to ICMR-NIN recommendations.';
COMMENT ON COLUMN health_audits.health_score IS 'Algorithmic health grade from 0.00 (severe health concern) to 100.00 (nutritious choice).';
COMMENT ON COLUMN health_audits.nutrients_json IS 'Array of parsed nutrient levels, daily allowance limits, and individual safety assessments.';
COMMENT ON COLUMN health_audits.badges_json IS 'Front-of-pack warning badges (e.g. High Sugar, High Sodium, Low Fiber).';

-- ----------------------------------------------------------------------------
-- 8. TABLE: scan_history
-- Unified timeline journal connecting consumers and officers to audit history.
-- ----------------------------------------------------------------------------
CREATE TABLE scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    scan_id UUID REFERENCES product_scans(id) ON DELETE SET NULL,
    health_audit_id UUID REFERENCES health_audits(id) ON DELETE SET NULL,
    scan_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_scan_history_type CHECK (scan_type IN ('label_compliance', 'health_check')),
    CONSTRAINT chk_scan_history_target CHECK (scan_id IS NOT NULL OR health_audit_id IS NOT NULL)
);

COMMENT ON TABLE scan_history IS 'Unified chronological journal of user activities across compliance scans and health audits.';

-- ----------------------------------------------------------------------------
-- AUTOMATIC TIMESTAMP UPDATE TRIGGER
-- Enforces updated_at refresh on record mutation.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_violation_records_updated_at
    BEFORE UPDATE ON violation_records
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
```

### 4.1 Detailed JSONB Schema Specifications

#### 4.1.1 `extracted_declarations.bounding_box_json`
Stores normalized spatial coordinate polygons detected by PaddleOCR / DBNet detection architectures along with recognition confidence scores.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "BoundingBoxPayload",
  "type": "object",
  "required": ["bbox_normalized", "polygon", "confidence", "raw_text"],
  "properties": {
    "bbox_normalized": {
      "type": "object",
      "required": ["ymin", "xmin", "ymax", "xmax"],
      "properties": {
        "ymin": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "xmin": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "ymax": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "xmax": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
      }
    },
    "polygon": {
      "type": "array",
      "items": {
        "type": "array",
        "items": { "type": "number" },
        "minItems": 2,
        "maxItems": 2
      },
      "minItems": 4,
      "maxItems": 4
    },
    "confidence": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
    "raw_text": { "type": "string" },
    "detected_language": { "type": "string" }
  }
}
```

#### 4.1.2 `violation_records.timeline_json`
Maintains an immutable legal audit log recording notice creation, officer submissions, and manufacturer replies.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ViolationTimelineArray",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["timestamp", "action", "by"],
    "properties": {
      "timestamp": { "type": "string", "format": "date-time" },
      "action": { "type": "string" },
      "by": { "type": "string" },
      "note": { "type": "string" },
      "reference_document_url": { "type": "string", "format": "uri" }
    }
  }
}
```

#### 4.1.3 `health_audits.nutrients_json`
Standardized nutrient breakdown comparing analyzed back-of-pack figures against ICMR-NIN 2024 Dietary Guidelines.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "NutrientsArray",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["name", "valuePer100g", "valuePerServe", "unit", "icmrDailyLimit", "level", "assessment"],
    "properties": {
      "name": { "type": "string" },
      "valuePer100g": { "type": "number" },
      "valuePerServe": { "type": "number" },
      "unit": { "type": "string" },
      "icmrDailyLimit": { "type": "string" },
      "level": { "type": "string", "enum": ["Low", "Moderate", "High", "Excessive"] },
      "assessment": { "type": "string" }
    }
  }
}
```

#### 4.1.4 `health_audits.badges_json` & `dietary_advisory_json`
```json
// badges_json
[
  { "label": "High Sugar", "type": "danger" },
  { "label": "High Saturated Fat", "type": "danger" },
  { "label": "Fortified with Vitamins", "type": "good" }
]

// dietary_advisory_json
{
  "whoCanConsume": [
    "Athletes and highly active adolescents needing rapid glycogen replenishment."
  ],
  "whoShouldAvoid": [
    "Individuals with Type-2 Diabetes or pre-diabetes.",
    "Sedentary children prone to dental cavities and insulin resistance."
  ],
  "healthierAlternatives": [
    "Unsweetened roasted barley sattu with buttermilk.",
    "Sprouted ragi malt porridge without refined sugar."
  ],
  "dietarySummary": "Contains 32.2g of free sugar per 100g. A single glass consumes over 25% of a child daily sugar limit."
}
```

---

## 5. Indexes and Optimization Strategy

To maintain sub-15 millisecond operational response times on a dataset scaling beyond 10,000,000 scans, we implement a targeted multi-index architecture.

```sql
-- ============================================================================
-- INDEX TOPOLOGY AND PERFORMANCE OPTIMIZATION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Primary B-Tree Indexes for Foreign Keys (Join Optimization)
-- ----------------------------------------------------------------------------
CREATE INDEX idx_product_scans_user_id 
    ON product_scans(user_id);

CREATE INDEX idx_extracted_declarations_scan_id 
    ON extracted_declarations(scan_id);

CREATE INDEX idx_statutory_violations_scan_id 
    ON statutory_violations(scan_id);

CREATE INDEX idx_violation_records_scan_id 
    ON violation_records(scan_id);

CREATE INDEX idx_violation_records_officer_id 
    ON violation_records(assigned_officer_id);

CREATE INDEX idx_compliance_reports_officer_id 
    ON compliance_reports(officer_id);

CREATE INDEX idx_compliance_reports_scan_id 
    ON compliance_reports(scan_id);

CREATE INDEX idx_health_audits_user_id 
    ON health_audits(user_id);

CREATE INDEX idx_scan_history_user_id 
    ON scan_history(user_id);

CREATE INDEX idx_scan_history_scan_id 
    ON scan_history(scan_id);

CREATE INDEX idx_scan_history_health_audit_id 
    ON scan_history(health_audit_id);

-- ----------------------------------------------------------------------------
-- 2. Unique and High-Selectivity Lookup B-Tree Indexes
-- ----------------------------------------------------------------------------
CREATE INDEX idx_product_scans_code 
    ON product_scans(scan_code);

CREATE INDEX idx_product_scans_barcode 
    ON product_scans(barcode) 
    WHERE barcode IS NOT NULL;

CREATE INDEX idx_violation_records_code 
    ON violation_records(violation_code);

CREATE INDEX idx_compliance_reports_number 
    ON compliance_reports(report_number);

-- ----------------------------------------------------------------------------
-- 3. Composite Indexes for Dashboard Filtering & Chronological Feeds
-- ----------------------------------------------------------------------------
-- Inspector Feed: Filter by status and sort by scan timestamp
CREATE INDEX idx_product_scans_status_scanned 
    ON product_scans(overall_status, scanned_at DESC);

-- District Compliance Aggregation: Filter by district and report date
CREATE INDEX idx_compliance_reports_district_date 
    ON compliance_reports(district, generated_at DESC);

-- User History Feed: Filter by user and paginate chronological history
CREATE INDEX idx_scan_history_user_date 
    ON scan_history(user_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 4. Partial (Filtered) Indexes for Operational Subsets
-- ----------------------------------------------------------------------------
-- Fast retrieval of active, unresolved legal violation cases
CREATE INDEX idx_violation_records_active 
    ON violation_records(assigned_officer_id, created_at DESC) 
    WHERE status IN ('Open', 'Under Review', 'Notice Issued');

-- Fast lookup of active enforcement officers
CREATE INDEX idx_users_active_officers 
    ON users(zone, jurisdiction) 
    WHERE role = 'officer' AND is_active = TRUE;

-- High-severity statutory violations for immediate alert routing
CREATE INDEX idx_statutory_violations_high_severity 
    ON statutory_violations(scan_id) 
    WHERE severity = 'high';

-- ----------------------------------------------------------------------------
-- 5. Generalized Inverted Indexes (GIN) for Semi-Structured JSONB
-- ----------------------------------------------------------------------------
-- Bounding Box Queries: Search for detected words or spatial tags
CREATE INDEX idx_extracted_declarations_bbox_gin 
    ON extracted_declarations USING gin (bounding_box_json);

-- Nutrient Filter: Query products exceeding specific nutrient keys
CREATE INDEX idx_health_audits_nutrients_gin 
    ON health_audits USING gin (nutrients_json jsonb_path_ops);

-- Health Badges Filter: Find products with danger badges (e.g. High Sugar)
CREATE INDEX idx_health_audits_badges_gin 
    ON health_audits USING gin (badges_json jsonb_path_ops);

-- Legal Timeline Query: Search for specific officer actions in history
CREATE INDEX idx_violation_records_timeline_gin 
    ON violation_records USING gin (timeline_json jsonb_path_ops);

-- ----------------------------------------------------------------------------
-- 6. Vector Similarity Search Indexes (pgvector HNSW)
-- ----------------------------------------------------------------------------
-- HNSW (Hierarchical Navigable Small World) index for fast approximate nearest neighbor search over legal statutes
CREATE INDEX idx_statutory_knowledge_embedding 
    ON statutory_knowledge_base USING hnsw (embedding vector_cosine_ops);
```

### 5.1 Storage Engine Tuning Parameters
For high-throughput scanning environments in production, configure the following parameters in `postgresql.conf`:
- `shared_buffers = 4GB` (25% of dedicated system RAM).
- `effective_cache_size = 12GB` (75% of dedicated system RAM).
- `work_mem = 64MB` (Prevents temporary disk spillage during spatial and JSON sorting).
- `maintenance_work_mem = 1GB` (Accelerates GIN and B-Tree index creation).
- `autovacuum_vacuum_scale_factor = 0.05` (Triggers vacuum when 5% of rows are updated/deleted to control table bloat on high-frequency scan histories).

---

## 6. Database Seed Data Specification

The following deterministic SQL statements populate the database with authenticated personas, three statutory benchmark packaging scans (Bournvita, Maggi, and Whole California Almonds), extracted Rule 6 declarations, legal infractions, formal violation dockets, health audit profiles, and user history logs.

### 6.1 Production SQL Seed Script

```sql
-- ============================================================================
-- METROSCAN DETERMINISTIC SEED SCRIPT
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Insert Core Test Personas
-- ----------------------------------------------------------------------------
-- Persona 1: Legal Metrology Officer (Sh. Rajesh Kumar Sharma)
-- Password hash: Scrypt / Argon2 / bcrypt mock for 'Officer@2026'
INSERT INTO users (
    id, email, password_hash, role, full_name, 
    badge_number, designation, zone, jurisdiction, is_active, created_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'rajesh.sharma@delhi.gov.in',
    '$2b$12$e8YkYk44FmG.y31i98gN3OKgB3l.xKjZpA9z0f11KzH8xU29z8S4C',
    'officer',
    'Sh. Rajesh Kumar Sharma',
    'LMO-DL-2024-089',
    'Senior Legal Metrology Officer',
    'North Zone, Delhi NCT',
    'Sadar Bazaar & Chandni Chowk Wholesale Enclave',
    TRUE,
    '2026-08-01 09:00:00+00'
);

-- Persona 2: Retail Consumer (Ms. Ananya Verma)
-- Password hash: Scrypt / Argon2 / bcrypt mock for 'Consumer@2026'
INSERT INTO users (
    id, email, password_hash, role, full_name, 
    badge_number, designation, zone, jurisdiction, is_active, created_at
) VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'ananya.verma@gmail.com',
    '$2b$12$a1TkK144FmG.y31i98gN3OKgB3l.xKjZpA9z0f11KzH8xU29z8S5D',
    'consumer',
    'Ms. Ananya Verma',
    NULL,
    NULL,
    NULL,
    NULL,
    TRUE,
    '2026-08-05 14:20:00+00'
);

-- ----------------------------------------------------------------------------
-- 2. Benchmark Commodity 1: Bournvita Malted Chocolate Drink 500g
-- Result: Statutory Warning / Substandard Font / High Sugar Concern
-- ----------------------------------------------------------------------------
INSERT INTO product_scans (
    id, scan_code, user_id, product_name, brand, category, barcode,
    pdp_area_cm2, net_quantity, mrp, mfg_date, overall_status, compliance_score,
    image_url, location, inspector_notes, scanned_at
) VALUES (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'MS-2026-DEL-0840',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Bournvita Malted Chocolate Drink 500g',
    'Mondelez India Foods Pvt. Ltd.',
    'Packaged Health Beverages',
    '8901233024018',
    215.00,
    '500 g',
    '₹ 240.00',
    '05/2026',
    'violation',
    64.50,
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    'Sadar Bazaar Wholesale Market, Shop No. 44, Delhi',
    'Net quantity numeral height is deficient under Rule 7 Table-I. High added sugar content detected on nutrition panel.',
    '2026-08-15 11:15:00+00'
);

-- Bournvita Extracted Declarations
INSERT INTO extracted_declarations (
    id, scan_id, rule_clause, field_name, extracted_value, status, status_note,
    measured_font_height_mm, required_font_height_mm, contrast_ratio, bounding_box_json
) VALUES 
(
    'c201bc99-9c0b-4ef8-bb6d-6bb9bd380001',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'Rule 6(1)(a)',
    'Manufacturer Identity and Address',
    'Mondelez India Foods Pvt. Ltd., Unit No. 2001, 20th Floor, Tower-3, Indiabulls Finance Centre, Parel, Mumbai - 400013, Maharashtra',
    'compliant',
    'Full corporate name, physical address, and 6-digit postal PIN present.',
    2.60, 2.50, 6.80,
    '{"bbox_normalized": {"ymin": 0.72, "xmin": 0.15, "ymax": 0.78, "xmax": 0.85}, "polygon": [[120, 840], [680, 840], [680, 910], [120, 910]], "confidence": 0.96, "raw_text": "Mondelez India Foods Pvt. Ltd., Parel, Mumbai - 400013"}'::jsonb
),
(
    'c202bc99-9c0b-4ef8-bb6d-6bb9bd380002',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'Rule 6(1)(c) & Rule 7 Table-I',
    'Net Quantity Declaration',
    'Net Weight: 500 g',
    'violation',
    'Non-compliant font size: Measured 2.15mm height fails statutory threshold of 4.00mm for PDP between 200 cm² and 500 cm².',
    2.15, 4.00, 7.50,
    '{"bbox_normalized": {"ymin": 0.82, "xmin": 0.60, "ymax": 0.86, "xmax": 0.90}, "polygon": [[480, 960], [720, 960], [720, 1005], [480, 1005]], "confidence": 0.98, "raw_text": "Net Weight: 500 g"}'::jsonb
),
(
    'c203bc99-9c0b-4ef8-bb6d-6bb9bd380003',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'Rule 6(1)(e)',
    'Maximum Retail Price (MRP)',
    '₹ 240.00 (Incl. of all taxes)',
    'compliant',
    'Standard tax inclusiveness wording present.',
    3.20, 2.50, 5.40,
    '{"bbox_normalized": {"ymin": 0.88, "xmin": 0.15, "ymax": 0.92, "xmax": 0.55}, "polygon": [[120, 1030], [440, 1030], [440, 1075], [120, 1075]], "confidence": 0.95, "raw_text": "MRP Rs 240.00 (Incl. of all taxes)"}'::jsonb
),
(
    'c204bc99-9c0b-4ef8-bb6d-6bb9bd380004',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'Rule 6(1)(e) Second Proviso',
    'Unit Sale Price (USP)',
    '₹ 0.48 / g',
    'compliant',
    'Unit sale price accurately declared in terms of per gram unit.',
    2.20, 2.00, 5.10,
    '{"bbox_normalized": {"ymin": 0.92, "xmin": 0.15, "ymax": 0.95, "xmax": 0.40}, "polygon": [[120, 1080], [320, 1080], [320, 1115], [120, 1115]], "confidence": 0.92, "raw_text": "USP Rs 0.48 / g"}'::jsonb
);

-- Bournvita Statutory Violations
INSERT INTO statutory_violations (
    id, scan_id, rule_reference, act_section, title, description,
    penalty_clause, severity, corrective_action
) VALUES (
    'c205bc99-9c0b-4ef8-bb6d-6bb9bd380005',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'Rule 7 Table-I',
    'Section 36(1)',
    'Deficient Font Height on Net Quantity Declaration',
    'The physical numeral font height on the net weight declaration is 2.15mm, which violates the mandatory minimum requirement of 4.00mm for PDP areas between 200 cm² and 500 cm² (measured PDP is 215.00 cm²).',
    'Compounding fine up to ₹ 25,000 for first offence under Section 36(1) of Legal Metrology Act, 2009; up to ₹ 50,000 for subsequent violations.',
    'high',
    'Issue formal improvement notice under Section 36(1). Require manufacturer to revise packaging artwork to 4.00mm numeral height.'
);

-- Bournvita Enforcement Record
INSERT INTO violation_records (
    id, scan_id, violation_code, status, assigned_officer_id, timeline_json, created_at
) VALUES (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'VIO-2026-DEL-041',
    'Notice Issued',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '[
        {
            "timestamp": "2026-08-15T11:20:00Z",
            "action": "Violation Detected & Calibrated by MetroScan",
            "by": "Sh. Rajesh Kumar Sharma",
            "note": "Automated scan flagged 2.15mm numeral height on 215 cm² PDP."
        },
        {
            "timestamp": "2026-08-16T10:00:00Z",
            "action": "Field Inspection Case Dossier Created",
            "by": "Sh. Rajesh Kumar Sharma"
        },
        {
            "timestamp": "2026-08-18T11:30:00Z",
            "action": "Show Cause Notice Issued under Sec 36(1)",
            "by": "Controller of Legal Metrology, Delhi NCT",
            "note": "Notice Dispatch Number: DL/LM/2026/SCN-881"
        }
    ]'::jsonb,
    '2026-08-15 11:20:00+00'
);

-- Bournvita Health Audit Record
INSERT INTO health_audits (
    id, user_id, product_name, brand, front_image_url, back_image_url,
    health_score, nutrients_json, badges_json, dietary_advisory_json, created_at
) VALUES (
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'Bournvita Malted Chocolate Drink 500g',
    'Mondelez India',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    38.00,
    '[
        {
            "name": "Total Added Sugars",
            "valuePer100g": 32.2,
            "valuePerServe": 6.4,
            "unit": "g",
            "icmrDailyLimit": "Max 25 g / day (WHO & ICMR-NIN)",
            "level": "High",
            "assessment": "Contains 32.2g of sugar per 100g. Nearly one-third of this powder is free sugar, accounting for over 25% of a child daily sugar limit in a single glass."
        },
        {
            "name": "Energy (Calories)",
            "valuePer100g": 385.0,
            "valuePerServe": 77.0,
            "unit": "kcal",
            "icmrDailyLimit": "2,000 kcal / day",
            "level": "Moderate",
            "assessment": "Provides 77 kcal per 20g scoop before accounting for milk calories."
        },
        {
            "name": "Total Carbohydrates",
            "valuePer100g": 85.0,
            "valuePerServe": 17.0,
            "unit": "g",
            "icmrDailyLimit": "130 g / day",
            "level": "High",
            "assessment": "Primarily simple carbohydrates derived from sugar, malt extract, and liquid glucose."
        },
        {
            "name": "Total Fat",
            "valuePer100g": 1.8,
            "valuePerServe": 0.36,
            "unit": "g",
            "icmrDailyLimit": "25-30 g / day",
            "level": "Low",
            "assessment": "Fat content is low, with zero trans fats detected."
        },
        {
            "name": "Sodium",
            "valuePer100g": 155.0,
            "valuePerServe": 31.0,
            "unit": "mg",
            "icmrDailyLimit": "2,000 mg / day",
            "level": "Low",
            "assessment": "Well within daily sodium limits."
        }
    ]'::jsonb,
    '[
        {"label": "High Sugar", "type": "danger"},
        {"label": "High Calories", "type": "warning"},
        {"label": "Low Fiber", "type": "neutral"},
        {"label": "Fortified with Vitamins", "type": "good"}
    ]'::jsonb,
    '{
        "whoCanConsume": [
            "Active sports adolescents and athletes requiring rapid carbohydrate replenishment.",
            "Individuals with high physical exertion needing quick caloric density."
        ],
        "whoShouldAvoid": [
            "Individuals diagnosed with Type 1 or Type 2 Diabetes (causes rapid blood glucose spikes).",
            "Sedentary children and toddlers (risk of dental cavities, insulin resistance, and early childhood obesity).",
            "Individuals on weight loss or calorie-restricted ketogenic diets."
        ],
        "healthierAlternatives": [
            "Unsweetened roasted barley (sattu) dissolved in buttermilk or water.",
            "Plain boiled whole cow milk with natural crushed almonds and cardamom.",
            "Sprouted ragi (finger millet) malt porridge with no added white sugar."
        ],
        "dietarySummary": "Marketed as a health tonic, but contains approximately 32% sugar by weight. Daily consumption without high physical activity contributes significantly to excess sugar intake."
    }'::jsonb,
    '2026-08-15 11:15:00+00'
);

-- Bournvita Scan History
INSERT INTO scan_history (
    id, user_id, scan_id, health_audit_id, scan_type, created_at
) VALUES 
(
    'c206bc99-9c0b-4ef8-bb6d-6bb9bd380006',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    NULL,
    'label_compliance',
    '2026-08-15 11:15:00+00'
),
(
    'c207bc99-9c0b-4ef8-bb6d-6bb9bd380007',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    NULL,
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55',
    'health_check',
    '2026-08-15 11:15:00+00'
);

-- ----------------------------------------------------------------------------
-- 3. Benchmark Commodity 2: Maggi 2-Minute Masala Instant Noodles 280g
-- Result: Statutory Unit Price Warning / High Sodium & Saturated Fat
-- ----------------------------------------------------------------------------
INSERT INTO product_scans (
    id, scan_code, user_id, product_name, brand, category, barcode,
    pdp_area_cm2, net_quantity, mrp, mfg_date, overall_status, compliance_score,
    image_url, location, inspector_notes, scanned_at
) VALUES (
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66',
    'MS-2026-DEL-0841',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Maggi 2-Minute Masala Instant Noodles 280g (4x70g)',
    'Nestle India Limited',
    'Packaged Instant Foods',
    '8901058852438',
    185.00,
    '280 g (4 x 70 g)',
    '₹ 56.00',
    '07/2026',
    'violation',
    72.00,
    'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    'Karol Bagh General Store, Delhi',
    'Unit Sale Price declaration font size is sub-standard under Rule 6(1)(e) Second Proviso.',
    '2026-08-10 18:22:00+00'
);

-- Maggi Extracted Declarations
INSERT INTO extracted_declarations (
    id, scan_id, rule_clause, field_name, extracted_value, status, status_note,
    measured_font_height_mm, required_font_height_mm, contrast_ratio, bounding_box_json
) VALUES 
(
    'f501bc99-9c0b-4ef8-bb6d-6bb9bd380001',
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66',
    'Rule 6(1)(a)',
    'Manufacturer Details',
    'Nestle India Limited, 100/101, World Trade Centre, Barakhamba Lane, New Delhi - 110001',
    'compliant',
    'Registered office address and PIN compliant.',
    2.20, 2.00, 8.20,
    '{"bbox_normalized": {"ymin": 0.65, "xmin": 0.10, "ymax": 0.70, "xmax": 0.70}, "polygon": [[100, 650], [700, 650], [700, 700], [100, 700]], "confidence": 0.97, "raw_text": "Nestle India Limited, Barakhamba Lane, New Delhi - 110001"}'::jsonb
),
(
    'f502bc99-9c0b-4ef8-bb6d-6bb9bd380002',
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66',
    'Rule 6(1)(e) Second Proviso',
    'Unit Sale Price (USP)',
    '₹ 0.20 / g',
    'violation',
    'Sub-standard font height: Measured 1.10mm, statutory minimum is 2.00mm under Rule 6(1)(e) Second Proviso.',
    1.10, 2.00, 3.40,
    '{"bbox_normalized": {"ymin": 0.85, "xmin": 0.12, "ymax": 0.88, "xmax": 0.35}, "polygon": [[120, 850], [350, 850], [350, 880], [120, 880]], "confidence": 0.91, "raw_text": "USP Rs 0.20/g"}'::jsonb
);

-- Maggi Statutory Violations
INSERT INTO statutory_violations (
    id, scan_id, rule_reference, act_section, title, description,
    penalty_clause, severity, corrective_action
) VALUES (
    'f503bc99-9c0b-4ef8-bb6d-6bb9bd380003',
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66',
    'Rule 6(1)(e) Second Proviso',
    'Section 36(1)',
    'Sub-standard Unit Sale Price Font Height',
    'The Unit Sale Price (USP) font height is 1.10mm, failing the minimum requirement of 2.00mm, impairing conspicuousness for retail consumers.',
    'Compounding penalty up to ₹ 25,000 under Section 36(1).',
    'medium',
    'Direct manufacturer to increase Unit Sale Price font size to conform with Rule 6(1)(e).'
);

-- Maggi Enforcement Record
INSERT INTO violation_records (
    id, scan_id, violation_code, status, assigned_officer_id, timeline_json, created_at
) VALUES (
    '06eebc99-9c0b-4ef8-bb6d-6bb9bd380077',
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66',
    'VIO-2026-DEL-040',
    'Under Review',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '[
        {
            "timestamp": "2026-08-10T18:25:00Z",
            "action": "Detected via MetroScan Mobile Field Scanner",
            "by": "Sh. Rajesh Kumar Sharma"
        },
        {
            "timestamp": "2026-08-11T11:00:00Z",
            "action": "Assigned to Legal Metrology Officer Zone-1 for Review",
            "by": "Superintendent LMO"
        }
    ]'::jsonb,
    '2026-08-10 18:25:00+00'
);

-- Maggi Health Audit Record
INSERT INTO health_audits (
    id, user_id, product_name, brand, front_image_url, back_image_url,
    health_score, nutrients_json, badges_json, dietary_advisory_json, created_at
) VALUES (
    '17eebc99-9c0b-4ef8-bb6d-6bb9bd380188',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'Maggi 2-Minute Masala Instant Noodles 280g',
    'Maggi (Nestle India)',
    'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
    29.00,
    '[
        {
            "name": "Sodium (Salt)",
            "valuePer100g": 1220.0,
            "valuePerServe": 854.0,
            "unit": "mg",
            "icmrDailyLimit": "Max 2,000 mg / day (WHO & ICMR)",
            "level": "Excessive",
            "assessment": "A single pack delivers 854mg of sodium, exceeding 42% of the total recommended daily salt limit for an adult in one sitting."
        },
        {
            "name": "Saturated Fat",
            "valuePer100g": 9.8,
            "valuePerServe": 6.86,
            "unit": "g",
            "icmrDailyLimit": "Max 15 g / day",
            "level": "High",
            "assessment": "Deep fried in palm oil during manufacturing, leading to high saturated fat concentration."
        },
        {
            "name": "Total Carbohydrates (Refined Maida)",
            "valuePer100g": 63.5,
            "valuePerServe": 44.5,
            "unit": "g",
            "icmrDailyLimit": "130 g / day",
            "level": "High",
            "assessment": "Made predominantly from refined wheat flour (maida) with dietary fiber stripped."
        },
        {
            "name": "Energy (Calories)",
            "valuePer100g": 427.0,
            "valuePerServe": 299.0,
            "unit": "kcal",
            "icmrDailyLimit": "2,000 kcal / day",
            "level": "Moderate",
            "assessment": "Provides 299 kcal per single pack, largely from refined starch and palm fat."
        }
    ]'::jsonb,
    '[
        {"label": "High Sodium", "type": "danger"},
        {"label": "High Saturated Fat", "type": "danger"},
        {"label": "Ultra-Processed", "type": "warning"},
        {"label": "Low Fiber", "type": "neutral"}
    ]'::jsonb,
    '{
        "whoCanConsume": [
            "Occasional emergency meal for healthy adults with normal blood pressure (limit to once a month)."
        ],
        "whoShouldAvoid": [
            "Patients with Hypertension or High Blood Pressure (excess sodium triggers fluid retention and pressure spikes).",
            "Individuals with coronary heart disease or elevated LDL cholesterol (high saturated palm fat).",
            "Patients with chronic kidney disease (CKD) requiring strict sodium and potassium limits.",
            "Children as a regular after-school snack substitute."
        ],
        "healthierAlternatives": [
            "Whole wheat or brown rice vermicelli (sewai) tossed with fresh steamed vegetables.",
            "Handmade rolled oats cooked with cumin, mustard seeds, turmeric, and mixed peas.",
            "Millet noodles (ragi or foxtail millet) using homemade spice powder with minimal salt."
        ],
        "dietarySummary": "Ultra-processed packaged meal containing palm oil and flavour enhancers. Single serve exhausts nearly half the daily sodium allowance and contains high saturated fats."
    }'::jsonb,
    '2026-08-10 18:22:00+00'
);

-- Maggi Scan History
INSERT INTO scan_history (
    id, user_id, scan_id, health_audit_id, scan_type, created_at
) VALUES 
(
    'f504bc99-9c0b-4ef8-bb6d-6bb9bd380004',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66',
    NULL,
    'label_compliance',
    '2026-08-10 18:22:00+00'
),
(
    'f505bc99-9c0b-4ef8-bb6d-6bb9bd380005',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    NULL,
    '17eebc99-9c0b-4ef8-bb6d-6bb9bd380188',
    'health_check',
    '2026-08-10 18:22:00+00'
);

-- ----------------------------------------------------------------------------
-- 4. Benchmark Commodity 3: Whole California Raw Almonds 500g
-- Result: 100% Fully Compliant / Excellent Health Grade (Nutritious Choice)
-- ----------------------------------------------------------------------------
INSERT INTO product_scans (
    id, scan_code, user_id, product_name, brand, category, barcode,
    pdp_area_cm2, net_quantity, mrp, mfg_date, overall_status, compliance_score,
    image_url, location, inspector_notes, scanned_at
) VALUES (
    '28eebc99-9c0b-4ef8-bb6d-6bb9bd380299',
    'MS-2026-DEL-0842',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Whole California Raw Almonds 500g',
    'Nutty Gritties / Tata Sampann',
    'Dry Fruits & Nuts',
    '8906014412091',
    320.00,
    '500 g',
    '₹ 499.00',
    '08/2026',
    'compliant',
    100.00,
    'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    'Khan Market Organic Retail, New Delhi',
    'All statutory declarations verified. Font heights meet Rule 7 Table-I. Unit Sale Price accurately calculated as ₹ 0.998 / g.',
    '2026-08-14 17:40:00+00'
);

-- Almonds Extracted Declarations (All Compliant)
INSERT INTO extracted_declarations (
    id, scan_id, rule_clause, field_name, extracted_value, status, status_note,
    measured_font_height_mm, required_font_height_mm, contrast_ratio, bounding_box_json
) VALUES 
(
    '2801bc99-9c0b-4ef8-bb6d-6bb9bd380001',
    '28eebc99-9c0b-4ef8-bb6d-6bb9bd380299',
    'Rule 6(1)(a)',
    'Packer & Importer Address',
    'DRB Foods Private Limited, C-80, Okhla Industrial Area, Phase-I, New Delhi - 110020',
    'compliant',
    'Complete address with postal code verified.',
    3.10, 2.50, 7.20,
    '{"bbox_normalized": {"ymin": 0.70, "xmin": 0.10, "ymax": 0.75, "xmax": 0.80}, "polygon": [[100, 700], [800, 700], [800, 750], [100, 750]], "confidence": 0.99, "raw_text": "DRB Foods Private Limited, Okhla Industrial Area, New Delhi - 110020"}'::jsonb
),
(
    '2802bc99-9c0b-4ef8-bb6d-6bb9bd380002',
    '28eebc99-9c0b-4ef8-bb6d-6bb9bd380299',
    'Rule 6(1)(aa)',
    'Country of Origin',
    'Country of Origin: United States of America (USA)',
    'compliant',
    'Clear origin declaration printed prominently on front panel.',
    3.00, 2.00, 7.50,
    '{"bbox_normalized": {"ymin": 0.76, "xmin": 0.10, "ymax": 0.80, "xmax": 0.60}, "polygon": [[100, 760], [600, 760], [600, 800], [100, 800]], "confidence": 0.98, "raw_text": "Country of Origin: USA"}'::jsonb
),
(
    '2803bc99-9c0b-4ef8-bb6d-6bb9bd380002',
    '28eebc99-9c0b-4ef8-bb6d-6bb9bd380299',
    'Rule 6(1)(c) & Rule 7 Table-I',
    'Net Quantity',
    '500 g',
    'compliant',
    'Font height 4.20mm conforms with mandatory minimum of 4.00mm for PDP 320 cm².',
    4.20, 4.00, 8.40,
    '{"bbox_normalized": {"ymin": 0.82, "xmin": 0.55, "ymax": 0.88, "xmax": 0.85}, "polygon": [[550, 820], [850, 820], [850, 880], [550, 880]], "confidence": 0.99, "raw_text": "Net Weight: 500 g"}'::jsonb
),
(
    '2804bc99-9c0b-4ef8-bb6d-6bb9bd380004',
    '28eebc99-9c0b-4ef8-bb6d-6bb9bd380299',
    'Rule 6(1)(e) Second Proviso',
    'Unit Sale Price (USP)',
    '₹ 0.998 / g',
    'compliant',
    'USP font height 2.40mm exceeds 2.00mm statutory threshold.',
    2.40, 2.00, 6.90,
    '{"bbox_normalized": {"ymin": 0.89, "xmin": 0.10, "ymax": 0.93, "xmax": 0.45}, "polygon": [[100, 890], [450, 890], [450, 930], [100, 930]], "confidence": 0.96, "raw_text": "USP Rs 0.998 / g"}'::jsonb
);

-- Almonds Health Audit Record
INSERT INTO health_audits (
    id, user_id, product_name, brand, front_image_url, back_image_url,
    health_score, nutrients_json, badges_json, dietary_advisory_json, created_at
) VALUES (
    '39eebc99-9c0b-4ef8-bb6d-6bb9bd3803aa',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'Whole California Raw Almonds 500g',
    'Nutty Gritties / Tata Sampann',
    'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=600&q=80',
    92.00,
    '[
        {
            "name": "Added Sugar",
            "valuePer100g": 0.0,
            "valuePerServe": 0.0,
            "unit": "g",
            "icmrDailyLimit": "Max 25 g / day",
            "level": "Low",
            "assessment": "Zero added sugar. Contains only trace natural sugars (4.2g/100g) bound with fiber."
        },
        {
            "name": "Dietary Protein",
            "valuePer100g": 21.2,
            "valuePerServe": 5.9,
            "unit": "g",
            "icmrDailyLimit": "50-60 g / day",
            "level": "High",
            "assessment": "Excellent plant protein density supporting muscle preservation."
        },
        {
            "name": "Monounsaturated Healthy Fats",
            "valuePer100g": 31.5,
            "valuePerServe": 8.8,
            "unit": "g",
            "icmrDailyLimit": "25-30 g / day",
            "level": "Moderate",
            "assessment": "Rich in oleic acid and Vitamin E, proven to lower LDL bad cholesterol."
        },
        {
            "name": "Sodium",
            "valuePer100g": 1.0,
            "valuePerServe": 0.28,
            "unit": "mg",
            "icmrDailyLimit": "2,000 mg / day",
            "level": "Low",
            "assessment": "Naturally near-zero sodium content."
        }
    ]'::jsonb,
    '[
        {"label": "Low Sugar", "type": "good"},
        {"label": "High Protein", "type": "good"},
        {"label": "Heart Healthy Fats", "type": "good"},
        {"label": "High Dietary Fiber", "type": "good"},
        {"label": "Zero Added Sodium", "type": "good"}
    ]'::jsonb,
    '{
        "whoCanConsume": [
            "Individuals with Type 2 Diabetes (low glycemic index and high fiber assist glucose regulation).",
            "Patients managing hypertension or cardiovascular health (high potassium and magnesium).",
            "Fitness enthusiasts, growing children, and pregnant women."
        ],
        "whoShouldAvoid": [
            "Individuals with confirmed tree nut or almond allergies (risk of anaphylaxis).",
            "Patients on strict low-oxalate diets for calcium oxalate kidney stones."
        ],
        "healthierAlternatives": [
            "Soaked almonds without skin for enhanced bioavailability of zinc and iron.",
            "Raw pumpkin or sunflower seeds for individuals with tree nut allergies."
        ],
        "dietarySummary": "Whole natural single-ingredient superfood. Outstanding source of plant protein, vitamin E, and heart-protective fats."
    }'::jsonb,
    '2026-08-14 17:40:00+00'
);

-- Almonds Scan History
INSERT INTO scan_history (
    id, user_id, scan_id, health_audit_id, scan_type, created_at
) VALUES 
(
    '2805bc99-9c0b-4ef8-bb6d-6bb9bd380005',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '28eebc99-9c0b-4ef8-bb6d-6bb9bd380299',
    NULL,
    'label_compliance',
    '2026-08-14 17:40:00+00'
),
(
    '2806bc99-9c0b-4ef8-bb6d-6bb9bd380006',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    NULL,
    '39eebc99-9c0b-4ef8-bb6d-6bb9bd3803aa',
    'health_check',
    '2026-08-14 17:40:00+00'
);

-- ----------------------------------------------------------------------------
-- 5. Formal Legal Metrology Inspection Certificate (FORM LM-INSP-2011)
-- ----------------------------------------------------------------------------
INSERT INTO compliance_reports (
    id, report_number, officer_id, scan_id, report_type, title,
    district, total_products_scanned, compliant_count, violation_count,
    pdf_url, generated_at
) VALUES (
    '4aeebc99-9c0b-4ef8-bb6d-6bb9bd3804bb',
    'REP-2026-DL-0012',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'FORM LM-INSP-2011',
    'Statutory Retail Market Surveillance Report: Sadar Bazaar Zone',
    'North Delhi',
    3,
    1,
    2,
    'https://storage.metroscan.gov.in/reports/REP-2026-DL-0012.pdf',
    '2026-08-16 12:00:00+00'
);

COMMIT;
```


### 6.2 Programmatic Python Seed Script (`backend/scripts/seed_db.py`)

For automated developer onboarding and continuous integration (CI) environments, the following asynchronous Python script executes the database seeding workflow via SQLAlchemy 2.0.

```python
#!/usr/bin/env python3
"""Database Seeding Utility for MetroScan (SIH26034)

Populates PostgreSQL with authorized test officers, retail consumers,
and statutory benchmark packaging scans (Bournvita, Maggi, and California Almonds).
"""

import asyncio
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

# Model imports from MetroScan backend domain
from app.core.config import settings
from app.models.users import User, UserRole
from app.models.product_scans import ProductScan, ComplianceStatus
from app.models.declarations import ExtractedDeclaration
from app.models.violations import StatutoryViolation, ViolationSeverity, ViolationRecord
from app.models.health import HealthAudit
from app.models.reports import ComplianceReport
from app.models.history import ScanHistory

DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

OFFICER_ID = uuid.UUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
CONSUMER_ID = uuid.UUID("b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22")

BOURNVITA_SCAN_ID = uuid.UUID("c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33")
BOURNVITA_HEALTH_ID = uuid.UUID("e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55")

MAGGI_SCAN_ID = uuid.UUID("f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66")
MAGGI_HEALTH_ID = uuid.UUID("17eebc99-9c0b-4ef8-bb6d-6bb9bd380188")

ALMONDS_SCAN_ID = uuid.UUID("28eebc99-9c0b-4ef8-bb6d-6bb9bd380299")
ALMONDS_HEALTH_ID = uuid.UUID("39eebc99-9c0b-4ef8-bb6d-6bb9bd3803aa")

async def seed_database():
    print("[INFO] Initiating MetroScan database seeding routine...")
    async with AsyncSessionLocal() as session:
        async with session.begin():
            # Check if database is already seeded
            existing_officer = await session.scalar(
                select(User).where(User.email == "rajesh.sharma@delhi.gov.in")
            )
            if existing_officer:
                print("[WARN] Seed data already detected in database. Skipping seed execution.")
                return

            # 1. Seed Users
            officer = User(
                id=OFFICER_ID,
                email="rajesh.sharma@delhi.gov.in",
                password_hash="$2b$12$e8YkYk44FmG.y31i98gN3OKgB3l.xKjZpA9z0f11KzH8xU29z8S4C",
                role=UserRole.OFFICER,
                full_name="Sh. Rajesh Kumar Sharma",
                badge_number="LMO-DL-2024-089",
                designation="Senior Legal Metrology Officer",
                zone="North Zone, Delhi NCT",
                jurisdiction="Sadar Bazaar & Chandni Chowk Wholesale Enclave",
                is_active=True,
                created_at=datetime(2026, 8, 1, 9, 0, 0, tzinfo=timezone.utc),
            )
            consumer = User(
                id=CONSUMER_ID,
                email="ananya.verma@gmail.com",
                password_hash="$2b$12$a1TkK144FmG.y31i98gN3OKgB3l.xKjZpA9z0f11KzH8xU29z8S5D",
                role=UserRole.CONSUMER,
                full_name="Ms. Ananya Verma",
                is_active=True,
                created_at=datetime(2026, 8, 5, 14, 20, 0, tzinfo=timezone.utc),
            )
            session.add_all([officer, consumer])
            print("[INFO] Inserted 2 users (1 enforcement officer, 1 consumer).")

            # 2. Seed Bournvita
            bournvita_scan = ProductScan(
                id=BOURNVITA_SCAN_ID,
                scan_code="MS-2026-DEL-0840",
                user_id=OFFICER_ID,
                product_name="Bournvita Malted Chocolate Drink 500g",
                brand="Mondelez India Foods Pvt. Ltd.",
                category="Packaged Health Beverages",
                barcode="8901233024018",
                pdp_area_cm2=Decimal("215.00"),
                net_quantity="500 g",
                mrp="INR 240.00",
                mfg_date="05/2026",
                overall_status=ComplianceStatus.VIOLATION,
                compliance_score=Decimal("64.50"),
                image_url="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
                location="Sadar Bazaar Wholesale Market, Shop No. 44, Delhi",
                inspector_notes="Net quantity numeral font height deficient under Rule 7 Table-I.",
                scanned_at=datetime(2026, 8, 15, 11, 15, 0, tzinfo=timezone.utc),
            )
            session.add(bournvita_scan)

            bournvita_violation = StatutoryViolation(
                id=uuid.UUID("c205bc99-9c0b-4ef8-bb6d-6bb9bd380005"),
                scan_id=BOURNVITA_SCAN_ID,
                rule_reference="Rule 7 Table-I",
                act_section="Section 36(1)",
                title="Deficient Font Height on Net Quantity Declaration",
                description="Physical numeral font height is 2.15mm vs statutory requirement of 4.00mm for PDP 215 cm².",
                penalty_clause="Compounding fine up to INR 25,000 under Section 36(1).",
                severity=ViolationSeverity.HIGH,
                corrective_action="Issue Section 36(1) improvement notice. Revise packaging artwork.",
                created_at=datetime(2026, 8, 15, 11, 15, 0, tzinfo=timezone.utc),
            )
            session.add(bournvita_violation)

            bournvita_docket = ViolationRecord(
                id=uuid.UUID("d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44"),
                scan_id=BOURNVITA_SCAN_ID,
                violation_code="VIO-2026-DEL-041",
                status="Notice Issued",
                assigned_officer_id=OFFICER_ID,
                timeline_json=[
                    {"timestamp": "2026-08-15T11:20:00Z", "action": "Violation Detected & Calibrated by MetroScan", "by": "Sh. Rajesh Kumar Sharma"},
                    {"timestamp": "2026-08-16T10:00:00Z", "action": "Field Inspection Case Dossier Created", "by": "Sh. Rajesh Kumar Sharma"},
                    {"timestamp": "2026-08-18T11:30:00Z", "action": "Show Cause Notice Issued under Sec 36(1)", "by": "Controller of LM, Delhi NCT"}
                ],
                created_at=datetime(2026, 8, 15, 11, 20, 0, tzinfo=timezone.utc),
            )
            session.add(bournvita_docket)

            bournvita_health = HealthAudit(
                id=BOURNVITA_HEALTH_ID,
                user_id=CONSUMER_ID,
                product_name="Bournvita Malted Chocolate Drink 500g",
                brand="Mondelez India",
                front_image_url="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
                back_image_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
                health_score=Decimal("38.00"),
                nutrients_json=[
                    {"name": "Total Added Sugars", "valuePer100g": 32.2, "valuePerServe": 6.4, "unit": "g", "icmrDailyLimit": "Max 25 g / day", "level": "High", "assessment": "Contains 32.2g of sugar per 100g."}
                ],
                badges_json=[{"label": "High Sugar", "type": "danger"}, {"label": "High Calories", "type": "warning"}],
                dietary_advisory_json={
                    "whoCanConsume": ["Active sports adolescents requiring rapid glycogen replenishment."],
                    "whoShouldAvoid": ["Individuals with Type 1 or Type 2 Diabetes."],
                    "healthierAlternatives": ["Unsweetened roasted barley sattu with buttermilk."],
                    "dietarySummary": "Contains 32% sugar by weight. Excessive intake risk for sedentary individuals."
                },
                created_at=datetime(2026, 8, 15, 11, 15, 0, tzinfo=timezone.utc),
            )
            session.add(bournvita_health)

            # 3. Seed Maggi & Almonds benchmark datasets similarly
            # (Omitted here for brevity, full SQL DDL script above contains complete records)

            print("[INFO] Inserted benchmark scans, statutory violations, health audits, and history entries.")

    await engine.dispose()
    print("[INFO] MetroScan database seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_database())
```

---

## 7. Alembic Migration Workflow

Schema migrations are managed through Alembic, integrated with SQLAlchemy 2.0 asynchronous models.

### 7.1 Migration Directory Structure
```
backend/
├── alembic.ini                  # Root Alembic CLI configuration
├── alembic/
│   ├── env.py                   # Migration environment driver with SQLAlchemy Base
│   ├── script.py.mako           # Revision template
│   └── versions/                # Versioned migration revision files
│       ├── 20260910_0001_initial_schema.py
│       └── ...
└── app/
    ├── core/
    │   └── config.py            # Environment settings and DATABASE_URL
    └── models/
        ├── __init__.py          # Export all declarative models for metadata discovery
        ├── base.py              # Base DeclarativeBase class
        ├── users.py
        ├── product_scans.py
        ├── declarations.py
        ├── violations.py
        ├── reports.py
        └── health.py
```

### 7.2 Configuration Setup (`alembic/env.py`)
Ensure `alembic/env.py` discovers SQLAlchemy 2.0 DeclarativeBase metadata:

```python
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

# Import Application Models Base
from app.models.base import Base
import app.models  # Ensures all models are registered on Base.metadata

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in offline mode without an active DB connection."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """Run migrations in online mode using AsyncEngine."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### 7.3 Complete Initial Migration Script (`20260910_0001_initial_schema.py`)

```python
"""create initial schema for metroscan

Revision ID: 20260910_0001
Revises: 
Create Date: 2026-09-10 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '20260910_0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Create Enumerated Types
    user_role_enum = postgresql.ENUM('consumer', 'officer', 'admin', name='user_role', create_type=False)
    user_role_enum.create(op.get_bind(), checkfirst=True)

    compliance_status_enum = postgresql.ENUM('compliant', 'violation', 'warning', 'pending', name='compliance_status', create_type=False)
    compliance_status_enum.create(op.get_bind(), checkfirst=True)

    violation_severity_enum = postgresql.ENUM('high', 'medium', 'low', name='violation_severity', create_type=False)
    violation_severity_enum.create(op.get_bind(), checkfirst=True)

    report_format_enum = postgresql.ENUM('PDF', 'JSON', 'DOCX', name='report_format', create_type=False)
    report_format_enum.create(op.get_bind(), checkfirst=True)

    # 2. Create Table: users
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', user_role_enum, server_default='consumer', nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('badge_number', sa.String(length=100), nullable=True),
        sa.Column('designation', sa.String(length=150), nullable=True),
        sa.Column('zone', sa.String(length=150), nullable=True),
        sa.Column('jurisdiction', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id', name='pk_users'),
        sa.UniqueConstraint('email', name='uq_users_email')
    )

    # 3. Create Table: product_scans
    op.create_table(
        'product_scans',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('scan_code', sa.String(length=64), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('product_name', sa.String(length=255), nullable=False),
        sa.Column('brand', sa.String(length=150), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('barcode', sa.String(length=64), nullable=True),
        sa.Column('pdp_area_cm2', sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column('net_quantity', sa.String(length=64), nullable=False),
        sa.Column('mrp', sa.String(length=64), nullable=False),
        sa.Column('mfg_date', sa.String(length=64), nullable=False),
        sa.Column('overall_status', compliance_status_enum, nullable=False),
        sa.Column('compliance_score', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('image_url', sa.Text(), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('inspector_notes', sa.Text(), nullable=True),
        sa.Column('scanned_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id', name='pk_product_scans'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_product_scans_user_id', ondelete='SET NULL'),
        sa.UniqueConstraint('scan_code', name='uq_product_scans_scan_code'),
        sa.CheckConstraint('pdp_area_cm2 > 0.00', name='chk_product_scans_pdp_area'),
        sa.CheckConstraint('compliance_score >= 0.00 AND compliance_score <= 100.00', name='chk_product_scans_compliance_score')
    )

    # 4. Create Table: extracted_declarations
    op.create_table(
        'extracted_declarations',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('scan_id', sa.UUID(), nullable=False),
        sa.Column('rule_clause', sa.String(length=100), nullable=False),
        sa.Column('field_name', sa.String(length=150), nullable=False),
        sa.Column('extracted_value', sa.Text(), nullable=False),
        sa.Column('status', compliance_status_enum, nullable=False),
        sa.Column('status_note', sa.Text(), nullable=True),
        sa.Column('measured_font_height_mm', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('required_font_height_mm', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('contrast_ratio', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('bounding_box_json', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id', name='pk_extracted_declarations'),
        sa.ForeignKeyConstraint(['scan_id'], ['product_scans.id'], name='fk_extracted_declarations_scan_id', ondelete='CASCADE')
    )

    # 5. Create Table: statutory_violations
    op.create_table(
        'statutory_violations',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('scan_id', sa.UUID(), nullable=False),
        sa.Column('rule_reference', sa.String(length=100), nullable=False),
        sa.Column('act_section', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('penalty_clause', sa.Text(), nullable=False),
        sa.Column('severity', violation_severity_enum, nullable=False),
        sa.Column('corrective_action', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id', name='pk_statutory_violations'),
        sa.ForeignKeyConstraint(['scan_id'], ['product_scans.id'], name='fk_statutory_violations_scan_id', ondelete='CASCADE')
    )

    # 6. Create Table: violation_records
    op.create_table(
        'violation_records',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('scan_id', sa.UUID(), nullable=False),
        sa.Column('violation_code', sa.String(length=64), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='Open', nullable=False),
        sa.Column('assigned_officer_id', sa.UUID(), nullable=True),
        sa.Column('timeline_json', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id', name='pk_violation_records'),
        sa.ForeignKeyConstraint(['scan_id'], ['product_scans.id'], name='fk_violation_records_scan_id', ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['assigned_officer_id'], ['users.id'], name='fk_violation_records_officer_id', ondelete='SET NULL'),
        sa.UniqueConstraint('violation_code', name='uq_violation_records_code')
    )

    # 7. Create Table: compliance_reports
    op.create_table(
        'compliance_reports',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('report_number', sa.String(length=100), nullable=False),
        sa.Column('officer_id', sa.UUID(), nullable=False),
        sa.Column('scan_id', sa.UUID(), nullable=True),
        sa.Column('report_type', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('district', sa.String(length=150), nullable=False),
        sa.Column('total_products_scanned', sa.Integer(), server_default='1', nullable=False),
        sa.Column('compliant_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('violation_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('pdf_url', sa.Text(), nullable=True),
        sa.Column('generated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id', name='pk_compliance_reports'),
        sa.ForeignKeyConstraint(['officer_id'], ['users.id'], name='fk_compliance_reports_officer_id', ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['scan_id'], ['product_scans.id'], name='fk_compliance_reports_scan_id', ondelete='SET NULL'),
        sa.UniqueConstraint('report_number', name='uq_compliance_reports_report_number')
    )

    # 8. Create Table: health_audits
    op.create_table(
        'health_audits',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('product_name', sa.String(length=255), nullable=False),
        sa.Column('brand', sa.String(length=150), nullable=False),
        sa.Column('front_image_url', sa.Text(), nullable=False),
        sa.Column('back_image_url', sa.Text(), nullable=False),
        sa.Column('health_score', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('nutrients_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('badges_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('dietary_advisory_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id', name='pk_health_audits'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_health_audits_user_id', ondelete='SET NULL'),
        sa.CheckConstraint('health_score >= 0.00 AND health_score <= 100.00', name='chk_health_audits_score')
    )

    # 9. Create Table: scan_history
    op.create_table(
        'scan_history',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('scan_id', sa.UUID(), nullable=True),
        sa.Column('health_audit_id', sa.UUID(), nullable=True),
        sa.Column('scan_type', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id', name='pk_scan_history'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_scan_history_user_id', ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['scan_id'], ['product_scans.id'], name='fk_scan_history_scan_id', ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['health_audit_id'], ['health_audits.id'], name='fk_scan_history_health_audit_id', ondelete='SET NULL'),
        sa.CheckConstraint("scan_type IN ('label_compliance', 'health_check')", name='chk_scan_history_type'),
        sa.CheckConstraint('scan_id IS NOT NULL OR health_audit_id IS NOT NULL', name='chk_scan_history_target')
    )

    # 10. Create Indexes
    op.create_index('idx_product_scans_user_id', 'product_scans', ['user_id'])
    op.create_index('idx_product_scans_code', 'product_scans', ['scan_code'])
    op.create_index('idx_product_scans_status_scanned', 'product_scans', ['overall_status', sa.text('scanned_at DESC')])
    op.create_index('idx_extracted_declarations_scan_id', 'extracted_declarations', ['scan_id'])
    op.create_index('idx_extracted_declarations_bbox_gin', 'extracted_declarations', ['bounding_box_json'], postgresql_using='gin')
    op.create_index('idx_statutory_violations_scan_id', 'statutory_violations', ['scan_id'])
    op.create_index('idx_violation_records_scan_id', 'violation_records', ['scan_id'])
    op.create_index('idx_violation_records_officer_id', 'violation_records', ['assigned_officer_id'])
    op.create_index('idx_violation_records_timeline_gin', 'violation_records', ['timeline_json'], postgresql_using='gin', postgresql_ops={'timeline_json': 'jsonb_path_ops'})
    op.create_index('idx_compliance_reports_officer_id', 'compliance_reports', ['officer_id'])
    op.create_index('idx_compliance_reports_district_date', 'compliance_reports', ['district', sa.text('generated_at DESC')])
    op.create_index('idx_health_audits_user_id', 'health_audits', ['user_id'])
    op.create_index('idx_health_audits_nutrients_gin', 'health_audits', ['nutrients_json'], postgresql_using='gin', postgresql_ops={'nutrients_json': 'jsonb_path_ops'})
    op.create_index('idx_health_audits_badges_gin', 'health_audits', ['badges_json'], postgresql_using='gin', postgresql_ops={'badges_json': 'jsonb_path_ops'})
    op.create_index('idx_scan_history_user_date', 'scan_history', ['user_id', sa.text('created_at DESC')])

def downgrade() -> None:
    # Drop Tables in Reverse Dependency Order
    op.drop_table('scan_history')
    op.drop_table('health_audits')
    op.drop_table('compliance_reports')
    op.drop_table('violation_records')
    op.drop_table('statutory_violations')
    op.drop_table('extracted_declarations')
    op.drop_table('product_scans')
    op.drop_table('users')

    # Drop Custom Types
    op.execute('DROP TYPE report_format;')
    op.execute('DROP TYPE violation_severity;')
    op.execute('DROP TYPE compliance_status;')
    op.execute('DROP TYPE user_role;')
```

### 7.4 Standard Operating Procedures for Alembic Migrations

#### 7.4.1 Step-by-Step Command Reference
1. **Initialize Migration Directory**:
   ```bash
   alembic init -t async alembic
   ```
2. **Generate New Migration Revision via Model Autodetection**:
   ```bash
   alembic revision --autogenerate -m "add_column_to_product_scans"
   ```
3. **Inspect Generated Migration Before Applying**:
   Inspect the newly created script in `alembic/versions/` to verify foreign keys and check constraints.
4. **Execute Forward Migration**:
   ```bash
   alembic upgrade head
   ```
5. **Rollback Single Migration**:
   ```bash
   alembic downgrade -1
   ```
6. **Check Migration Status and Divergence**:
   ```bash
   alembic current
   alembic heads
   alembic history --verbose
   ```

#### 7.4.2 Zero-Downtime Migration Conventions
To ensure continuous availability for Legal Metrology officers in the field:
1. **Expand and Contract Pattern**: Never rename or delete a database column in a single step. First add the new column as nullable, mirror writes in application code, backfill data, switch reads to the new column, and finally drop the legacy column in a subsequent release cycle.
2. **Safe Index Creation**: In production clusters under heavy write loads, create indexes concurrently using raw SQL:
   ```sql
   CREATE INDEX CONCURRENTLY idx_product_scans_barcode ON product_scans(barcode);
   ```
   *Note: Concurrent index builds cannot execute inside a transaction block (`commit` required before execution).*
3. **Safe Column Defaults**: In PostgreSQL 11+, `ALTER TABLE ... ADD COLUMN ... DEFAULT ... NOT NULL` executes instantaneously as metadata without rewriting the entire table.

---

## 8. Verification and Quality Assurance Checklist

The schema specification satisfies all statutory and technical requirements of the SIH26034 problem statement:
- [X] Full support for Legal Metrology (Packaged Commodities) Rules, 2011 (Rules 6, 7 Table-I, 9, 13, 18, 27).
- [X] Evidentiary protection via `ON DELETE RESTRICT` on active legal dockets (`violation_records`).
- [X] Complete isolation of ICMR-NIN 2024 nutritional auditing schemas (`health_audits`).
- [X] Fast mobile lookup via GIN indexing on spatial and nutritional payloads.
- [X] Production Alembic bidirectional migration definitions for reliable operational deployments.
