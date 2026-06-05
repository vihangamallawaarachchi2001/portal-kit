import { createClient } from '@/lib/supabase/server'
import { ok, noContent, unauthorized, forbidden, notFound, badRequest, conflict, internalError, fromZodError } from '@/lib/api'
import { updateClientSchema } from '@/lib/validations'
import { ZodError } from 'zod'

async function getClientOrForbid(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, clientId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('freelancer_id', userId)
    .is('deleted_at', null)
    .single()

  if (error || !data) return null
  return data
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const client = await getClientOrForbid(supabase, user.id, id)
  if (!client) return notFound('Client not found')

  // Fetch with projects
  const { data, error } = await supabase
    .from('clients')
    .select(`*, projects ( *, files ( id, status ), messages ( id, sender_type, read_at ) )`)
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (error) return internalError(error.message)
  return ok(data)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const client = await getClientOrForbid(supabase, user.id, id)
  if (!client) return notFound('Client not found')

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = updateClientSchema.parse(body) } catch (e) { return fromZodError(e as ZodError) }

  // If slug changing, check uniqueness
  if (input.portal_slug && input.portal_slug !== client.portal_slug) {
    const { count } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('portal_slug', input.portal_slug)
      .neq('id', id)
      .is('deleted_at', null)

    if ((count ?? 0) > 0) return conflict('This portal slug is already taken.')
  }

  const { data, error } = await supabase
    .from('clients')
    .update({ ...input, updated_at: new Date().toISOString() })
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

  const client = await getClientOrForbid(supabase, user.id, id)
  if (!client) return notFound('Client not found')

  const { error } = await supabase
    .from('clients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('freelancer_id', user.id)

  if (error) return internalError(error.message)
  return noContent()
}
