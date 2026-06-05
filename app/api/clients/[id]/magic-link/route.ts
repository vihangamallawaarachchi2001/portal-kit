import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, notFound, internalError } from '@/lib/api'
import { sendPortalMagicLink } from '@/lib/email'
import { randomBytes, createHash } from 'crypto'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // Verify ownership
  const { data: client } = await supabase
    .from('clients')
    .select('id, name, email, portal_slug, freelancer_id')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!client) return notFound('Client not found')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, business_name')
    .eq('id', user.id)
    .single()

  // Generate a random token + hash it for storage
  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const service = createServiceClient()
  const { error } = await service.from('portal_sessions').insert({
    client_id: client.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  })

  if (error) return internalError(error.message)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portalkit.app'
  const portalUrl = `${appUrl}/p/${client.portal_slug}?token=${rawToken}`

  sendPortalMagicLink({
    to: client.email,
    clientName: client.name,
    freelancerName: profile?.full_name ?? 'Your freelancer',
    businessName: profile?.business_name || profile?.full_name || 'PortalKit',
    portalUrl,
  }).catch(err => console.error('[email] magic-link', err))

  return ok({ sent: true, portalUrl })
}
