import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, notFound, forbidden } from '@/lib/api'
import { getWorkspaceContext, canAccessSub } from '@/lib/workspace'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: invoiceId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  const service = createServiceClient()

  // Verify invoice belongs to this freelancer
  const { data: invoice } = await service
    .from('invoices')
    .select('id, client_id')
    .eq('id', invoiceId)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!invoice) return notFound('Invoice not found')

  if (!canAccessSub(ctx, 'canViewInvoices', invoice.client_id)) return forbidden()

  const { data: receipts } = await service
    .from('invoice_receipts')
    .select('id, filename, file_size, mime_type, storage_path, uploaded_at')
    .eq('invoice_id', invoiceId)
    .order('uploaded_at', { ascending: false })

  // Generate signed download URLs for each receipt
  const receiptsWithUrls = await Promise.all(
    (receipts ?? []).map(async r => {
      const { data } = await service.storage
        .from('portalkit_bucket')
        .createSignedUrl(r.storage_path, 3600)
      return { ...r, download_url: data?.signedUrl ?? null }
    })
  )

  return ok({ receipts: receiptsWithUrls })
}
