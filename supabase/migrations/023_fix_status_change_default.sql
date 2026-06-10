-- Fix notification_preferences: status_change was defaulting to false.
-- Change column default to include status_change: true.
ALTER TABLE public.profiles
  ALTER COLUMN notification_preferences
  SET DEFAULT '{"messages":true,"file_review":true,"invoice_paid":true,"status_change":true,"weekly_digest":false,"milestone_reminders":true,"milestone_client_notify":true,"meeting_reminders":true}';

-- Back-fill existing rows — set status_change to true for any row
-- where it is explicitly false or missing.
UPDATE public.profiles
SET notification_preferences = notification_preferences || '{"status_change":true}'::jsonb
WHERE (notification_preferences->>'status_change') IS NULL
   OR (notification_preferences->>'status_change') = 'false';
