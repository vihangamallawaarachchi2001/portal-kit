import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { unauthorized, internalError } from '@/lib/api'
import { ZipArchive } from 'archiver'
import { getWorkspaceContext } from '@/lib/workspace'

export const runtime = 'nodejs'

// Fields intentionally excluded from export (operational/infra, not personal data)
const EXCLUDED_PROFILE_FIELDS = [
  'stripe_subscription_id',
  'stripe_connect_account_id',
]

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const { ownerId } = await getWorkspaceContext(user.id, user.email ?? '')

  const service = createServiceClient()

  // ── 1. Fetch all user data in parallel ─────────────────────────────────────
  const [
    profileResult,
    clientsResult,
    projectsResult,
    invoicesResult,
    milestonesResult,
    meetingsResult,
  ] = await Promise.all([
    service
      .from('profiles')
      .select('id, full_name, business_name, avatar_url, plan, onboarding_completed, created_at, updated_at')
      .eq('id', ownerId)
      .single(),

    service
      .from('clients')
      .select('id, name, email, portal_slug, status, created_at, updated_at')
      .eq('freelancer_id', ownerId)
      .is('deleted_at', null),

    service
      .from('projects')
      .select('id, client_id, title, description, status, due_date, created_at, updated_at')
      .eq('freelancer_id', ownerId)
      .is('deleted_at', null),

    service
      .from('invoices')
      .select('id, client_id, project_id, title, status, subtotal, tax_rate, total, currency, due_date, notes, created_at, updated_at')
      .eq('freelancer_id', ownerId),

    service
      .from('milestones')
      .select('id, project_id, title, description, due_date, completed_at, created_at, updated_at')
      .eq('freelancer_id', ownerId),

    service
      .from('meetings')
      .select('id, project_id, client_id, title, description, scheduled_at, duration_mins, status, created_at, updated_at')
      .eq('freelancer_id', ownerId),
  ])

  // ── 2. Fetch messages via project IDs ───────────────────────────────────────
  const projectIds = (projectsResult.data ?? []).map((p: { id: string }) => p.id)

  const { data: messages } =
    projectIds.length > 0
      ? await service
          .from('messages')
          .select('id, project_id, sender_type, content, read_at, created_at')
          .in('project_id', projectIds)
          .order('created_at', { ascending: true })
      : { data: [] }

  // ── 3. Build ZIP archive in memory ─────────────────────────────────────────
  const datasets: Array<{ name: string; data: unknown }> = [
    { name: 'profile.json',    data: { ...profileResult.data, email: user.email } },
    { name: 'clients.json',    data: clientsResult.data    ?? [] },
    { name: 'projects.json',   data: projectsResult.data   ?? [] },
    { name: 'invoices.json',   data: invoicesResult.data   ?? [] },
    { name: 'messages.json',   data: messages              ?? [] },
    { name: 'milestones.json', data: milestonesResult.data ?? [] },
    { name: 'meetings.json',   data: meetingsResult.data   ?? [] },
  ]

  const archive = new ZipArchive({ zlib: { level: 6 } })
  const chunks: Buffer[] = []

  const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
    archive.on('data', (chunk: Buffer) => chunks.push(chunk))
    archive.on('end',  () => resolve(Buffer.concat(chunks)))
    archive.on('error', reject)

    for (const { name, data } of datasets) {
      archive.append(Buffer.from(JSON.stringify(data, null, 2), 'utf8'), { name })
    }

    archive.finalize()
  }).catch(err => {
    console.error('[export] archive failed', err)
    return null
  })

  if (!zipBuffer) return internalError('Failed to build export archive')

  const dateStr = new Date().toISOString().slice(0, 10)

  return new Response(zipBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="portalkit-export-${dateStr}.zip"`,
      'Content-Length': String(zipBuffer.length),
    },
  })
}
