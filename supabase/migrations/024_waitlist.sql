CREATE TABLE public.waitlist (
  id                  UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  email               TEXT          UNIQUE NOT NULL,
  source              TEXT          NOT NULL DEFAULT 'direct',
  is_founding_member  BOOLEAN       NOT NULL DEFAULT true,
  converted_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
-- No public-facing RLS policies — accessed via service role only.
