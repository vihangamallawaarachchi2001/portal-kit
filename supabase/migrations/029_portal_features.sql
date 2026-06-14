-- Per-client feature toggles: freelancers can control which sections
-- are visible to clients in their portal.
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS portal_features JSONB NOT NULL DEFAULT
    '{"files":true,"invoices":true,"messages":true,"milestones":true,"meetings":true}';
