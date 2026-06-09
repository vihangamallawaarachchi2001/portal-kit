import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, Clock, ExternalLink, Video } from 'lucide-react'

export default async function PortalMeetingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) redirect(`/p/${slug}/access`)

  const service = createServiceClient()
  const { data: meetings } = await service
    .from('meetings')
    .select('id,title,description,scheduled_at,duration_mins,meet_link,status,project_id,projects(id,title)')
    .eq('client_id', clientId)
    .neq('status', 'cancelled')
    .order('scheduled_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Meetings</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Scheduled meetings</h1>
            <p className="text-sm text-slate-600 mt-1">See upcoming meetings and join directly from the portal.</p>
          </div>
          <Link href={`/p/${slug}`} className="text-sm font-semibold text-ds-secondary hover:underline">Back to overview</Link>
        </div>
      </div>

      {meetings && meetings.length > 0 ? (
        <div className="grid gap-4">
          {(meetings as any[]).map((meeting) => {
            const dt = new Date(meeting.scheduled_at)
            const isPast = dt < new Date()
            const project = Array.isArray(meeting.projects) ? meeting.projects[0] : meeting.projects
            return (
              <div key={meeting.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{meeting.title}</p>
                    {meeting.description && <p className="text-sm text-slate-600 mt-1">{meeting.description}</p>}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200">
                    <Clock className="size-4 text-slate-500" />
                    {dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}
                    {dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 border border-slate-200">
                    <CalendarDays className="size-4 text-slate-500" />
                    {meeting.duration_mins} min
                  </span>
                  {project?.title && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 border border-slate-200">
                      <span className="font-semibold">Project:</span> {project.title}
                    </span>
                  )}
                  <a
                    href={meeting.meet_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-ds-secondary/10 px-3 py-2 text-sm font-semibold text-ds-secondary hover:bg-ds-secondary/15 transition"
                  >
                    <ExternalLink className="size-4" /> Join meeting
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
          <Video className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-900">No meetings scheduled</p>
          <p className="mt-2 text-sm">Your freelancer can schedule a meeting from their dashboard and you'll receive an invite here.</p>
        </div>
      )}
    </div>
  )
}
