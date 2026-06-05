import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { FolderOpen, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0

const STATUS_CONFIG = {
  briefing:    { label: 'Briefing',    class: 'bg-slate-100 text-slate-600',  bar: 'bg-slate-400',  dot: 'bg-slate-400'  },
  in_progress: { label: 'In Progress', class: 'bg-blue-50 text-blue-700',     bar: 'bg-blue-500',   dot: 'bg-blue-500'   },
  review:      { label: 'In Review',   class: 'bg-amber-50 text-amber-700',   bar: 'bg-amber-500',  dot: 'bg-amber-500'  },
  done:        { label: 'Done',        class: 'bg-green-50 text-green-700',   bar: 'bg-green-500',  dot: 'bg-green-500'  },
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: projects } = await supabase
    .from('projects')
    .select('*, clients ( id, name, portal_slug )')
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  const all = projects ?? []
  const active    = all.filter(p => p.status !== 'done')
  const completed = all.filter(p => p.status === 'done')

  return (
    <div className="w-full">
      {/* Page hero */}
      <div className="px-8 pt-8 pb-6 border-b border-outline-variant/50 bg-white">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Projects</p>
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">All Projects</h1>
            <p className="text-sm text-on-surface-variant mt-1">Track progress across all client workspaces.</p>
          </div>
          {all.length > 0 && (
            <div className="flex items-center gap-4 shrink-0">
              <Stat label="Active" value={active.length} color="text-ds-secondary" />
              <Stat label="Done" value={completed.length} color="text-green-600" />
              <Stat label="Total" value={all.length} color="text-on-surface" />
            </div>
          )}
        </div>
      </div>

      <div className="p-8 flex flex-col gap-6">
        {all.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-white rounded-2xl border border-outline-variant">
            <div className="size-14 rounded-2xl bg-surface-container flex items-center justify-center">
              <FolderOpen className="size-6 text-on-surface-variant" />
            </div>
            <div>
              <p className="text-base font-semibold text-on-surface">No projects yet</p>
              <p className="text-sm text-on-surface-variant mt-1 max-w-sm">
                Add a client first, then create projects from within their portal.
              </p>
            </div>
            <Link href="/dashboard/clients" className="h-9 px-5 rounded-xl bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors">
              Go to Clients
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {active.length > 0 && (
              <Section title="Active" count={active.length} projects={active} />
            )}
            {completed.length > 0 && (
              <Section title="Completed" count={completed.length} projects={completed} faded />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

type ProjectRow = {
  id: string; title: string; status: string; due_date: string | null;
  updated_at: string;
  clients: { id: string; name: string; portal_slug: string } | null
}

function Section({ title, count, projects, faded }: { title: string; count: number; projects: ProjectRow[]; faded?: boolean }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-on-surface">{title}</h2>
        <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className={cn('bg-white rounded-2xl border border-outline-variant overflow-hidden', faded && 'opacity-65')}>
        {/* Header row */}
        <div className="grid grid-cols-[1fr_180px_120px_100px] gap-4 px-5 py-3 border-b border-outline-variant bg-surface-container/50">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Project</p>
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Client</p>
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Due Date</p>
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Status</p>
        </div>
        <div className="divide-y divide-outline-variant/60">
          {projects.map(p => {
            const cfg = STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.briefing
            return (
              <Link
                key={p.id}
                href={p.clients ? `/dashboard/clients/${p.clients.id}` : '#'}
                className="grid grid-cols-[1fr_180px_120px_100px] gap-4 items-center px-5 py-3.5 hover:bg-surface-container/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn('size-2 rounded-full shrink-0', cfg.dot)} />
                  <p className="text-sm font-semibold text-on-surface truncate group-hover:text-ds-secondary transition-colors">{p.title}</p>
                </div>
                <p className="text-sm text-on-surface-variant truncate">{p.clients?.name ?? '—'}</p>
                <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                  {p.due_date ? (
                    <>
                      <Clock className="size-3.5 shrink-0" />
                      <span>{formatDate(p.due_date)}</span>
                    </>
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full', cfg.class)}>
                    {cfg.label}
                  </span>
                  <ArrowRight className="size-3.5 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className={cn('text-2xl font-extrabold', color)}>{value}</span>
      <span className="text-xs text-on-surface-variant">{label}</span>
    </div>
  )
}
