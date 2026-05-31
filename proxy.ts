import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

const PROTECTED = ['/dashboard', '/onboarding', '/settings', '/projects', '/clients', '/invoices']
const AUTH_ONLY  = ['/auth']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const { response, claims } = await updateSession(request)
  const isAuthenticated = !!claims
  const onboardingComplete = claims?.user_metadata?.onboarding_complete === true

  // 1. Not authenticated → trying to access a protected route → send to /auth
  if (!isAuthenticated && PROTECTED.some(p => pathname.startsWith(p))) {
    const url = new URL('/auth', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // 2. Authenticated → visiting /auth → redirect based on onboarding status
  if (isAuthenticated && AUTH_ONLY.some(p => pathname.startsWith(p))) {
    const destination = onboardingComplete ? '/dashboard' : '/onboarding'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // 3. Authenticated + onboarding incomplete → trying any protected route except /onboarding
  //    Redirect to /onboarding so they finish it before accessing the app
  if (isAuthenticated && !onboardingComplete && !pathname.startsWith('/onboarding') && PROTECTED.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // 4. Authenticated + onboarding already complete → visiting /onboarding again
  //    No reason to re-onboard — send to dashboard
  if (isAuthenticated && onboardingComplete && pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
