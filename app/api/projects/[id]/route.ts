import { createClient } from '@/lib/supabase/server'
import { ok, noContent, unauthorized, notFound, badRequest, internalError, fromZodError } from '@/lib/api'
import { updateProjectSchema } from '@/lib/validations'
import { sendStatusChangedEmail } from '@/lib/email'
import { ZodError } from 'zod'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      files ( * ),
      messages ( *, profiles:sender_id ( id, full_name, avatar_url ) ),
      invoices ( * ),
      clients ( id, name, email, portal_slug )
    `)
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (error || !data) return notFound('Project not found')
  return ok(data)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // Fetch existing to detect status change
  const { data: existing } = await supabase
    .from('projects')
    .select('id, status, client_id, title, clients(id, name, email, portal_slug)')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!existing) return notFound('Project not found')

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = updateProjectSchema.parse(body) } catch (e) { return fromZodError(e as ZodError) }

  const { data, error } = await supabase
    .from('projects')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .select()
    .single()

  if (error) return internalError(error.message)

  // Send email if status changed
  if (input.status && input.status !== existing.status) {
    const client = Array.isArray(existing.clients) ? existing.clients[0] : existing.clients
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', user.id)
      .single()

    if (client?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
      await sendStatusChangedEmail({
        to: client.email,
        clientName: client.name,
        freelancerName: profile?.full_name ?? '',
        businessName: profile?.business_name || profile?.full_name || '',
        projectTitle: existing.title,
        newStatus: input.status,
        portalUrl: `${appUrl}/p/${client.portal_slug}`,
      }).catch(() => {})
    }
  }

  return ok(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!existing) return notFound('Project not found')

  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return internalError(error.message)
  return noContent()
}
