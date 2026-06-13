import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap, Lock, Star } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/service'
import { WaitlistForm } from './waitlist-form'

export const metadata: Metadata = {
  title: 'Founding Member — PortalKit',
  description: 'Lock in 40% off PortalKit forever. Only 20 founding member spots available.',
}

const FOUNDING_MEMBER_LIMIT = 20

const BENEFITS = [
  { icon: Zap, text: '40% off Pro or Business, forever — applied automatically at checkout' },
  { icon: Star, text: 'Early access before public launch' },
  { icon: Lock, text: 'Price locked in even if we raise rates later' },
]

export default async function FoundingMemberPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>
}) {
  const { source = 'founding-member-page' } = await searchParams

  const service = createServiceClient()
  const { count } = await service
    .from('waitlist')
    .select('id', { count: 'exact', head: true })

  const spotsUsed = count ?? 0
  const spotsRemaining = Math.max(0, FOUNDING_MEMBER_LIMIT - spotsUsed)
  const pctFilled = Math.min(100, Math.round((spotsUsed / FOUNDING_MEMBER_LIMIT) * 100))
  const isSoldOut = spotsRemaining === 0

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: 'linear-gradient(135deg, #0038a8 0%, #0051d5 40%, #001f6b 100%)' }}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-[500px] rounded-full bg-white opacity-[0.04]" />
        <div className="absolute -bottom-32 -left-32 size-[400px] rounded-full bg-white opacity-[0.03]" />
      </div>

      <div className="relative w-full max-w-lg">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/" className="text-white font-extrabold text-2xl tracking-tight hover:opacity-80 transition-opacity">
            PortalKit
          </Link>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Early access — founding member pricing
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Lock in 40% off,<br />forever.
        </h1>
        <p className="text-center text-white/60 text-lg mb-8 leading-relaxed">
          Be one of 20 freelancers who get founding member pricing on PortalKit — the client portal built for professionals.
        </p>

        {/* Counter + progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Founding member spots</span>
            {isSoldOut ? (
              <span className="text-red-400 text-sm font-semibold">Sold out</span>
            ) : (
              <span className="text-white font-bold text-sm">
                {spotsRemaining} of {FOUNDING_MEMBER_LIMIT} remaining
              </span>
            )}
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-all"
              style={{ width: `${pctFilled}%` }}
            />
          </div>
          {!isSoldOut && spotsRemaining <= 5 && (
            <p className="text-amber-300 text-xs mt-2 text-center font-medium">
              Only {spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} left — don&apos;t miss out.
            </p>
          )}
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm p-6 sm:p-8 mb-8">
          {isSoldOut ? (
            <div className="text-center py-4">
              <p className="text-white font-semibold text-lg mb-2">All founding member spots are claimed.</p>
              <p className="text-white/55 text-sm mb-6">
                Join the waitlist and we&apos;ll notify you when PortalKit launches with a special early-adopter offer.
              </p>
              <WaitlistForm source={source} initialSpotsRemaining={0} />
            </div>
          ) : (
            <WaitlistForm source={source} initialSpotsRemaining={spotsRemaining} />
          )}
        </div>

        {/* Benefits */}
        <ul className="flex flex-col gap-3 mb-10">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <div className="size-6 rounded-md bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="size-3.5 text-white" />
              </div>
              <span className="text-white/75 text-sm leading-snug">{text}</span>
            </li>
          ))}
        </ul>

        {/* Footer note */}
        <p className="text-center text-white/30 text-xs leading-relaxed">
          By joining you agree to our{' '}
          <Link href="/terms" className="underline hover:text-white/60 transition-colors">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-white/60 transition-colors">Privacy Policy</Link>.
          {' '}Discount applies when you create your account using this email.
        </p>

      </div>
    </div>
  )
}
