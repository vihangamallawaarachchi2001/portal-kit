export const PLAN_LIMITS = {
  free: {
    clients: 1,
    filesPerPortal: 3,
    storageMb: 500,
  },
  pro: {
    clients: Infinity,
    filesPerPortal: Infinity,
    storageGb: 5,
  },
  business: {
    clients: Infinity,
    filesPerPortal: Infinity,
    storageGb: 20,
  },
} as const

export type PlanId = keyof typeof PLAN_LIMITS
