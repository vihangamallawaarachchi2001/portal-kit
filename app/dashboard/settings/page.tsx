import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileSettings } from '@/components/dashboard/profile-settings'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Manage your profile, billing, and notification preferences.</p>
      </div>
      <ProfileSettings profile={profile} email={user.email ?? ''} />
    </div>
  )
}
