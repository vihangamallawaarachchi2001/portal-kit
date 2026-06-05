'use server'

import { createClient } from '@/lib/supabase/server'

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
