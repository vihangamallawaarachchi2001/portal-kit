import { createServiceClient } from '@/lib/supabase/service'
import { ok, badRequest } from '@/lib/api'
import { sendPortalMagicLink } from '@/lib/email'
import { randomBytes, createHash } from 'crypto'

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const { email } = body as { email?: string }
  if (!email || !email.includes('@')) return badRequest('Valid email required')

  const service = createServiceClient()

  // Look up client by portal slug + email (case-insensitive)
  const { data: client } = await service
    .from('clients')
    .select(`
      id, name, email, portal_slug,
      profiles:freelancer_id ( full_name, business_name )
    `)
    .eq('portal_slug', slug)
    .ilike('email', email.trim())
    .is('deleted_at', null)
    .single()

  // Always return success to avoid email enumeration
  if (!client) return ok({ sent: true })

  // Rate limit: max 3 magic links per client per hour to prevent Resend quota abuse
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await service
    .from('portal_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', client.id)
    .gte('created_at', oneHourAgo)
  if ((count ?? 0) >= 3) return ok({ sent: true })

  const profile = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles

  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { error } = await service.from('portal_sessions').insert({
    client_id: client.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  })

  if (error) {
    console.error('[request-access] insert session', error)
    return ok({ sent: true }) // silently succeed
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portalkit.app'
  const portalUrl = `${appUrl}/p/${slug}/access?token=${rawToken}`

  sendPortalMagicLink({
    to: client.email,
    clientName: client.name,
    freelancerName: profile?.full_name ?? 'Your freelancer',
    businessName: profile?.business_name || profile?.full_name || 'PortalKit',
    portalUrl,
  }).catch(err => console.error('[email] request-access', err))

  return ok({ sent: true })
}
