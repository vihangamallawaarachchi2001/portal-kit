-- Migration 021: Add stripe_onboarding_skipped flag to profiles
-- Tracks whether the user explicitly skipped Stripe Connect during onboarding
-- so we can surface a contextual nudge in the dashboard without nagging everyone.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_onboarding_skipped BOOLEAN NOT NULL DEFAULT FALSE;
