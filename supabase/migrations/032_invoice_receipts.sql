-- Invoice receipts uploaded by clients as proof of bank transfer payment
CREATE TABLE IF NOT EXISTS public.invoice_receipts (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id    UUID        NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  client_id     UUID        NOT NULL,
  freelancer_id UUID        NOT NULL,
  filename      TEXT        NOT NULL,
  storage_path  TEXT        NOT NULL,
  file_size     INTEGER     NOT NULL DEFAULT 0,
  mime_type     TEXT        NOT NULL DEFAULT 'application/octet-stream',
  uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoice_receipts ENABLE ROW LEVEL SECURITY;

-- Freelancers can view receipts for their own invoices
CREATE POLICY "freelancer_read_receipts"
  ON public.invoice_receipts FOR SELECT
  USING (freelancer_id = auth.uid());
