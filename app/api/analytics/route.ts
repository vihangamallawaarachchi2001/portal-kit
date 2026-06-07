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

  // Last 6 months bucket labels
  const now   = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return { label: d.toLocaleString('en-US', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() + 1 }
  })

  // Revenue per month (paid invoices)
  const { data: paidInvoices } = await supabase
    .from('invoices')
    .select('total, paid_at, currency')
    .eq('freelancer_id', user.id)
    .eq('status', 'paid')
    .not('paid_at', 'is', null)
    .gte('paid_at', new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString())

  const revenueByMonth = months.map(m => ({
    month: m.label,
    revenue: (paidInvoices ?? [])
      .filter(inv => {
        const d = new Date(inv.paid_at!)
        return d.getFullYear() === m.year && d.getMonth() + 1 === m.month
      })
      .reduce((sum, inv) => sum + Number(inv.total), 0),
  }))

  // Invoice status breakdown
  const { data: allInvoices } = await supabase
    .from('invoices')
    .select('status, total')
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)

  const invoiceBreakdown = {
    draft:   { count: 0, total: 0 },
    sent:    { count: 0, total: 0 },
    paid:    { count: 0, total: 0 },
    overdue: { count: 0, total: 0 },
  }
  for (const inv of (allInvoices ?? [])) {
    const s = inv.status as keyof typeof invoiceBreakdown
    if (invoiceBreakdown[s]) {
      invoiceBreakdown[s].count++
      invoiceBreakdown[s].total += Number(inv.total)
    }
  }

  // New clients per month
  const { data: allClients } = await supabase
    .from('clients')
    .select('created_at')
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .gte('created_at', new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString())

  const clientsByMonth = months.map(m => ({
    month: m.label,
    clients: (allClients ?? []).filter(c => {
      const d = new Date(c.created_at)
      return d.getFullYear() === m.year && d.getMonth() + 1 === m.month
    }).length,
  }))

  // File review stats
  const { data: allFiles } = await supabase
    .from('files')
    .select('status')
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .in('status', ['approved', 'changes_requested'])

  const fileStats = {
    approved:          (allFiles ?? []).filter(f => f.status === 'approved').length,
    changes_requested: (allFiles ?? []).filter(f => f.status === 'changes_requested').length,
  }
  const totalReviewed = fileStats.approved + fileStats.changes_requested
  const approvalRate  = totalReviewed > 0 ? Math.round((fileStats.approved / totalReviewed) * 100) : null

  // Project status distribution
  const { data: allProjects } = await supabase
    .from('projects')
    .select('status')
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)

  const projectDistribution = ['briefing', 'in_progress', 'review', 'done'].map(status => ({
    status,
    label: { briefing: 'Briefing', in_progress: 'In Progress', review: 'In Review', done: 'Done' }[status]!,
    count: (allProjects ?? []).filter(p => p.status === status).length,
  }))

  return ok({
    currency:            profile?.base_currency ?? 'USD',
    revenueByMonth,
    invoiceBreakdown,
    clientsByMonth,
    fileStats:           { ...fileStats, approvalRate, totalReviewed },
    projectDistribution,
    totalRevenue:        revenueByMonth.reduce((s, m) => s + m.revenue, 0),
    totalClients:        (allClients?.length ?? 0),
  })
}
