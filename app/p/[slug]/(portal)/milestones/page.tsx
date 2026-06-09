import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarCheck, CalendarDays, CheckCircle2, Clock, FolderOpen } from 'lucide-react'
import { formatDate } from '@/lib/format'

export default async function PortalMilestonesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) redirect(`/p/${slug}/access`)

  const service = createServiceClient()

  // Milestones belong to projects (no direct client_id); get project IDs first
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

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Milestones</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Project milestones</h1>
            <p className="text-sm text-slate-600 mt-1">Review the next deadlines and completion status for your project milestones.</p>
          </div>
          <Link href={`/p/${slug}`} className="text-sm font-semibold text-ds-secondary hover:underline">Back to overview</Link>
        </div>
      </div>

      {milestones && milestones.length > 0 ? (
        <div className="grid gap-4">
          {milestones.map((milestone) => {
            const isCompleted = !!milestone.completed_at
            const today = new Date(); today.setHours(0, 0, 0, 0)
            const dueDate = new Date(milestone.due_date)
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            const isOverdue = !isCompleted && diffDays < 0
            return (
              <div key={milestone.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{milestone.title}</p>
                    {milestone.description && <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>}
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold shadow-sm ${
                    isCompleted ? 'bg-emerald-50 text-emerald-700' : isOverdue ? 'bg-red-50 text-red-700' : 'bg-white text-slate-700'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="size-4 text-emerald-500" /> : <CalendarCheck className="size-4" />}
                    {isCompleted ? `Completed ${formatDate(milestone.completed_at!)}` : isOverdue ? 'Overdue' : `Due ${formatDate(milestone.due_date)}`}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 border border-slate-200">
                    <FolderOpen className="size-4 text-slate-500" />
                    {projectMap[milestone.project_id] ?? 'Project'}
                  </span>
                  {!isCompleted && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 border border-slate-200">
                      <Clock className="size-4 text-slate-500" />
                      {isOverdue
                        ? `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`
                        : diffDays === 0 ? 'Due today'
                        : `${diffDays} day${diffDays !== 1 ? 's' : ''} away`}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
          <CalendarDays className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-900">No milestones available yet</p>
          <p className="mt-2 text-sm">Your freelancer can add milestones from the dashboard and they will appear here.</p>
        </div>
      )}
    </div>
  )
}
