import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { ok, badRequest, unauthorized } from '@/lib/api'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: invoiceId } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) return unauthorized('Not authenticated')

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Invalid request body')

  const { storage_path, filename, file_size, mime_type } = body
  if (!storage_path || !filename) return badRequest('storage_path and filename required')

  const service = createServiceClient()

  const { data: invoice } = await service
    .from('invoices')
    .select('id, freelancer_id, client_id')
    .eq('id', invoiceId)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .single()

  if (!invoice) return unauthorized('Invoice not found')

  const { data: receipt, error } = await service
    .from('invoice_receipts')
    .insert({
      invoice_id: invoiceId,
      client_id: clientId,
      freelancer_id: invoice.freelancer_id,
      filename,
      storage_path,
      file_size: file_size ?? 0,
      mime_type: mime_type ?? 'application/octet-stream',
    })
    .select('id, filename, file_size, mime_type, uploaded_at')
    .single()

  if (error) return badRequest('Failed to save receipt')

  return ok({ receipt })
}
