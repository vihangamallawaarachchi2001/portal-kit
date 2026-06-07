import { createClient } from '@/lib/supabase/server'
import { ok, noContent, unauthorized, paymentRequired, badRequest, internalError } from '@/lib/api'
import { z } from 'zod'

const patchSchema = z.object({
  custom_domain: z.string().min(3).max(253).regex(
    /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i,
    'Must be a valid domain like portal.yourdomain.com',
  ).nullable(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data } = await supabase
    .from('profiles')
    .select('custom_domain, custom_domain_verified, plan')
    .eq('id', user.id)
    .single()

  return ok({
    custom_domain:          data?.custom_domain ?? null,
    custom_domain_verified: data?.custom_domain_verified ?? false,
    plan:                   data?.plan ?? 'free',
  })
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'free') {
    return paymentRequired(
      'Custom domains are available on Pro and Business plans.',
      { code: 'domain_gating' },
    )
  }

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return badRequest('Invalid domain', parsed.error.flatten().fieldErrors)

  const { custom_domain } = parsed.data

  const { error } = await supabase
    .from('profiles')
    .update({ custom_domain, custom_domain_verified: false })
    .eq('id', user.id)

  if (error) return internalError(error.message)
  return ok({ custom_domain, custom_domain_verified: false })
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { error } = await supabase
    .from('profiles')
    .update({ custom_domain: null, custom_domain_verified: false })
    .eq('id', user.id)

  if (error) return internalError(error.message)
  return noContent()
}
