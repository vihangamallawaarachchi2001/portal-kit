-- =============================================================================
-- PORTALKIT — Full Database Schema, RLS Policies, and Seed Data
-- Run this in the Supabase SQL Editor using the service role (full access).
-- =============================================================================
--
-- HOW auth.users AND profiles WORK TOGETHER
-- ─────────────────────────────────────────
--  auth.users   → Supabase's internal auth table. Created automatically when
--                 someone signs up via magic link. You NEVER write to this
--                 table directly in application code — Supabase Auth owns it.
--                 It holds: id (uuid), email, created_at, and auth metadata.
--
--  profiles     → YOUR table that mirrors auth.users 1-to-1.
--                 profiles.id = auth.users.id  (same UUID, always)
--                 Stores business data about the freelancer: name, plan, Stripe
--                 IDs, avatar, etc. — things Supabase Auth doesn't store.
--
--  The link:    A Postgres TRIGGER fires on every INSERT into auth.users.
--               It automatically creates a matching row in profiles with the
--               same id and email. This happens in the same transaction as
--               sign-up so there is never a moment where auth.users has a row
--               but profiles does not.
--
--  In RLS:      auth.uid() returns the UUID of the currently authenticated
--               user — which matches BOTH auth.users.id AND profiles.id.
--               So `WHERE freelancer_id = auth.uid()` works because
--               freelancer_id → profiles(id) → auth.users(id).
--
--  Client access: Clients have NO Supabase account. They arrive via magic
--               link → portal_sessions. The Next.js API validates their
--               session token server-side and uses the Supabase service-role
--               key for DB operations (bypassing RLS). For extra defence, RLS
--               policies also accept a Postgres transaction-local variable
--               `app.client_id` that the API sets before any query.
-- =============================================================================


-- =============================================================================
-- PART 1 — EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram indexes for slug search


-- =============================================================================
-- PART 2 — TABLE SCHEMAS
-- Order matters: referenced tables first.
-- =============================================================================

-- ── profiles ─────────────────────────────────────────────────────────────────
-- One row per Supabase Auth user (freelancer). Created automatically by
-- the handle_new_user() trigger below. id mirrors auth.users.id exactly.
CREATE TABLE IF NOT EXISTS public.profiles (
    id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name             TEXT,
    business_name         TEXT,
    avatar_url            TEXT,
    plan                  TEXT NOT NULL DEFAULT 'free'
                          CHECK (plan IN ('free', 'pro', 'business')),
    stripe_customer_id    TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    subscription_status   TEXT
                          CHECK (subscription_status IN ('active','canceled','past_due','trialing')),
    onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── clients ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL,
    portal_slug   TEXT NOT NULL UNIQUE,          -- used in /p/[slug] URL
    portal_pin    TEXT,                          -- bcrypt hash of 4-digit PIN backup
    status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'archived')),
    deleted_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id     UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES public.profiles(id),  -- denormalized for RLS
    title         TEXT NOT NULL,
    description   TEXT,
    status        TEXT NOT NULL DEFAULT 'briefing'
                  CHECK (status IN ('briefing','in_progress','review','done')),
    due_date      DATE,
    deleted_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── files ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.files (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    freelancer_id   UUID NOT NULL REFERENCES public.profiles(id),
    filename        TEXT NOT NULL,
    storage_path    TEXT NOT NULL,               -- path inside Supabase Storage bucket
    file_size       BIGINT NOT NULL DEFAULT 0,   -- bytes
    mime_type       TEXT NOT NULL,
    version         INTEGER NOT NULL DEFAULT 1,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','changes_requested')),
    client_comment  TEXT,
    reviewed_at     TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── invoices ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id               UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    freelancer_id           UUID NOT NULL REFERENCES public.profiles(id),
    invoice_number          TEXT NOT NULL,        -- e.g. INV-0001, unique per freelancer
    line_items              JSONB NOT NULL DEFAULT '[]'::jsonb,
                            -- [{description, quantity, unit_price}]
    subtotal                NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax_rate                NUMERIC(5,2)  NOT NULL DEFAULT 0,   -- percentage
    tax_amount              NUMERIC(10,2) NOT NULL DEFAULT 0,
    total                   NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency                TEXT NOT NULL DEFAULT 'USD',
    status                  TEXT NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft','sent','paid','overdue')),
    due_date                DATE,
    stripe_payment_intent_id TEXT,
    paid_at                 TIMESTAMPTZ,
    notes                   TEXT,
    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (freelancer_id, invoice_number)
);

-- ── messages ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_type  TEXT NOT NULL CHECK (sender_type IN ('freelancer','client')),
    sender_id    UUID REFERENCES public.profiles(id), -- NULL when sender is client
    content      TEXT NOT NULL CHECK (char_length(content) <= 4000),
    read_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── portal_sessions ──────────────────────────────────────────────────────────
-- Tracks magic-link tokens sent to clients. Tokens are SHA-256 hashed; the
-- raw token is sent in the email URL and never stored.
CREATE TABLE IF NOT EXISTS public.portal_sessions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,   -- SHA-256 of the raw URL token
    expires_at TIMESTAMPTZ NOT NULL,   -- 24h from creation
    used_at    TIMESTAMPTZ,            -- NULL = not yet used (single-use)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- PART 3 — INDEXES
-- =============================================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- clients
CREATE INDEX IF NOT EXISTS idx_clients_freelancer     ON public.clients(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_clients_slug           ON public.clients(portal_slug);
CREATE INDEX IF NOT EXISTS idx_clients_status         ON public.clients(freelancer_id, status) WHERE deleted_at IS NULL;

-- projects
CREATE INDEX IF NOT EXISTS idx_projects_client        ON public.projects(client_id)     WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_freelancer    ON public.projects(freelancer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status        ON public.projects(status);

-- files
CREATE INDEX IF NOT EXISTS idx_files_project          ON public.files(project_id)      WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_files_freelancer       ON public.files(freelancer_id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_files_status           ON public.files(status);

-- invoices
CREATE INDEX IF NOT EXISTS idx_invoices_client        ON public.invoices(client_id)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_freelancer    ON public.invoices(freelancer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_status        ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_pi     ON public.invoices(stripe_payment_intent_id);

-- messages
CREATE INDEX IF NOT EXISTS idx_messages_project       ON public.messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread        ON public.messages(project_id)   WHERE read_at IS NULL;

-- portal_sessions
CREATE INDEX IF NOT EXISTS idx_portal_sessions_client ON public.portal_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_token  ON public.portal_sessions(token_hash);


-- =============================================================================
-- PART 4 — TRIGGERS & FUNCTIONS
-- =============================================================================

-- ── updated_at auto-stamp ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    -- Attach to every table that has updated_at
    PERFORM 1;
END $$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at  ON public.profiles;
DROP TRIGGER IF EXISTS trg_clients_updated_at   ON public.clients;
DROP TRIGGER IF EXISTS trg_projects_updated_at  ON public.projects;
DROP TRIGGER IF EXISTS trg_invoices_updated_at  ON public.invoices;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ── auto-create profile when a new auth user signs up ───────────────────────
-- This is the CORE of the auth.users ↔ profiles relationship.
-- Supabase Auth calls this trigger every time a user successfully signs up
-- (magic link, OTP, OAuth, etc.). We immediately create a matching profiles
-- row with the same UUID. From this point on, auth.uid() = profiles.id.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER                       -- runs as the trigger owner (postgres)
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, created_at, updated_at)
    VALUES (
        NEW.id,
        -- Pre-fill name from user_metadata if the provider sends it
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;       -- idempotent: safe to run multiple times
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── auto-increment invoice number per freelancer ─────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_freelancer_id UUID)
RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(
        (regexp_match(invoice_number, 'INV-(\d+)'))[1]::INTEGER
    ), 0) + 1
    INTO next_num
    FROM public.invoices
    WHERE freelancer_id = p_freelancer_id;

    RETURN 'INV-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;


-- ── helper: is this client_id in an active portal session? ──────────────────
-- Called by RLS policies to allow un-authenticated client access.
-- The Next.js API sets app.client_id in a SET LOCAL before running queries.
CREATE OR REPLACE FUNCTION public.get_current_client_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN NULLIF(current_setting('app.client_id', TRUE), '')::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$;


-- =============================================================================
-- PART 5 — ROW LEVEL SECURITY
-- =============================================================================
-- Philosophy:
--   • Freelancers identified by auth.uid() — the standard Supabase mechanism.
--   • Clients have no auth account; their access is validated server-side
--     (service-role key) OR via the app.client_id Postgres parameter.
--   • Service role (used in Next.js API routes) bypasses ALL RLS. That is
--     intentional — the API layer enforces its own authz on top.
-- =============================================================================

-- ── profiles ─────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Each user can only see and edit their own profile.
CREATE POLICY "profiles: select own"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "profiles: update own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- INSERT is handled exclusively by the handle_new_user trigger
-- (SECURITY DEFINER), so application code never needs an insert policy.

-- ── clients ──────────────────────────────────────────────────────────────────
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients: freelancer full access"
    ON public.clients FOR ALL
    USING  (freelancer_id = auth.uid() AND deleted_at IS NULL)
    WITH CHECK (freelancer_id = auth.uid());

-- Public portal route reads a client by slug (no auth). The API uses
-- service-role so this policy is a safety-net for direct SDK usage.
CREATE POLICY "clients: portal session read by client_id"
    ON public.clients FOR SELECT
    USING (id = public.get_current_client_id());

-- ── projects ─────────────────────────────────────────────────────────────────
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects: freelancer full access"
    ON public.projects FOR ALL
    USING  (freelancer_id = auth.uid() AND deleted_at IS NULL)
    WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "projects: client read via session"
    ON public.projects FOR SELECT
    USING (
        client_id = public.get_current_client_id()
        AND deleted_at IS NULL
    );

-- ── files ────────────────────────────────────────────────────────────────────
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "files: freelancer full access"
    ON public.files FOR ALL
    USING  (freelancer_id = auth.uid() AND deleted_at IS NULL)
    WITH CHECK (freelancer_id = auth.uid());

-- Clients can READ files in their project and UPDATE status/comment
CREATE POLICY "files: client read via session"
    ON public.files FOR SELECT
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id
              AND p.client_id = public.get_current_client_id()
              AND p.deleted_at IS NULL
        )
    );

