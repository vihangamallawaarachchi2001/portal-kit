import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'   // ← server client, not useUser()

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()  // ← correct for server component

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b flex items-center justify-between px-6">
        <span className="font-semibold">PortalKit</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
