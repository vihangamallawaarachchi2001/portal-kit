import { createServiceClient } from '@/lib/supabase/service'
import { ok, badRequest, notFound } from '@/lib/api'
import { createHash } from 'crypto'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const { token, slug } = body as { token?: string; slug?: string }
  if (!token || !slug) return badRequest('token and slug are required')

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const service = createServiceClient()

  // Look up client by slug
  const { data: client } = await service
    .from('clients')
    .select('id')
    .eq('portal_slug', slug)
    .is('deleted_at', null)
    .single()

  if (!client) return notFound('Portal not found')

  // Validate session token
  const { data: session } = await service
    .from('portal_sessions')
    .select('id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .eq('client_id', client.id)
    .single()

  if (!session) return badRequest('Invalid or expired link')
  if (session.used_at) return badRequest('This link has already been used. Request a new one from your freelancer.')
  if (new Date(session.expires_at) < new Date()) return badRequest('This link has expired. Request a new one.')

  // Mark used
  await service
    .from('portal_sessions')
    .update({ used_at: new Date().toISOString() })
    .eq('id', session.id)

  // Set portal session cookie (httpOnly, 30 days)
  const cookieStore = await cookies()
  cookieStore.set('portal_client_id', client.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return ok({ client_id: client.id })
}
