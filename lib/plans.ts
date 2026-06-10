import type { Plan } from '@/types/database'

// ── Per-plan limits ───────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  free: {
    clients:           3,
    filesPerPortal:    10,
    storageMb:         500,
    invoicesPerMonth:  3,
    teamMembers:       0,
  },
  pro: {
    clients:           Infinity,
    filesPerPortal:    Infinity,
    storageGb:         5,
    invoicesPerMonth:  Infinity,
    teamMembers:       0,
  },
  business: {
    clients:           Infinity,
    filesPerPortal:    Infinity,
    storageGb:         20,
    invoicesPerMonth:  Infinity,
    teamMembers:       5,
  },
} as const satisfies Record<Plan, object>

// ── Per-plan feature flags ────────────────────────────────────────────────────

export const PLAN_FEATURES: Record<Plan, {
  stripePayments:      boolean
  pdfInvoices:         boolean
  multiCurrency:       boolean
  customDomain:        boolean
  removeBranding:      boolean
  teamMembers:         boolean
  advancedAnalytics:   boolean
  whiteLabel:          boolean
  clientPermissions:   boolean
}> = {
  free: {
    stripePayments:    false,
    pdfInvoices:       false,
    multiCurrency:     false,
    customDomain:      false,
    removeBranding:    false,
    teamMembers:       false,
    advancedAnalytics: false,
    whiteLabel:        false,
    clientPermissions: false,
  },
  pro: {
    stripePayments:    true,
    pdfInvoices:       true,
    multiCurrency:     true,
    customDomain:      true,
    removeBranding:    true,
    teamMembers:       false,
    advancedAnalytics: false,
    whiteLabel:        false,
    clientPermissions: false,
  },
  business: {
    stripePayments:    true,
    pdfInvoices:       true,
    multiCurrency:     true,
    customDomain:      true,
    removeBranding:    true,
    teamMembers:       true,
    advancedAnalytics: true,
    whiteLabel:        true,
    clientPermissions: true,
  },
}

// ── Helper ────────────────────────────────────────────────────────────────────

export function hasFeature(plan: Plan | string, feature: keyof typeof PLAN_FEATURES.free): boolean {
  const p = (plan ?? 'free') as Plan
  return PLAN_FEATURES[p]?.[feature] ?? false
}

export function getLimit<K extends keyof typeof PLAN_LIMITS.free>(
  plan: Plan | string,
  limit: K,
): (typeof PLAN_LIMITS.free)[K] {
  const p = (plan ?? 'free') as Plan
  return (PLAN_LIMITS[p] as typeof PLAN_LIMITS.free)[limit]
}
