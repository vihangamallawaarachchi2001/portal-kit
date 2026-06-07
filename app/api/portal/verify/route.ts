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

  // Atomically mark the session as used — the WHERE conditions ensure we only
  // succeed if the token exists, is not yet used, and is not expired.
  // This eliminates the TOCTOU window where two concurrent requests could both
  // pass the used_at check before either updates the row.
  const usedAt = new Date().toISOString()
  const { data: session } = await service
    .from('portal_sessions')
    .update({ used_at: usedAt })
    .eq('token_hash', tokenHash)
    .eq('client_id', client.id)
    .is('used_at', null)
    .gt('expires_at', usedAt)
    .select('id')
    .maybeSingle()

  if (!session) {
    // Update matched nothing — do a read-only diagnostic to give a helpful message
    const { data: check } = await service
      .from('portal_sessions')
      .select('used_at, expires_at')
      .eq('token_hash', tokenHash)
      .eq('client_id', client.id)
      .maybeSingle()

    if (!check) return badRequest('Invalid or expired link')
    if (check.used_at) return badRequest('This link has already been used. Request a new one from your freelancer.')
    return badRequest('This link has expired. Request a new one.')
  }

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
