import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExportDataButton } from '@/components/dashboard/export-data-button'

export const metadata = { title: 'Account' }

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  return (
    <div className="px-8 pt-8 pb-12 max-w-2xl">
      <h2 className="text-lg font-bold text-on-surface tracking-tight">Account</h2>
      <p className="text-sm text-on-surface-variant mt-0.5 mb-8">Manage your account data and privacy.</p>

      {/* ── Data export ───────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h3 className="text-[13px] font-bold text-on-surface uppercase tracking-widest mb-4">
          Data & Privacy
        </h3>

        <div className="rounded-xl border border-outline-variant/60 bg-white p-5">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface">Export my data</p>
              <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed">
                Download a ZIP containing all your PortalKit data — profile, clients,
                projects, invoices, messages, milestones, and meetings — as JSON files.
              </p>
            </div>
            <ExportDataButton />
          </div>
        </div>
      </section>

      {/* ── Account info ──────────────────────────────────────────────────── */}
      <section>
        <h3 className="text-[13px] font-bold text-on-surface uppercase tracking-widest mb-4">
          Account Info
        </h3>

        <div className="rounded-xl border border-outline-variant/60 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-on-surface-variant">Email address</span>
            <span className="text-[13px] font-medium text-on-surface">{user.email}</span>
          </div>
          <div className="h-px bg-outline-variant/40" />
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-on-surface-variant">Account created</span>
            <span className="text-[13px] font-medium text-on-surface">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
