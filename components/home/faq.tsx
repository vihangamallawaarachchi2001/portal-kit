import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    question: 'What exactly is PortalKit?',
    answer:
      "PortalKit is a client portal platform for freelancers and small agencies. Instead of managing projects through email, you get a professional, branded portal where clients can view deliverables, approve files, pay invoices, and send messages — all in one place.",
  },
  {
    question: 'Do my clients need to create an account?',
    answer:
      "No. Clients access their portal through a unique, secure link you send them. No login, no password, no friction. They click the link and see everything you've shared with them.",
  },
  {
    question: 'Can I use my own domain name?',
    answer:
      "Yes, on Pro and Business plans. You can map a custom subdomain (e.g., clients.yourbrand.com) so the portal feels entirely like your own product — PortalKit is completely invisible.",
  },
  {
    question: 'Does PortalKit integrate with Stripe or PayPal?',
    answer:
      "Yes. Connect your Stripe or PayPal account to send invoices directly through the portal. Clients pay without ever leaving the portal, and you're notified the moment a payment lands.",
  },
  {
    question: "Is my clients' data secure?",
    answer:
      "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Portal sessions use time-limited, cryptographically signed tokens — no passwords stored client-side. We undergo regular third-party security audits.",
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer:
      "Yes, absolutely. No long-term contracts, no cancellation fees. If you cancel, your account stays active until the end of the billing period and you can export all your data at any time.",
  },
  {
    question: 'What happens to my portals if I downgrade to Free?',
    answer:
      "Your data is never deleted. Portals above the Free tier limit become read-only. Upgrade at any time to restore full access instantly. Nothing is lost.",
  },
]

export default function FAQ() {
  return (
    <section className="bg-surface py-24 px-6" id="faq">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* Left: sticky header */}
          <div className="lg:w-72 shrink-0 lg:sticky lg:top-24 lg:self-start space-y-5">
            <p className="text-sm font-semibold uppercase tracking-widest text-ds-secondary">
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-on-surface leading-snug">
              Questions &amp;
              <br />answers
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Still have questions?{' '}
              <a
                href="/contact"
                className="text-ds-secondary underline-offset-4 decoration-ds-secondary/40 hover:underline"
              >
                Talk to our team
              </a>
              {' '}— we reply within one business day.
            </p>

            {/* Decorative line */}
            <div className="hidden lg:block w-8 h-px bg-outline-variant" />
          </div>

          {/* Right: accordion */}
          <div className="flex-1 divide-y divide-outline-variant">
            {FAQS.map(({ question, answer }) => (
              <details key={question} className="group py-1">
                <summary className="flex cursor-pointer list-none select-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-base font-medium text-on-surface group-open:text-ds-secondary transition-colors duration-150 leading-snug">
                    {question}
                  </span>
                  <ChevronDown
                    size={18}
                    strokeWidth={2}
                    className="shrink-0 mt-0.5 text-on-surface-variant transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <div className="pb-6">
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {answer}
                  </p>
                </div>
              </details>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
