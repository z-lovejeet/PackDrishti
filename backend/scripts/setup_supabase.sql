-- ============================================================================
-- PACKDRISHTI - SUPABASE POSTGRESQL 16 SETUP SCRIPT
-- Consumer Food Nutrition, Ingredient Safety & Daily Product Scanner
-- ============================================================================

-- Step 1: Enable Core Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Define Enumerated Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('consumer', 'admin');
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
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. TABLE: health_audits
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

-- 3. TABLE: scan_history
CREATE TABLE IF NOT EXISTS scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    health_audit_id UUID REFERENCES health_audits(id) ON DELETE CASCADE,
    scan_type VARCHAR(50) NOT NULL DEFAULT 'health_check',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scan_history_user ON scan_history(user_id);
