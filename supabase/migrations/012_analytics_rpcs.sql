-- =============================================================================
-- Migration 012 — Analytics SQL functions
-- Replaces in-JS aggregation in /api/analytics with SQL GROUP BY queries.
-- Each function returns SETOF a composite row type (no schema changes needed).
-- =============================================================================

-- ── Revenue per month ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_revenue_by_month(
  p_freelancer_id UUID,
  p_since         TIMESTAMPTZ
)
RETURNS TABLE(month TEXT, revenue NUMERIC)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('month', paid_at), 'YYYY-MM') AS month,
    COALESCE(SUM(total), 0)                          AS revenue
  FROM public.invoices
  WHERE freelancer_id = p_freelancer_id
    AND status = 'paid'
    AND paid_at IS NOT NULL
    AND paid_at >= p_since
    AND deleted_at IS NULL
  GROUP BY 1
  ORDER BY 1;
$$;

-- ── Invoice status breakdown ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_invoice_breakdown(p_freelancer_id UUID)
RETURNS TABLE(status TEXT, count BIGINT, total NUMERIC)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    status,
    COUNT(*)   AS count,
    COALESCE(SUM(total), 0) AS total
  FROM public.invoices
  WHERE freelancer_id = p_freelancer_id
    AND deleted_at IS NULL
  GROUP BY status;
$$;

-- ── New clients per month ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_clients_by_month(
  p_freelancer_id UUID,
  p_since         TIMESTAMPTZ
)
RETURNS TABLE(month TEXT, clients BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
    COUNT(*)                                            AS clients
  FROM public.clients
  WHERE freelancer_id = p_freelancer_id
    AND deleted_at IS NULL
    AND created_at >= p_since
  GROUP BY 1
  ORDER BY 1;
$$;

-- ── File review stats ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_file_stats(p_freelancer_id UUID)
RETURNS TABLE(status TEXT, count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status, COUNT(*) AS count
  FROM public.files
  WHERE freelancer_id = p_freelancer_id
    AND deleted_at IS NULL
    AND status IN ('approved', 'changes_requested')
  GROUP BY status;
$$;

-- ── Project status distribution ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.analytics_project_distribution(p_freelancer_id UUID)
RETURNS TABLE(status TEXT, count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status, COUNT(*) AS count
  FROM public.projects
  WHERE freelancer_id = p_freelancer_id
    AND deleted_at IS NULL
  GROUP BY status;
$$;
