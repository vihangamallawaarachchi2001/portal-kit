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

  const now = new Date().toISOString()

  // Read session: must exist, not expired, and have fewer than 4 uses
  const { data: session } = await service
    .from('portal_sessions')
    .select('id, use_count, expires_at')
    .eq('token_hash', tokenHash)
    .eq('client_id', client.id)
    .maybeSingle()

  if (!session) return badRequest('Invalid or expired link')
  if (session.expires_at < now) return badRequest('This link has expired. Request a new one.')
  if (session.use_count >= 4) return badRequest('This link has been used too many times. Request a new one from your freelancer.')

  // Increment the use counter
  await service
    .from('portal_sessions')
    .update({ use_count: session.use_count + 1 })
    .eq('id', session.id)

  // Set portal session cookie — valid until the furthest project deadline, or 1 year if none
  const { data: projects } = await service
    .from('projects')
    .select('due_date')
    .eq('client_id', client.id)
    .is('deleted_at', null)
    .not('due_date', 'is', null)

  const nowMs = Date.now()
  const oneYearMs = 60 * 60 * 24 * 365
  let cookieMaxAge = oneYearMs

  if (projects && projects.length > 0) {
    const furthestDeadline = Math.max(
      ...projects.map(p => new Date(p.due_date!).getTime())
    )
    const secsUntilDeadline = Math.floor((furthestDeadline - nowMs) / 1000)
    if (secsUntilDeadline > 0) cookieMaxAge = secsUntilDeadline
  }

  const cookieStore = await cookies()
  cookieStore.set('portal_client_id', client.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: cookieMaxAge,
    path: '/',
  })

  return ok({ client_id: client.id })
}
