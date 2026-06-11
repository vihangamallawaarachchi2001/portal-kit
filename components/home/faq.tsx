import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const FAQS = [
  {
    question: 'What exactly is PortalKit?',
    answer:
      'PortalKit is a client portal platform for freelancers and small agencies. Instead of managing projects through email, you get a professional, branded portal where clients view deliverables, approve files, pay invoices, and send messages — all in one place.',
  },
  {
    question: 'Do my clients need to create an account?',
    answer:
      "No. Clients access their portal through a unique, secure magic link you send them. No login, no password, no friction. They click the link and see everything you've shared.",
  },
  {
    question: 'Can I use my own domain name?',
    answer:
      'Yes, on Pro and Business plans. You can map a custom subdomain (e.g., clients.yourbrand.com) so the portal feels entirely like your own product — PortalKit is completely invisible.',
  },
  {
    question: 'Does PortalKit integrate with Stripe?',
    answer:
      'Yes. Connect your Stripe account to send invoices directly through the portal. Clients pay without ever leaving it, and you are notified the moment a payment lands.',
  },
  {
    question: 'Is my clients\' data secure?',
    answer:
      'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Portal sessions use time-limited, cryptographically signed tokens — no passwords stored client-side.',
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer:
      'Yes, absolutely. No long-term contracts, no cancellation fees. If you cancel, your account stays active until the end of the billing period and you can export all your data at any time.',
  },
  {
    question: 'What happens to my portals if I downgrade to Free?',
    answer:
      'Your data is never deleted. Portals above the Free tier limit become read-only. Upgrade at any time to restore full access instantly. Nothing is lost.',
  },
]

export default function FAQ() {
  return (
    <section className="bg-[#f8fafc] py-28 px-6" id="faq">
      <div className="max-w-7xl mx-auto">

        {/* ── Heading ── */}
        <div className="max-w-xl mx-auto text-center mb-14">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ds-secondary mb-4">
            FAQ
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.06] mb-5">
            Questions &amp; answers.
          </h2>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Everything you need to know before you start.
          </p>
        </div>

        {/* ── 2-column card grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {FAQS.map(({ question, answer }, i) => (
            <div
              key={question}
              className="flex flex-col gap-3 rounded-2xl bg-white border border-gray-200/80 p-7"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              {/* Number chip */}
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-[11px] font-bold text-gray-500 font-mono shrink-0 self-start">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
                {question}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {answer}
              </p>
            </div>
          ))}

          {/* 8th card — Contact CTA (fills the even grid) */}
          <div
            className="flex flex-col justify-between rounded-2xl p-7"
            style={{
              background: 'linear-gradient(135deg, #0051D5 0%, #003da6 100%)',
              boxShadow: '0 8px 32px -4px rgba(0,81,213,0.35)',
            }}
          >
            <div>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-bold font-mono shrink-0 mb-3" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                ?
              </span>
              <h3 className="text-[15px] font-bold text-white leading-snug mb-3">
                Still have questions?
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                We&apos;re a small team and we read every message. Reach out and
                expect a reply within one business day.
              </p>
            </div>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white group"
            >
              Send us a message
              <ArrowRight size={15} strokeWidth={2.5} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
