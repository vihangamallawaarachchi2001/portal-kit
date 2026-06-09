-- Migration 019: milestones
CREATE TABLE public.milestones (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  freelancer_id UUID        NOT NULL REFERENCES public.profiles(id),
  title         TEXT        NOT NULL CHECK (char_length(title) <= 120),
  description   TEXT        CHECK (char_length(description) <= 500),
  due_date      DATE        NOT NULL,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_project    ON public.milestones(project_id);
CREATE INDEX idx_milestones_freelancer ON public.milestones(freelancer_id);
CREATE INDEX idx_milestones_due        ON public.milestones(due_date) WHERE completed_at IS NULL;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_milestones_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Freelancer owns and manages milestones
CREATE POLICY "milestones: freelancer full access"
  ON public.milestones FOR ALL
  USING  (freelancer_id = auth.uid())
  WITH CHECK (freelancer_id = auth.uid());

-- Client reads milestones on their projects via portal session
CREATE POLICY "milestones: client read"
  ON public.milestones FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE client_id = public.get_current_client_id()
        AND deleted_at IS NULL
    )
  );
