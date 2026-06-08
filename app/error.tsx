'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global error]', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
          <div className="flex flex-col items-center text-center gap-5 max-w-sm">
            <div className="size-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="size-7 text-red-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">Something went wrong</p>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                An unexpected error occurred. If this keeps happening, please contact support.
              </p>
              {error.digest && (
                <p className="text-xs text-gray-400 mt-2 font-mono">Error ID: {error.digest}</p>
              )}
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="size-3.5" />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
