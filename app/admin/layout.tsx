import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { verifySessionValue, ADMIN_COOKIE } from '@/lib/admin-auth'
import AdminGate from '@/components/admin/admin-gate'

export const metadata = { title: 'Admin — PortalKit' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session     = cookieStore.get(ADMIN_COOKIE)?.value

  if (!session || !verifySessionValue(session)) {
    // Suspense required because AdminGate uses useSearchParams()
    return (
      <Suspense>
        <AdminGate />
      </Suspense>
    )
  }

  return <>{children}</>
}
