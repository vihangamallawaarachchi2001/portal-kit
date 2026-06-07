-- Migration 017: One-time magic link tokens for admin panel auth.
-- Completely separate from Supabase user auth — the admin visits /admin,
-- enters their email, receives a link, clicks it, and gets a signed session cookie.

CREATE TABLE IF NOT EXISTS public.admin_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash  TEXT        NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_tokens ENABLE ROW LEVEL SECURITY;
-- No public policies — accessed exclusively via the service role key
