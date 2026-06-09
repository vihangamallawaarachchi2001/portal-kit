-- Migration 020: meetings
CREATE TABLE public.meetings (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID        REFERENCES public.projects(id) ON DELETE SET NULL,
  freelancer_id UUID        NOT NULL REFERENCES public.profiles(id),
  client_id     UUID        NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL CHECK (char_length(title) <= 150),
  description   TEXT        CHECK (char_length(description) <= 1000),
  scheduled_at  TIMESTAMPTZ NOT NULL,
  duration_mins INTEGER     NOT NULL DEFAULT 30 CHECK (duration_mins BETWEEN 15 AND 480),
  meet_link     TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN ('scheduled','completed','cancelled')),
  invite_sent_at  TIMESTAMPTZ,
  reminder_24h_at TIMESTAMPTZ,
  reminder_1h_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meetings_freelancer ON public.meetings(freelancer_id);
CREATE INDEX idx_meetings_client     ON public.meetings(client_id);
CREATE INDEX idx_meetings_scheduled  ON public.meetings(scheduled_at)
  WHERE status = 'scheduled';

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetings: freelancer full access"
  ON public.meetings FOR ALL
  USING  (freelancer_id = auth.uid())
  WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "meetings: client read"
  ON public.meetings FOR SELECT
  USING (client_id = public.get_current_client_id() AND status != 'cancelled');
