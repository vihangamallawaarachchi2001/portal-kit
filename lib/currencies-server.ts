import { unstable_cache } from 'next/cache'
import Stripe from 'stripe'
import { STRIPE_SUPPORTED_FALLBACK } from './currencies'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' })
}

// Fetches the union of all payment currencies Stripe supports across all countries.
// Cached for 24 hours — Stripe rarely changes this list.
export const getStripeSupportedCurrencies = unstable_cache(
  async (): Promise<string[]> => {
    const specs = await getStripe().countrySpecs.list({ limit: 100 })
    const codes = new Set<string>()
    for (const spec of specs.data) {
      spec.supported_payment_currencies.forEach(c => codes.add(c.toUpperCase()))
    }
    return [...codes]
  },
  ['stripe-supported-currencies'],
  { revalidate: 86400 },
)

export async function isStripeSupportedServer(currency: string): Promise<boolean> {
  try {
    const currencies = await getStripeSupportedCurrencies()
    return currencies.includes(currency.toUpperCase())
  } catch {
    return STRIPE_SUPPORTED_FALLBACK.has(currency.toUpperCase())
  }
}
