import { createClient } from '@/lib/supabase/server'
import { ok, noContent, unauthorized, notFound, badRequest, internalError, forbidden, fromZodError } from '@/lib/api'
import { updateInvoiceSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { getWorkspaceContext, allowedClientIds, canAccessSub } from '@/lib/workspace'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  // Fetch the invoice scoped to this workspace (freelancer_id = ownerId)
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, clients(id, name, email, portal_slug)')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (error || !invoice) return notFound('Invoice not found')

  // If the invoice is linked to a client, enforce sub-member access controls.
  // Invoices without a client_id are owner-level records — no grant check needed.
  if (invoice.client_id) {
    const allowed = allowedClientIds(ctx)
    if (allowed !== null && !allowed.includes(invoice.client_id)) {
      return forbidden('Access denied')
    }
    if (!canAccessSub(ctx, 'canViewInvoices', invoice.client_id)) {
      return forbidden('Access denied')
    }
  }

  return ok(invoice)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const { ownerId } = await getWorkspaceContext(user.id, user.email ?? '')

  const { data: existing } = await supabase
    .from('invoices')
    .select('id, status')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!existing) return notFound('Invoice not found')
  if (existing.status === 'paid') return badRequest('Cannot edit a paid invoice')

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = updateInvoiceSchema.parse(body) } catch (e) { return fromZodError(e as ZodError) }

  // Recalculate if line items provided
  let updates: Record<string, unknown> = { ...input, updated_at: new Date().toISOString() }
  if (input.line_items) {
    const subtotal = input.line_items.reduce((s, item) => s + item.quantity * item.unit_price, 0)
    const taxRate = input.tax_rate ?? 0
    const tax_amount = subtotal * (taxRate / 100)
    updates = { ...updates, subtotal, tax_amount, total: subtotal + tax_amount }
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .select()
    .single()

  if (error) return internalError(error.message)
  return ok(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const { ownerId } = await getWorkspaceContext(user.id, user.email ?? '')

  const { data: existing } = await supabase
    .from('invoices')
    .select('id, status')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!existing) return notFound('Invoice not found')
  if (existing.status === 'paid') return badRequest('Cannot delete a paid invoice')

  const { error } = await supabase
    .from('invoices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('freelancer_id', ownerId)

  if (error) return internalError(error.message)
  return noContent()
}
