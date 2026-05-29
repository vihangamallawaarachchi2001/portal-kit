import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { PageHero } from '@/components/public/page-hero'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn how PortalKit uses cookies and similar tracking technologies.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-on-surface">{title}</h2>
      <div className="space-y-3 text-sm text-on-surface-variant leading-relaxed">{children}</div>
    </div>
  )
}

const COOKIE_TYPES = [
  {
    name: 'Strictly necessary',
    purpose: 'Authentication session tokens, CSRF protection, security tokens',
    retention: 'Session / 90 days',
    canDisable: false,
  },
  {
    name: 'Functional',
    purpose: 'Remembering your preferences (language, theme, sidebar state)',
    retention: '12 months',
    canDisable: true,
  },
  {
    name: 'Analytics',
    purpose: 'Understanding how the platform is used to guide product improvements (anonymised)',
    retention: '13 months',
    canDisable: true,
  },
]

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        <PageHero
          eyebrow="Legal"
          headline="Cookie"
          accentLine="Policy."
          compact
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Last updated: 1 January 2025</p>
        </PageHero>

        {/* ── Legal content ─────────────────────────────────────── */}
        <section className="bg-surface py-16 px-6">
          <div className="mx-auto max-w-3xl space-y-10">

            <Section title="1. What are cookies?">
              <p>
                Cookies are small text files stored on your device when you visit a
                website. They allow the site to remember information about your visit,
                such as whether you are logged in and your preferences.
              </p>
              <p>
                Similar technologies — such as local storage, session storage, and
                pixel beacons — serve comparable purposes and are covered by this
                policy.
              </p>
            </Section>

            <Section title="2. How we use cookies">
              <p>
                PortalKit uses cookies to:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1">
                <li>Keep you signed in to your account across browser sessions</li>
                <li>Protect against cross-site request forgery (CSRF) attacks</li>
                <li>Remember your interface preferences</li>
                <li>Understand how the platform is used so we can improve it</li>
              </ul>
              <p>
                We do not use cookies for advertising or cross-site tracking.
              </p>
            </Section>

            <Section title="3. Types of cookies we use">
              <div className="rounded-xl border border-outline-variant overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low">
                      <th className="text-left px-4 py-3 font-semibold text-on-surface">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-on-surface">Purpose</th>
                      <th className="text-left px-4 py-3 font-semibold text-on-surface">Retention</th>
                      <th className="text-left px-4 py-3 font-semibold text-on-surface">Optional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COOKIE_TYPES.map(({ name, purpose, retention, canDisable }, i) => (
                      <tr key={name} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'}>
                        <td className="px-4 py-3 font-medium text-on-surface whitespace-nowrap">{name}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{purpose}</td>
                        <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{retention}</td>
                        <td className="px-4 py-3">
                          {canDisable ? (
                            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Yes</span>
                          ) : (
                            <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="4. Third-party cookies">
              <p>
                The following third-party services may set cookies on your device
                when you use PortalKit:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1">
                <li>
                  <strong>Stripe</strong> — payment processing. Stripe may set cookies
                  to prevent fraud. See{' '}
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-ds-secondary hover:underline underline-offset-4">
                    Stripe&apos;s Privacy Policy
                  </a>
                  .
                </li>
                <li>
                  <strong>Supabase</strong> — authentication. Supabase sets a session
                  cookie to maintain your logged-in state. See{' '}
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-ds-secondary hover:underline underline-offset-4">
                    Supabase&apos;s Privacy Policy
                  </a>
                  .
                </li>
              </ul>
            </Section>

            <Section title="5. Managing cookies">
              <p>
                You can control cookies through your browser settings. Most browsers
                allow you to view, block, or delete cookies. Note that disabling
                strictly necessary cookies will prevent you from signing in to
                your account.
              </p>
              <p>Browser cookie management guides:</p>
              <ul className="list-disc list-outside pl-5 space-y-1">
                <li>Chrome: Settings → Privacy and security → Cookies</li>
                <li>Safari: Preferences → Privacy</li>
                <li>Firefox: Settings → Privacy &amp; Security</li>
                <li>Edge: Settings → Cookies and site permissions</li>
              </ul>
              <p>
                For analytics cookies specifically, you may opt out from your
                account preferences under Settings → Privacy.
              </p>
            </Section>

            <Section title="6. Changes to this policy">
              <p>
                We may update this Cookie Policy to reflect changes in our practices
                or applicable law. We will post the updated policy on this page with
                a revised &ldquo;Last updated&rdquo; date.
              </p>
            </Section>

            <Section title="7. Contact">
              <p>
                Questions about our use of cookies? Contact us at{' '}
                <a href="mailto:privacy@portalkit.com" className="text-ds-secondary hover:underline underline-offset-4">
                  privacy@portalkit.com
                </a>
                . For broader privacy questions, see our{' '}
                <Link href="/privacy" className="text-ds-secondary hover:underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </p>
            </Section>

          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
