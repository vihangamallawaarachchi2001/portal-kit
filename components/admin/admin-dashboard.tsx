'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts'
import {
  Users, DollarSign, FolderOpen, MessageSquare, FileText, Bell,
  Activity, Database, Shield, Star, Search, Loader2, X, LogOut, ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────────────────────

interface KPIs {
  totalUsers: number; totalClients: number; totalProjects: number
  totalFiles: number; totalMessages: number; totalInvoices: number
  totalPaidRevenue: number; totalPushSubs: number; totalPortalSessions: number
}
interface PlanSlice  { name: string; value: number; color: string }
interface WeekPoint  { week: string; signups: number }
interface MonthPoint { month: string; revenue: number }
interface InvoiceStat { status: string; count: number; total: number }
interface TableCount  { table: string; rows: number }
interface RecentUser {
  id: string; email: string; name: string | null
  plan: string; joinedAt: string; grantExpiresAt: string | null
}
interface Grant {
  id: string; email: string; name: string | null
  plan: string; expiresAt: string; note: string | null
}
interface AdminData {
  kpis: KPIs
  planBreakdown: PlanSlice[]
  weeklySignups: WeekPoint[]
  monthlyRevenue: MonthPoint[]
  invoiceBreakdown: InvoiceStat[]
  activityWeek: { messages: number; files: number; sessions: number }
  tableCounts: TableCount[]
  recentUsers: RecentUser[]
  activeGrants: Grant[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Users', 'Revenue', 'Resources', 'Special Users'] as const
type Tab = typeof TABS[number]

function fmtMoney(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_COLORS: Record<string, string> = {
  paid: '#10b981', sent: '#3b82f6', draft: '#94a3b8', overdue: '#ef4444', cancelled: '#9ca3af',
}

// ── KPI Card — matches exact pattern from clients-view.tsx ────────────────────

function KpiCard({ value, label, icon: Icon, color, accent }: {
  value: string | number; label: string; icon: React.ElementType; color: string; accent: string
}) {
  const isString = typeof value === 'string'
  return (
    <div className="relative flex items-start justify-between px-5 py-4 rounded-lg border border-outline-variant/20 bg-white shadow-sm overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-0.75" style={{ background: accent }} />
      <div className="flex flex-col">
        <span className={cn('font-extrabold text-on-surface tracking-tight leading-none', isString ? 'text-[20px]' : 'text-[28px]')}>
          {value}
        </span>
        <span className="text-[12px] font-medium text-on-surface-variant mt-2">{label}</span>
      </div>
      <Icon className={cn('size-4.5 mt-0.5 shrink-0 opacity-40', color)} />
    </div>
  )
}

// ── Plan badge ────────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const cls = {
    pro:      'bg-indigo-50 text-indigo-700 border-indigo-200',
    business: 'bg-purple-50 text-purple-700 border-purple-200',
    free:     'bg-surface-container text-on-surface-variant border-outline-variant/40',
  }[plan] ?? 'bg-surface-container text-on-surface-variant border-outline-variant/40'
  return (
    <span className={cn('inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize', cls)}>
      {plan}
    </span>
  )
}

// ── Section title ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-3">{children}</h2>
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, money }: {
  active?: boolean; payload?: { value: number }[]; label?: string; money?: boolean
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-outline-variant/30 rounded-lg px-3 py-2 shadow-sm text-sm">
      <p className="text-on-surface-variant text-xs">{label}</p>
      <p className="font-bold text-on-surface">{money ? fmtMoney(payload[0].value) : payload[0].value}</p>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function Empty({ message }: { message: string }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-on-surface-variant/50 gap-2">
      <Database className="size-8 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: AdminData }) {
  const { kpis, planBreakdown, weeklySignups } = data
  return (
    <div className="space-y-7">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard value={kpis.totalUsers}                   label="Freelancers"   icon={Users}        color="text-slate-400"  accent="#94a3b8" />
        <KpiCard value={kpis.totalClients}                 label="Clients"       icon={Users}        color="text-blue-500"   accent="#3b82f6" />
        <KpiCard value={kpis.totalProjects}                label="Projects"      icon={FolderOpen}   color="text-emerald-500" accent="#10b981" />
        <KpiCard value={kpis.totalFiles}                   label="Files"         icon={FileText}     color="text-amber-500"  accent="#f59e0b" />
        <KpiCard value={fmtMoney(kpis.totalPaidRevenue)}   label="Paid Revenue"  icon={DollarSign}   color="text-violet-500" accent="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Weekly signups — wider */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-outline-variant/20 shadow-sm p-5">
          <SectionTitle>Weekly Signups — last 8 weeks</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklySignups} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#45464d', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#45464d', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,81,213,0.05)' }} />
              <Bar dataKey="signups" fill="#0051d5" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-outline-variant/20 shadow-sm p-5">
          <SectionTitle>Plan Distribution</SectionTitle>
          {planBreakdown.length === 0 ? <Empty message="No users yet" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={planBreakdown} dataKey="value" nameKey="name"
                  cx="50%" cy="45%" innerRadius={52} outerRadius={76} paddingAngle={3}>
                  {planBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={7}
                  formatter={v => <span className="text-[11px] text-on-surface-variant">{v}</span>} />
                <Tooltip formatter={v => [v, '']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Activity row */}
      <div>
        <SectionTitle>Activity — last 7 days</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard value={data.activityWeek.messages}       label="Messages"         icon={MessageSquare} color="text-blue-500"    accent="#3b82f6" />
          <KpiCard value={data.activityWeek.files}          label="Files Uploaded"   icon={FileText}      color="text-amber-500"  accent="#f59e0b" />
          <KpiCard value={data.activityWeek.sessions}       label="Portal Sessions"  icon={Activity}      color="text-emerald-500" accent="#10b981" />
          <KpiCard value={kpis.totalPushSubs}               label="Push Subscribers" icon={Bell}          color="text-violet-500" accent="#8b5cf6" />
        </div>
      </div>
    </div>
  )
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab({ recentUsers }: { recentUsers: RecentUser[] }) {
  return (
    <div className="space-y-3">
      <SectionTitle>Recent Signups</SectionTitle>
      <div className="rounded-xl border border-outline-variant/20 bg-white shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_minmax(0,200px)_90px_140px_140px] px-5 py-2.5 bg-surface-container/50 border-b border-outline-variant/15">
          {['Name', 'Email', 'Plan', 'Joined', 'Grant Expires'].map(h => (
            <p key={h} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</p>
          ))}
        </div>
        {/* Rows */}
        <div className="divide-y divide-outline-variant/10">
          {recentUsers.length === 0 && <Empty message="No signups yet" />}
          {recentUsers.map(u => (
            <div key={u.id} className="grid grid-cols-[1fr_minmax(0,200px)_90px_140px_140px] px-5 py-3 hover:bg-surface-container/20 transition-colors items-center">
              <p className="text-sm font-semibold text-on-surface truncate">{u.name ?? <span className="text-on-surface-variant/50 font-normal italic">no name</span>}</p>
              <p className="text-xs font-mono text-on-surface-variant truncate pr-3">{u.email}</p>
              <PlanBadge plan={u.plan} />
              <p className="text-xs text-on-surface-variant">{fmtDate(u.joinedAt)}</p>
              <p className="text-xs">
                {u.grantExpiresAt
                  ? <span className="text-amber-600 font-medium">{fmtDate(u.grantExpiresAt)}</span>
                  : <span className="text-on-surface-variant/40">—</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Revenue Tab ───────────────────────────────────────────────────────────────

function RevenueTab({ data }: { data: AdminData }) {
  const { monthlyRevenue, invoiceBreakdown, kpis } = data
  const paidCount = invoiceBreakdown.find(i => i.status === 'paid')?.count ?? 0
  const outstandingCount = (invoiceBreakdown.find(i => i.status === 'sent')?.count ?? 0)
    + (invoiceBreakdown.find(i => i.status === 'overdue')?.count ?? 0)

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard value={kpis.totalInvoices}             label="Total Invoices"  icon={FileText}   color="text-slate-400"  accent="#94a3b8" />
        <KpiCard value={fmtMoney(kpis.totalPaidRevenue)} label="Paid Revenue"   icon={DollarSign} color="text-emerald-500" accent="#10b981" />
        <KpiCard value={paidCount}                      label="Paid Invoices"   icon={Activity}   color="text-blue-500"   accent="#3b82f6" />
        <KpiCard value={outstandingCount}               label="Outstanding"     icon={Bell}       color="text-amber-500"  accent="#f59e0b" />
      </div>

      {/* Monthly revenue chart */}
      <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-5">
        <SectionTitle>Monthly Revenue — last 6 months</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyRevenue} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0051d5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0051d5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#45464d', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#45464d', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={<ChartTooltip money />} />
            <Area type="monotone" dataKey="revenue" stroke="#0051d5" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Invoice breakdown */}
      <div>
        <SectionTitle>Invoice Breakdown by Status</SectionTitle>
        <div className="rounded-xl border border-outline-variant/20 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_140px] px-5 py-2.5 bg-surface-container/50 border-b border-outline-variant/15">
            {['Status', 'Count', 'Total Amount'].map(h => (
              <p key={h} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant last:text-right">{h}</p>
            ))}
          </div>
          <div className="divide-y divide-outline-variant/10">
            {invoiceBreakdown.length === 0 && <Empty message="No invoices yet" />}
            {invoiceBreakdown.map(row => (
              <div key={row.status} className="grid grid-cols-[1fr_100px_140px] px-5 py-3 hover:bg-surface-container/20 transition-colors items-center">
                <span className="flex items-center gap-2 text-sm font-medium text-on-surface">
                  <span className="size-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[row.status] ?? '#94a3b8' }} />
                  <span className="capitalize">{row.status}</span>
                </span>
                <span className="text-sm text-on-surface-variant">{row.count}</span>
                <span className="text-sm font-semibold text-on-surface text-right">{fmtMoney(row.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Resources Tab ─────────────────────────────────────────────────────────────

function ResourcesTab({ data }: { data: AdminData }) {
  const { tableCounts } = data
  const maxRows = Math.max(...tableCounts.map(t => t.rows), 1)

  return (
    <div className="space-y-7">
      <div>
        <SectionTitle>Database Row Counts</SectionTitle>
        <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-5">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tableCounts} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 56 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#45464d', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="table" tick={{ fill: '#45464d', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,81,213,0.04)' }} />
              <Bar dataKey="rows" radius={[0, 3, 3, 0]}>
                {tableCounts.map((_, i) => {
                  const hue = 220 + i * 18
                  return <Cell key={i} fill={`hsl(${hue},65%,55%)`} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <SectionTitle>Table Overview</SectionTitle>
        <div className="rounded-xl border border-outline-variant/20 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_1fr] px-5 py-2.5 bg-surface-container/50 border-b border-outline-variant/15">
            {['Table', 'Rows', 'Fill'].map(h => (
              <p key={h} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</p>
            ))}
          </div>
          <div className="divide-y divide-outline-variant/10">
            {tableCounts.map(t => (
              <div key={t.table} className="grid grid-cols-[1fr_100px_1fr] px-5 py-3 hover:bg-surface-container/20 transition-colors items-center">
                <span className="flex items-center gap-2 text-sm font-medium text-on-surface">
                  <Database className="size-3.5 text-on-surface-variant/40 shrink-0" />
                  {t.table}
                </span>
                <span className="text-sm font-mono text-on-surface-variant">{t.rows.toLocaleString()}</span>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden max-w-40">
                  <div className="h-full bg-ds-secondary rounded-full"
                    style={{ width: `${Math.max(2, Math.min(100, (t.rows / maxRows) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Special Users Tab ─────────────────────────────────────────────────────────

interface SearchedUser {
  id: string; email: string; full_name: string | null
  plan: string; plan_grant_expires_at: string | null; plan_grant_note: string | null
}

function SpecialUsersTab({ activeGrants, onRefresh }: { activeGrants: Grant[]; onRefresh: () => void }) {
  const [email, setEmail]         = useState('')
  const [searching, setSearching] = useState(false)
  const [found, setFound]         = useState<SearchedUser | null>(null)
  const [noResult, setNoResult]   = useState(false)
  const [grantPlan, setGrantPlan] = useState<'pro' | 'business'>('pro')
  const [months, setMonths]       = useState(3)
  const [note, setNote]           = useState('')
  const [granting, setGranting]   = useState(false)
  const [revoking, setRevoking]   = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSearching(true); setFound(null); setNoResult(false)
    try {
      const res = await fetch(`/api/admin/search-user?email=${encodeURIComponent(email.trim())}`)
      if (res.ok) setFound(await res.json())
      else setNoResult(true)
    } catch { setNoResult(true) }
    finally { setSearching(false) }
  }

  async function handleGrant() {
    if (!found) return
    setGranting(true)
    try {
      const res = await fetch('/api/admin/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: found.id, plan: grantPlan, months, note: note || null }),
      })
      if (res.ok) {
        toast.success(`Granted ${grantPlan} plan to ${found.email}`)
        setFound(null); setEmail(''); setNote('')
        onRefresh()
      } else {
        const d = await res.json()
        toast.error(d.error ?? 'Failed to grant')
      }
    } catch { toast.error('Network error') }
    finally { setGranting(false) }
  }

  async function handleRevoke(userId: string, userEmail: string) {
    setRevoking(userId)
    try {
      const res = await fetch('/api/admin/grant', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        toast.success(`Revoked grant for ${userEmail}`)
        onRefresh()
      } else {
        const d = await res.json()
        toast.error(d.error ?? 'Failed to revoke')
      }
    } catch { toast.error('Network error') }
    finally { setRevoking(null) }
  }

  return (
    <div className="space-y-7">
      {/* Grant panel */}
      <div>
        <SectionTitle>Grant Special Access</SectionTitle>
        <div className="bg-white rounded-xl border border-outline-variant/20 shadow-sm p-5 space-y-4">
          <p className="text-sm text-on-surface-variant">
            Search a registered user by email and grant them free Pro or Business access for UAT testing or early-adopter offers.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/40 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="h-9 w-full pl-9 pr-3 rounded-md border border-outline-variant/60 text-sm bg-white focus:border-ds-secondary focus:ring-2 focus:ring-ds-secondary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/40"
              />
            </div>
            <button type="submit" disabled={searching || !email.trim()}
              className="h-9 px-4 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors disabled:opacity-40 flex items-center gap-2 shadow-sm">
              {searching ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
              Search
            </button>
          </form>

          {noResult && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <X className="size-3.5" /> No registered user found with that email.
            </p>
          )}

          {/* Result card */}
          {found && (
            <div className="border border-outline-variant/30 rounded-lg overflow-hidden">
              {/* User header */}
              <div className="flex items-start justify-between px-4 py-3 bg-surface-container/30 border-b border-outline-variant/15">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-on-surface">{found.full_name ?? <span className="italic text-on-surface-variant/60 font-normal">No name set</span>}</p>
                  <p className="text-xs font-mono text-on-surface-variant">{found.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <PlanBadge plan={found.plan} />
                    {found.plan_grant_expires_at && (
                      <span className="text-[11px] text-amber-600 font-medium">
                        Active grant — expires {fmtDate(found.plan_grant_expires_at)}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setFound(null)} className="size-6 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
                  <X className="size-3.5" />
                </button>
              </div>

              {/* Grant form */}
              <div className="px-4 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">Plan</label>
                    <select value={grantPlan} onChange={e => setGrantPlan(e.target.value as 'pro' | 'business')}
                      className="h-8 w-full px-3 rounded-md border border-outline-variant/60 text-sm bg-white focus:border-ds-secondary focus:ring-2 focus:ring-ds-secondary/20 focus:outline-none transition-all">
                      <option value="pro">Pro</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1.5">Duration</label>
                    <select value={months} onChange={e => setMonths(Number(e.target.value))}
                      className="h-8 w-full px-3 rounded-md border border-outline-variant/60 text-sm bg-white focus:border-ds-secondary focus:ring-2 focus:ring-ds-secondary/20 focus:outline-none transition-all">
                      <option value={1}>1 month</option>
                      <option value={3}>3 months</option>
                      <option value={6}>6 months</option>
                      <option value={12}>12 months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-on-surface block mb-1.5">Note <span className="text-on-surface-variant/40 font-normal">(optional)</span></label>
                  <input type="text" value={note} onChange={e => setNote(e.target.value)}
                    placeholder="e.g. UAT tester, early adopter…"
                    className="h-8 w-full px-3 rounded-md border border-outline-variant/60 text-sm bg-white focus:border-ds-secondary focus:ring-2 focus:ring-ds-secondary/20 focus:outline-none transition-all placeholder:text-on-surface-variant/40" />
                </div>

                <button onClick={handleGrant} disabled={granting}
                  className="flex items-center gap-2 h-9 px-4 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors disabled:opacity-40 shadow-sm">
                  {granting ? <Loader2 className="size-3.5 animate-spin" /> : <Star className="size-3.5" />}
                  Grant {grantPlan.charAt(0).toUpperCase() + grantPlan.slice(1)} · {months} month{months !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active grants table */}
      <div>
        <SectionTitle>Active Grants ({activeGrants.length})</SectionTitle>
        <div className="rounded-xl border border-outline-variant/20 bg-white shadow-sm overflow-hidden">
          {activeGrants.length === 0 ? (
            <Empty message="No active grants" />
          ) : (
            <>
              <div className="grid grid-cols-[1fr_minmax(0,200px)_80px_140px_1fr_80px] px-5 py-2.5 bg-surface-container/50 border-b border-outline-variant/15">
                {['User', 'Email', 'Plan', 'Expires', 'Note', ''].map((h, i) => (
                  <p key={i} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</p>
                ))}
              </div>
              <div className="divide-y divide-outline-variant/10">
                {activeGrants.map(g => (
                  <div key={g.id} className="grid grid-cols-[1fr_minmax(0,200px)_80px_140px_1fr_80px] px-5 py-3 hover:bg-surface-container/20 transition-colors items-center">
                    <p className="text-sm font-semibold text-on-surface truncate">{g.name ?? '—'}</p>
                    <p className="text-xs font-mono text-on-surface-variant truncate pr-3">{g.email}</p>
                    <PlanBadge plan={g.plan} />
                    <p className="text-xs font-medium text-amber-600">{fmtDate(g.expiresAt)}</p>
                    <p className="text-xs text-on-surface-variant truncate pr-3">{g.note ?? '—'}</p>
                    <button
                      onClick={() => handleRevoke(g.id, g.email)}
                      disabled={revoking === g.id}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors flex items-center gap-1">
                      {revoking === g.id ? <Loader2 className="size-3 animate-spin" /> : 'Revoke'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

export default function AdminDashboard({ data, adminEmail }: { data: AdminData; adminEmail: string }) {
  const [tab, setTab] = useState<Tab>('Overview')
  const router = useRouter()

  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Header — matches dashboard header style */}
      <header className="sticky top-0 z-20 h-14 border-b border-outline-variant/15 bg-white/95 backdrop-blur-sm flex items-center">
        <div className="w-full max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="PortalKit" width={26} height={26} className="rounded-md" />
            <span className="text-sm font-bold text-on-surface">PortalKit</span>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
              <Shield className="size-2.5" /> Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs text-on-surface-variant font-mono">{adminEmail}</span>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-outline-variant/60 text-xs font-medium text-on-surface hover:bg-surface-container transition-colors">
              <LogOut className="size-3.5" /> Dashboard
              <ChevronRight className="size-3 opacity-40" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab navigation — sticky below header */}
      <div className="sticky top-14 z-10 border-b border-outline-variant/15 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex gap-0.5 -mb-px overflow-x-auto">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn(
                  'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  tab === t
                    ? 'border-ds-secondary text-ds-secondary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface',
                )}>
                {t}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-8 py-7">
        {tab === 'Overview'      && <OverviewTab data={data} />}
        {tab === 'Users'         && <UsersTab recentUsers={data.recentUsers} />}
        {tab === 'Revenue'       && <RevenueTab data={data} />}
        {tab === 'Resources'     && <ResourcesTab data={data} />}
        {tab === 'Special Users' && (
          <SpecialUsersTab activeGrants={data.activeGrants} onRefresh={() => router.refresh()} />
        )}
      </main>
    </div>
  )
}
