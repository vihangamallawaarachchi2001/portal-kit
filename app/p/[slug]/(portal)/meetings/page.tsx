import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, Clock, ExternalLink, Video, ArrowLeft, FolderOpen, CheckCircle2 } from 'lucide-react'

export default async function PortalMeetingsPage({ params }: { params: Promise<{ slug: string }> }) {
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
  if (features && features.meetings === false) redirect(`/p/${slug}`)

  const { data: meetings } = await service
    .from('meetings')
    .select('id,title,description,scheduled_at,duration_mins,meet_link,status,project_id,projects(id,title)')
    .eq('client_id', clientId)
    .neq('status', 'cancelled')
    .order('scheduled_at', { ascending: true })

  const now = new Date()
  const upcoming = (meetings ?? []).filter(m => new Date(m.scheduled_at) >= now)
  const past = (meetings ?? []).filter(m => new Date(m.scheduled_at) < now)

  function formatMeetingDate(iso: string) {
    const dt = new Date(iso)
    const isToday = dt.toDateString() === now.toDateString()
    const isTomorrow = dt.toDateString() === new Date(Date.now() + 86400000).toDateString()
    const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    const time = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    return { dayLabel, time }
  }

  return (
    <div className="space-y-6">

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-6" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)' }}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-600">Meetings</p>
              <h1 className="mt-1.5 text-2xl font-bold text-slate-900">Scheduled meetings</h1>
              <p className="text-sm text-slate-600 mt-1">Join calls directly from your portal — no account needed.</p>
            </div>
            <Link href={`/p/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors shrink-0 self-start">
              <ArrowLeft className="size-4" /> Overview
            </Link>
          </div>

          {/* Stats strip */}
          {(meetings ?? []).length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {upcoming.length > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-purple-200 text-xs font-semibold text-purple-700">
                  <CalendarDays className="size-3.5" />
                  {upcoming.length} upcoming
                </div>
              )}
              {past.length > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 text-xs font-semibold text-slate-500">
                  <CheckCircle2 className="size-3.5" />
                  {past.length} past
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {(meetings ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 flex flex-col items-center text-center gap-4">
          <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Video className="size-7 text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">No meetings scheduled</p>
            <p className="text-sm text-slate-500 mt-1">Your freelancer can schedule meetings from their dashboard — they&apos;ll appear here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Upcoming meetings */}
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Upcoming</h2>
              <div className="grid gap-3">
                {(upcoming as any[]).map((meeting) => {
                  const { dayLabel, time } = formatMeetingDate(meeting.scheduled_at)
                  const project = Array.isArray(meeting.projects) ? meeting.projects[0] : meeting.projects
                  const isToday = dayLabel === 'Today'

                  return (
                    <div key={meeting.id} className={`rounded-2xl border shadow-sm overflow-hidden ${isToday ? 'border-purple-200' : 'border-slate-200'}`}>
                      {/* Color top strip */}
                      <div className="h-1 w-full" style={{ background: isToday ? 'linear-gradient(90deg, #9333ea, #7c3aed)' : '#e2e8f0' }} />
                      <div className="bg-white p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-base">{meeting.title}</p>
                            {meeting.description && (
                              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{meeting.description}</p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                                isToday ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                <CalendarDays className="size-3.5" />
                                {dayLabel}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                                <Clock className="size-3.5" />
                                {time} · {meeting.duration_mins} min
                              </span>
                              {project?.title && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                                  <FolderOpen className="size-3.5" />
                                  {project.title}
                                </span>
                              )}
                            </div>
                          </div>

                          {meeting.meet_link && (
                            <a
                              href={meeting.meet_link}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm shrink-0 ${
                                isToday
                                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                                  : 'bg-slate-900 text-white hover:bg-slate-800'
                              }`}
                            >
                              <ExternalLink className="size-4" />
                              Join meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past meetings */}
          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Past</h2>
              <div className="grid gap-2">
                {(past as any[]).reverse().map((meeting) => {
                  const { dayLabel, time } = formatMeetingDate(meeting.scheduled_at)
                  const project = Array.isArray(meeting.projects) ? meeting.projects[0] : meeting.projects

                  return (
                    <div key={meeting.id} className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-600">{meeting.title}</p>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                            <span>{dayLabel} · {time}</span>
                            {project?.title && <span>· {project.title}</span>}
                            <span>· {meeting.duration_mins} min</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-xs font-medium text-slate-500 shrink-0">
                          <CheckCircle2 className="size-3" /> Done
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
