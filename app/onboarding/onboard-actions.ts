'use server'

import { createClient } from '@/lib/supabase/server'

// ── New focused actions for the 3-step wizard ──────────────────────────────

export async function saveFullName(fullName: string) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function skipStripeConnect() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ stripe_onboarding_skipped: true, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function finishOnboarding() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  // Mirror flag into JWT user_metadata so the middleware gate clears immediately
  const { error: metaError } = await supabase.auth.updateUser({ data: { onboarding_complete: true } })
  if (metaError) console.error('[onboarding] updateUser metadata:', metaError.message)

  return { success: true }
}

// ── Legacy action (kept for any existing callers) ──────────────────────────

export async function updateProfile({
  fullName,
  businessName,
  tagline,
  avatarUrl,
  plan = 'free',
}: {
  fullName: string
  businessName: string
  tagline: string
  avatarUrl: string | null
  plan?: string
}) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not authenticated')

  // Upsert so a missing profile row never silently fails
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: fullName || null,
      business_name: businessName || null,
      tagline: tagline || null,
      avatar_url: avatarUrl,
      plan: plan === 'free' ? 'free' : (plan as 'pro' | 'business'),
      base_currency: 'USD',
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })

  if (error) throw new Error(error.message)

  // Update JWT user_metadata so the session reflects the change immediately
  const { error: metaError } = await supabase.auth.updateUser({
    data: { onboarding_complete: true },
  })
  if (metaError) console.error('[onboarding] updateUser metadata:', metaError.message)

  return { success: true }
}

export async function saveProfile({
  fullName,
  businessName,
  tagline,
  avatarUrl,
  baseCurrency,
}: {
  fullName: string
  businessName?: string
  tagline?: string
  avatarUrl?: string | null
  baseCurrency?: string
}) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName.trim() || null,
      business_name: businessName?.trim() || null,
      tagline: tagline?.trim() || null,
      ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
      ...(baseCurrency ? { base_currency: baseCurrency } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function uploadAvatarToStorage(file: File) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not authenticated')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `avatars/${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('portalkit_bucket')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) throw new Error(uploadError.message)

  const { data } = supabase.storage.from('portalkit_bucket').getPublicUrl(path)
  return data.publicUrl
}
