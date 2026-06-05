import { createClient } from '@/lib/supabase/server'
import { ok, created, unauthorized, notFound, badRequest, internalError, fromZodError } from '@/lib/api'
import { createInvoiceSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!client) return notFound('Client not found')

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) return internalError(error.message)
  return ok(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!client) return notFound('Client not found')

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = createInvoiceSchema.parse({ ...body, client_id: id }) } catch (e) { return fromZodError(e as ZodError) }

  // Calculate totals
  const subtotal = input.line_items.reduce((s, item) => s + item.quantity * item.unit_price, 0)
  const tax_amount = subtotal * (input.tax_rate / 100)
  const total = subtotal + tax_amount

  // Generate invoice number
  const { data: numData } = await supabase.rpc('generate_invoice_number', { p_freelancer_id: user.id })
  const invoice_number = numData ?? 'INV-0001'

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      ...input,
      freelancer_id: user.id,
      invoice_number,
      subtotal,
      tax_amount,
      total,
    })
    .select()
    .single()

  if (error) return internalError(error.message)
  return created(data)
}
