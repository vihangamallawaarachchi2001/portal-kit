import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, badRequest, notFound, internalError } from '@/lib/api'

// POST — grant a free Pro/Business plan to a user for N months
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

  const { data: profile } = await service.from('profiles').select('id').eq('id', userId).single()
  if (!profile) return notFound('User not found')

  const expiresAt = new Date(Date.now() + months * 30 * 86400000).toISOString()

  // Step 1: Update plan — these columns always exist
  const { error: planErr } = await service
    .from('profiles')
    .update({ plan, subscription_status: 'active' })
    .eq('id', userId)
  if (planErr) return internalError(planErr.message)

  // Step 2: Update grant-tracking columns — requires migration 015.
  // Silently skips if the columns don't exist yet so the grant still works.
  const { error: grantErr } = await service
    .from('profiles')
    .update({ plan_grant_expires_at: expiresAt, plan_grant_note: note ?? null })
    .eq('id', userId)
  if (grantErr) {
    console.warn('[admin/grant] grant tracking unavailable (run migration 015):', grantErr.message)
  }

  return ok({ granted: true, plan, expiresAt, trackingEnabled: !grantErr })
}

// DELETE — revoke a grant, returning the user to free
export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const { userId } = body as { userId?: string }
  if (!userId) return badRequest('userId required')

  const service = createServiceClient()

  // Step 1: Revert plan — always works
  const { error: planErr } = await service
    .from('profiles')
    .update({ plan: 'free', subscription_status: 'inactive' })
    .eq('id', userId)
  if (planErr) return internalError(planErr.message)

  // Step 2: Clear grant-tracking columns — silently skip if not available
  await service
    .from('profiles')
    .update({ plan_grant_expires_at: null, plan_grant_note: null })
    .eq('id', userId)

  return ok({ revoked: true })
}
