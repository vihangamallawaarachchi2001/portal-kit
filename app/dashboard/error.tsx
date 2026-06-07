'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#f4f6fa' }}>
      <div className="flex flex-col items-center text-center gap-5 max-w-sm">
        <div className="size-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertTriangle className="size-7 text-red-500" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">Something went wrong</p>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            This page encountered an unexpected error. Try refreshing, or go back to the dashboard.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mt-2 font-mono">Error ID: {error.digest}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="size-3.5" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LayoutDashboard className="size-3.5" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
