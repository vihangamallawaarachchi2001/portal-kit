import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, badRequest, internalError } from '@/lib/api'
import dns from 'dns/promises'

// The target CNAME value that custom domains should point to.
// In production this would be the PortalKit portal edge hostname.
const CNAME_TARGET = process.env.PORTAL_CNAME_TARGET ?? (
  process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
    : 'portals.portalkit.io'
)

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: profile } = await supabase
    .from('profiles')
    .select('custom_domain')
    .eq('id', user.id)
    .single()

  if (!profile?.custom_domain) return badRequest('No custom domain set')

  let verified = false
  try {
    const records = await dns.resolveCname(profile.custom_domain)
    verified = records.some(r => r.toLowerCase().includes(CNAME_TARGET.toLowerCase()))
  } catch {
    // DNS lookup failed — domain not configured yet
    verified = false
  }

  if (verified) {
    await supabase
      .from('profiles')
      .update({ custom_domain_verified: true })
      .eq('id', user.id)
  }

  return ok({ verified, cname_target: CNAME_TARGET })
}
