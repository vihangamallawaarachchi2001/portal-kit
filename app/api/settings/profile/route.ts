import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, internalError, fromZodError, badRequest } from '@/lib/api'
import { updateProfileSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = updateProfileSchema.parse(body) } catch (e) { return fromZodError(e as ZodError) }

  const { error } = await supabase
    .from('profiles')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return internalError(error.message)
  return ok({ success: true })
}
