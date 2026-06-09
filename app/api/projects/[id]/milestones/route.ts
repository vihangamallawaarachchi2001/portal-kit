import { createClient } from '@/lib/supabase/server'
import { ok, badRequest, unauthorized, notFound, internalError } from '@/lib/api'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // Verify project belongs to freelancer
  const { data: project } = await supabase
    .from('projects')
    .select('id, freelancer_id')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()
  if (!project) return notFound('Project not found')

  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', id)
    .order('due_date', { ascending: true })

  if (error) return internalError(error.message)
  return ok({ data })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // Verify project belongs to freelancer
  const { data: project } = await supabase
    .from('projects')
    .select('id, freelancer_id')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()
  if (!project) return notFound('Project not found')

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const { title, due_date, description } = body as { title?: string; due_date?: string; description?: string }
  if (!title || !due_date) return badRequest('Missing title or due_date')

  const { data, error } = await supabase
    .from('milestones')
    .insert([{ project_id: id, freelancer_id: user.id, title, description: description ?? null, due_date }])
    .select()
    .single()

  if (error) return internalError(error.message)
  return ok(data)
}
