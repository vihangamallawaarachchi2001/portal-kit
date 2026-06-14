-- Link accepted team members to their Supabase auth user
-- and store per-member permission scopes

ALTER TABLE public.team_invites
  ADD COLUMN IF NOT EXISTS accepted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT
    '{"clients":true,"projects":true,"invoices":true,"files":true,"messages":true,"settings":false,"billing":false}';

CREATE INDEX IF NOT EXISTS idx_team_invites_accepted_user_id
  ON public.team_invites(accepted_user_id)
  WHERE accepted_user_id IS NOT NULL;

-- Allow team members to read their own invite row (so getWorkspaceContext can resolve ownerId)
CREATE POLICY "member_reads_own_invite"
  ON public.team_invites FOR SELECT
  USING (accepted_user_id = auth.uid());

-- Service role already bypasses RLS for the accept + link writes
