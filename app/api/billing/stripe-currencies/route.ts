import { ok, internalError } from '@/lib/api'
import { getStripeSupportedCurrencies } from '@/lib/currencies-server'
import { STRIPE_SUPPORTED_FALLBACK } from '@/lib/currencies'

export async function GET() {
  try {
    const currencies = await getStripeSupportedCurrencies()
    return ok({ currencies })
  } catch {
    // STRIPE_SECRET_KEY not set or API unreachable — return static fallback
    return ok({ currencies: [...STRIPE_SUPPORTED_FALLBACK], fallback: true })
  }
}
