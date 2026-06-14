import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, badRequest, notFound, forbidden } from '@/lib/api'
import { getWorkspaceContext, canAccessSub } from '@/lib/workspace'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, status, client_id')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!invoice) return notFound('Invoice not found')

  if (!canAccessSub(ctx, 'canViewInvoices', invoice.client_id)) return forbidden()

  if (invoice.status === 'paid') return badRequest('Invoice is already paid')
  if (invoice.status === 'draft') return badRequest('Cannot mark a draft as paid')

  const { error } = await supabase
    .from('invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id)
    .eq('freelancer_id', ownerId)

  if (error) return badRequest('Failed to update invoice')

  return ok({ success: true })
}
