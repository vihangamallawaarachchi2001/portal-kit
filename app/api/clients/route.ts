import { createClient } from '@/lib/supabase/server'
import { ok, created, unauthorized, badRequest, conflict, paymentRequired, internalError, fromZodError } from '@/lib/api'
import { createClientSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, email, portal_slug, status, created_at, updated_at')
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (error) return internalError(error.message)
  return ok(data)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

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
      .eq('freelancer_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null)

    if ((count ?? 0) >= 1) {
      return paymentRequired('Free plan allows 1 active client portal. Upgrade to Pro for unlimited.', { code: 'client_limit', limit: 1, current: count })
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
    .insert({ ...input, freelancer_id: user.id })
    .select()
    .single()

  if (error) return internalError(error.message)
  return created(data)
}
