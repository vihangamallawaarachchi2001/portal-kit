import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, paymentRequired } from '@/lib/api'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, base_currency')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'business') {
    return paymentRequired(
      'Advanced analytics are available on the Business plan.',
      { code: 'analytics_gating' },
    )
  }

  const now    = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

  // Month bucket labels (client-side rendering expects these keys)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      label: d.toLocaleString('en-US', { month: 'short' }),
      key:   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    }
  })

  // All queries in parallel — each aggregated by SQL, not JS
  const [
    { data: revRows },
    { data: invRows },
    { data: clientRows },
    { data: fileRows },
    { data: projectRows },
  ] = await Promise.all([
    // Revenue per month: SUM(total) GROUP BY month
    supabase.rpc('analytics_revenue_by_month', {
      p_freelancer_id: user.id,
      p_since:         sixMonthsAgo,
    }),
    // Invoice status breakdown: COUNT + SUM per status
    supabase.rpc('analytics_invoice_breakdown', { p_freelancer_id: user.id }),
    // New clients per month: COUNT GROUP BY month
    supabase.rpc('analytics_clients_by_month', {
      p_freelancer_id: user.id,
      p_since:         sixMonthsAgo,
    }),
    // File approval stats: COUNT per review status
    supabase.rpc('analytics_file_stats', { p_freelancer_id: user.id }),
    // Project status distribution: COUNT per status
    supabase.rpc('analytics_project_distribution', { p_freelancer_id: user.id }),
  ])

  // Map SQL results onto the month buckets
  const revMap = Object.fromEntries(
    (revRows as { month: string; revenue: number }[] ?? []).map(r => [r.month, r.revenue])
  )
  const revenueByMonth = months.map(m => ({ month: m.label, revenue: revMap[m.key] ?? 0 }))

  const clientMap = Object.fromEntries(
    (clientRows as { month: string; clients: number }[] ?? []).map(r => [r.month, r.clients])
  )
  const clientsByMonth = months.map(m => ({ month: m.label, clients: clientMap[m.key] ?? 0 }))

  const invBreakdown = (invRows as { status: string; count: number; total: number }[] ?? [])
  const invoiceBreakdown = {
    draft:   { count: 0, total: 0 },
    sent:    { count: 0, total: 0 },
    paid:    { count: 0, total: 0 },
    overdue: { count: 0, total: 0 },
  } as Record<string, { count: number; total: number }>
  for (const row of invBreakdown) {
    if (invoiceBreakdown[row.status]) {
      invoiceBreakdown[row.status] = { count: Number(row.count), total: Number(row.total) }
    }
  }

  const fRows = fileRows as { status: string; count: number }[] ?? []
  const approved = Number(fRows.find(r => r.status === 'approved')?.count ?? 0)
  const changes  = Number(fRows.find(r => r.status === 'changes_requested')?.count ?? 0)
  const totalReviewed = approved + changes
  const fileStats = {
    approved,
    changes_requested: changes,
    approvalRate:  totalReviewed > 0 ? Math.round((approved / totalReviewed) * 100) : null,
    totalReviewed,
  }

  const pRows = projectRows as { status: string; count: number }[] ?? []
  const projectDistribution = ['briefing', 'in_progress', 'review', 'done'].map(status => ({
    status,
    label: { briefing: 'Briefing', in_progress: 'In Progress', review: 'In Review', done: 'Done' }[status]!,
    count: Number(pRows.find(r => r.status === status)?.count ?? 0),
  }))

  const totalRevenue   = revenueByMonth.reduce((s, m) => s + m.revenue, 0)
  const totalClients   = clientsByMonth.reduce((s, m) => s + m.clients, 0)

  return ok({
    currency: profile?.base_currency ?? 'USD',
    revenueByMonth,
    invoiceBreakdown,
    clientsByMonth,
    fileStats,
    projectDistribution,
    totalRevenue,
    totalClients,
  })
}
