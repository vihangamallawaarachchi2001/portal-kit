import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/public/header'
import Footer from '@/components/public/footer'
import { PageHero } from '@/components/public/page-hero'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the Terms of Service governing your use of the PortalKit platform.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-on-surface">{title}</h2>
      <div className="space-y-3 text-sm text-on-surface-variant leading-relaxed">{children}</div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="pt-16">

        <PageHero
          eyebrow="Legal"
          headline="Terms of"
          accentLine="Service."
          compact
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Last updated: 1 January 2025</p>
        </PageHero>

        {/* ── Legal content ─────────────────────────────────────── */}
        <section className="bg-surface py-16 px-6">
          <div className="mx-auto max-w-3xl space-y-10">

            <Section title="1. Acceptance of terms">
              <p>
                By accessing or using PortalKit (&ldquo;the Service&rdquo;), you agree to be
                bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to
                these Terms, do not use the Service.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you (or your
                employer or another entity on whose behalf you are entering into these
                Terms) and PortalKit Inc. (&ldquo;PortalKit&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).
              </p>
            </Section>

            <Section title="2. Description of service">
              <p>
                PortalKit provides a cloud-based client portal platform that enables
                freelancers and agencies to share files, track invoices, communicate
                with clients, and manage project delivery through a branded, shareable
                portal link.
              </p>
              <p>
                We reserve the right to modify, suspend, or discontinue any aspect
                of the Service at any time, with reasonable notice to users where
                practicable.
              </p>
            </Section>

            <Section title="3. User accounts">
              <p>
                You must create an account to access the Service. You are responsible
                for maintaining the confidentiality of your account credentials and
                for all activities that occur under your account.
              </p>
              <p>
                You must provide accurate and complete information when creating your
                account and keep it up to date. You may not transfer your account to
                any other party without our prior written consent.
              </p>
              <p>
                You must be at least 18 years old to create an account. By creating
                an account, you represent that you meet this requirement.
              </p>
            </Section>

            <Section title="4. Acceptable use">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-outside pl-5 space-y-1">
                <li>Upload or share content that is illegal, harmful, threatening, abusive, harassing, or defamatory</li>
                <li>Infringe any intellectual property rights of any third party</li>
                <li>Distribute malware, viruses, or other malicious software</li>
                <li>Send spam or unsolicited commercial messages</li>
                <li>Attempt to gain unauthorised access to any part of the Service</li>
                <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
                <li>Use the Service to build a competing product</li>
                <li>Circumvent any rate limits, security measures, or access controls</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate
                this policy, with or without notice.
              </p>
            </Section>

            <Section title="5. Payment and billing">
              <p>
                Paid plans are billed on a monthly or annual basis. Billing begins
                on the date you upgrade and renews automatically on the same date
                each billing cycle. All prices are in USD unless otherwise stated.
              </p>
              <p>
                We offer a 14-day free trial for paid plans. You will not be charged
                during the trial period. After the trial, your selected plan will
                be billed automatically unless you cancel before the trial ends.
              </p>
              <p>
                All fees are non-refundable except where required by applicable law.
                If you downgrade your plan mid-cycle, no refund or credit is issued
                for the remainder of the billing period.
              </p>
              <p>
                We reserve the right to change pricing with at least 30 days&apos; notice
                to your registered email address.
              </p>
            </Section>

            <Section title="6. Intellectual property">
              <p>
                <strong>Your content:</strong> You retain ownership of all content
                you upload or create through the Service (&ldquo;User Content&rdquo;). By using
                the Service, you grant PortalKit a limited, non-exclusive licence to
                store, display, and transmit your User Content solely as necessary to
                provide the Service.
              </p>
              <p>
                <strong>Our platform:</strong> PortalKit and its underlying technology,
                trademarks, and design elements are owned by PortalKit Inc. Nothing
                in these Terms grants you any right to use our intellectual property
                other than as necessary to use the Service.
              </p>
            </Section>

            <Section title="7. Privacy">
              <p>
                Your use of the Service is also governed by our{' '}
                <Link href="/privacy" className="text-ds-secondary hover:underline underline-offset-4">
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms by reference.
              </p>
            </Section>

            <Section title="8. Disclaimer of warranties">
              <p>
                THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES
                OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
                IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                OR NON-INFRINGEMENT.
              </p>
              <p>
                We do not warrant that the Service will be uninterrupted, error-free,
                or completely secure. We make reasonable efforts to maintain uptime but
                do not guarantee any specific availability level.
              </p>
            </Section>

            <Section title="9. Limitation of liability">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PORTALKIT&apos;S TOTAL LIABILITY
                TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT
                EXCEED THE TOTAL FEES YOU PAID TO PORTALKIT IN THE 12 MONTHS PRECEDING
                THE EVENT GIVING RISE TO THE CLAIM.
              </p>
              <p>
                IN NO EVENT SHALL PORTALKIT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, EXEMPLARY, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS
                OF PROFITS, DATA, GOODWILL, OR BUSINESS OPPORTUNITIES.
              </p>
            </Section>

            <Section title="10. Termination">
              <p>
                You may cancel your account at any time from your account settings.
                Cancellation takes effect at the end of the current billing period.
                You will retain access to the Service until the period ends.
              </p>
              <p>
                We may suspend or terminate your account immediately if you materially
                breach these Terms, fail to pay fees, or engage in behaviour that poses
                a risk to our platform or other users.
              </p>
              <p>
                Upon termination, you may export your data within 30 days. After that
                period, your data will be permanently deleted.
              </p>
            </Section>

            <Section title="11. Dispute resolution">
              <p>
                These Terms are governed by the laws of the State of Delaware, USA,
                without regard to its conflict of law provisions. Any disputes arising
                from these Terms or your use of the Service shall be resolved by
                binding arbitration in Delaware, except that either party may seek
                injunctive or other equitable relief in any court of competent jurisdiction.
              </p>
              <p>
                You waive any right to participate in a class-action lawsuit or
                class-wide arbitration.
              </p>
            </Section>

            <Section title="12. General">
              <p>
                These Terms constitute the entire agreement between you and PortalKit
                regarding the Service and supersede any prior agreements. If any
                provision of these Terms is found to be unenforceable, the remaining
                provisions will remain in full effect.
              </p>
              <p>
                We may update these Terms from time to time. We will notify you of
                material changes at least 14 days in advance. Continued use of the
                Service after changes take effect constitutes acceptance of the
                updated Terms.
              </p>
              <p>
                For questions about these Terms, contact us at{' '}
                <a href="mailto:legal@portalkit.com" className="text-ds-secondary hover:underline underline-offset-4">
                  legal@portalkit.com
                </a>
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
