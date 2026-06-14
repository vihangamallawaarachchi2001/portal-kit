import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

const PROTECTED = ['/dashboard', '/onboarding', '/settings', '/projects', '/clients', '/invoices']
const AUTH_ONLY  = ['/auth']

// Paths accessible from a custom-domain portal
const PORTAL_PREFIXES = ['/p/', '/api/portal/', '/api/invoices/']
const APP_HOSTNAME = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').hostname }
  catch { return 'localhost' }
})()

function isCustomDomain(hostname: string) {
  return (
    hostname !== APP_HOSTNAME &&
    hostname !== 'localhost' &&
    hostname !== '127.0.0.1' &&
    !hostname.endsWith('.localhost')
  )
}

function isPortalPath(pathname: string) {
  return PORTAL_PREFIXES.some(p => pathname.startsWith(p))
}

async function handleCustomDomain(request: NextRequest): Promise<NextResponse> {
  const { hostname, pathname } = request.nextUrl

  // Non-portal path on a custom domain → redirect to main app
  if (!isPortalPath(pathname)) {
    return NextResponse.redirect(
      new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://portalkit.app')
    )
  }

  // Verify this hostname is a registered, verified custom domain
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Env not set — fail open to avoid blocking misconfigured deployments
    return NextResponse.next()
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles` +
      `?custom_domain=eq.${encodeURIComponent(hostname)}` +
      `&custom_domain_verified=eq.true&select=id&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Accept: 'application/json',
        },
      }
    )

    if (res.ok) {
      const rows: { id: string }[] = await res.json()
      if (rows.length > 0) return NextResponse.next()
    }
  } catch {
    // Fail open on transient DB/network errors
    return NextResponse.next()
  }

  // Domain is unknown or not yet verified
  return new NextResponse(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Portal not found</title>
    <style>body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f9ff;color:#0b1c30;}
    h2{font-size:1.25rem;font-weight:700;margin-bottom:.5rem;}p{font-size:.875rem;color:#45464d;}</style>
    </head><body><h2>Portal not found</h2>
    <p>This domain is not configured as a PortalKit portal.</p></body></html>`,
    { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

export async function proxy(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl

  // Custom domain: skip auth session, handle portal routing only
  if (isCustomDomain(hostname)) {
    return handleCustomDomain(request)
  }

  // App's own domain: run existing auth session logic
  const { response, claims } = await updateSession(request)
  const isAuthenticated = !!claims

  if (!isAuthenticated && PROTECTED.some(p => pathname.startsWith(p))) {
    const url = new URL('/auth', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

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
