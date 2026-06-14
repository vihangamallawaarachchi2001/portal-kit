import { createClient } from '@/lib/supabase/server'
import { ok, created, unauthorized, badRequest, conflict, paymentRequired, internalError, fromZodError } from '@/lib/api'
import { createClientSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { getWorkspaceContext, allowedClientIds } from '@/lib/workspace'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  let query = supabase
    .from('clients')
    .select('id, name, email, portal_slug, status, created_at, updated_at')
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)

  const ids = allowedClientIds(ctx)
  if (ids !== null) query = query.in('id', ids)

  const { data, error } = await query
    .order('updated_at', { ascending: false })
    .limit(200)

  if (error) return internalError(error.message)
  return ok(data)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const { ownerId } = await getWorkspaceContext(user.id, user.email ?? '')

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = createClientSchema.parse(body) } catch (e) { return fromZodError(e as ZodError) }

  // Enforce free tier: 1 active client max
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'free') {
    const { count } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('freelancer_id', ownerId)
      .eq('status', 'active')
      .is('deleted_at', null)

    if ((count ?? 0) >= 3) {
      return paymentRequired('Free plan allows 3 active client portals. Upgrade to Pro for unlimited.', { code: 'client_limit', limit: 3, current: count })
    }
  }

  // Check slug uniqueness
  const { count: slugCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('portal_slug', input.portal_slug)
    .is('deleted_at', null)

  if ((slugCount ?? 0) > 0) return conflict('This portal slug is already taken.')

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...input, freelancer_id: ownerId })
    .select()
    .single()

  if (error) return internalError(error.message)
  return created(data)
}
