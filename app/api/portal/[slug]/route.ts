import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, notFound } from '@/lib/api'
import { cookies } from 'next/headers'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value

  if (!clientId) return unauthorized('No portal session. Please use the magic link sent to your email.')

  const service = createServiceClient()

  const { data: client, error } = await service
    .from('clients')
    .select(`
      id, name, email, portal_slug, status,
      profiles:freelancer_id (
        id, full_name, business_name, avatar_url, tagline, plan
      )
    `)
    .eq('portal_slug', slug)
    .eq('id', clientId)
    .is('deleted_at', null)
    .single()

  if (error || !client) return notFound('Portal not found')

  const { data: projects } = await service
    .from('projects')
    .select(`
      id, title, description, status, due_date, updated_at,
      files ( id, filename, file_size, mime_type, version, status, client_comment, reviewed_at, created_at ),
      messages ( id, sender_type, sender_id, content, read_at, created_at )
    `)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: invoices } = await service
    .from('invoices')
    .select('id, invoice_number, line_items, subtotal, tax_rate, tax_amount, total, currency, status, due_date, paid_at, notes')
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  return ok({ ...client, projects: projects ?? [], invoices: invoices ?? [] })
}
