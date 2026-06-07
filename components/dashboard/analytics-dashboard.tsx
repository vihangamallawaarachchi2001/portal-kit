'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { TrendingUp, Users, CheckCircle2, FolderOpen, Loader2, Zap } from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  currency: string
  revenueByMonth: { month: string; revenue: number }[]
  invoiceBreakdown: Record<string, { count: number; total: number }>
  clientsByMonth: { month: string; clients: number }[]
  fileStats: { approved: number; changes_requested: number; approvalRate: number | null; totalReviewed: number }
  projectDistribution: { status: string; label: string; count: number }[]
  totalRevenue: number
  totalClients: number
}

const STATUS_COLORS: Record<string, string> = {
  briefing:    '#94a3b8',
  in_progress: '#3b82f6',
  review:      '#f59e0b',
  done:        '#10b981',
}

const INVOICE_COLORS: Record<string, string> = {
  draft:   '#94a3b8',
  sent:    '#3b82f6',
  paid:    '#10b981',
  overdue: '#ef4444',
}

interface AnalyticsDashboardProps {
  plan: string
}

export function AnalyticsDashboard({ plan }: AnalyticsDashboardProps) {
  const [data, setData]       = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const isBusinessPlan = plan === 'business'

  useEffect(() => {
    if (!isBusinessPlan) { setLoading(false); return }
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isBusinessPlan])

  if (!isBusinessPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-8">
        <div className="size-16 rounded-2xl bg-amber-50 flex items-center justify-center">
          <Zap className="size-8 text-amber-500" />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-lg font-bold text-on-surface">Advanced Analytics</p>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            Deep insights into your revenue, clients, and project performance — available on the Business plan.
          </p>
        </div>
        <Link
          href="/dashboard/settings/billing"
          className="inline-flex items-center gap-1.5 h-10 px-6 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          <Zap className="size-4" />
          Upgrade to Business
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-6 animate-spin text-on-surface-variant/40" />
      </div>
    )
  }

  if (!data) return null

  const currency   = data.currency
  const maxRevenue = Math.max(...data.revenueByMonth.map(m => m.revenue), 1)

  const pieData = data.projectDistribution
    .filter(p => p.count > 0)
    .map(p => ({ name: p.label, value: p.count, color: STATUS_COLORS[p.status] }))

  const invoicePie = Object.entries(data.invoiceBreakdown)
    .filter(([, v]) => v.count > 0)
    .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v.count, color: INVOICE_COLORS[k] }))

  return (
    <div className="flex flex-col gap-6 px-6 sm:px-8 pt-8 pb-12">
      <div>
        <h2 className="text-lg font-bold text-on-surface tracking-tight">Advanced Analytics</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Business performance overview for the last 6 months.</p>
      </div>

      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          icon={TrendingUp}
          label="Revenue (6 mo)"
          value={formatCurrency(data.totalRevenue, currency)}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <KpiCard
          icon={Users}
          label="New Clients"
          value={String(data.totalClients)}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Approval Rate"
          value={data.fileStats.approvalRate !== null ? `${data.fileStats.approvalRate}%` : '—'}
          color="text-ds-secondary"
          bg="bg-ds-secondary/10"
        />
        <KpiCard
          icon={FolderOpen}
          label="Files Reviewed"
          value={String(data.fileStats.totalReviewed)}
          color="text-violet-600"
          bg="bg-violet-50"
        />
      </div>

      {/* ── Revenue bar chart ── */}
      <ChartCard title="Monthly Revenue" subtitle="Paid invoice totals per month">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.revenueByMonth} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v === 0 ? '0' : `${Math.round(v / 1000)}k`}
              width={36}
            />
            <Tooltip
              formatter={(v: unknown) => [formatCurrency(Number(v), currency), 'Revenue']}
              contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="revenue" fill="#0051d5" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
        {maxRevenue === 1 && (
          <p className="text-xs text-on-surface-variant text-center pb-2">No paid invoices in the last 6 months.</p>
        )}
      </ChartCard>

      {/* ── Client growth + project distribution ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ChartCard title="New Clients" subtitle="Clients added per month">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.clientsByMonth} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }} />
              <Line type="monotone" dataKey="clients" stroke="#0051d5" strokeWidth={2} dot={{ r: 3, fill: '#0051d5' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Project Status" subtitle="Distribution across all projects">
          {pieData.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-12">No projects yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>}
                />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Invoice breakdown ── */}
      <ChartCard title="Invoice Breakdown" subtitle="Count of invoices by status">
        <div className="flex flex-col gap-3 py-2">
          {Object.entries(data.invoiceBreakdown).map(([status, val]) => {
            const totalCount = Object.values(data.invoiceBreakdown).reduce((s, v) => s + v.count, 0)
            const pct = totalCount > 0 ? Math.round((val.count / totalCount) * 100) : 0
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="w-16 text-xs font-semibold capitalize text-on-surface-variant shrink-0">{status}</span>
                <div className="flex-1 h-5 bg-surface-container rounded-md overflow-hidden">
                  <div
                    className="h-full rounded-md transition-all"
                    style={{ width: `${pct}%`, background: INVOICE_COLORS[status] }}
                  />
                </div>
                <span className="text-xs font-semibold text-on-surface w-24 shrink-0 text-right">
                  {val.count} · {formatCurrency(val.total, currency)}
                </span>
              </div>
            )
          })}
        </div>
      </ChartCard>

      {/* ── File review approval rate ── */}
      <ChartCard title="File Review Results" subtitle="Approval vs changes requested">
        <div className="flex items-center justify-center gap-8 py-4">
          <Donut
            value={data.fileStats.approved}
            total={data.fileStats.totalReviewed}
            label="Approved"
            color="#10b981"
          />
          <Donut
            value={data.fileStats.changes_requested}
            total={data.fileStats.totalReviewed}
            label="Changes"
            color="#f59e0b"
          />
        </div>
        {data.fileStats.approvalRate !== null && (
          <p className="text-center text-sm text-on-surface-variant pb-2">
            Overall approval rate: <span className="font-bold text-emerald-600">{data.fileStats.approvalRate}%</span>
          </p>
        )}
        {data.fileStats.totalReviewed === 0 && (
          <p className="text-center text-xs text-on-surface-variant pb-2">No file reviews yet.</p>
        )}
      </ChartCard>

      {/* ── Invoice pie ── */}
      {invoicePie.length > 0 && (
        <ChartCard title="Revenue by Status" subtitle="Monetary breakdown of invoices">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={invoicePie} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value">
                {invoicePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>}
              />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: string; color: string; bg: string
}) {
  return (
    <div className="bg-white rounded-md shadow-sm p-4 flex items-center gap-3">
      <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0', bg)}>
        <Icon className={cn('size-4', color)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-on-surface-variant truncate">{label}</p>
        <p className="text-base font-bold text-on-surface leading-tight truncate">{value}</p>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-outline-variant/30">
        <p className="text-sm font-bold text-on-surface">{title}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function Donut({ value, total, label, color }: { value: number; total: number; label: string; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative size-20">
        <svg viewBox="0 0 40 40" className="size-full -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#f3f4f6" strokeWidth="5" />
          <circle
            cx="20" cy="20" r="16" fill="none"
            stroke={color} strokeWidth="5"
            strokeDasharray={`${pct} 100`}
            strokeLinecap="round"
            pathLength={100}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-on-surface">
          {pct}%
        </span>
      </div>
      <p className="text-xs text-on-surface-variant">{label} <span className="font-semibold text-on-surface">({value})</span></p>
    </div>
  )
}
