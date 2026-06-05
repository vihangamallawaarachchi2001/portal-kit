-- Add project_id to invoices (column exists in schema definition but may be
-- missing from the live DB if the initial migration ran before it was added)
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_project
  ON public.invoices(project_id)
  WHERE deleted_at IS NULL AND project_id IS NOT NULL;
