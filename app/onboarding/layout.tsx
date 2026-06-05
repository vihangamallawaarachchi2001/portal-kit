import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not authenticated → go sign in
  if (!user) redirect('/auth')

  // Already completed onboarding → go to dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) redirect('/dashboard')

  return <>{children}</>
}
