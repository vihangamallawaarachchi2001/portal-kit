-- White-label branding removal (Business plan)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hide_branding BOOLEAN NOT NULL DEFAULT FALSE;
