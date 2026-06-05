import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('[auth/callback] provider error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorDescription ?? error)}`, origin)
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth?error=missing_code', origin))
  }

  const supabase = await createClient()
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.user) {
    console.error('[auth/callback] exchange failed:', exchangeError?.message)
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(exchangeError?.message ?? 'Sign-in failed')}`, origin)
    )
  }

  // Check whether onboarding has been completed (reliable DB check, not JWT timestamp)
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', data.user.id)
    .single()

  if (!profile?.onboarding_completed) {
    return NextResponse.redirect(new URL('/onboarding', origin))
  }

  // Sanitise `next` to prevent open-redirect attacks
  const destination = next.startsWith('/') ? next : '/dashboard'
  return NextResponse.redirect(new URL(destination, origin))
}
