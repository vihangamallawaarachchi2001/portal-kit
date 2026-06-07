import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { hashAdminToken, createSessionValue, ADMIN_COOKIE, SESSION_MAX_AGE } from '@/lib/admin-auth'

export async function GET(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const fail   = (reason: string) => NextResponse.redirect(`${appUrl}/admin?error=${reason}`)

  const token = new URL(req.url).searchParams.get('token')
  if (!token) return fail('missing_token')

  const service = createServiceClient()
  const now     = new Date().toISOString()

  // Atomic update: mark token used only if it exists, is unused, and not expired.
  // Same TOCTOU-safe pattern used for portal magic links.
  const { data, error } = await service
    .from('admin_tokens')
    .update({ used_at: now })
    .eq('token_hash', hashAdminToken(token))
    .is('used_at', null)
    .gt('expires_at', now)
    .select('id')
    .maybeSingle()

  if (error || !data) return fail('invalid_or_expired')

  // Set signed httpOnly session cookie valid for SESSION_MAX_AGE seconds
  const res = NextResponse.redirect(`${appUrl}/admin`)
  res.cookies.set(ADMIN_COOKIE, createSessionValue(process.env.ADMIN_EMAIL!), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/',
    maxAge:   SESSION_MAX_AGE,
  })
  return res
}
