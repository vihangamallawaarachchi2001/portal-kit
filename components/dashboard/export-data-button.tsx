'use client'

import { useState } from 'react'
import { Download, Loader2, CheckCircle } from 'lucide-react'

export function ExportDataButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleExport() {
    if (state === 'loading') return
    setState('loading')

    try {
      const res = await fetch('/api/settings/export')
      if (!res.ok) throw new Error(`Export failed: ${res.status}`)

      const blob = await res.blob()
      const dateStr = new Date().toISOString().slice(0, 10)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `portalkit-export-${dateStr}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setState('done')
      setTimeout(() => setState('idle'), 4000)
    } catch (err) {
      console.error('[export]', err)
      setState('error')
      setTimeout(() => setState('idle'), 4000)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={state === 'loading'}
      className="flex items-center gap-2 h-9 px-4 rounded-lg border border-outline-variant text-sm font-semibold shrink-0 transition-colors disabled:opacity-60
        data-[state=done]:border-emerald-300 data-[state=done]:bg-emerald-50 data-[state=done]:text-emerald-700
        data-[state=error]:border-red-300 data-[state=error]:bg-red-50 data-[state=error]:text-red-700
        hover:bg-surface-container text-on-surface"
      data-state={state}
    >
      {state === 'loading' ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : state === 'done' ? (
        <CheckCircle className="size-3.5" />
      ) : (
        <Download className="size-3.5" />
      )}
      {state === 'loading' ? 'Exporting…' : state === 'done' ? 'Downloaded!' : state === 'error' ? 'Export failed' : 'Export data'}
    </button>
  )
}
