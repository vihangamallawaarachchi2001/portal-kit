import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

const PROTECTED = ['/dashboard', '/onboarding', '/settings', '/projects', '/clients', '/invoices']
const AUTH_ONLY = ['/auth']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const { response, claims } = await updateSession(request)
  const isAuthenticated = !!claims

  if (!isAuthenticated && PROTECTED.some(p => pathname.startsWith(p))) {
    const url = new URL('/auth', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthenticated && AUTH_ONLY.some(p => pathname.startsWith(p))) {
    const onboardingComplete = claims?.user_metadata?.onboarding_complete === true
    const destination = onboardingComplete ? '/dashboard' : '/onboarding'
    return NextResponse.redirect(new URL(destination, request.url))
  }
  // update user's auth session
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}