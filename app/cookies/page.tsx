import type { Metadata } from 'next'
import { LegalPage, LegalSection, LegalLink } from '@/components/public/legal-page'

export const metadata: Metadata = {
  title: 'Cookie Policy — PortalKit',
  description: 'Learn how PortalKit uses cookies and similar technologies, and how to manage them.',
}

const TOC = [
  { id: 'what',      label: '1. What are cookies?'       },
  { id: 'how',       label: '2. How we use cookies'      },
  { id: 'types',     label: '3. Types of cookies'        },
  { id: 'third',     label: '4. Third-party cookies'     },
  { id: 'manage',    label: '5. Managing cookies'        },
  { id: 'changes',   label: '6. Changes to this policy'  },
  { id: 'contact',   label: '7. Contact'                 },
]

const RELATED = [
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms'   },
  { label: 'Security',         href: '/security'},
]

const COOKIE_TYPES = [
  {
    name: 'Strictly necessary',
    purpose: 'Authentication session tokens, CSRF protection, and security tokens. Required for the Service to function.',
    retention: 'Session / 90 days',
    optional: false,
  },
  {
    name: 'Functional',
    purpose: 'Remembering your interface preferences such as sidebar state and display settings.',
    retention: '12 months',
    optional: true,
  },
  {
    name: 'Analytics',
    purpose: 'Understanding aggregate usage patterns (page views, feature adoption) to guide product improvements. Data is anonymised.',
    retention: '13 months',
    optional: true,
  },
]

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      titleLine1="Cookie"
      titleAccent="Policy."
      description="How we use cookies and similar technologies on the PortalKit platform, and your options for managing them."
      updatedDate="12 June 2026"
      toc={TOC}
      relatedLinks={RELATED}
    >

      <LegalSection id="what" number="01" title="What are cookies?">
        <p>
          Cookies are small text files that a website stores on your device when you visit
          it. They allow the site to recognise your device on subsequent visits, remember
          information about you (such as whether you are logged in), and provide a more
          consistent experience.
        </p>
        <p>
          Similar technologies — including local storage, session storage, and pixel beacons
          — serve comparable purposes and are covered by this policy when we refer to
          &ldquo;cookies&rdquo;.
        </p>
        <p>
          Cookies set by the website you are visiting are called &ldquo;first-party cookies&rdquo;.
          Cookies set by organisations other than the website operator are &ldquo;third-party
          cookies&rdquo;. We describe both types in this policy.
        </p>
      </LegalSection>

      <LegalSection id="how" number="02" title="How we use cookies">
        <p>PortalKit uses cookies to:</p>
        <ul className="list-disc list-outside pl-5 space-y-1.5">
          <li>Keep you securely signed in to your account across browser sessions</li>
          <li>Protect your account against cross-site request forgery (CSRF) attacks</li>
          <li>Remember your interface preferences and dashboard settings</li>
          <li>Understand how the platform is used in aggregate, so we can improve it</li>
        </ul>
        <p>
          We do not use cookies for advertising, retargeting, or cross-site tracking.
          We do not sell data collected through cookies to third parties.
        </p>
      </LegalSection>

      <LegalSection id="types" number="03" title="Types of cookies we use">
        <p>
          The table below lists the categories of cookies we use, what they are for,
          how long they are stored, and whether you can disable them.
        </p>

        <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-140">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-700 w-[22%]">Category</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-700">Purpose</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-700 w-[18%]">Retention</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-700 w-[12%]">Optional</th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_TYPES.map(({ name, purpose, retention, optional }, i) => (
                  <tr
                    key={name}
                    className="border-b border-gray-100 last:border-0"
                    style={i % 2 === 1 ? { background: '#fafafa' } : {}}
                  >
                    <td className="px-5 py-4 font-semibold text-gray-800 align-top">{name}</td>
                    <td className="px-5 py-4 text-gray-600 align-top leading-relaxed">{purpose}</td>
                    <td className="px-5 py-4 text-gray-500 align-top whitespace-nowrap">{retention}</td>
                    <td className="px-5 py-4 align-top">
                      {optional ? (
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-3">
          Strictly necessary cookies cannot be disabled without breaking core functionality
          such as sign-in. All other cookies can be disabled in your browser settings or
          in your account Settings → Privacy.
        </p>
      </LegalSection>

      <LegalSection id="third" number="04" title="Third-party cookies">
        <p>
          The following third-party services may set cookies on your device when you use
          PortalKit. Each of these providers has its own privacy policy:
        </p>
        <ul className="list-disc list-outside pl-5 space-y-3">
          <li>
            <strong>Stripe</strong> — Payment processing. Stripe may set cookies to prevent
            fraud and ensure secure checkout. See{' '}
            <LegalLink href="https://stripe.com/privacy">Stripe&apos;s Privacy Policy</LegalLink>.
          </li>
          <li>
            <strong>Supabase</strong> — Authentication. Supabase sets a session cookie to
            maintain your signed-in state. See{' '}
            <LegalLink href="https://supabase.com/privacy">Supabase&apos;s Privacy Policy</LegalLink>.
          </li>
          <li>
            <strong>Plausible Analytics</strong> — If enabled, Plausible tracks aggregate
            page-view statistics without cookies and without collecting personal data.
            See{' '}
            <LegalLink href="https://plausible.io/privacy">Plausible&apos;s Privacy Policy</LegalLink>.
          </li>
        </ul>
        <p>
          We do not embed social media tracking pixels, advertising networks, or any other
          third-party code that sets cookies for purposes outside the operation of the Service.
        </p>
      </LegalSection>

      <LegalSection id="manage" number="05" title="Managing cookies">
        <p>
          You can control and delete cookies through your browser settings. Note that
          disabling strictly necessary cookies will prevent you from signing in to your
          account.
        </p>
        <p>Browser cookie management instructions:</p>
        <ul className="list-disc list-outside pl-5 space-y-1.5">
          <li><strong>Chrome</strong>: Settings → Privacy and security → Cookies and other site data</li>
          <li><strong>Safari</strong>: Preferences → Privacy → Manage Website Data</li>
          <li><strong>Firefox</strong>: Settings → Privacy &amp; Security → Cookies and Site Data</li>
          <li><strong>Edge</strong>: Settings → Cookies and site permissions</li>
        </ul>
        <p>
          For optional analytics cookies specifically, you may opt out at any time from
          your account under Settings → Privacy, without affecting your ability to use
          the Service.
        </p>
        <p>
          If you clear cookies, you will be signed out of PortalKit and your preference
          settings will be reset. You can sign back in immediately using your email or
          Google account.
        </p>
      </LegalSection>

      <LegalSection id="changes" number="06" title="Changes to this policy">
        <p>
          We may update this Cookie Policy to reflect changes in our practices, the
          technologies we use, or applicable law. When we do, we will post the revised
          policy on this page and update the &ldquo;Last updated&rdquo; date.
        </p>
        <p>
          If we make material changes that affect the cookies we use or your rights,
          we will provide more prominent notice, such as a banner on the Service or an
          email notification.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="07" title="Contact">
        <p>
          Questions about our use of cookies or this policy? Contact us at{' '}
          <LegalLink href="mailto:privacy@portalkit.com">privacy@portalkit.com</LegalLink>.
        </p>
        <p>
          For broader privacy enquiries, see our{' '}
          <LegalLink href="/privacy">Privacy Policy</LegalLink>.
        </p>
      </LegalSection>

    </LegalPage>
  )
}
