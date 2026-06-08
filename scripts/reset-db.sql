-- =============================================================================
-- scripts/reset-db.sql
--
-- Empties all PortalKit application tables.
-- Does NOT drop tables, schemas, or auth.users.
--
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================

-- TRUNCATE with CASCADE handles FK order automatically.
-- Sequences (serial PKs) are also reset; UUID PKs are unaffected.

TRUNCATE
  public.admin_tokens,
  public.team_invites,
  public.push_subscriptions,
  public.portal_sessions,
  public.messages,
  public.files,
  public.invoices,
  public.projects,
  public.clients,
  public.profiles
RESTART IDENTITY
CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- What this DOES:
--   • Deletes every row from every public application table
--   • Resets any auto-increment sequences to 1 (no UUID effect)
--
-- What this does NOT do:
--   • Does NOT drop tables or alter schema
--   • Does NOT delete auth.users (Supabase Auth)
--     → Clear test users via Dashboard → Authentication → Users
--   • Does NOT clear Storage bucket objects
--     → Clear via Dashboard → Storage → portalkit_bucket
-- ─────────────────────────────────────────────────────────────────────────────
