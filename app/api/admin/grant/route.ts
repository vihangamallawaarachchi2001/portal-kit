import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, badRequest, notFound, internalError } from '@/lib/api'

// POST — grant a free Pro/Business plan to a user
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const { userId, plan, months, note } = body as {
    userId?: string; plan?: string; months?: number; note?: string | null
  }

  if (!userId) return badRequest('userId required')
  if (plan !== 'pro' && plan !== 'business') return badRequest('plan must be pro or business')
  if (!months || months < 1 || months > 24) return badRequest('months must be 1–24')

  const service = createServiceClient()

  // Confirm user exists
  const { data: profile } = await service
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()
  if (!profile) return notFound('User not found')

  const expiresAt = new Date(Date.now() + months * 30 * 86400000).toISOString()

  const { error } = await service
    .from('profiles')
    .update({
      plan,
      subscription_status: 'active',
      plan_grant_expires_at: expiresAt,
      plan_grant_note: note ?? null,
    })
    .eq('id', userId)

  if (error) return internalError(error.message)
  return ok({ granted: true, plan, expiresAt })
}

// DELETE — revoke a grant, reverting user to free
export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const { userId } = body as { userId?: string }
  if (!userId) return badRequest('userId required')

  const service = createServiceClient()

  const { error } = await service
    .from('profiles')
    .update({
      plan: 'free',
      subscription_status: 'inactive',
      plan_grant_expires_at: null,
      plan_grant_note: null,
    })
    .eq('id', userId)

  if (error) return internalError(error.message)
  return ok({ revoked: true })
}
