import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarCheck, CheckCircle2, Clock, AlertCircle, ArrowLeft, FolderOpen } from 'lucide-react'
import { formatDate } from '@/lib/format'

export default async function PortalMilestonesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) redirect(`/p/${slug}/access`)

  const service = createServiceClient()

  const { data: clientFeatureCheck } = await service
    .from('clients')
    .select('portal_features')
    .eq('portal_slug', slug)
    .eq('id', clientId)
    .single()
  const features = clientFeatureCheck?.portal_features as Record<string, boolean> | null
  if (features && features.milestones === false) redirect(`/p/${slug}`)

  const { data: projects } = await service
    .from('projects')
    .select('id, title')
    .eq('client_id', clientId)
    .is('deleted_at', null)

  const projectIds = (projects ?? []).map(p => p.id)
  const projectMap = Object.fromEntries((projects ?? []).map(p => [p.id, p.title]))

  const { data: milestones } = projectIds.length > 0
    ? await service
        .from('milestones')
        .select('id,title,description,due_date,completed_at,project_id')
        .in('project_id', projectIds)
        .order('due_date', { ascending: true })
    : { data: [] }

  const today = new Date(); today.setHours(0, 0, 0, 0)

  const completed = (milestones ?? []).filter(m => !!m.completed_at)
  const upcoming = (milestones ?? []).filter(m => !m.completed_at)

  const totalCount = (milestones ?? []).length
  const completedCount = completed.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-6">

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-6" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Milestones</p>
              <h1 className="mt-1.5 text-2xl font-bold text-slate-900">Project milestones</h1>
              <p className="text-sm text-slate-600 mt-1">Track deadlines and completion status for every deliverable.</p>
            </div>
            <Link href={`/p/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors shrink-0">
              <ArrowLeft className="size-4" /> Overview
            </Link>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">{completedCount} of {totalCount} complete</span>
                <span className="text-xs font-bold text-emerald-700">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {(milestones ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 flex flex-col items-center text-center gap-4">
          <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <CalendarCheck className="size-7 text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">No milestones yet</p>
            <p className="text-sm text-slate-500 mt-1">Your freelancer can add milestones from the dashboard — they&apos;ll appear here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Upcoming milestones */}
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Upcoming</h2>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-5 bottom-5 w-px bg-slate-200" />
                <div className="space-y-3">
                  {upcoming.map((milestone) => {
                    const dueDate = new Date(milestone.due_date)
                    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    const isOverdue = diffDays < 0
                    const isDueToday = diffDays === 0
                    const isSoon = diffDays > 0 && diffDays <= 7

                    return (
                      <div key={milestone.id} className="relative flex gap-4">
                        {/* Timeline dot */}
                        <div className={`relative z-10 size-10 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white ${
                          isOverdue ? 'bg-red-100' : isDueToday ? 'bg-amber-100' : isSoon ? 'bg-orange-50' : 'bg-slate-100'
                        }`}>
                          {isOverdue
                            ? <AlertCircle className="size-4.5 text-red-500" />
                            : isDueToday
                            ? <Clock className="size-4.5 text-amber-500" />
                            : <CalendarCheck className="size-4.5 text-slate-400" />
                          }
                        </div>

                        {/* Card */}
                        <div className={`flex-1 rounded-2xl border p-5 shadow-sm transition-all ${
                          isOverdue
                            ? 'bg-red-50 border-red-200'
                            : isDueToday
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-slate-200'
                        }`}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-base leading-tight ${isOverdue ? 'text-red-900' : 'text-slate-900'}`}>
                                {milestone.title}
                              </p>
                              {milestone.description && (
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{milestone.description}</p>
                              )}
                            </div>

                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${
                              isOverdue
                                ? 'bg-red-100 text-red-700'
                                : isDueToday
                                ? 'bg-amber-100 text-amber-700'
                                : isSoon
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Clock className="size-3" />
                              {isOverdue
                                ? `${Math.abs(diffDays)}d overdue`
                                : isDueToday
                                ? 'Due today'
                                : diffDays === 1
                                ? 'Due tomorrow'
                                : `${diffDays} days`}
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <FolderOpen className="size-3.5" />
                              {projectMap[milestone.project_id] ?? 'Project'}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span>Due {formatDate(milestone.due_date)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Completed milestones */}
          {completed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Completed</h2>
              <div className="relative">
                <div className="absolute left-5 top-5 bottom-5 w-px bg-emerald-100" />
                <div className="space-y-3">
                  {completed.map((milestone) => (
                    <div key={milestone.id} className="relative flex gap-4">
                      <div className="relative z-10 size-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 ring-4 ring-white">
                        <CheckCircle2 className="size-4.5 text-emerald-600" />
                      </div>
                      <div className="flex-1 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-semibold text-slate-700 line-through decoration-emerald-300">
                            {milestone.title}
                          </p>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 shrink-0">
                            <CheckCircle2 className="size-3" />
                            Completed {formatDate(milestone.completed_at!)}
                          </span>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-slate-400 mt-1">{milestone.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                          <FolderOpen className="size-3.5" />
                          {projectMap[milestone.project_id] ?? 'Project'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