CREATE POLICY "files: client update review"
    ON public.files FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id
              AND p.client_id = public.get_current_client_id()
              AND p.deleted_at IS NULL
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id
              AND p.client_id = public.get_current_client_id()
              AND p.deleted_at IS NULL
        )
    );

-- ── invoices ─────────────────────────────────────────────────────────────────
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices: freelancer full access"
    ON public.invoices FOR ALL
    USING  (freelancer_id = auth.uid() AND deleted_at IS NULL)
    WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "invoices: client read via session"
    ON public.invoices FOR SELECT
    USING (
        client_id = public.get_current_client_id()
        AND deleted_at IS NULL
    );

-- ── messages ─────────────────────────────────────────────────────────────────
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages: freelancer full access"
    ON public.messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id
              AND p.freelancer_id = auth.uid()
              AND p.deleted_at IS NULL
        )
    );

CREATE POLICY "messages: client read and write via session"
    ON public.messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_id
              AND p.client_id = public.get_current_client_id()
              AND p.deleted_at IS NULL
        )
    );

-- ── portal_sessions ──────────────────────────────────────────────────────────
ALTER TABLE public.portal_sessions ENABLE ROW LEVEL SECURITY;

-- Only the service-role key (used in API routes) can touch portal_sessions.
-- No authenticated user or anonymous visitor should ever directly query this.
CREATE POLICY "portal_sessions: deny all anon and user access"
    ON public.portal_sessions FOR ALL
    USING (FALSE);


-- =============================================================================
-- PART 6 — SEED DATA  (industrial volume, realistic)
-- =============================================================================
-- Run this section in Supabase SQL Editor as service role.
-- It seeds 3 freelancers, ~4 clients each, ~3 projects per client,
-- ~4 files per project, invoices, messages, and portal sessions.
--
-- auth.users rows are inserted directly here (only possible with service
-- role). In production, they are created by Supabase Auth automatically.
-- =============================================================================

DO $$
DECLARE
    -- ── freelancer UUIDs ──────────────────────────────────────────────────
    fl1 UUID := '11111111-0000-0000-0000-000000000001';
    fl2 UUID := '22222222-0000-0000-0000-000000000001';
    fl3 UUID := '33333333-0000-0000-0000-000000000001';

    -- ── client UUIDs ─────────────────────────────────────────────────────
    c1  UUID := gen_random_uuid();  c2  UUID := gen_random_uuid();
    c3  UUID := gen_random_uuid();  c4  UUID := gen_random_uuid();
    c5  UUID := gen_random_uuid();  c6  UUID := gen_random_uuid();
    c7  UUID := gen_random_uuid();  c8  UUID := gen_random_uuid();
    c9  UUID := gen_random_uuid();  c10 UUID := gen_random_uuid();
    c11 UUID := gen_random_uuid();  c12 UUID := gen_random_uuid();

    -- ── project UUIDs ────────────────────────────────────────────────────
    p1  UUID := gen_random_uuid();  p2  UUID := gen_random_uuid();
    p3  UUID := gen_random_uuid();  p4  UUID := gen_random_uuid();
    p5  UUID := gen_random_uuid();  p6  UUID := gen_random_uuid();
    p7  UUID := gen_random_uuid();  p8  UUID := gen_random_uuid();
    p9  UUID := gen_random_uuid();  p10 UUID := gen_random_uuid();
    p11 UUID := gen_random_uuid();  p12 UUID := gen_random_uuid();
    p13 UUID := gen_random_uuid();  p14 UUID := gen_random_uuid();
    p15 UUID := gen_random_uuid();  p16 UUID := gen_random_uuid();
    p17 UUID := gen_random_uuid();  p18 UUID := gen_random_uuid();
    p19 UUID := gen_random_uuid();  p20 UUID := gen_random_uuid();
    p21 UUID := gen_random_uuid();  p22 UUID := gen_random_uuid();
    p23 UUID := gen_random_uuid();  p24 UUID := gen_random_uuid();
    p25 UUID := gen_random_uuid();  p26 UUID := gen_random_uuid();
    p27 UUID := gen_random_uuid();  p28 UUID := gen_random_uuid();
    p29 UUID := gen_random_uuid();  p30 UUID := gen_random_uuid();
    p31 UUID := gen_random_uuid();  p32 UUID := gen_random_uuid();
    p33 UUID := gen_random_uuid();  p34 UUID := gen_random_uuid();
    p35 UUID := gen_random_uuid();  p36 UUID := gen_random_uuid();

BEGIN

-- ============================================================
-- 6.1  auth.users  (Supabase Auth — service role only insert)
-- ============================================================
-- In production this is created by Supabase Auth when the
-- freelancer clicks the magic link for the first time.
-- We insert it manually here so the trigger creates profiles too.

INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, is_super_admin, is_sso_user, deleted_at
) VALUES
    (
        fl1, '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'alex@studiowave.io',
        crypt('SeedPass123!', gen_salt('bf')),
        NOW(),
        '{"full_name":"Alex Rivera"}'::jsonb,
        NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days',
        '', '', '', '', FALSE, FALSE, NULL
    ),
    (
        fl2, '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'sana@designsbysana.com',
        crypt('SeedPass123!', gen_salt('bf')),
        NOW(),
        '{"full_name":"Sana Malik"}'::jsonb,
        NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days',
        '', '', '', '', FALSE, FALSE, NULL
    ),
    (
        fl3, '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        'dev@codedbyomar.com',
        crypt('SeedPass123!', gen_salt('bf')),
        NOW(),
        '{"full_name":"Omar Hassan"}'::jsonb,
        NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days',
        '', '', '', '', FALSE, FALSE, NULL
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6.2  profiles
-- ============================================================
-- The handle_new_user() trigger already created skeleton rows
-- when auth.users was inserted above. We UPDATE them with
-- the full business profile now.

UPDATE public.profiles SET
    full_name             = 'Alex Rivera',
    business_name         = 'StudioWave',
    avatar_url            = 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    plan                  = 'pro',
    stripe_customer_id    = 'cus_SeedAlex001',
    stripe_subscription_id= 'sub_SeedAlex001',
    subscription_status   = 'active',
    onboarding_completed  = TRUE,
    created_at            = NOW() - INTERVAL '60 days',
    updated_at            = NOW() - INTERVAL '1 day'
WHERE id = fl1;

UPDATE public.profiles SET
    full_name             = 'Sana Malik',
    business_name         = 'Designs by Sana',
    avatar_url            = 'https://api.dicebear.com/7.x/avataaars/svg?seed=sana',
    plan                  = 'business',
    stripe_customer_id    = 'cus_SeedSana001',
    stripe_subscription_id= 'sub_SeedSana001',
    subscription_status   = 'active',
    onboarding_completed  = TRUE,
    created_at            = NOW() - INTERVAL '45 days',
    updated_at            = NOW() - INTERVAL '2 hours'
WHERE id = fl2;

UPDATE public.profiles SET
    full_name             = 'Omar Hassan',
    business_name         = 'Coded by Omar',
    avatar_url            = 'https://api.dicebear.com/7.x/avataaars/svg?seed=omar',
    plan                  = 'pro',
    stripe_customer_id    = 'cus_SeedOmar001',
    stripe_subscription_id= 'sub_SeedOmar001',
    subscription_status   = 'active',
    onboarding_completed  = TRUE,
    created_at            = NOW() - INTERVAL '30 days',
    updated_at            = NOW() - INTERVAL '3 hours'
WHERE id = fl3;

-- ============================================================
-- 6.3  clients   (12 total, 4 per freelancer)
-- ============================================================

INSERT INTO public.clients (id, freelancer_id, name, email, portal_slug, status, created_at, updated_at) VALUES
    -- Alex Rivera's clients
    (c1,  fl1, 'Acme Corp',         'hello@acmecorp.com',           'acme-corp',          'active',   NOW()-'55 days'::INTERVAL,  NOW()-'1 day'::INTERVAL),
    (c2,  fl1, 'Pixel & Press',     'studio@pixelpress.design',     'pixel-press',         'active',   NOW()-'50 days'::INTERVAL,  NOW()-'4 hours'::INTERVAL),
    (c3,  fl1, 'GreenLeaf Foods',   'brand@greenleaffoods.co',      'greenleaf-foods',     'active',   NOW()-'40 days'::INTERVAL,  NOW()-'2 days'::INTERVAL),
    (c4,  fl1, 'Northstar Ventures','info@northstarvc.com',         'northstar-ventures',  'archived', NOW()-'58 days'::INTERVAL,  NOW()-'10 days'::INTERVAL),

    -- Sana Malik's clients
    (c5,  fl2, 'Lumi Beauty',       'creative@lumibeauty.com',      'lumi-beauty',         'active',   NOW()-'42 days'::INTERVAL,  NOW()-'6 hours'::INTERVAL),
    (c6,  fl2, 'The Roast Room',    'owner@theroastroom.cafe',      'the-roast-room',      'active',   NOW()-'38 days'::INTERVAL,  NOW()-'1 day'::INTERVAL),
    (c7,  fl2, 'MedSync Health',    'marketing@medsynch.io',        'medsync-health',      'active',   NOW()-'30 days'::INTERVAL,  NOW()-'3 hours'::INTERVAL),
    (c8,  fl2, 'Sparks Agency',     'projects@sparksagency.au',     'sparks-agency',       'active',   NOW()-'25 days'::INTERVAL,  NOW()-'30 minutes'::INTERVAL),

    -- Omar Hassan's clients
    (c9,  fl3, 'LaunchPad SaaS',    'founders@launchpadsaas.io',    'launchpad-saas',      'active',   NOW()-'28 days'::INTERVAL,  NOW()-'2 hours'::INTERVAL),
    (c10, fl3, 'Retro Brewing Co',  'hello@retrobrewing.com',       'retro-brewing-co',    'active',   NOW()-'24 days'::INTERVAL,  NOW()-'5 hours'::INTERVAL),
    (c11, fl3, 'Atlas Real Estate', 'digital@atlasrealestate.com',  'atlas-real-estate',   'active',   NOW()-'20 days'::INTERVAL,  NOW()-'1 day'::INTERVAL),
    (c12, fl3, 'BrightKids Edu',    'hello@brightkids.edu.au',      'brightkids-edu',      'active',   NOW()-'15 days'::INTERVAL,  NOW()-'8 hours'::INTERVAL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6.4  projects  (36 total, ~3 per client)
-- ============================================================

INSERT INTO public.projects (id, client_id, freelancer_id, title, description, status, due_date, created_at, updated_at) VALUES
    -- Acme Corp (c1) — fl1
    (p1,  c1, fl1, 'Brand Identity Refresh',   'Full rebrand: logo, typography, palette, brand guide', 'review',       '2026-06-15', NOW()-'50 days'::INTERVAL, NOW()-'1 day'::INTERVAL),
    (p2,  c1, fl1, 'Website Redesign',          'Redesign corporate website — 8 pages, Figma deliverables', 'in_progress', '2026-07-01', NOW()-'45 days'::INTERVAL, NOW()-'3 hours'::INTERVAL),
    (p3,  c1, fl1, 'Social Media Kit',          'Templates for Instagram, LinkedIn, and Twitter/X',   'done',         NULL,         NOW()-'55 days'::INTERVAL, NOW()-'20 days'::INTERVAL),

    -- Pixel & Press (c2) — fl1
    (p4,  c2, fl1, 'Editorial Layout — Issue 12','Magazine layout, 48 pages, InDesign',                'done',         NULL,         NOW()-'48 days'::INTERVAL, NOW()-'10 days'::INTERVAL),
    (p5,  c2, fl1, 'Event Poster Series',        '6 A2 posters for the spring program',                'in_progress',  '2026-06-20', NOW()-'35 days'::INTERVAL, NOW()-'1 day'::INTERVAL),
    (p6,  c2, fl1, 'Brand Style Guide Update',   'Update brand guidelines with new secondary palette', 'briefing',     '2026-07-10', NOW()-'10 days'::INTERVAL, NOW()-'5 hours'::INTERVAL),

    -- GreenLeaf Foods (c3) — fl1
    (p7,  c3, fl1, 'Packaging Design',           'Redesign 3 SKUs — pouch, box, jar',                  'in_progress',  '2026-06-30', NOW()-'38 days'::INTERVAL, NOW()-'12 hours'::INTERVAL),
    (p8,  c3, fl1, 'eCommerce Product Photos',   'Lifestyle and white-bg shots for 12 products',       'review',       '2026-06-10', NOW()-'28 days'::INTERVAL, NOW()-'2 days'::INTERVAL),
    (p9,  c3, fl1, 'Email Campaign Templates',   '6 Klaviyo HTML templates',                           'briefing',     '2026-07-20', NOW()-'5 days'::INTERVAL,  NOW()-'1 day'::INTERVAL),

    -- Northstar Ventures (c4) — fl1 (archived client — project done)
    (p10, c4, fl1, 'Pitch Deck Design',          '18-slide investor pitch deck',                       'done',         NULL,         NOW()-'58 days'::INTERVAL, NOW()-'30 days'::INTERVAL),

    -- Lumi Beauty (c5) — fl2
    (p11, c5, fl2, 'Brand Guidelines v2',         'Extend brand system to include skincare sub-brand',  'review',       '2026-06-05', NOW()-'40 days'::INTERVAL, NOW()-'6 hours'::INTERVAL),
    (p12, c5, fl2, 'Packaging Illustrations',     'Hand-drawn botanicals for 5 product lines',         'in_progress',  '2026-07-15', NOW()-'30 days'::INTERVAL, NOW()-'1 day'::INTERVAL),
    (p13, c5, fl2, 'Look Book Layout',            '24-page seasonal look book, print-ready PDF',       'briefing',     '2026-08-01', NOW()-'15 days'::INTERVAL, NOW()-'8 hours'::INTERVAL),

    -- The Roast Room (c6) — fl2
    (p14, c6, fl2, 'Logo & Brand Identity',       'New logo, wordmark, and brand colours',              'done',         NULL,         NOW()-'38 days'::INTERVAL, NOW()-'15 days'::INTERVAL),
    (p15, c6, fl2, 'Menu Design & Print Files',   'Dine-in menu, takeaway bag, cups print files',      'in_progress',  '2026-06-25', NOW()-'25 days'::INTERVAL, NOW()-'3 hours'::INTERVAL),
    (p16, c6, fl2, 'Instagram Content Plan',      '30 caption templates + 12 Canva story templates',   'review',       '2026-06-12', NOW()-'20 days'::INTERVAL, NOW()-'1 day'::INTERVAL),

    -- MedSync Health (c7) — fl2
    (p17, c7, fl2, 'UI/UX Patient Dashboard',     'Dashboard redesign for patient-facing web app',     'in_progress',  '2026-07-30', NOW()-'28 days'::INTERVAL, NOW()-'4 hours'::INTERVAL),
    (p18, c7, fl2, 'Marketing One-Pagers',        '4 A4 one-pagers for sales team',                   'done',         NULL,         NOW()-'35 days'::INTERVAL, NOW()-'20 days'::INTERVAL),
    (p19, c7, fl2, 'Trade Show Booth Design',     '3m x 3m stand, pull-up banners, desk display',     'briefing',     '2026-09-01', NOW()-'8 days'::INTERVAL,  NOW()-'2 days'::INTERVAL),

    -- Sparks Agency (c8) — fl2
    (p20, c8, fl2, 'Sub-brand Identity — Sparks X','New identity for events arm of agency',             'review',       '2026-06-18', NOW()-'22 days'::INTERVAL, NOW()-'30 minutes'::INTERVAL),
    (p21, c8, fl2, 'Proposal Template',           'Branded proposal deck template (PowerPoint + PDF)', 'in_progress',  '2026-06-28', NOW()-'18 days'::INTERVAL, NOW()-'2 hours'::INTERVAL),
    (p22, c8, fl2, 'Client Report Template',      'Monthly performance report template',               'briefing',     '2026-07-05', NOW()-'5 days'::INTERVAL,  NOW()-'1 day'::INTERVAL),

    -- LaunchPad SaaS (c9) — fl3
    (p23, c9, fl3, 'Landing Page Build',          'Next.js landing page — pricing, features, CTA',    'in_progress',  '2026-06-20', NOW()-'25 days'::INTERVAL, NOW()-'2 hours'::INTERVAL),
    (p24, c9, fl3, 'Auth & Onboarding Flow',      'Magic link auth + 3-step onboarding wizard',       'in_progress',  '2026-07-05', NOW()-'20 days'::INTERVAL, NOW()-'5 hours'::INTERVAL),
    (p25, c9, fl3, 'API Integration — Stripe',    'Stripe billing: checkout, portal, webhooks',       'briefing',     '2026-07-20', NOW()-'10 days'::INTERVAL, NOW()-'1 day'::INTERVAL),

    -- Retro Brewing Co (c10) — fl3
    (p26, c10, fl3, 'E-commerce Store Build',     'Shopify custom theme — product catalogue, cart',   'review',       '2026-06-15', NOW()-'22 days'::INTERVAL, NOW()-'3 hours'::INTERVAL),
    (p27, c10, fl3, 'Taproom Booking System',     'Simple reservation form + admin panel (Next.js)',  'in_progress',  '2026-07-01', NOW()-'15 days'::INTERVAL, NOW()-'1 day'::INTERVAL),
    (p28, c10, fl3, 'Blog & CMS Setup',           'Sanity CMS + blog section on existing Next.js site','briefing',    '2026-07-15', NOW()-'7 days'::INTERVAL,  NOW()-'6 hours'::INTERVAL),

    -- Atlas Real Estate (c11) — fl3
    (p29, c11, fl3, 'Property Listings Portal',   'Search, filter, detail page — Supabase + Next.js','in_progress',  '2026-07-10', NOW()-'18 days'::INTERVAL, NOW()-'4 hours'::INTERVAL),
    (p30, c11, fl3, 'Agent CRM Dashboard',        'Internal dashboard for agents — listings + leads', 'briefing',     '2026-08-01', NOW()-'12 days'::INTERVAL, NOW()-'2 days'::INTERVAL),
    (p31, c11, fl3, 'Email Automation — Klaviyo', 'Klaviyo flows: open house, follow-up, newsletter', 'done',         NULL,         NOW()-'20 days'::INTERVAL, NOW()-'8 days'::INTERVAL),

    -- BrightKids Edu (c12) — fl3
    (p32, c12, fl3, 'Parent Portal MVP',          'Login, assignments view, progress tracker (Next.js)','in_progress', '2026-07-25', NOW()-'13 days'::INTERVAL, NOW()-'5 hours'::INTERVAL),
    (p33, c12, fl3, 'Teacher Dashboard',          'Class roster, grade entry, attendance — React',   'briefing',     '2026-08-10', NOW()-'10 days'::INTERVAL, NOW()-'1 day'::INTERVAL),
    (p34, c12, fl3, 'Mobile-Responsive Audit',    'Audit and fix all responsive issues on existing site','done',       NULL,         NOW()-'15 days'::INTERVAL, NOW()-'5 days'::INTERVAL),

    -- Extra projects to hit 36
    (p35, c1, fl1, 'Annual Report Layout',        '40-page PDF annual report',                        'done',         NULL,         NOW()-'70 days'::INTERVAL, NOW()-'35 days'::INTERVAL),
    (p36, c5, fl2, 'Retail Display Graphics',     '6 in-store display panels, print-ready',          'done',         NULL,         NOW()-'50 days'::INTERVAL, NOW()-'25 days'::INTERVAL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6.5  files  (representative set across projects)
-- ============================================================

INSERT INTO public.files (id, project_id, freelancer_id, filename, storage_path, file_size, mime_type, version, status, client_comment, reviewed_at, created_at) VALUES
    -- Brand Identity Refresh (p1) — in review
    (gen_random_uuid(), p1, fl1, 'logo-concepts-v1.pdf',       'files/fl1/p1/logo-concepts-v1.pdf',       4200000, 'application/pdf',  1, 'changes_requested', 'Love direction 2 but can we try a rounded version?', NOW()-'5 days'::INTERVAL,  NOW()-'10 days'::INTERVAL),
    (gen_random_uuid(), p1, fl1, 'logo-concepts-v2.pdf',       'files/fl1/p1/logo-concepts-v2.pdf',       3800000, 'application/pdf',  2, 'pending',            NULL,                                                 NULL,                        NOW()-'2 days'::INTERVAL),
    (gen_random_uuid(), p1, fl1, 'brand-colours.pdf',          'files/fl1/p1/brand-colours.pdf',          1200000, 'application/pdf',  1, 'approved',           NULL,                                                 NOW()-'8 days'::INTERVAL,    NOW()-'12 days'::INTERVAL),
    (gen_random_uuid(), p1, fl1, 'typography-selection.pdf',   'files/fl1/p1/typography-selection.pdf',   900000,  'application/pdf',  1, 'approved',           'Perfect, exactly what we were looking for',         NOW()-'7 days'::INTERVAL,    NOW()-'12 days'::INTERVAL),

    -- Website Redesign (p2) — in progress
    (gen_random_uuid(), p2, fl1, 'homepage-wireframe.fig',     'files/fl1/p2/homepage-wireframe.fig',     2100000, 'application/octet-stream', 1, 'approved',  NULL,                                                 NOW()-'15 days'::INTERVAL,   NOW()-'20 days'::INTERVAL),
    (gen_random_uuid(), p2, fl1, 'homepage-design-v1.fig',     'files/fl1/p2/homepage-design-v1.fig',     8500000, 'application/octet-stream', 1, 'changes_requested','Hero image needs to be more dynamic',           NOW()-'5 days'::INTERVAL,    NOW()-'8 days'::INTERVAL),
    (gen_random_uuid(), p2, fl1, 'homepage-design-v2.fig',     'files/fl1/p2/homepage-design-v2.fig',     9100000, 'application/octet-stream', 2, 'pending',   NULL,                                                 NULL,                        NOW()-'1 day'::INTERVAL),
    (gen_random_uuid(), p2, fl1, 'inner-pages-design.fig',     'files/fl1/p2/inner-pages-design.fig',     12000000,'application/octet-stream', 1, 'pending',   NULL,                                                 NULL,                        NOW()-'3 hours'::INTERVAL),

    -- Social Media Kit (p3) — done
    (gen_random_uuid(), p3, fl1, 'instagram-templates.zip',    'files/fl1/p3/instagram-templates.zip',    15000000,'application/zip',  1, 'approved',           NULL,                                                 NOW()-'22 days'::INTERVAL,   NOW()-'25 days'::INTERVAL),
    (gen_random_uuid(), p3, fl1, 'linkedin-templates.zip',     'files/fl1/p3/linkedin-templates.zip',     8000000, 'application/zip',  1, 'approved',           'Great work!',                                       NOW()-'20 days'::INTERVAL,   NOW()-'25 days'::INTERVAL),
    (gen_random_uuid(), p3, fl1, 'brand-guidelines-mini.pdf',  'files/fl1/p3/brand-guidelines-mini.pdf',  2200000, 'application/pdf',  1, 'approved',           NULL,                                                 NOW()-'21 days'::INTERVAL,   NOW()-'25 days'::INTERVAL),

    -- Event Poster Series (p5) — in progress
    (gen_random_uuid(), p5, fl1, 'poster-spring-jazz.pdf',     'files/fl1/p5/poster-spring-jazz.pdf',     5500000, 'application/pdf',  1, 'approved',           NULL,                                                 NOW()-'10 days'::INTERVAL,   NOW()-'14 days'::INTERVAL),
    (gen_random_uuid(), p5, fl1, 'poster-art-fair.pdf',        'files/fl1/p5/poster-art-fair.pdf',        5200000, 'application/pdf',  1, 'pending',            NULL,                                                 NULL,                        NOW()-'1 day'::INTERVAL),

    -- Packaging Design (p7) — in progress
    (gen_random_uuid(), p7, fl1, 'pouch-design-v1.ai',         'files/fl1/p7/pouch-design-v1.ai',         18000000,'application/illustrator', 1, 'changes_requested','The green feels too dark, try #3D7A4E',        NOW()-'3 days'::INTERVAL,    NOW()-'7 days'::INTERVAL),
    (gen_random_uuid(), p7, fl1, 'box-design-v1.ai',           'files/fl1/p7/box-design-v1.ai',           22000000,'application/illustrator', 1, 'pending',    NULL,                                                 NULL,                        NOW()-'5 days'::INTERVAL),
    (gen_random_uuid(), p7, fl1, 'jar-design-v1.ai',           'files/fl1/p7/jar-design-v1.ai',           19000000,'application/illustrator', 1, 'pending',    NULL,                                                 NULL,                        NOW()-'5 days'::INTERVAL),

    -- Brand Guidelines v2 (p11) — fl2 review
    (gen_random_uuid(), p11, fl2, 'brand-guide-v2-draft.pdf', 'files/fl2/p11/brand-guide-v2-draft.pdf',  11000000,'application/pdf',  1, 'changes_requested','Section 4 fonts are wrong — should be Canela not GT',  NOW()-'2 days'::INTERVAL,   NOW()-'6 days'::INTERVAL),
    (gen_random_uuid(), p11, fl2, 'brand-guide-v2-final.pdf', 'files/fl2/p11/brand-guide-v2-final.pdf',  12000000,'application/pdf',  2, 'pending',            NULL,                                                 NULL,                        NOW()-'4 hours'::INTERVAL),

    -- Logo & Brand Identity (p14) — done
    (gen_random_uuid(), p14, fl2, 'logo-roast-room.svg',       'files/fl2/p14/logo-roast-room.svg',       140000,  'image/svg+xml',   1, 'approved',           NULL,                                                 NOW()-'18 days'::INTERVAL,   NOW()-'22 days'::INTERVAL),
    (gen_random_uuid(), p14, fl2, 'brand-guide-roast-room.pdf','files/fl2/p14/brand-guide-roast-room.pdf',6500000, 'application/pdf', 1, 'approved',           'Love it! Can we get the source files too?',         NOW()-'16 days'::INTERVAL,   NOW()-'22 days'::INTERVAL),

    -- UI/UX Patient Dashboard (p17) — in progress
    (gen_random_uuid(), p17, fl2, 'dashboard-wireframes.fig',  'files/fl2/p17/dashboard-wireframes.fig',  3400000, 'application/octet-stream', 1, 'approved',  NULL,                                                 NOW()-'10 days'::INTERVAL,   NOW()-'14 days'::INTERVAL),
    (gen_random_uuid(), p17, fl2, 'dashboard-design-v1.fig',   'files/fl2/p17/dashboard-design-v1.fig',   14000000,'application/octet-stream', 1, 'pending',   NULL,                                                 NULL,                        NOW()-'2 days'::INTERVAL),

    -- Sub-brand Identity (p20) — fl2 review
    (gen_random_uuid(), p20, fl2, 'sparks-x-logo.pdf',         'files/fl2/p20/sparks-x-logo.pdf',         2100000, 'application/pdf', 1, 'pending',            NULL,                                                 NULL,                        NOW()-'6 hours'::INTERVAL),
    (gen_random_uuid(), p20, fl2, 'sparks-x-brand-board.pdf',  'files/fl2/p20/sparks-x-brand-board.pdf',  4800000, 'application/pdf', 1, 'pending',            NULL,                                                 NULL,                        NOW()-'6 hours'::INTERVAL),

    -- Landing Page Build (p23) — fl3 in progress
    (gen_random_uuid(), p23, fl3, 'landing-page-staging-url.pdf','files/fl3/p23/landing-page-staging.pdf',180000,  'application/pdf', 1, 'pending',            NULL,                                                 NULL,                        NOW()-'3 days'::INTERVAL),

    -- E-commerce Store Build (p26) — fl3 review
    (gen_random_uuid(), p26, fl3, 'store-preview-link.pdf',    'files/fl3/p26/store-preview-link.pdf',    220000,  'application/pdf', 1, 'changes_requested','The cart drawer is not working on mobile',             NOW()-'1 day'::INTERVAL,     NOW()-'4 days'::INTERVAL),
    (gen_random_uuid(), p26, fl3, 'store-v2-fixes.pdf',        'files/fl3/p26/store-v2-fixes.pdf',        240000,  'application/pdf', 2, 'pending',            NULL,                                                 NULL,                        NOW()-'2 hours'::INTERVAL),

    -- Property Listings Portal (p29) — fl3 in progress
    (gen_random_uuid(), p29, fl3, 'portal-search-wireframe.pdf','files/fl3/p29/portal-search-wireframe.pdf',1800000,'application/pdf',1, 'approved',           NULL,                                                 NOW()-'8 days'::INTERVAL,    NOW()-'12 days'::INTERVAL),
    (gen_random_uuid(), p29, fl3, 'portal-v1-staging.pdf',     'files/fl3/p29/portal-v1-staging.pdf',     900000,  'application/pdf', 1, 'pending',            NULL,                                                 NULL,                        NOW()-'1 day'::INTERVAL),

    -- Parent Portal MVP (p32) — fl3 in progress
    (gen_random_uuid(), p32, fl3, 'parent-portal-wireframe.pdf','files/fl3/p32/parent-portal-wireframe.pdf',2300000,'application/pdf',1,'approved',            'Looks good!',                                       NOW()-'4 days'::INTERVAL,    NOW()-'8 days'::INTERVAL),
    (gen_random_uuid(), p32, fl3, 'parent-portal-v1.pdf',      'files/fl3/p32/parent-portal-v1.pdf',      1100000, 'application/pdf', 1, 'pending',            NULL,                                                 NULL,                        NOW()-'12 hours'::INTERVAL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6.6  invoices  (realistic mix of statuses)
-- ============================================================

INSERT INTO public.invoices (id, client_id, freelancer_id, invoice_number, line_items, subtotal, tax_rate, tax_amount, total, currency, status, due_date, stripe_payment_intent_id, paid_at, notes, created_at, updated_at) VALUES
    -- Alex Rivera invoices
    (gen_random_uuid(), c1, fl1, 'INV-0001',
     '[{"description":"Brand identity — discovery & concepts","quantity":1,"unit_price":1500},{"description":"Logo refinements (2 rounds)","quantity":1,"unit_price":500}]'::jsonb,
     2000.00, 10.00, 200.00, 2200.00, 'AUD', 'paid', '2026-05-01',
     'pi_seed_acme_001', NOW()-'25 days'::INTERVAL, 'Thank you for your business!',
     NOW()-'50 days'::INTERVAL, NOW()-'25 days'::INTERVAL),

    (gen_random_uuid(), c1, fl1, 'INV-0002',
     '[{"description":"Brand guide document (30 pages)","quantity":1,"unit_price":800},{"description":"Brand colour palette & typography spec","quantity":1,"unit_price":400}]'::jsonb,
     1200.00, 10.00, 120.00, 1320.00, 'AUD', 'paid', '2026-05-15',
     'pi_seed_acme_002', NOW()-'12 days'::INTERVAL, NULL,
     NOW()-'35 days'::INTERVAL, NOW()-'12 days'::INTERVAL),

    (gen_random_uuid(), c1, fl1, 'INV-0003',
     '[{"description":"Website redesign — UX & design (milestone 1)","quantity":1,"unit_price":3000}]'::jsonb,
     3000.00, 10.00, 300.00, 3300.00, 'AUD', 'sent', '2026-06-10',
     NULL, NULL, '50% milestone payment',
     NOW()-'5 days'::INTERVAL, NOW()-'5 days'::INTERVAL),

    (gen_random_uuid(), c2, fl1, 'INV-0004',
     '[{"description":"Editorial layout — 48 pages","quantity":1,"unit_price":2400}]'::jsonb,
     2400.00, 10.00, 240.00, 2640.00, 'AUD', 'paid', '2026-04-30',
     'pi_seed_pp_001', NOW()-'20 days'::INTERVAL, NULL,
     NOW()-'40 days'::INTERVAL, NOW()-'20 days'::INTERVAL),

    (gen_random_uuid(), c2, fl1, 'INV-0005',
     '[{"description":"Event poster series — 6 A2 posters","quantity":6,"unit_price":280}]'::jsonb,
     1680.00, 10.00, 168.00, 1848.00, 'AUD', 'sent', '2026-06-20',
     NULL, NULL, NULL,
     NOW()-'3 days'::INTERVAL, NOW()-'3 days'::INTERVAL),

    (gen_random_uuid(), c3, fl1, 'INV-0006',
     '[{"description":"Packaging design — 3 SKUs (discovery)","quantity":1,"unit_price":1800}]'::jsonb,
     1800.00, 10.00, 180.00, 1980.00, 'AUD', 'overdue', '2026-05-10',
     NULL, NULL, '30 days net',
     NOW()-'30 days'::INTERVAL, NOW()-'16 days'::INTERVAL),

    (gen_random_uuid(), c3, fl1, 'INV-0007',
     '[{"description":"eCommerce product photography — 12 products","quantity":12,"unit_price":150}]'::jsonb,
     1800.00, 10.00, 180.00, 1980.00, 'AUD', 'draft', '2026-06-30',
     NULL, NULL, NULL,
     NOW()-'1 day'::INTERVAL, NOW()-'1 day'::INTERVAL),

    -- Sana Malik invoices
    (gen_random_uuid(), c5, fl2, 'INV-0001',
     '[{"description":"Brand guidelines v2 — strategy & design","quantity":1,"unit_price":2800}]'::jsonb,
     2800.00, 0.00, 0.00, 2800.00, 'USD', 'sent', '2026-06-08',
     NULL, NULL, NULL,
     NOW()-'4 days'::INTERVAL, NOW()-'4 days'::INTERVAL),

    (gen_random_uuid(), c5, fl2, 'INV-0002',
     '[{"description":"Retail display graphics — 6 panels","quantity":6,"unit_price":220}]'::jsonb,
     1320.00, 0.00, 0.00, 1320.00, 'USD', 'paid', '2026-04-15',
     'pi_seed_lumi_001', NOW()-'30 days'::INTERVAL, NULL,
     NOW()-'45 days'::INTERVAL, NOW()-'30 days'::INTERVAL),

    (gen_random_uuid(), c6, fl2, 'INV-0001',
     '[{"description":"Logo and brand identity","quantity":1,"unit_price":1600},{"description":"Brand guide document","quantity":1,"unit_price":600}]'::jsonb,
     2200.00, 0.00, 0.00, 2200.00, 'USD', 'paid', '2026-04-20',
     'pi_seed_roast_001', NOW()-'28 days'::INTERVAL, NULL,
     NOW()-'38 days'::INTERVAL, NOW()-'28 days'::INTERVAL),

    (gen_random_uuid(), c6, fl2, 'INV-0002',
     '[{"description":"Menu design — dine-in, takeaway, cups","quantity":1,"unit_price":950}]'::jsonb,
     950.00, 0.00, 0.00, 950.00, 'USD', 'sent', '2026-06-25',
     NULL, NULL, NULL,
     NOW()-'2 days'::INTERVAL, NOW()-'2 days'::INTERVAL),

    (gen_random_uuid(), c7, fl2, 'INV-0001',
     '[{"description":"Marketing one-pagers — 4 documents","quantity":4,"unit_price":350}]'::jsonb,
     1400.00, 0.00, 0.00, 1400.00, 'USD', 'paid', '2026-04-25',
     'pi_seed_medsync_001', NOW()-'22 days'::INTERVAL, NULL,
     NOW()-'32 days'::INTERVAL, NOW()-'22 days'::INTERVAL),

    (gen_random_uuid(), c7, fl2, 'INV-0002',
     '[{"description":"UI/UX patient dashboard — discovery & wireframes","quantity":1,"unit_price":3500}]'::jsonb,
     3500.00, 0.00, 0.00, 3500.00, 'USD', 'draft', '2026-07-15',
     NULL, NULL, 'Milestone 1 of 3',
     NOW()-'12 hours'::INTERVAL, NOW()-'12 hours'::INTERVAL),

    (gen_random_uuid(), c8, fl2, 'INV-0001',
     '[{"description":"Sub-brand identity — Sparks X","quantity":1,"unit_price":2200}]'::jsonb,
     2200.00, 0.00, 0.00, 2200.00, 'USD', 'sent', '2026-06-18',
     NULL, NULL, NULL,
     NOW()-'1 day'::INTERVAL, NOW()-'1 day'::INTERVAL),

    -- Omar Hassan invoices
    (gen_random_uuid(), c9, fl3, 'INV-0001',
     '[{"description":"Landing page build — design & dev","quantity":1,"unit_price":4500},{"description":"Domain + hosting setup","quantity":1,"unit_price":200}]'::jsonb,
     4700.00, 10.00, 470.00, 5170.00, 'AUD', 'sent', '2026-06-20',
     NULL, NULL, '50% upfront balance due on delivery',
     NOW()-'3 days'::INTERVAL, NOW()-'3 days'::INTERVAL),

    (gen_random_uuid(), c10, fl3, 'INV-0001',
     '[{"description":"E-commerce store build — Shopify theme","quantity":1,"unit_price":5800}]'::jsonb,
     5800.00, 10.00, 580.00, 6380.00, 'AUD', 'sent', '2026-06-15',
     NULL, NULL, NULL,
     NOW()-'2 days'::INTERVAL, NOW()-'2 days'::INTERVAL),

    (gen_random_uuid(), c10, fl3, 'INV-0002',
     '[{"description":"Taproom booking system — scoping","quantity":1,"unit_price":800}]'::jsonb,
     800.00, 10.00, 80.00, 880.00, 'AUD', 'draft', '2026-07-05',
     NULL, NULL, NULL,
     NOW()-'1 day'::INTERVAL, NOW()-'1 day'::INTERVAL),

    (gen_random_uuid(), c11, fl3, 'INV-0001',
     '[{"description":"Klaviyo email automation setup — 3 flows","quantity":3,"unit_price":600}]'::jsonb,
     1800.00, 10.00, 180.00, 1980.00, 'AUD', 'paid', '2026-05-20',
     'pi_seed_atlas_001', NOW()-'8 days'::INTERVAL, NULL,
     NOW()-'20 days'::INTERVAL, NOW()-'8 days'::INTERVAL),

    (gen_random_uuid(), c11, fl3, 'INV-0002',
     '[{"description":"Property listings portal — build","quantity":1,"unit_price":7200}]'::jsonb,
     7200.00, 10.00, 720.00, 7920.00, 'AUD', 'sent', '2026-07-10',
     NULL, NULL, '50% upfront — balance on launch',
     NOW()-'5 days'::INTERVAL, NOW()-'5 days'::INTERVAL),

    (gen_random_uuid(), c12, fl3, 'INV-0001',
     '[{"description":"Mobile responsive audit & fixes","quantity":1,"unit_price":1200}]'::jsonb,
     1200.00, 10.00, 120.00, 1320.00, 'AUD', 'paid', '2026-05-10',
     'pi_seed_bright_001', NOW()-'5 days'::INTERVAL, NULL,
     NOW()-'15 days'::INTERVAL, NOW()-'5 days'::INTERVAL),

    (gen_random_uuid(), c12, fl3, 'INV-0002',
     '[{"description":"Parent portal MVP — design & build","quantity":1,"unit_price":6500}]'::jsonb,
     6500.00, 10.00, 650.00, 7150.00, 'AUD', 'draft', '2026-07-25',
     NULL, NULL, 'Milestone 1 — kickoff',
     NOW()-'2 hours'::INTERVAL, NOW()-'2 hours'::INTERVAL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6.7  messages  (threaded conversations per project)
-- ============================================================

INSERT INTO public.messages (id, project_id, sender_type, sender_id, content, read_at, created_at) VALUES
    -- Brand Identity Refresh (p1)
    (gen_random_uuid(), p1, 'freelancer', fl1, 'Hi! I have uploaded the first round of logo concepts — 3 directions. Take a look and let me know which direction resonates. I''d suggest focusing on direction 2 as it aligns best with what you described in the brief.', NOW()-'12 days'::INTERVAL, NOW()-'12 days'::INTERVAL),
    (gen_random_uuid(), p1, 'client',     NULL, 'Thanks Alex! We reviewed all three. Direction 2 is closest but could you try a rounded version of the icon? The sharp corners feel a bit aggressive for our brand.', NOW()-'11 days'::INTERVAL, NOW()-'11 days'::INTERVAL),
    (gen_random_uuid(), p1, 'freelancer', fl1, 'Perfect feedback! Working on the rounded variant now — will have it uploaded by end of day Thursday.', NOW()-'10 days'::INTERVAL, NOW()-'10 days'::INTERVAL),
    (gen_random_uuid(), p1, 'client',     NULL, 'Great, looking forward to it!', NOW()-'10 days'::INTERVAL, NOW()-'10 days'::INTERVAL),
    (gen_random_uuid(), p1, 'freelancer', fl1, 'Done! Just uploaded v2 with the rounded icon. I''ve also tweaked the weight slightly — should feel warmer. Let me know what you think.', NULL, NOW()-'2 days'::INTERVAL),

    -- Website Redesign (p2)
    (gen_random_uuid(), p2, 'freelancer', fl1, 'Wireframes are approved — moving into visual design now. I''ll have the homepage design ready for review by next Wednesday.', NOW()-'18 days'::INTERVAL, NOW()-'18 days'::INTERVAL),
    (gen_random_uuid(), p2, 'client',     NULL, 'Sounds good! Quick question — should we include the testimonials section on the homepage or only on the about page?', NOW()-'17 days'::INTERVAL, NOW()-'17 days'::INTERVAL),
    (gen_random_uuid(), p2, 'freelancer', fl1, 'Good question. I''d recommend a condensed testimonial strip on the homepage (3 quotes max) and the full section on the About page. It builds trust on the landing page without overwhelming it.', NOW()-'16 days'::INTERVAL, NOW()-'16 days'::INTERVAL),
    (gen_random_uuid(), p2, 'client',     NULL, 'That makes sense. Let''s do that.', NOW()-'16 days'::INTERVAL, NOW()-'16 days'::INTERVAL),
    (gen_random_uuid(), p2, 'freelancer', fl1, 'Homepage v2 is up — addressed the hero feedback. Also uploaded the inner page designs. Would love your thoughts on the About and Services pages specifically.', NULL, NOW()-'1 day'::INTERVAL),

    -- Packaging Design (p7)
    (gen_random_uuid(), p7, 'freelancer', fl1, 'Starting on the packaging today. Quick question on the pouch — is it a stand-up pouch or flat? And do you need CMYK print-ready files or will you be printing digitally?', NOW()-'38 days'::INTERVAL, NOW()-'38 days'::INTERVAL),
    (gen_random_uuid(), p7, 'client',     NULL, 'Stand-up pouch, yes. Print files in CMYK please — we''re going to a commercial printer. The green on our current packaging is #2C5F2E but we''re open to adjusting.', NOW()-'37 days'::INTERVAL, NOW()-'37 days'::INTERVAL),
    (gen_random_uuid(), p7, 'freelancer', fl1, 'Got it. I''ve uploaded v1 of all three SKUs. The green I''ve used is slightly lighter (#3D7A4E) as I felt it would have better print reproduction. Happy to revert if you prefer the original.', NOW()-'8 days'::INTERVAL, NOW()-'8 days'::INTERVAL),
    (gen_random_uuid(), p7, 'client',     NULL, 'Can we find a middle ground? Something between #2C5F2E and #3D7A4E. Maybe #347060?', NULL, NOW()-'3 days'::INTERVAL),

    -- Brand Guidelines v2 (p11) — Lumi Beauty
    (gen_random_uuid(), p11, 'freelancer', fl2, 'Brand guide v2 draft is uploaded. Key changes: extended colour palette with the new nude tones, updated font pairing with Canela Display, and new photography direction section. Have a look!', NOW()-'7 days'::INTERVAL, NOW()-'7 days'::INTERVAL),
    (gen_random_uuid(), p11, 'client',     NULL, 'Love the new photography section! One issue though — Section 4 has GT Walsheim listed but we agreed on Canela throughout. Can that be fixed?', NOW()-'3 days'::INTERVAL, NOW()-'3 days'::INTERVAL),
    (gen_random_uuid(), p11, 'freelancer', fl2, 'My apologies — that slipped through. Fixed and re-uploaded as v2. Should be correct throughout now.', NULL, NOW()-'4 hours'::INTERVAL),

    -- UI/UX Patient Dashboard (p17) — MedSync Health
    (gen_random_uuid(), p17, 'freelancer', fl2, 'Wireframes are approved — great. I''m now working through the high-fidelity designs. Targeting the dashboard home, patient record, and appointment views for round 1.', NOW()-'12 days'::INTERVAL, NOW()-'12 days'::INTERVAL),
    (gen_random_uuid(), p17, 'client',     NULL, 'One thing we forgot to mention — the dashboard needs to be WCAG AA compliant. Particularly for the data tables. We have a few users with visual impairments.', NOW()-'11 days'::INTERVAL, NOW()-'11 days'::INTERVAL),
    (gen_random_uuid(), p17, 'freelancer', fl2, 'Absolutely — WCAG AA is my default standard. All colour contrasts will be verified, and I''ll include focus state designs for keyboard navigation. I''ll flag any edge cases.', NOW()-'10 days'::INTERVAL, NOW()-'10 days'::INTERVAL),
    (gen_random_uuid(), p17, 'client',     NULL, 'Perfect, thank you for flagging that proactively.', NOW()-'10 days'::INTERVAL, NOW()-'10 days'::INTERVAL),
    (gen_random_uuid(), p17, 'freelancer', fl2, 'Dashboard v1 is uploaded — covers all three views we discussed. Contrast ratios are all 4.5:1 or higher. Let me know your thoughts!', NULL, NOW()-'2 days'::INTERVAL),

    -- Landing Page Build (p23) — LaunchPad SaaS
    (gen_random_uuid(), p23, 'freelancer', fl3, 'Staging site is live at the link in the files section. All sections are built — hero, features, pricing, FAQ, footer. Works on mobile. Ready for your feedback!', NOW()-'4 days'::INTERVAL, NOW()-'4 days'::INTERVAL),
    (gen_random_uuid(), p23, 'client',     NULL, 'This looks really solid! A few things: 1) Can the pricing toggle (monthly/annual) be animated? 2) The FAQ accordion feels slow. 3) Can we add a countdown to our launch date in the hero?', NOW()-'3 days'::INTERVAL, NOW()-'3 days'::INTERVAL),
    (gen_random_uuid(), p23, 'freelancer', fl3, 'All three are doable. Countdown timer and animated pricing toggle are straightforward. For the FAQ I''ll replace the custom implementation with Radix Accordion which will be snappier. I''ll aim for EOW.', NULL, NOW()-'3 days'::INTERVAL),

    -- E-commerce Store (p26) — Retro Brewing
    (gen_random_uuid(), p26, 'freelancer', fl3, 'Store preview is ready — link is in the files tab. Product pages, cart, checkout are all functional with Shopify test mode. Would love feedback on the cart drawer in particular.', NOW()-'5 days'::INTERVAL, NOW()-'5 days'::INTERVAL),
    (gen_random_uuid(), p26, 'client',     NULL, 'Looks great on desktop! But the cart drawer is broken on mobile — the close button is cut off and you can''t scroll the items. Also on iPhone the hero video doesn''t autoplay.', NOW()-'2 days'::INTERVAL, NOW()-'2 days'::INTERVAL),
    (gen_random_uuid(), p26, 'freelancer', fl3, 'Thanks for testing on mobile — caught it. The cart issue was a z-index + overflow conflict. The video autoplay needs `muted playsinline` attributes for iOS. Both fixed in v2. Uploading now.', NULL, NOW()-'1 hour'::INTERVAL),

    -- Property Listings Portal (p29) — Atlas Real Estate
    (gen_random_uuid(), p29, 'freelancer', fl3, 'Wireframes approved — starting the build. Quick question on search: should the map and list view be side-by-side (like Airbnb) or tabbed? Side-by-side looks great on desktop but harder on mobile.', NOW()-'14 days'::INTERVAL, NOW()-'14 days'::INTERVAL),
    (gen_random_uuid(), p29, 'client',     NULL, 'Side-by-side for desktop, tabbed for mobile. We want the map prominent on desktop since most serious buyers explore on laptop.', NOW()-'13 days'::INTERVAL, NOW()-'13 days'::INTERVAL),
    (gen_random_uuid(), p29, 'freelancer', fl3, 'That''s the right call. Built it — works well. The responsive breakpoint switches at 768px. Uploaded v1 of the portal for your review.', NULL, NOW()-'1 day'::INTERVAL),

    -- Parent Portal MVP (p32) — BrightKids Edu
    (gen_random_uuid(), p32, 'freelancer', fl3, 'Wireframes are up — covers the login flow, assignments view, and progress tracker. The progress tracker uses a simple chart — let me know if you''d like a different visualisation style.', NOW()-'9 days'::INTERVAL, NOW()-'9 days'::INTERVAL),
    (gen_random_uuid(), p32, 'client',     NULL, 'Wireframes look great! The chart is fine. One addition — can parents also see upcoming events/excursions? Even a simple list would be helpful.', NOW()-'8 days'::INTERVAL, NOW()-'8 days'::INTERVAL),
    (gen_random_uuid(), p32, 'freelancer', fl3, 'Yes, that''s easy to add. I''ll add an "Upcoming Events" card on the dashboard and a simple events list page. Won''t add to the timeline. Building v1 now.', NOW()-'7 days'::INTERVAL, NOW()-'7 days'::INTERVAL),
    (gen_random_uuid(), p32, 'client',     NULL, 'Amazing, thank you!', NOW()-'7 days'::INTERVAL, NOW()-'7 days'::INTERVAL),
    (gen_random_uuid(), p32, 'freelancer', fl3, 'Parent portal v1 is live on staging — link in the files tab. Includes the events section. Everything is mobile-responsive. Keen to hear what the parents think!', NULL, NOW()-'12 hours'::INTERVAL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6.8  portal_sessions  (active magic-link sessions)
-- ============================================================
-- Real tokens are random bytes; here we store fake SHA-256 hashes.
-- In production: encode(digest(random_token, 'sha256'), 'hex')

INSERT INTO public.portal_sessions (id, client_id, token_hash, expires_at, used_at, created_at) VALUES
    (gen_random_uuid(), c1,  encode(digest('seed-token-acme-corp-001',     'sha256'),'hex'), NOW()+INTERVAL '18 hours', NOW()-'6 hours'::INTERVAL,  NOW()-'6 hours'::INTERVAL),
    (gen_random_uuid(), c2,  encode(digest('seed-token-pixel-press-001',   'sha256'),'hex'), NOW()+INTERVAL '20 hours', NOW()-'4 hours'::INTERVAL,  NOW()-'4 hours'::INTERVAL),
    (gen_random_uuid(), c3,  encode(digest('seed-token-greenleaf-001',     'sha256'),'hex'), NOW()+INTERVAL '22 hours', NULL,                        NOW()-'2 hours'::INTERVAL),
    (gen_random_uuid(), c5,  encode(digest('seed-token-lumi-beauty-001',   'sha256'),'hex'), NOW()+INTERVAL '12 hours', NOW()-'1 hour'::INTERVAL,   NOW()-'5 hours'::INTERVAL),
    (gen_random_uuid(), c6,  encode(digest('seed-token-roast-room-001',    'sha256'),'hex'), NOW()+INTERVAL '6 hours',  NOW()-'30 minutes'::INTERVAL,NOW()-'3 hours'::INTERVAL),
    (gen_random_uuid(), c7,  encode(digest('seed-token-medsync-001',       'sha256'),'hex'), NOW()+INTERVAL '15 hours', NULL,                        NOW()-'9 hours'::INTERVAL),
    (gen_random_uuid(), c8,  encode(digest('seed-token-sparks-001',        'sha256'),'hex'), NOW()+INTERVAL '21 hours', NOW()-'20 minutes'::INTERVAL,NOW()-'1 hour'::INTERVAL),
    (gen_random_uuid(), c9,  encode(digest('seed-token-launchpad-001',     'sha256'),'hex'), NOW()+INTERVAL '10 hours', NOW()-'2 hours'::INTERVAL,  NOW()-'4 hours'::INTERVAL),
    (gen_random_uuid(), c10, encode(digest('seed-token-retro-brewing-001', 'sha256'),'hex'), NOW()+INTERVAL '5 hours',  NULL,                        NOW()-'1 hour'::INTERVAL),
    (gen_random_uuid(), c11, encode(digest('seed-token-atlas-001',         'sha256'),'hex'), NOW()+INTERVAL '16 hours', NOW()-'45 minutes'::INTERVAL,NOW()-'2 hours'::INTERVAL),
    (gen_random_uuid(), c12, encode(digest('seed-token-brightkids-001',    'sha256'),'hex'), NOW()+INTERVAL '8 hours',  NULL,                        NOW()-'30 minutes'::INTERVAL),
    -- Expired session (used for testing expiry logic)
    (gen_random_uuid(), c3,  encode(digest('seed-token-greenleaf-expired', 'sha256'),'hex'), NOW()-INTERVAL '1 hour',   NULL,                        NOW()-'25 hours'::INTERVAL)
ON CONFLICT DO NOTHING;

END $$;


-- =============================================================================
-- PART 7 — VERIFICATION QUERIES
-- Run these after the seed to confirm everything looks right.
-- =============================================================================

-- Count rows per table
SELECT 'auth.users'      AS tbl, COUNT(*) FROM auth.users      WHERE email LIKE '%studiowave%' OR email LIKE '%designsbysana%' OR email LIKE '%codedbyomar%'
UNION ALL
SELECT 'profiles',    COUNT(*) FROM public.profiles
UNION ALL
SELECT 'clients',     COUNT(*) FROM public.clients
UNION ALL
SELECT 'projects',    COUNT(*) FROM public.projects
UNION ALL
SELECT 'files',       COUNT(*) FROM public.files
UNION ALL
SELECT 'invoices',    COUNT(*) FROM public.invoices
UNION ALL
SELECT 'messages',    COUNT(*) FROM public.messages
UNION ALL
SELECT 'portal_sessions', COUNT(*) FROM public.portal_sessions;

-- Verify auth.users ↔ profiles join — every auth user must have a profile
SELECT
    u.email,
    p.full_name,
    p.business_name,
    p.plan,
    p.subscription_status
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email IN ('alex@studiowave.io','sana@designsbysana.com','dev@codedbyomar.com');

-- Sample: freelancer → clients → projects → files chain
SELECT
    pr.full_name        AS freelancer,
    c.name              AS client,
    pj.title            AS project,
    pj.status           AS project_status,
    COUNT(f.id)         AS file_count,
    SUM(CASE WHEN f.status = 'approved' THEN 1 ELSE 0 END) AS approved,
    SUM(CASE WHEN f.status = 'pending'  THEN 1 ELSE 0 END) AS pending
FROM public.profiles pr
JOIN public.clients  c  ON c.freelancer_id = pr.id
JOIN public.projects pj ON pj.client_id   = c.id
LEFT JOIN public.files f ON f.project_id  = pj.id AND f.deleted_at IS NULL
WHERE pj.deleted_at IS NULL AND c.deleted_at IS NULL
GROUP BY pr.full_name, c.name, pj.title, pj.status
ORDER BY pr.full_name, c.name, pj.title;

-- Outstanding invoice totals per freelancer
SELECT
    p.full_name                          AS freelancer,
    COUNT(i.id)                          AS total_invoices,
    SUM(CASE WHEN i.status = 'paid'    THEN i.total ELSE 0 END) AS total_paid,
    SUM(CASE WHEN i.status = 'sent'    THEN i.total ELSE 0 END) AS outstanding,
    SUM(CASE WHEN i.status = 'overdue' THEN i.total ELSE 0 END) AS overdue
FROM public.profiles p
LEFT JOIN public.invoices i ON i.freelancer_id = p.id AND i.deleted_at IS NULL
GROUP BY p.full_name
ORDER BY p.full_name;
