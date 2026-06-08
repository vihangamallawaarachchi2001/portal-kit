-- =============================================================================
-- Migration 011 — Cleanup helpers and missing indexes
-- =============================================================================

-- ── Compound index for push_subscriptions queries ─────────────────────────────
-- sendPushToSubscriber always filters by (subscriber_type, subscriber_id).
-- Without this index every push notification is a full table scan.
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_subscriber
  ON public.push_subscriptions(subscriber_type, subscriber_id);

-- ── Hard-delete cleanup function ──────────────────────────────────────────────
-- Called weekly by /api/cron/cleanup. Purges rows soft-deleted more than 90
-- days ago so they stop bloating table scans and storage.
CREATE OR REPLACE FUNCTION public.hard_delete_old_soft_deleted()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff TIMESTAMPTZ := NOW() - INTERVAL '90 days';
  deleted_files    INT;
  deleted_messages INT;
  deleted_projects INT;
  deleted_clients  INT;
BEGIN
  DELETE FROM public.files    WHERE deleted_at < cutoff;
  GET DIAGNOSTICS deleted_files    = ROW_COUNT;

  DELETE FROM public.messages WHERE deleted_at < cutoff;
  GET DIAGNOSTICS deleted_messages = ROW_COUNT;

  DELETE FROM public.projects WHERE deleted_at < cutoff;
  GET DIAGNOSTICS deleted_projects = ROW_COUNT;

  DELETE FROM public.clients  WHERE deleted_at < cutoff;
  GET DIAGNOSTICS deleted_clients  = ROW_COUNT;

  RETURN jsonb_build_object(
    'files',    deleted_files,
    'messages', deleted_messages,
    'projects', deleted_projects,
    'clients',  deleted_clients
  );
END;
$$;

-- ── Expired portal_sessions cleanup function ──────────────────────────────────
-- Every magic link creates a row. Without cleanup this table grows unbounded.
CREATE OR REPLACE FUNCTION public.purge_expired_portal_sessions()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted INT;
BEGIN
  DELETE FROM public.portal_sessions
  WHERE expires_at < NOW() - INTERVAL '48 hours';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$;
