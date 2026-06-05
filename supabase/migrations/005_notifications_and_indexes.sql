-- ══════════════════════════════════════════════════════════════════
-- Migration 005 — Additional indexes, helper functions, and cleanup
-- ══════════════════════════════════════════════════════════════════

-- Ensure tagline column exists (idempotent with 004)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tagline TEXT;

-- ── Overdue invoice auto-update function ─────────────────────────
-- Called on-read by API instead of a scheduled job (simpler for MVP)
CREATE OR REPLACE FUNCTION public.mark_overdue_invoices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invoices
  SET status = 'overdue'
  WHERE status = 'sent'
    AND due_date < CURRENT_DATE
    AND deleted_at IS NULL;
END;
$$;

-- ── Index: portal slug lookup for public portal pages ─────────────
CREATE INDEX IF NOT EXISTS idx_clients_portal_slug
  ON public.clients(portal_slug)
  WHERE deleted_at IS NULL;

-- ── RLS policy: allow freelancer to read their own auth email ─────
-- (useful for weekly digest — service role already bypasses RLS)

-- ── Allow authenticated users to read profile by id for avatar display
CREATE POLICY IF NOT EXISTS "profiles: any authenticated user can read avatars"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
