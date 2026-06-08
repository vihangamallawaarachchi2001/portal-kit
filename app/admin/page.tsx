import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { ADMIN_COOKIE, getEmailFromSession } from '@/lib/admin-auth'
import AdminDashboard from '@/components/admin/admin-dashboard'

export const revalidate = 0

function weeklyBins(n: number): string[] {
  const now = new Date()
  const daysToMon = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - daysToMon)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() - (n - 1 - i) * 7)
    return d.toISOString().slice(0, 10)
  })
}

function monthlyBins(n: number): string[] {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}

export default async function AdminPage() {
  const cookieStore = await cookies()
  const adminEmail  = getEmailFromSession(cookieStore.get(ADMIN_COOKIE)?.value ?? '')
    ?? process.env.ADMIN_EMAIL
    ?? 'admin'

  const service = createServiceClient()
  const sevenDaysAgo   = new Date(Date.now() -  7 * 86400000).toISOString()
  const thirtyDaysAgo  = new Date(Date.now() - 30 * 86400000).toISOString()
  const eightWeeksAgo  = new Date(Date.now() - 56 * 86400000).toISOString()
  const sixMonthsAgo   = new Date(Date.now() - 180 * 86400000).toISOString()
  const now = new Date().toISOString()

  const [
    { count: cUsers },
    { count: cClients },
    { count: cProjects },
    { count: cFiles },
    { count: cMessages },
    { count: cInvoices },
    { count: cPushSubs },
    { count: cPortalSessions },
    { data: planRows },
    { data: signupRows },
    { data: revenueRows },
    { data: invoiceRows },
    { count: cRecentMessages },
    { count: cRecentFiles },
    { count: cRecentSessions },
    // Recent users: no grant columns — works without migration 015
    { data: recentSignupsRows },
    // Active grants: may return null if migration 015 not run — handled below
    { data: grantsRows },
    authResult,
    // Resource queries
    { data: dbSizeRaw },
    { data: storageStatsRaw },
    // Email estimates: portal sessions (magic links) + invoice sends in last 30 days
    { count: cEmailMagicLinks },
    { count: cEmailInvoices },
  ] = await Promise.all([
    service.from('profiles').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    service.from('clients').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    service.from('projects').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    service.from('files').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    service.from('messages').select('id', { count: 'exact', head: true }),
    service.from('invoices').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    service.from('push_subscriptions').select('id', { count: 'exact', head: true }),
    service.from('portal_sessions').select('id', { count: 'exact', head: true }),
    service.from('profiles').select('plan').is('deleted_at', null).limit(5000),
    service.from('profiles').select('created_at').gte('created_at', eightWeeksAgo).is('deleted_at', null).limit(5000),
    service.from('invoices').select('total, paid_at').eq('status', 'paid').gte('paid_at', sixMonthsAgo).is('deleted_at', null).limit(5000),
    service.from('invoices').select('status, total').is('deleted_at', null).limit(10000),
    service.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    service.from('files').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo).is('deleted_at', null),
    service.from('portal_sessions').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    // Basic profile fields only — no grant columns, so this works without migration 015
    service.from('profiles').select('id, full_name, plan, created_at').order('created_at', { ascending: false }).limit(10),
    // Grant query — may fail silently if migration 015 not run; grantsRows will be null
    service.from('profiles').select('id, full_name, plan, plan_grant_expires_at, plan_grant_note').not('plan_grant_expires_at', 'is', null).gt('plan_grant_expires_at', now).limit(100),
    service.auth.admin.listUsers({ perPage: 1000 }),
    // Resource RPCs — return null if migration 016 not run
    service.rpc('admin_db_size'),
    service.rpc('admin_storage_stats'),
    // Magic link emails sent in last 30 days
    service.from('portal_sessions').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    // Invoice emails: non-draft invoices created in last 30 days (each required an email send)
    service.from('invoices').select('id', { count: 'exact', head: true }).neq('status', 'draft').gte('created_at', thirtyDaysAgo).is('deleted_at', null),
  ])

  const emailMap = new Map<string, string>()
  for (const u of authResult.data?.users ?? []) {
    if (u.id && u.email) emailMap.set(u.id, u.email)
  }

  // Plan breakdown
  const planCount: Record<string, number> = {}
  for (const row of planRows ?? []) {
    const p = (row as { plan: string }).plan ?? 'free'
    planCount[p] = (planCount[p] ?? 0) + 1
  }
  const PLAN_COLORS: Record<string, string> = { free: '#6b7280', pro: '#4f46e5', business: '#7c3aed' }
  const planBreakdown = Object.entries(planCount).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: PLAN_COLORS[name] ?? '#9ca3af',
  }))

  // Weekly signups
  const wBins = weeklyBins(8)
  const wMap = new Map(wBins.map(w => [w, 0]))
  for (const row of signupRows ?? []) {
    const d = new Date((row as { created_at: string }).created_at)
    const daysToMon = (d.getDay() + 6) % 7
    const mon = new Date(d)
    mon.setDate(d.getDate() - daysToMon)
    const key = mon.toISOString().slice(0, 10)
    if (wMap.has(key)) wMap.set(key, (wMap.get(key) ?? 0) + 1)
  }
  const weeklySignups = wBins.map(w => ({
    week: new Date(w + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    signups: wMap.get(w) ?? 0,
  }))

  // Monthly revenue
  const mBins = monthlyBins(6)
  const mMap = new Map(mBins.map(m => [m, 0]))
  for (const row of revenueRows ?? []) {
    const r = row as { total: number; paid_at: string }
    const m = r.paid_at?.slice(0, 7)
    if (m && mMap.has(m)) mMap.set(m, (mMap.get(m) ?? 0) + Number(r.total))
  }
  const monthlyRevenue = mBins.map(m => ({
    month: new Date(m + '-15').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    revenue: Math.round((mMap.get(m) ?? 0) * 100) / 100,
  }))

  // Invoice breakdown + total paid revenue
  const invStatMap: Record<string, { count: number; total: number }> = {}
  let totalPaidRevenue = 0
  for (const row of invoiceRows ?? []) {
    const r = row as { status: string; total: number }
    if (!invStatMap[r.status]) invStatMap[r.status] = { count: 0, total: 0 }
    invStatMap[r.status].count++
    invStatMap[r.status].total += Number(r.total)
    if (r.status === 'paid') totalPaidRevenue += Number(r.total)
  }
  const invoiceBreakdown = Object.entries(invStatMap).map(([status, { count, total }]) => ({
    status, count, total: Math.round(total * 100) / 100,
  }))

  // Recent users — grant expiry will always be null until migration 015 is run
  const recentUsers = (recentSignupsRows ?? []).map(p => {
    const row = p as Record<string, unknown>
    return {
      id: row.id as string,
      email: emailMap.get(row.id as string) ?? '—',
      name: (row.full_name as string | null) ?? null,
      plan: (row.plan as string) ?? 'free',
      joinedAt: row.created_at as string,
      grantExpiresAt: null as string | null,
    }
  })

  // Active grants — null if migration 015 not run, which is fine (no grants exist yet)
  const activeGrants = (grantsRows ?? []).map(p => {
    const row = p as Record<string, unknown>
    return {
      id: row.id as string,
      email: emailMap.get(row.id as string) ?? '—',
      name: (row.full_name as string | null) ?? null,
      plan: (row.plan as string) ?? 'free',
      expiresAt: row.plan_grant_expires_at as string,
      note: (row.plan_grant_note as string | null) ?? null,
    }
  })

  // Resource metrics
  const storageRow = Array.isArray(storageStatsRaw) ? storageStatsRaw[0] : null
  const emailEstimateMonth = (cEmailMagicLinks ?? 0) + (cEmailInvoices ?? 0)

  const data = {
    kpis: {
      totalUsers: cUsers ?? 0,
      totalClients: cClients ?? 0,
      totalProjects: cProjects ?? 0,
      totalFiles: cFiles ?? 0,
      totalMessages: cMessages ?? 0,
      totalInvoices: cInvoices ?? 0,
      totalPaidRevenue: Math.round(totalPaidRevenue * 100) / 100,
      totalPushSubs: cPushSubs ?? 0,
      totalPortalSessions: cPortalSessions ?? 0,
    },
    planBreakdown,
    weeklySignups,
    monthlyRevenue,
    invoiceBreakdown,
    activityWeek: {
      messages: cRecentMessages ?? 0,
      files: cRecentFiles ?? 0,
      sessions: cRecentSessions ?? 0,
    },
    tableCounts: [
      { table: 'Users',           rows: cUsers ?? 0 },
      { table: 'Clients',         rows: cClients ?? 0 },
      { table: 'Projects',        rows: cProjects ?? 0 },
      { table: 'Files',           rows: cFiles ?? 0 },
      { table: 'Messages',        rows: cMessages ?? 0 },
      { table: 'Invoices',        rows: cInvoices ?? 0 },
      { table: 'Push Subs',       rows: cPushSubs ?? 0 },
      { table: 'Portal Sessions', rows: cPortalSessions ?? 0 },
    ],
    recentUsers,
    activeGrants,
    resources: {
      authUsers: authResult.data?.users?.length ?? 0,
      dbSizeBytes:      typeof dbSizeRaw === 'number' ? dbSizeRaw : null,
      storageSizeBytes: storageRow ? Number((storageRow as Record<string, unknown>).total_bytes) : null,
      storageFileCount: storageRow ? Number((storageRow as Record<string, unknown>).file_count)  : null,
      emailMagicLinksMonth: cEmailMagicLinks ?? 0,
      emailInvoicesMonth:   cEmailInvoices ?? 0,
      emailEstimateMonth,
    },
  }

  return <AdminDashboard data={data} adminEmail={adminEmail} />
}
