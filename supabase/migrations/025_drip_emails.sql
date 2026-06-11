-- Migration 025: Add drip email sequence tracking to profiles.
-- drip_step: how many drip emails have been sent (0 = none yet, 4 = complete).
-- drip_last_sent_at: when the most recent drip email was sent (NULL before first send).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS drip_step          INT          NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS drip_last_sent_at  TIMESTAMPTZ;
