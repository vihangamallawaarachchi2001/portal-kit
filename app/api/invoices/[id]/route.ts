import { createClient } from '@/lib/supabase/server'
import { ok, noContent, unauthorized, notFound, badRequest, internalError, fromZodError } from '@/lib/api'
import { updateInvoiceSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(id, name, email, portal_slug)')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (error || !data) return notFound('Invoice not found')
  return ok(data)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: existing } = await supabase
    .from('invoices')
    .select('id, status')
    .eq('id', id)
    .eq('freelancer_id', user.id)
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
    .eq('freelancer_id', user.id)
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

  const { data: existing } = await supabase
    .from('invoices')
    .select('id, status')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!existing) return notFound('Invoice not found')
  if (existing.status === 'paid') return badRequest('Cannot delete a paid invoice')

  const { error } = await supabase
    .from('invoices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return internalError(error.message)
  return noContent()
}
