import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, badRequest, internalError } from '@/lib/api'

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const {
    bank_name, account_holder, account_number, routing_number, country, currency,
  } = body as Record<string, string>

  const { error } = await supabase
    .from('profiles')
    .update({
      bank_details: { bank_name, account_holder, account_number, routing_number, country, currency },
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return internalError(error.message)
  return ok({ success: true })
}
