-- Allow team members to read their workspace owner's data via RLS.
-- Application layer still enforces per-client/project grants on top of this.

-- Helper: returns the set of owner_ids this user is a member of
CREATE OR REPLACE FUNCTION public.team_owner_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT owner_id FROM public.team_invites
  WHERE accepted_user_id = auth.uid()
    AND status = 'accepted'
$$;

-- clients
DROP POLICY IF EXISTS "team_member_reads_clients" ON public.clients;
CREATE POLICY "team_member_reads_clients"
  ON public.clients FOR SELECT
  USING (freelancer_id IN (SELECT public.team_owner_ids()));

-- projects
DROP POLICY IF EXISTS "team_member_reads_projects" ON public.projects;
CREATE POLICY "team_member_reads_projects"
  ON public.projects FOR SELECT
  USING (freelancer_id IN (SELECT public.team_owner_ids()));

-- files
DROP POLICY IF EXISTS "team_member_reads_files" ON public.files;
CREATE POLICY "team_member_reads_files"
  ON public.files FOR SELECT
  USING (freelancer_id IN (SELECT public.team_owner_ids()));

-- invoices
DROP POLICY IF EXISTS "team_member_reads_invoices" ON public.invoices;
CREATE POLICY "team_member_reads_invoices"
  ON public.invoices FOR SELECT
  USING (freelancer_id IN (SELECT public.team_owner_ids()));

-- messages
DROP POLICY IF EXISTS "team_member_reads_messages" ON public.messages;
CREATE POLICY "team_member_reads_messages"
  ON public.messages FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE freelancer_id IN (SELECT public.team_owner_ids())
    )
  );

-- milestones
DROP POLICY IF EXISTS "team_member_reads_milestones" ON public.milestones;
CREATE POLICY "team_member_reads_milestones"
  ON public.milestones FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE freelancer_id IN (SELECT public.team_owner_ids())
    )
  );

-- meetings
DROP POLICY IF EXISTS "team_member_reads_meetings" ON public.meetings;
CREATE POLICY "team_member_reads_meetings"
  ON public.meetings FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE freelancer_id IN (SELECT public.team_owner_ids())
    )
  );
