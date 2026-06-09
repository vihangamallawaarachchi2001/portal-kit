function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className ?? ''}`} />
}

export default function ClientDetailLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 rounded-2xl" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: 2 }).map((_, j) => (
              <Skeleton key={j} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
