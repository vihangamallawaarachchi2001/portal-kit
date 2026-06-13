import { createClient } from '@/lib/supabase/server'
import { ok, noContent, unauthorized, paymentRequired, badRequest, internalError } from '@/lib/api'
import { z } from 'zod'

const patchSchema = z.object({
  custom_domain: z.string().min(3).max(253).regex(
    /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i,
    'Must be a valid domain like portal.yourdomain.com',
  ).nullable().optional(),
  hide_branding: z.boolean().optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data } = await supabase
    .from('profiles')
    .select('custom_domain, custom_domain_verified, hide_branding, plan')
    .eq('id', user.id)
    .single()

  return ok({
    custom_domain:          data?.custom_domain ?? null,
    custom_domain_verified: data?.custom_domain_verified ?? false,
    hide_branding:          data?.hide_branding ?? false,
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

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return badRequest('Invalid input', parsed.error.flatten().fieldErrors)

  const { custom_domain, hide_branding } = parsed.data
  const updates: Record<string, unknown> = {}

  // Custom domain — Pro+ only
  if (custom_domain !== undefined) {
    if (profile?.plan === 'free') {
      return paymentRequired(
        'Custom domains are available on Pro and Business plans.',
        { code: 'domain_gating' },
      )
    }
    updates.custom_domain          = custom_domain
    updates.custom_domain_verified = false
  }

  // Remove branding — Pro+ feature (Free plan only restriction)
  if (hide_branding !== undefined) {
    if (profile?.plan === 'free') {
      return paymentRequired(
        'Removing PortalKit branding is available on Pro and above.',
        { code: 'remove_branding' },
      )
    }
    updates.hide_branding = hide_branding
  }

  if (Object.keys(updates).length === 0) return badRequest('No valid fields to update')

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return internalError(error.message)
  return ok(updates)
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
