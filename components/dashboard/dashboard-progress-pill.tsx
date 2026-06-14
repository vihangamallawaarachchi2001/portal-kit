'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'portalkit_onboarding_dismissed'

interface Props {
  completedCount: number
  total: number
}

export function DashboardProgressPill({ completedCount, total }: Props) {
  // Default to hidden to avoid a flash on hydration
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(localStorage.getItem(STORAGE_KEY) !== '1')
  }, [])

  if (!show) return null

  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="flex-1 max-w-48 h-1.5 rounded-full bg-outline-variant/40 overflow-hidden">
        <div
          className="h-full rounded-full bg-ds-secondary transition-all"
          style={{ width: `${(completedCount / total) * 100}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-on-surface-variant shrink-0">
        {completedCount}/{total} setup complete
      </span>
    </div>
  )
}
