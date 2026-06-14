-- Per-member, per-client and per-project data access grants
-- Controls which clients/projects a team member can see, and what sub-features
-- (files, invoices, messages, milestones) they can access within each.
--
-- Row with project_id IS NULL  → client-level grant (all projects in that client)
-- Row with project_id IS NOT NULL → project-level grant (that project only)
--
-- When team_invites.permissions->>'all_clients' = 'true' (default),
-- this table is ignored and the member sees everything.

CREATE TABLE IF NOT EXISTS public.team_data_grants (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_id         UUID        NOT NULL REFERENCES public.team_invites(id)  ON DELETE CASCADE,
  client_id         UUID        NOT NULL REFERENCES public.clients(id)        ON DELETE CASCADE,
  project_id        UUID                 REFERENCES public.projects(id)       ON DELETE CASCADE,
  can_view_files      BOOLEAN NOT NULL DEFAULT true,
  can_view_invoices   BOOLEAN NOT NULL DEFAULT true,
  can_view_messages   BOOLEAN NOT NULL DEFAULT true,
  can_view_milestones BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  -- (invite, client, NULL project) and (invite, client, specific project) are each unique
  UNIQUE NULLS NOT DISTINCT (invite_id, client_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_team_data_grants_invite  ON public.team_data_grants(invite_id);
CREATE INDEX IF NOT EXISTS idx_team_data_grants_client  ON public.team_data_grants(client_id);
CREATE INDEX IF NOT EXISTS idx_team_data_grants_project ON public.team_data_grants(project_id) WHERE project_id IS NOT NULL;

ALTER TABLE public.team_data_grants ENABLE ROW LEVEL SECURITY;
-- Accessed only via service role in lib/workspace.ts — no public policies needed.

-- Add all_clients flag to existing permissions column
-- Default true = member sees all clients (backward compatible)
UPDATE public.team_invites
  SET permissions = permissions || '{"all_clients":true}'::jsonb
  WHERE NOT (permissions ? 'all_clients');

ALTER TABLE public.team_invites
  ALTER COLUMN permissions SET DEFAULT
    '{"clients":true,"projects":true,"invoices":true,"files":true,"messages":true,"settings":false,"billing":false,"all_clients":true}';
