import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { PageHero } from '@/components/public/page-hero'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how PortalKit collects, uses, and protects your personal information.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-on-surface">{title}</h2>
      <div className="space-y-3 text-sm text-on-surface-variant leading-relaxed">{children}</div>
    </div>
  )
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 pl-4 border-l-2 border-outline-variant">
      <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
      <div className="text-sm text-on-surface-variant leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        <PageHero
          eyebrow="Legal"
          headline="Privacy"
          accentLine="Policy."
          compact
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Last updated: 1 January 2025</p>
        </PageHero>

        {/* ── Legal content ─────────────────────────────────────── */}
        <section className="bg-surface py-16 px-6">
          <div className="mx-auto max-w-3xl space-y-10">

            <Section title="1. Introduction">
              <p>
                PortalKit (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the PortalKit platform
                (&ldquo;Service&rdquo;). This Privacy Policy explains how we collect, use, share,
                and protect information about you when you use the Service.
              </p>
              <p>
                By using PortalKit, you agree to the collection and use of information
                in accordance with this policy. If you disagree with any part of this
                policy, you should discontinue use of the Service.
              </p>
            </Section>

            <Section title="2. Data controller">
              <p>
                PortalKit Inc. is the data controller for personal data processed
                under this policy. You can contact us at{' '}
                <a href="mailto:privacy@portalkit.com" className="text-ds-secondary hover:underline underline-offset-4">
                  privacy@portalkit.com
                </a>
                .
              </p>
            </Section>

            <Section title="3. Information we collect">
              <Sub title="Account information">
                <p>
                  When you create a PortalKit account, we collect your email address,
                  full name, and business name. This information is necessary to
                  create and identify your account.
                </p>
              </Sub>
              <Sub title="Payment information">
                <p>
                  We process payments through Stripe. We do not store your full card
                  number, CVV, or bank account details. Stripe is our payment processor
                  and handles all payment data subject to their own privacy policy.
                </p>
              </Sub>
              <Sub title="Usage data">
                <p>
                  We collect information about how you use the Service, including pages
                  visited, features used, actions taken, and error events. This data
                  is used to improve the Service.
                </p>
              </Sub>
              <Sub title="Client portal data">
                <p>
                  Files, messages, invoices, and other content you upload or create
                  within the Service are stored on our infrastructure. This data
                  belongs to you and is processed on your behalf.
                </p>
              </Sub>
              <Sub title="Log and device data">
                <p>
                  We automatically collect log data including IP address, browser type,
                  operating system, referring URL, and timestamps when you access
                  the Service.
                </p>
              </Sub>
            </Section>

            <Section title="4. How we use your information">
              <p>We use collected information to:</p>
              <ul className="list-disc list-outside pl-5 space-y-1">
                <li>Provide, maintain, and improve the Service</li>
                <li>Process transactions and send related information</li>
                <li>Send transactional emails (portal activity, invoices, account notices)</li>
                <li>Respond to support requests</li>
                <li>Monitor and analyse usage patterns to improve the Service</li>
                <li>Detect, prevent, and address technical issues and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p>
                We will not send you marketing emails without your explicit consent.
                Where we send product update emails, you can unsubscribe at any time.
              </p>
            </Section>

            <Section title="5. Data sharing and disclosure">
              <p>
                We do not sell, rent, or trade your personal data with third parties.
                We share data only in the following circumstances:
              </p>
              <Sub title="Service providers (data processors)">
                <p>We use the following third-party services to operate the platform:</p>
                <ul className="list-disc list-outside pl-5 space-y-1">
                  <li><strong>Supabase</strong> — database hosting, authentication, and storage</li>
                  <li><strong>Stripe</strong> — payment processing</li>
                  <li><strong>Resend</strong> — transactional email delivery</li>
                  <li><strong>Vercel</strong> — application hosting and edge functions</li>
                </ul>
                <p>
                  Each of these providers processes data only as directed by us and
                  is bound by appropriate data processing agreements.
                </p>
              </Sub>
              <Sub title="Legal requirements">
                <p>
                  We may disclose your information if required to do so by law, court
                  order, or government authority, or if we believe disclosure is
                  necessary to protect our rights or the safety of others.
                </p>
              </Sub>
              <Sub title="Business transfers">
                <p>
                  In the event of a merger, acquisition, or sale of company assets,
                  your information may be transferred as part of that transaction.
                  We will notify you via email before your data becomes subject to
                  a different privacy policy.
                </p>
              </Sub>
            </Section>

            <Section title="6. Data retention">
              <p>
                We retain your account data for as long as your account is active.
                If you delete your account, we permanently delete your data within
                30 days, except where retention is required by law.
              </p>
              <p>
                You may request deletion of your data at any time by contacting us
                at{' '}
                <a href="mailto:privacy@portalkit.com" className="text-ds-secondary hover:underline underline-offset-4">
                  privacy@portalkit.com
                </a>
                .
              </p>
            </Section>

            <Section title="7. Your rights">
              <p>
                Depending on your location, you may have the following rights regarding
                your personal data:
              </p>
              <ul className="list-disc list-outside pl-5 space-y-1">
                <li><strong>Access</strong> — request a copy of the data we hold about you</li>
                <li><strong>Rectification</strong> — request correction of inaccurate data</li>
                <li><strong>Erasure</strong> — request deletion of your personal data</li>
                <li><strong>Portability</strong> — receive your data in a structured, machine-readable format</li>
                <li><strong>Restriction</strong> — request that we limit processing of your data</li>
                <li><strong>Objection</strong> — object to processing based on legitimate interests</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at{' '}
                <a href="mailto:privacy@portalkit.com" className="text-ds-secondary hover:underline underline-offset-4">
                  privacy@portalkit.com
                </a>
                . We will respond within 30 days.
              </p>
              <p>
                If you are located in the EU or UK, you also have the right to lodge
                a complaint with your local supervisory authority.
              </p>
            </Section>

            <Section title="8. Security">
              <p>
                We implement industry-standard security measures including TLS 1.3
                encryption in transit, AES-256 encryption at rest, and regular
                security audits. No method of transmission over the internet or
                electronic storage is 100% secure, and we cannot guarantee absolute
                security.
              </p>
              <p>
                To report a security vulnerability, please see our{' '}
                <Link href="/security" className="text-ds-secondary hover:underline underline-offset-4">
                  Security page
                </Link>
                .
              </p>
            </Section>

            <Section title="9. Cookies">
              <p>
                We use cookies and similar tracking technologies. See our{' '}
                <Link href="/cookies" className="text-ds-secondary hover:underline underline-offset-4">
                  Cookie Policy
                </Link>{' '}
                for details on the types of cookies we use and how to manage them.
              </p>
            </Section>

            <Section title="10. Children's privacy">
              <p>
                The Service is not directed to individuals under 16 years of age.
                We do not knowingly collect personal information from children. If
                you become aware that a child has provided us with personal data,
                please contact us immediately.
              </p>
            </Section>

            <Section title="11. Changes to this policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify
                you of material changes by email or by a prominent notice within
                the Service at least 14 days before the change takes effect.
                Continued use of the Service after changes constitutes acceptance
                of the updated policy.
              </p>
            </Section>

            <Section title="12. Contact">
              <p>
                For questions or concerns about this Privacy Policy, contact us at:
              </p>
              <address className="not-italic space-y-0.5">
                <p className="font-medium text-on-surface">PortalKit Inc.</p>
                <p>
                  <a href="mailto:privacy@portalkit.com" className="text-ds-secondary hover:underline underline-offset-4">
                    privacy@portalkit.com
                  </a>
                </p>
              </address>
            </Section>

          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
