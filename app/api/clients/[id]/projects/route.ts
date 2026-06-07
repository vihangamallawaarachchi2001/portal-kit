import { createClient } from '@/lib/supabase/server'
import { ok, created, unauthorized, notFound, badRequest, internalError, paymentRequired, fromZodError } from '@/lib/api'
import { createProjectSchema } from '@/lib/validations'
import { ZodError } from 'zod'

const PROJECT_LIMITS: Record<string, number> = { free: 2, pro: Infinity, business: Infinity }

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // Verify client ownership
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!client) return notFound('Client not found')

  const { data, error } = await supabase
    .from('projects')
    .select('id, title, description, status, due_date, client_id, created_at, updated_at')
    .eq('client_id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return internalError(error.message)
  return ok(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!client) return notFound('Client not found')

  // Enforce per-plan project limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const limit = PROJECT_LIMITS[profile?.plan ?? 'free'] ?? 2
  if (isFinite(limit)) {
    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('freelancer_id', user.id)
      .is('deleted_at', null)

    if ((count ?? 0) >= limit) {
      return paymentRequired(
        `Free plan allows ${limit} projects. Upgrade to Pro for unlimited projects.`,
        { limit, current: count ?? 0, code: 'project_limit' },
      )
    }
  }

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = createProjectSchema.parse({ ...body, client_id: id }) } catch (e) { return fromZodError(e as ZodError) }

  const { data, error } = await supabase
    .from('projects')
    .insert({ ...input, freelancer_id: user.id })
    .select()
    .single()

  if (error) return internalError(error.message)
  return created(data)
}
