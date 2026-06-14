-- Add portal_closed flag to clients
-- When true, clients see a "portal closed" screen instead of their portal content
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS portal_closed BOOLEAN NOT NULL DEFAULT false;
