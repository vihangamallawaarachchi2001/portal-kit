import { createClient } from '@/lib/supabase/server'
import { SettingsNav } from '@/components/dashboard/settings-nav'

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = user
    ? (await supabase
        .from('profiles')
        .select('full_name, business_name, avatar_url, plan')
        .eq('id', user.id)
        .single()).data
    : null

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left settings nav ─────────────────────── */}
      <SettingsNav
        displayName={profile?.business_name || profile?.full_name || 'My Account'}
        avatarUrl={profile?.avatar_url ?? null}
        plan={profile?.plan ?? 'free'}
      />

      {/* ── Right content ─────────────────────────── */}
      <div className="flex-1 min-w-0 border-l border-outline-variant/30">
        {children}
      </div>
    </div>
  )
}
