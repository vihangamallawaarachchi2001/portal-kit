import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

const PROTECTED = ['/dashboard', '/onboarding', '/settings', '/projects', '/clients', '/invoices']
const AUTH_ONLY  = ['/auth']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const { response, claims } = await updateSession(request)
  const isAuthenticated = !!claims

  // 1. Not authenticated → trying to access a protected route → send to /auth
  if (!isAuthenticated && PROTECTED.some(p => pathname.startsWith(p))) {
    const url = new URL('/auth', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // 2. Authenticated → visiting /auth → send to dashboard.
  //    The dashboard layout redirects to /onboarding when needed (DB check),
  //    so we never rely on the JWT onboarding_complete flag here. That flag
  //    can be stale between a Server Action updating user_metadata and the
  //    browser receiving a refreshed access token.
  if (isAuthenticated && AUTH_ONLY.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
