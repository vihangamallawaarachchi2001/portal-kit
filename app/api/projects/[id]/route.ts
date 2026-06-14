import { createClient } from '@/lib/supabase/server'
import { ok, noContent, unauthorized, notFound, badRequest, internalError, fromZodError } from '@/lib/api'
import { updateProjectSchema } from '@/lib/validations'
import { sendStatusChangedEmail } from '@/lib/email'
import { ZodError } from 'zod'
import { getWorkspaceContext, allowedClientIds, allowedProjectIds } from '@/lib/workspace'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

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
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (error || !data) return notFound('Project not found')

  const clientIds = allowedClientIds(ctx)
  if (clientIds !== null && data.client_id && !clientIds.includes(data.client_id)) return notFound()
  const projectIds = allowedProjectIds(ctx, data.client_id)
  if (projectIds !== null && !projectIds.includes(data.id)) return notFound()

  return ok(data)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  // Fetch existing to detect status change
  const { data: existing } = await supabase
    .from('projects')
    .select('id, status, client_id, title, clients(id, name, email, portal_slug)')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!existing) return notFound('Project not found')

  const clientIds = allowedClientIds(ctx)
  if (clientIds !== null && existing.client_id && !clientIds.includes(existing.client_id)) return notFound()
  const projectIds = allowedProjectIds(ctx, existing.client_id)
  if (projectIds !== null && !projectIds.includes(existing.id)) return notFound()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = updateProjectSchema.parse(body) } catch (e) { return fromZodError(e as ZodError) }

  const { data, error } = await supabase
    .from('projects')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .select()
    .single()

  if (error) return internalError(error.message)

  // Send email if status changed
  if (input.status && input.status !== existing.status) {
    const client = Array.isArray(existing.clients) ? (existing.clients[0] ?? null) : existing.clients
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, business_name, plan, hide_branding')
      .eq('id', user.id)
      .single()

    const hideBranding = profile?.plan !== 'free' && (profile?.hide_branding ?? false)
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
        hideBranding,
      }).catch((err) => console.error('[email] status-changed notification failed', err))
    }
  }

  return ok(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  const { data: existing } = await supabase
    .from('projects')
    .select('id, client_id')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!existing) return notFound('Project not found')

  const clientIds = allowedClientIds(ctx)
  if (clientIds !== null && existing.client_id && !clientIds.includes(existing.client_id)) return notFound()
  const projectIds = allowedProjectIds(ctx, existing.client_id)
  if (projectIds !== null && !projectIds.includes(existing.id)) return notFound()

  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('freelancer_id', ownerId)

  if (error) return internalError(error.message)
  return noContent()
}
