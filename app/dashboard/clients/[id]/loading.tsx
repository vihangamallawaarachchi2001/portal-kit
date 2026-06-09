import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/95 px-6 py-5 shadow-2xl border border-slate-200">
        <Loader2 className="h-7 w-7 animate-spin text-ds-secondary" />
        <p className="text-sm font-medium text-on-surface">Loading client details…</p>
      </div>
    </div>
  )
}
