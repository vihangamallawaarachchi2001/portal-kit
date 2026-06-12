'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const TOPICS = [
  'General enquiry',
  'Billing & plans',
  'Technical issue',
  'Enterprise / Agency',
  'Security concern',
  'Feedback or ideas',
  'Other',
]

interface FormState {
  name: string
  email: string
  topic: string
  message: string
}

const EMPTY: FormState = { name: '', email: '', topic: '', message: '' }

export default function ContactForm() {
  const [form, setForm]         = useState<FormState>(EMPTY)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Unable to send your message. Please email us directly at hello@portalkit.com.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Success state ── */
  if (submitted) {
    return (
      <div
        className="rounded-2xl p-10 text-center space-y-5"
        style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 8px 24px -8px rgba(0,0,0,0.10)' }}
      >
        <div className="flex justify-center">
          <span
            className="flex items-center justify-center size-16 rounded-full"
            style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)' }}
          >
            <CheckCircle2 className="size-8" style={{ color: '#16a34a' }} strokeWidth={1.75} />
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Message sent!</h3>
          <p className="text-sm text-gray-500">
            Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''}. We&apos;ll reply to{' '}
            <span className="font-semibold text-gray-700">{form.email}</span>{' '}
            within one business day.
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setSubmitted(false) }}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    )
  }

  /* ── Form ── */
  const inputBase = `
    w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900
    placeholder:text-gray-400 outline-none transition-all
  `

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 8px 24px -8px rgba(0,0,0,0.10)',
      }}
    >
      {/* Blue top accent */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #0051D5, #3b82f6, #60a5fa)' }} />

      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Send us a message</h2>
          <p className="mt-1 text-sm text-gray-500">We read every message and reply within one business day.</p>
        </div>

        {/* Name + email row */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="contact-name">
              Full name <span className="text-red-400">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Jane Smith"
              required
              autoFocus
              className={inputBase}
              style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#0051D5'
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,81,213,0.10)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.background = '#f9fafb'
                e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)'
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700" htmlFor="contact-email">
              Work email <span className="text-red-400">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="jane@company.com"
              required
              className={inputBase}
              style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#0051D5'
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,81,213,0.10)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.background = '#f9fafb'
                e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)'
              }}
            />
          </div>
        </div>

        {/* Topic */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="contact-topic">
            What can we help with? <span className="text-red-400">*</span>
          </label>
          <select
            id="contact-topic"
            value={form.topic}
            onChange={e => set('topic', e.target.value)}
            required
            className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition-all appearance-none cursor-pointer"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              paddingRight: '36px',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#0051D5'
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,81,213,0.10)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.background = '#f9fafb'
              e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            <option value="" disabled>Select a topic…</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="contact-message">
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            id="contact-message"
            value={form.message}
            onChange={e => set('message', e.target.value)}
            placeholder="Tell us what you're working on, what you need, or what's not working…"
            required
            rows={5}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all resize-none leading-relaxed"
            style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#0051D5'
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,81,213,0.10)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.background = '#f9fafb'
              e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)'
            }}
          />
          <p className="text-[11px] text-gray-400 text-right tabular-nums">
            {form.message.length} / 2000
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl px-4 py-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || form.message.length > 2000}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all disabled:opacity-70"
          style={{
            background: '#0051D5',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(0,81,213,0.32)',
          }}
          onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#003db5' }}
          onMouseOut={e => { e.currentTarget.style.background = '#0051D5' }}
        >
          {loading ? (
            <>
              <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
              Sending…
            </>
          ) : (
            <>
              Send message
              <ArrowRight size={15} strokeWidth={2.5} />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-gray-400">
          By submitting, you agree to our{' '}
          <a href="/privacy" className="text-blue-600 hover:underline underline-offset-2">Privacy Policy</a>.
        </p>
      </form>
    </div>
  )
}
