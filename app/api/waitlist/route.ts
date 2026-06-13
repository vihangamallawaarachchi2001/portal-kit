import { createServiceClient } from '@/lib/supabase/service'
import { ok, created, conflict, badRequest, internalError } from '@/lib/api'
import { sendWaitlistConfirmEmail } from '@/lib/email'

const FOUNDING_MEMBER_LIMIT = 20

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const { email, source = 'direct' } = body as { email?: string; source?: string }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest('Valid email is required')
  }

  const service = createServiceClient()

  const { count: currentCount } = await service
    .from('waitlist')
    .select('id', { count: 'exact', head: true })

  const spotsUsed = currentCount ?? 0
  const isFoundingMember = spotsUsed < FOUNDING_MEMBER_LIMIT

  const { error } = await service.from('waitlist').insert({
    email: email.toLowerCase().trim(),
    source,
    is_founding_member: isFoundingMember,
  })

  if (error) {
    if (error.code === '23505') return conflict('already_registered')
    return internalError('Failed to register email')
  }

  await sendWaitlistConfirmEmail({ to: email, isFoundingMember })

  const spotsRemaining = isFoundingMember
    ? Math.max(0, FOUNDING_MEMBER_LIMIT - spotsUsed - 1)
    : 0

  return created({ success: true, is_founding_member: isFoundingMember, spots_remaining: spotsRemaining })
}

export async function GET() {
  const service = createServiceClient()
  const { count } = await service
    .from('waitlist')
    .select('id', { count: 'exact', head: true })

  const spotsUsed = count ?? 0
  return ok({ spots_remaining: Math.max(0, FOUNDING_MEMBER_LIMIT - spotsUsed) })
}
