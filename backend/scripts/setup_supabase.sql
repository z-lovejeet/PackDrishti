-- ============================================================================
-- PACKDRASHITI (SIH26034) - SUPABASE POSTGRESQL 16 & PGVECTOR SETUP SCRIPT
-- Administering Ministry: Department of Consumer Affairs (Legal Metrology Division)
-- Target Platform: Supabase Managed PostgreSQL with native pgvector extension
-- ============================================================================

-- Step 1: Enable Core Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Define Enumerated Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('consumer', 'officer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE compliance_status AS ENUM ('compliant', 'violation', 'warning', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE violation_severity AS ENUM ('high', 'medium', 'low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Create Core Tables

-- 1. TABLE: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
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

    CONSTRAINT chk_users_officer_badge CHECK (
        (role != 'officer') OR (badge_number IS NOT NULL AND designation IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_badge_number ON users(badge_number);

-- 2. TABLE: product_scans
CREATE TABLE IF NOT EXISTS product_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_code VARCHAR(64) NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    barcode VARCHAR(64),
    pdp_area_cm2 NUMERIC(8, 2) NOT NULL,
    net_quantity VARCHAR(64) NOT NULL,
    mrp VARCHAR(64) NOT NULL,
    mfg_date VARCHAR(64) NOT NULL,
    overall_status compliance_status NOT NULL DEFAULT 'pending',
    compliance_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT NOT NULL,
    location VARCHAR(255),
    inspector_notes TEXT,
    scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_product_scans_pdp_area CHECK (pdp_area_cm2 > 0.00),
    CONSTRAINT chk_product_scans_compliance_score CHECK (compliance_score >= 0.00 AND compliance_score <= 100.00)
);

CREATE INDEX IF NOT EXISTS idx_product_scans_user_id ON product_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_product_scans_scanned_at ON product_scans(scanned_at DESC);

-- 3. TABLE: extracted_declarations
CREATE TABLE IF NOT EXISTS extracted_declarations (
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

    CONSTRAINT chk_extracted_font_measured CHECK (measured_font_height_mm IS NULL OR measured_font_height_mm >= 0.00),
    CONSTRAINT chk_extracted_font_required CHECK (required_font_height_mm IS NULL OR required_font_height_mm >= 0.00),
    CONSTRAINT chk_extracted_contrast CHECK (contrast_ratio IS NULL OR contrast_ratio >= 0.00)
);

CREATE INDEX IF NOT EXISTS idx_extracted_declarations_scan_id ON extracted_declarations(scan_id);

-- 4. TABLE: statutory_knowledge_base
CREATE TABLE IF NOT EXISTS statutory_knowledge_base (
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

-- HNSW Cosine Index for Sub-Millisecond Semantic Vector Search
CREATE INDEX IF NOT EXISTS idx_statutory_knowledge_embedding 
ON statutory_knowledge_base USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_statutory_knowledge_rule_id 
ON statutory_knowledge_base(rule_identifier);

-- 5. TABLE: statutory_violations
CREATE TABLE IF NOT EXISTS statutory_violations (
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

CREATE INDEX IF NOT EXISTS idx_statutory_violations_scan_id ON statutory_violations(scan_id);

-- 6. TABLE: violation_records
CREATE TABLE IF NOT EXISTS violation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES product_scans(id) ON DELETE RESTRICT,
    violation_code VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    assigned_officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    timeline_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_violation_records_scan_id ON violation_records(scan_id);
CREATE INDEX IF NOT EXISTS idx_violation_records_officer ON violation_records(assigned_officer_id);

-- 7. TABLE: compliance_reports
CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number VARCHAR(100) NOT NULL UNIQUE,
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

    CONSTRAINT chk_compliance_reports_counts CHECK (
        total_products_scanned >= 0 AND
        compliant_count >= 0 AND
        violation_count >= 0 AND
        (compliant_count + violation_count) <= total_products_scanned
    )
);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_officer ON compliance_reports(officer_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_report_num ON compliance_reports(report_number);

-- 8. TABLE: health_audits
CREATE TABLE IF NOT EXISTS health_audits (
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

    CONSTRAINT chk_health_audits_score CHECK (health_score >= 0.00 AND health_score <= 100.00)
);

CREATE INDEX IF NOT EXISTS idx_health_audits_user ON health_audits(user_id);

-- 9. TABLE: scan_history
CREATE TABLE IF NOT EXISTS scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    scan_id UUID REFERENCES product_scans(id) ON DELETE SET NULL,
    health_audit_id UUID REFERENCES health_audits(id) ON DELETE SET NULL,
    scan_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_scan_history_type CHECK (scan_type IN ('label_compliance', 'health_check')),
    CONSTRAINT chk_scan_history_target CHECK (scan_id IS NOT NULL OR health_audit_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_scan_history_user ON scan_history(user_id);

-- Step 4: Seed Benchmark Statutory Rules
INSERT INTO statutory_knowledge_base (id, rule_identifier, title, act_reference, amendment_year, full_text, metadata_json)
VALUES
(
    'c0a80101-0000-0000-0000-000000000001',
    'Rule 6(1)(e)',
    'Unit Sale Price (USP) Mandatory Declaration',
    'Legal Metrology (Packaged Commodities) Rules, 2011',
    2021,
    'The unit sale price shall be declared on every package where the net quantity is more than one kilogram or one litre, as rupees per gram or per millilitre, or per kilogram or per litre.',
    '{"section": "Rule 6(1)(e)", "mandatory": true, "amendment": "G.S.R. 779(E) dated 02.11.2021"}'::jsonb
),
(
    'c0a80101-0000-0000-0000-000000000002',
    'Rule 7 Table-I',
    'Minimum Height of Numerals and Letters on Principal Display Panel',
    'Legal Metrology (Packaged Commodities) Rules, 2011',
    2011,
    'The minimum height of any numeral and letter on the principal display panel shall depend on the net quantity and the area of the principal display panel as prescribed in Table-I.',
    '{"section": "Rule 7 Table-I", "mandatory": true, "table": "Table-I"}'::jsonb
),
(
    'c0a80101-0000-0000-0000-000000000003',
    'Section 36(1)',
    'Penalty for Non-Standard Packages',
    'Legal Metrology Act, 2009',
    2009,
    'Whoever manufactures, packs, imports, sells, distributes, delivers or otherwise transfers, offers, exposes or possesses for sale, any pre-packaged commodity which does not conform to the declarations on the package as provided in this Act, shall be punished with fine which may extend to twenty-five thousand rupees, for the second offence, with fine which may extend to fifty thousand rupees and for the subsequent offence, with fine which shall not be less than fifty thousand rupees but which may extend to one lakh rupees or with imprisonment for a term which may extend to one year or with both.',
    '{"section": "Section 36(1)", "act": "Legal Metrology Act, 2009", "penalty_first": 25000, "penalty_second": 50000}'::jsonb
)
ON CONFLICT DO NOTHING;
