-- Allow magic links to be used up to 4 times (30-day cookie means clients
-- only need to re-verify on a new device / cleared-cookie scenario).
ALTER TABLE public.portal_sessions
  ADD COLUMN IF NOT EXISTS use_count INTEGER NOT NULL DEFAULT 0;
