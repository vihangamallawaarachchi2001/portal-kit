-- Allow team members to read their workspace owner's profile.
-- Needed so plan-gated features in the UI use the owner's plan, not the member's.
-- team_owner_ids() is defined in migration 035.

DROP POLICY IF EXISTS "team_member_reads_owner_profile" ON public.profiles;
CREATE POLICY "team_member_reads_owner_profile"
  ON public.profiles FOR SELECT
  USING (id IN (SELECT public.team_owner_ids()));
