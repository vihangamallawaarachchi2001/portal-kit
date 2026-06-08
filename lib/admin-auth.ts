import { createHmac, randomBytes, createHash } from 'crypto'

export const ADMIN_COOKIE      = '__admin_session'
export const SESSION_MAX_AGE   = 8 * 3600          // 8 hours in seconds

// ── Token helpers ─────────────────────────────────────────────────────────────

export function generateAdminToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashAdminToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// ── Session cookie helpers ────────────────────────────────────────────────────

function cookieSecret(): string {
  return process.env.ADMIN_TOKEN_SECRET ?? process.env.CRON_SECRET ?? 'insecure-fallback'
}

export function createSessionValue(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, iat: Date.now() })).toString('base64url')
  const sig = createHmac('sha256', cookieSecret()).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifySessionValue(value: string): boolean {
  try {
    const dot = value.lastIndexOf('.')
    if (dot === -1) return false
    const payload = value.slice(0, dot)
    const sig     = value.slice(dot + 1)
    const expected = createHmac('sha256', cookieSecret()).update(payload).digest('hex')
    if (sig !== expected) return false
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email: string; iat: number
    }
    if (Date.now() - data.iat > SESSION_MAX_AGE * 1000) return false
    if (data.email?.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) return false
    return true
  } catch {
    return false
  }
}

export function getEmailFromSession(value: string): string | null {
  try {
    const dot = value.lastIndexOf('.')
    if (dot === -1) return null
    const data = JSON.parse(Buffer.from(value.slice(0, dot), 'base64url').toString('utf8')) as {
      email: string
    }
    return data.email ?? null
  } catch {
    return null
  }
}
