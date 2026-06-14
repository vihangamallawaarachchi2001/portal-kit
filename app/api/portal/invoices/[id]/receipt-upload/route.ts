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

  const { filename, mime_type, file_size } = body
  if (!filename || !mime_type) return badRequest('filename and mime_type required')

  const service = createServiceClient()

  const { data: invoice } = await service
    .from('invoices')
    .select('id, freelancer_id, client_id')
    .eq('id', invoiceId)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .single()

  if (!invoice) return unauthorized('Invoice not found')

  const ext = (filename as string).split('.').pop()?.toLowerCase() ?? 'bin'
  const storagePath = `receipts/${invoice.freelancer_id}/${clientId}/${invoiceId}/${Date.now()}-receipt.${ext}`

  const { data: signedUrl, error } = await service.storage
    .from('portalkit_bucket')
    .createSignedUploadUrl(storagePath)

  if (error || !signedUrl) return badRequest('Could not create upload URL')

  return ok({ signed_url: signedUrl.signedUrl, token: signedUrl.token, storage_path: storagePath })
}
