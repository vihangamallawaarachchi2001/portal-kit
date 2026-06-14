'use client'

import { cn } from '@/lib/utils'
import {
  ArrowRight, Camera, Check, ChevronDown, FileText,
  Layers, Loader2, Lock, Upload, Users, Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveProfile, uploadAvatarToStorage, finishOnboarding } from './onboard-actions'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

const CURRENCIES: { code: string; label: string }[] = [
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'USD', label: 'United States Dollar' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'EUR', label: 'Euro' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'NZD', label: 'New Zealand Dollar' },
  { code: 'SGD', label: 'Singapore Dollar' },
  { code: 'AED', label: 'UAE Dirham' },
  { code: 'AFN', label: 'Afghan Afghani' },
  { code: 'ALL', label: 'Albanian Lek' },
  { code: 'AMD', label: 'Armenian Dram' },
  { code: 'ANG', label: 'Netherlands Antillean Guilder' },
  { code: 'AOA', label: 'Angolan Kwanza' },
  { code: 'ARS', label: 'Argentine Peso' },
  { code: 'AWG', label: 'Aruban Florin' },
  { code: 'AZN', label: 'Azerbaijani Manat' },
  { code: 'BAM', label: 'Bosnia-Herzegovina Mark' },
  { code: 'BBD', label: 'Barbadian Dollar' },
  { code: 'BDT', label: 'Bangladeshi Taka' },
  { code: 'BGN', label: 'Bulgarian Lev' },
  { code: 'BIF', label: 'Burundian Franc' },
  { code: 'BMD', label: 'Bermudian Dollar' },
  { code: 'BND', label: 'Brunei Dollar' },
  { code: 'BOB', label: 'Bolivian Boliviano' },
  { code: 'BRL', label: 'Brazilian Real' },
  { code: 'BSD', label: 'Bahamian Dollar' },
  { code: 'BWP', label: 'Botswanan Pula' },
  { code: 'BYN', label: 'Belarusian Ruble' },
  { code: 'BZD', label: 'Belize Dollar' },
  { code: 'CDF', label: 'Congolese Franc' },
  { code: 'CHF', label: 'Swiss Franc' },
  { code: 'CLP', label: 'Chilean Peso' },
  { code: 'CNY', label: 'Chinese Yuan' },
  { code: 'COP', label: 'Colombian Peso' },
  { code: 'CRC', label: 'Costa Rican Colón' },
  { code: 'CVE', label: 'Cape Verdean Escudo' },
  { code: 'CZK', label: 'Czech Koruna' },
  { code: 'DJF', label: 'Djiboutian Franc' },
  { code: 'DKK', label: 'Danish Krone' },
  { code: 'DOP', label: 'Dominican Peso' },
  { code: 'DZD', label: 'Algerian Dinar' },
  { code: 'EGP', label: 'Egyptian Pound' },
  { code: 'ETB', label: 'Ethiopian Birr' },
  { code: 'FJD', label: 'Fijian Dollar' },
  { code: 'FKP', label: 'Falkland Islands Pound' },
  { code: 'GEL', label: 'Georgian Lari' },
  { code: 'GIP', label: 'Gibraltar Pound' },
  { code: 'GMD', label: 'Gambian Dalasi' },
  { code: 'GNF', label: 'Guinean Franc' },
  { code: 'GTQ', label: 'Guatemalan Quetzal' },
  { code: 'GYD', label: 'Guyanese Dollar' },
  { code: 'HKD', label: 'Hong Kong Dollar' },
  { code: 'HNL', label: 'Honduran Lempira' },
  { code: 'HTG', label: 'Haitian Gourde' },
  { code: 'HUF', label: 'Hungarian Forint' },
  { code: 'IDR', label: 'Indonesian Rupiah' },
  { code: 'ILS', label: 'Israeli New Shekel' },
  { code: 'INR', label: 'Indian Rupee' },
  { code: 'ISK', label: 'Icelandic Króna' },
  { code: 'JMD', label: 'Jamaican Dollar' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'KES', label: 'Kenyan Shilling' },
  { code: 'KGS', label: 'Kyrgyzstani Som' },
  { code: 'KHR', label: 'Cambodian Riel' },
  { code: 'KMF', label: 'Comorian Franc' },
  { code: 'KRW', label: 'South Korean Won' },
  { code: 'KYD', label: 'Cayman Islands Dollar' },
  { code: 'KZT', label: 'Kazakhstani Tenge' },
  { code: 'LAK', label: 'Laotian Kip' },
  { code: 'LBP', label: 'Lebanese Pound' },
  { code: 'LKR', label: 'Sri Lankan Rupee' },
  { code: 'LRD', label: 'Liberian Dollar' },
  { code: 'LSL', label: 'Lesotho Loti' },
  { code: 'MAD', label: 'Moroccan Dirham' },
  { code: 'MDL', label: 'Moldovan Leu' },
  { code: 'MGA', label: 'Malagasy Ariary' },
  { code: 'MKD', label: 'Macedonian Denar' },
  { code: 'MMK', label: 'Myanmar Kyat' },
  { code: 'MNT', label: 'Mongolian Tögrög' },
  { code: 'MOP', label: 'Macanese Pataca' },
  { code: 'MUR', label: 'Mauritian Rupee' },
  { code: 'MVR', label: 'Maldivian Rufiyaa' },
  { code: 'MWK', label: 'Malawian Kwacha' },
  { code: 'MXN', label: 'Mexican Peso' },
  { code: 'MYR', label: 'Malaysian Ringgit' },
  { code: 'MZN', label: 'Mozambican Metical' },
  { code: 'NAD', label: 'Namibian Dollar' },
  { code: 'NGN', label: 'Nigerian Naira' },
  { code: 'NIO', label: 'Nicaraguan Córdoba' },
  { code: 'NOK', label: 'Norwegian Krone' },
  { code: 'NPR', label: 'Nepalese Rupee' },
  { code: 'PAB', label: 'Panamanian Balboa' },
  { code: 'PEN', label: 'Peruvian Sol' },
  { code: 'PGK', label: 'Papua New Guinean Kina' },
  { code: 'PHP', label: 'Philippine Peso' },
  { code: 'PKR', label: 'Pakistani Rupee' },
  { code: 'PLN', label: 'Polish Złoty' },
  { code: 'PYG', label: 'Paraguayan Guaraní' },
  { code: 'QAR', label: 'Qatari Riyal' },
  { code: 'RON', label: 'Romanian Leu' },
  { code: 'RSD', label: 'Serbian Dinar' },
  { code: 'RUB', label: 'Russian Ruble' },
  { code: 'RWF', label: 'Rwandan Franc' },
  { code: 'SAR', label: 'Saudi Riyal' },
  { code: 'SBD', label: 'Solomon Islands Dollar' },
  { code: 'SCR', label: 'Seychellois Rupee' },
  { code: 'SEK', label: 'Swedish Krona' },
  { code: 'SHP', label: 'Saint Helenian Pound' },
  { code: 'SLE', label: 'Sierra Leonean Leone' },
  { code: 'SOS', label: 'Somali Shilling' },
  { code: 'SRD', label: 'Surinamese Dollar' },
  { code: 'SZL', label: 'Swazi Lilangeni' },
  { code: 'THB', label: 'Thai Baht' },
  { code: 'TJS', label: 'Tajikistani Somoni' },
  { code: 'TOP', label: 'Tongan Paʻanga' },
  { code: 'TRY', label: 'Turkish Lira' },
  { code: 'TTD', label: 'Trinidad & Tobago Dollar' },
  { code: 'TWD', label: 'New Taiwan Dollar' },
  { code: 'TZS', label: 'Tanzanian Shilling' },
  { code: 'UAH', label: 'Ukrainian Hryvnia' },
  { code: 'UGX', label: 'Ugandan Shilling' },
  { code: 'UYU', label: 'Uruguayan Peso' },
  { code: 'UZS', label: 'Uzbekistani Som' },
  { code: 'VND', label: 'Vietnamese Đồng' },
  { code: 'VUV', label: 'Vanuatu Vatu' },
  { code: 'WST', label: 'Samoan Tala' },
  { code: 'XAF', label: 'Central African CFA Franc' },
  { code: 'XCD', label: 'East Caribbean Dollar' },
  { code: 'XOF', label: 'West African CFA Franc' },
  { code: 'XPF', label: 'CFP Franc' },
  { code: 'YER', label: 'Yemeni Rial' },
  { code: 'ZAR', label: 'South African Rand' },
  { code: 'ZMW', label: 'Zambian Kwacha' },
]

const PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    features: ['1 active client portal', '3 file uploads', 'Invoice payments', 'PortalKit branding'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: { monthly: 15, annual: 12.5 },
    features: ['Unlimited client portals', '5 GB file storage', 'Remove PortalKit branding', 'PDF invoices', 'Priority support'],
    popular: true,
  },
  {
    id: 'business' as const,
    name: 'Business',
    price: { monthly: 29, annual: 24 },
    features: ['Everything in Pro', '20 GB storage', 'White-label portal', 'Weekly digest emails', 'Dedicated support'],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawStep = parseInt(searchParams.get('step') ?? '0', 10)
  const initialStep = isNaN(rawStep) ? 0 : Math.min(Math.max(rawStep, 0), 2)

  // ── Step state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState(initialStep)

  // ── Step 0: Profile fields ────────────────────────────────────────────────
  const [fullName, setFullName]             = useState('')
  const [businessName, setBusinessName]     = useState('')
  const [tagline, setTagline]               = useState('')
  const [currency, setCurrency]             = useState('')
  const [avatarUrl, setAvatarUrl]           = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview]   = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Step 1: Plan selection ────────────────────────────────────────────────
  const [billing, setBilling]       = useState<'monthly' | 'annual'>('monthly')
  const [planLoading, setPlanLoading] = useState<string | null>(null)

  // ── Step 2: Client creation ───────────────────────────────────────────────
  const [clientName, setClientName]   = useState('')
  const [clientEmail, setClientEmail] = useState('')

  // ── Shared ────────────────────────────────────────────────────────────────
  const [error, setError]            = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Live preview values (step 0)
  const displayName     = fullName.trim() || 'Your Name'
  const displayBusiness = businessName.trim() || null
  const displayInitials = displayName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const portalSlug      = toSlug(fullName || 'yourname')

  // ── Avatar upload ─────────────────────────────────────────────────────────
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarUploading(true)
    try {
      const url = await uploadAvatarToStorage(file)
      setAvatarUrl(url)
    } catch {
      setAvatarUrl(null)
    } finally {
      setAvatarUploading(false)
    }
  }

  // ── Step 0: save profile + advance ───────────────────────────────────────
  async function handleStep0() {
    if (!fullName.trim()) { setError('Please enter your name.'); return }
    setError(null)
    startTransition(async () => {
      try {
        await saveProfile({
          fullName,
          businessName: businessName || undefined,
          tagline: tagline || undefined,
          avatarUrl: avatarUrl ?? undefined,
          baseCurrency: currency || undefined,
        })
        setStep(1)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  // ── Step 1: free → advance; paid → Stripe Checkout ───────────────────────
  async function handleSelectPlan(planId: string) {
    setError(null)
    if (planId === 'free') {
      setStep(2)
      return
    }
    setPlanLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, billing, successUrl: '/onboarding?step=2' }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? 'Failed to start checkout.')
      }
      const { url } = await res.json()
      window.location.href = url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setPlanLoading(null)
    }
  }

  // ── Step 2: create first client + finish ─────────────────────────────────
  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault()
    if (!clientName.trim()) { setError('Client name is required.'); return }
    setError(null)
    startTransition(async () => {
      try {
        const slug = toSlug(clientName) || 'client'
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: clientName.trim(), email: clientEmail.trim(), portal_slug: slug }),
        })

        let clientId: string | null = null
        if (res.ok) {
          clientId = (await res.json()).id
        } else if (res.status === 409) {
          const slugFallback = `${slug}-${Date.now().toString(36)}`
          const retry = await fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: clientName.trim(), email: clientEmail.trim(), portal_slug: slugFallback }),
          })
          if (retry.ok) clientId = (await retry.json()).id
          else throw new Error('Could not create client. Please try again.')
        } else {
          const d = await res.json()
          throw new Error(d.error ?? 'Failed to create client.')
        }

        await finishOnboarding()
        await createClient().auth.refreshSession()
        router.push(clientId ? `/dashboard/clients/${clientId}` : '/dashboard')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  // ── Step 2: skip ─────────────────────────────────────────────────────────
  async function handleSkipClient() {
    setError(null)
    startTransition(async () => {
      try {
        await finishOnboarding()
        await createClient().auth.refreshSession()
        router.push('/dashboard')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 bg-surface/80 backdrop-blur-sm z-10 border-b border-outline-variant">
        <div className="flex items-center justify-between px-8 py-3.5 max-w-6xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex items-center justify-center size-8 rounded-md bg-ds-secondary shrink-0">
              <Layers className="size-4.5 text-white" strokeWidth={1.75} />
            </span>
            <span className="font-bold text-lg tracking-tight text-on-surface">PortalKit</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant tabular-nums">Step {step + 1} of 3</span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    step >= i ? 'w-8 bg-ds-secondary' : 'w-5 bg-outline-variant'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Step 0: Profile Setup ─────────────────────────────────────────── */}
      {step === 0 && (
        <main className="max-w-6xl mx-auto w-full px-8 py-14 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-14 lg:gap-20 items-start">

          {/* Form */}
          <div className="flex flex-col gap-8 max-w-lg">
            <div className="flex flex-col gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ds-secondary/10 border border-ds-secondary/20 w-fit text-xs font-semibold text-ds-secondary">
                <span className="size-1.5 rounded-full bg-ds-secondary inline-block" />
                Getting started
              </span>
              <h1 className="text-[1.85rem] font-bold text-on-surface tracking-tight leading-[1.2]">
                Set up your profile
              </h1>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                This is how you and your business appear across portals, invoices, and emails.
              </p>
            </div>

            {/* Logo + name row */}
            <div className="flex items-start gap-5">
              {/* Avatar uploader */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative size-20 rounded-full border-2 border-dashed border-outline-variant hover:border-ds-secondary/50 bg-surface-container-low transition-colors overflow-hidden group"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-1">
                      <Camera className="size-5 text-on-surface-variant group-hover:text-ds-secondary transition-colors" />
                    </div>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-surface/60 flex items-center justify-center">
                      <Loader2 className="size-4 animate-spin text-ds-secondary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="size-4 text-white" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <p className="text-[10px] text-on-surface-variant text-center leading-tight">Logo /<br />photo</p>
              </div>

              {/* Name + business name */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="full-name" className="font-semibold text-on-surface text-sm">
                    Your name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={e => { setFullName(e.target.value); setError(null) }}
                    onKeyDown={e => e.key === 'Enter' && handleStep0()}
                    autoFocus
                    className="h-10"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="business-name" className="font-semibold text-on-surface text-sm">
                    Business name <span className="text-xs text-on-surface-variant font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="business-name"
                    type="text"
                    placeholder="Jane Smith Design"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Tagline + currency */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tagline" className="font-semibold text-on-surface text-sm">
                    Tagline <span className="text-xs text-on-surface-variant font-normal">(optional)</span>
                  </Label>
                  <span className="text-[11px] text-on-surface-variant tabular-nums">{tagline.length}/120</span>
                </div>
                <Input
                  id="tagline"
                  type="text"
                  placeholder="Crafting digital experiences that convert"
                  value={tagline}
                  onChange={e => setTagline(e.target.value.slice(0, 120))}
                  className="h-10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currency" className="font-semibold text-on-surface text-sm">
                  Base currency <span className="text-xs text-on-surface-variant font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <select
                    id="currency"
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm text-on-surface appearance-none outline-none focus:ring-2 focus:ring-ring cursor-pointer transition-colors"
                  >
                    <option value="">Select currency…</option>
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} — {c.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant pointer-events-none" />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleStep0}
                disabled={isPending || avatarUploading}
                className="w-full h-11 rounded-xl bg-ds-secondary hover:bg-ds-secondary-container text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isPending ? <><Loader2 className="size-4 animate-spin" />Saving…</> : 'Continue →'}
              </button>
              <div className="flex items-center justify-center gap-1.5">
                <Lock className="size-3 text-on-surface-variant" />
                <p className="text-xs text-on-surface-variant">Your data is encrypted and never shared</p>
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="sticky top-24 hidden lg:flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ds-tertiary-action opacity-60" />
                <span className="relative inline-flex rounded-full size-2 bg-ds-tertiary-action" />
              </span>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Live Preview</p>
            </div>
            <div className="rounded-2xl bg-surface-container-low border border-outline-variant p-4">
              <div className="rounded-xl overflow-hidden border border-outline-variant/70 shadow-md">
                {/* Browser chrome */}
                <div className="bg-surface-container-high flex items-center gap-3 px-3 py-2.5 border-b border-outline-variant/50">
                  <div className="flex items-center gap-1.25 shrink-0">
                    <div className="size-2.5 rounded-full bg-ds-error/60" />
                    <div className="size-2.5 rounded-full bg-amber-400/60" />
                    <div className="size-2.5 rounded-full bg-ds-tertiary-action/60" />
                  </div>
                  <div className="flex-1 bg-surface-container rounded-md px-2.5 py-1 text-[10px] text-on-surface-variant font-medium">
                    portalkit.app/{portalSlug}
                  </div>
                </div>
                {/* Portal header */}
                <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0051d5 0%, #316bf3 100%)' }}>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl overflow-hidden ring-2 ring-white/25 shrink-0 bg-white/15">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                          {displayInitials}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm leading-snug">
                        {displayBusiness ?? displayName}
                      </p>
                      {displayBusiness && (
                        <p className="text-white/70 text-[11px] leading-tight">{displayName}</p>
                      )}
                      {tagline.trim() ? (
                        <p className="text-white/50 text-[10px] leading-tight mt-0.5 max-w-48 truncate">{tagline}</p>
                      ) : !displayBusiness ? (
                        <p className="text-white/60 text-[11px]">Client portal</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                {/* Portal body */}
                <div className="bg-surface px-4 py-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-on-surface">Welcome back 👋</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      Here&apos;s your snapshot with {displayBusiness ?? displayName}.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-outline-variant/50 px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-ds-secondary/10 flex items-center justify-center shrink-0">
                        <FileText className="size-3.5 text-ds-secondary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-on-surface leading-tight">Website Redesign</p>
                        <p className="text-[9px] text-on-surface-variant">INV-001 · Due Jun 15</p>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Pending</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-center text-on-surface-variant">Preview updates as you type</p>
          </div>

        </main>
      )}

      {/* ── Step 1: Plan Selection ─────────────────────────────────────────── */}
      {step === 1 && (
        <main className="max-w-5xl mx-auto w-full px-8 py-14 flex flex-col gap-10">

          <div className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ds-secondary/10 border border-ds-secondary/20 w-fit text-xs font-semibold text-ds-secondary">
              <span className="size-1.5 rounded-full bg-ds-secondary inline-block" />
              Choose your plan
            </span>
            <h1 className="text-[1.85rem] font-bold text-on-surface tracking-tight leading-[1.2]">
              Start free, upgrade anytime
            </h1>
            <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
              No credit card required for the free plan. Upgrade at any time from Settings.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center">
            <div className="flex items-center bg-surface-container border border-outline-variant rounded-lg p-0.5">
              {(['monthly', 'annual'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setBilling(p)}
                  className={cn(
                    'px-4 py-1.5 rounded-md text-xs font-semibold transition-all',
                    billing === p
                      ? 'bg-white text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  )}
                >
                  {p === 'monthly' ? 'Monthly' : 'Annual · 20% off'}
                </button>
              ))}
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PLANS.map(p => (
              <div
                key={p.id}
                className={cn(
                  'relative rounded-xl border-2 p-6 flex flex-col gap-5',
                  p.popular
                    ? 'border-ds-secondary shadow-lg shadow-ds-secondary/10'
                    : 'border-outline-variant'
                )}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-ds-secondary px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                      <Zap className="size-2.5" /> Popular
                    </span>
                  </div>
                )}

                <div>
                  <p className="font-extrabold text-on-surface text-lg">{p.name}</p>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-3xl font-extrabold text-on-surface">
                      ${billing === 'annual' ? p.price.annual : p.price.monthly}
                    </span>
                    <span className="text-sm text-on-surface-variant">/mo</span>
                  </div>
                  {billing === 'annual' && p.price.annual > 0 && (
                    <p className="text-xs text-ds-tertiary-action font-semibold mt-0.5">
                      Billed ${(p.price.annual * 12).toFixed(0)}/year
                    </p>
                  )}
                  {p.id === 'free' && (
                    <p className="text-xs text-on-surface-variant mt-0.5">Free forever</p>
                  )}
                </div>

                <ul className="flex flex-col gap-2.5 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-on-surface">
                      <Check className="size-4 text-ds-secondary shrink-0 mt-0.5" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(p.id)}
                  disabled={planLoading !== null}
                  className={cn(
                    'h-10 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60',
                    p.popular
                      ? 'bg-ds-secondary text-white hover:bg-ds-secondary-container shadow-sm'
                      : p.id === 'free'
                      ? 'border-2 border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
                      : 'border-2 border-ds-secondary/30 text-ds-secondary hover:bg-ds-secondary/5'
                  )}
                >
                  {planLoading === p.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : p.id === 'free' ? (
                    <>Continue free <ArrowRight className="size-3.5" /></>
                  ) : (
                    <>Choose {p.name} <ArrowRight className="size-3.5" /></>
                  )}
                </button>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <p className="text-center text-xs text-on-surface-variant">
            You can change your plan at any time from{' '}
            <span className="font-medium text-on-surface">Settings → Billing</span>.
          </p>

        </main>
      )}

      {/* ── Step 2: Create First Client ───────────────────────────────────── */}
      {step === 2 && (
        <main className="flex-1 flex items-center justify-center px-8 py-14">
          <div className="w-full max-w-md flex flex-col gap-8">

            <div className="flex flex-col items-center gap-4 text-center">
              <div className="size-16 rounded-2xl bg-ds-secondary/10 border border-ds-secondary/15 flex items-center justify-center">
                <Users className="size-8 text-ds-secondary" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">Add your first client</h1>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto">
                  Create a portal for your first client. You can share the link as soon as you&apos;re done.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateClient} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-name" className="font-semibold text-on-surface text-sm">
                  Client name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="client-name"
                  type="text"
                  placeholder="Acme Corp"
                  value={clientName}
                  onChange={e => { setClientName(e.target.value); setError(null) }}
                  autoFocus
                  className="h-10"
                />
                {clientName.trim() && (
                  <p className="text-xs text-on-surface-variant">
                    Portal URL:{' '}
                    <span className="font-mono text-ds-secondary">portalkit.app/p/{toSlug(clientName)}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="client-email" className="font-semibold text-on-surface text-sm">
                  Client email{' '}
                  <span className="text-xs text-on-surface-variant font-normal">(optional)</span>
                </Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={e => { setClientEmail(e.target.value); setError(null) }}
                  className="h-10"
                />
                <p className="text-xs text-on-surface-variant">Used to send them their portal access link.</p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 rounded-xl bg-ds-secondary hover:bg-ds-secondary-container text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isPending ? <><Loader2 className="size-4 animate-spin" />Creating portal…</> : 'Create portal →'}
              </button>
            </form>

            <div className="flex flex-col items-center">
              <button
                onClick={handleSkipClient}
                disabled={isPending}
                className="text-sm text-on-surface-variant hover:text-on-surface hover:cursor-pointer underline-offset-2 transition-colors disabled:opacity-50 px-3 py-1.5 rounded-lg hover:bg-surface-container-low"
              >
                I&apos;ll do this later → go to dashboard
              </button>
            </div>

          </div>
        </main>
      )}

    </div>
  )
}
