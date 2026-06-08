-- Migration 016: RPCs for admin resource monitoring.
-- These let the admin dashboard query actual Supabase database size and
-- storage bucket usage so you can track free-tier limits before they're hit.

-- Returns the raw database size in bytes (PostgreSQL internal stat)
CREATE OR REPLACE FUNCTION admin_db_size()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pg_database_size(current_database())::bigint;
$$;

-- Returns file count + total bytes stored in a given storage bucket.
-- Reads from storage.objects which the service role has access to.
CREATE OR REPLACE FUNCTION admin_storage_stats(bucket_name text DEFAULT 'portalkit_bucket')
RETURNS TABLE(file_count bigint, total_bytes bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::bigint                                                    AS file_count,
    COALESCE(SUM((metadata->>'size')::bigint), 0)::bigint              AS total_bytes
  FROM storage.objects
  WHERE bucket_id = bucket_name;
$$;

GRANT EXECUTE ON FUNCTION admin_db_size()              TO service_role;
GRANT EXECUTE ON FUNCTION admin_storage_stats(text)    TO service_role;
