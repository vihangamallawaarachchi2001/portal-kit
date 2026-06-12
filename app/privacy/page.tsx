import type { Metadata } from 'next'
import { LegalPage, LegalSection, LegalSub, LegalLink } from '@/components/public/legal-page'

export const metadata: Metadata = {
  title: 'Privacy Policy — PortalKit',
  description: 'Learn how PortalKit collects, uses, and protects your personal information.',
}

const TOC = [
  { id: 'intro',       label: '1. Introduction'             },
  { id: 'controller',  label: '2. Data controller'           },
  { id: 'collect',     label: '3. Information we collect'    },
  { id: 'use',         label: '4. How we use your data'      },
  { id: 'sharing',     label: '5. Data sharing'              },
  { id: 'retention',   label: '6. Data retention'            },
  { id: 'rights',      label: '7. Your rights'               },
  { id: 'security',    label: '8. Security'                  },
  { id: 'cookies',     label: '9. Cookies'                   },
  { id: 'dnt',         label: '10. Do Not Track'             },
  { id: 'children',    label: '11. Children\'s privacy'      },
  { id: 'changes',     label: '12. Changes to this policy'   },
  { id: 'contact',     label: '13. Contact'                  },
]

const RELATED = [
  { label: 'Terms of Service', href: '/terms'    },
  { label: 'Cookie Policy',    href: '/cookies'  },
  { label: 'Security',         href: '/security' },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      titleLine1="Privacy"
      titleAccent="Policy."
      description="How we collect, use, and protect your personal data — and the rights you have over it."
      updatedDate="12 June 2026"
      toc={TOC}
      relatedLinks={RELATED}
    >

      <LegalSection id="intro" number="01" title="Introduction">
        <p>
          PortalKit (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the PortalKit platform
          (&ldquo;Service&rdquo;). This Privacy Policy explains how we collect, use, share,
          and protect personal information when you use the Service.
        </p>
        <p>
          By using PortalKit, you agree to the collection and use of information in
          accordance with this policy. If you do not agree with any part of this policy,
          you should stop using the Service.
        </p>
        <p>
          This policy applies to all users of the Service, including freelancers, agencies,
          and their end clients who access client portals. Where we refer to &ldquo;you&rdquo; in this
          document, we mean any person whose personal data we process in connection with the Service.
        </p>
      </LegalSection>

      <LegalSection id="controller" number="02" title="Data controller">
        <p>
          PortalKit is the data controller for personal data processed under this policy.
          If you are located in the European Union or United Kingdom, we act as a controller
          within the meaning of the General Data Protection Regulation (GDPR) and the UK GDPR
          respectively.
        </p>
        <p>
          If you are located in Australia, this policy also applies to us as an organisation
          covered by the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs).
        </p>
        <p>
          Our contact details are provided in Section 13 below.
        </p>
      </LegalSection>

      <LegalSection id="collect" number="03" title="Information we collect">
        <LegalSub title="Account information">
          <p>
            When you create a PortalKit account, we collect your email address, full name,
            and business name. This information is required to create and identify your account.
          </p>
        </LegalSub>
        <LegalSub title="Payment information">
          <p>
            Payments are processed by Stripe, Inc. We do not store your full card number,
            CVV, or bank account details on our servers. Stripe is our payment processor and
            handles all payment data subject to their own{' '}
            <LegalLink href="https://stripe.com/privacy">Privacy Policy</LegalLink>.
            We receive only a masked card identifier and transaction status from Stripe.
          </p>
        </LegalSub>
        <LegalSub title="Usage data">
          <p>
            We collect information about how you use the Service, including pages visited,
            features used, actions taken, and error events. This data is used to improve
            the Service and is not linked to your identity for advertising purposes.
          </p>
        </LegalSub>
        <LegalSub title="Client portal data">
          <p>
            Files, messages, invoices, milestones, and other content you upload or create
            within the Service are stored on our infrastructure. This content belongs to
            you and is processed solely to provide the Service you have requested.
          </p>
        </LegalSub>
        <LegalSub title="Log and device data">
          <p>
            We automatically collect log data including your IP address, browser type and
            version, operating system, referring URL, and request timestamps when you access
            the Service. This data is used for security monitoring and abuse prevention.
          </p>
        </LegalSub>
        <LegalSub title="Communications">
          <p>
            If you contact us by email or through a contact form, we retain the content of
            your message and your contact details to respond to your enquiry and improve our
            support processes.
          </p>
        </LegalSub>
      </LegalSection>

      <LegalSection id="use" number="04" title="How we use your data">
        <p>We use collected information to:</p>
        <ul className="list-disc list-outside pl-5 space-y-1.5">
          <li>Create and maintain your account and provide the Service</li>
          <li>Process transactions and send payment-related communications</li>
          <li>Send transactional emails, such as portal activity notifications, invoice receipts, and account security alerts</li>
          <li>Send product update and onboarding emails where you have not opted out</li>
          <li>Respond to support requests and improve our customer support processes</li>
          <li>Monitor and analyse usage patterns to improve and develop the Service</li>
          <li>Detect, prevent, and address fraud, abuse, and security incidents</li>
          <li>Comply with applicable legal obligations</li>
          <li>Enforce our Terms of Service</li>
        </ul>
        <p>
          Our legal bases for processing (under GDPR) are: performance of a contract
          (providing the Service), legitimate interests (security, fraud prevention, service
          improvement), legal obligation (compliance requirements), and consent (marketing
          emails, optional analytics). You may withdraw consent at any time without affecting
          the lawfulness of prior processing.
        </p>
        <p>
          We will not send you unsolicited marketing emails. Where we send product update
          emails, you may unsubscribe at any time via the link in the email or by contacting
          us directly.
        </p>
      </LegalSection>

      <LegalSection id="sharing" number="05" title="Data sharing and disclosure">
        <p>
          We do not sell, rent, or trade your personal data with third parties for their
          own marketing purposes. We share data only in the following circumstances:
        </p>
        <LegalSub title="Service providers (sub-processors)">
          <p>
            We use the following third-party services to operate the platform. Each provider
            processes data only as directed by us and is bound by appropriate data processing
            agreements:
          </p>
          <ul className="list-disc list-outside pl-5 space-y-1.5">
            <li><strong>Supabase</strong> — database hosting, user authentication, and file storage</li>
            <li><strong>Stripe, Inc.</strong> — payment processing and Stripe Connect for freelancer payouts</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
            <li><strong>Railway / Vercel</strong> — application hosting and serverless infrastructure</li>
            <li><strong>Sentry</strong> — error monitoring and application performance monitoring</li>
          </ul>
        </LegalSub>
        <LegalSub title="Legal requirements">
          <p>
            We may disclose your information if required by law, court order, or government
            authority, or if we believe in good faith that disclosure is reasonably necessary
            to protect our rights, your safety, or the safety of others, or to investigate
            fraud or a security incident.
          </p>
        </LegalSub>
        <LegalSub title="Business transfers">
          <p>
            In the event of a merger, acquisition, financing, reorganisation, or sale of
            company assets, your information may be transferred as part of that transaction.
            We will notify affected users by email at least 30 days before your data becomes
            subject to a materially different privacy policy.
          </p>
        </LegalSub>
        <LegalSub title="With your consent">
          <p>
            In any other circumstance, we will only share your data with your explicit consent.
          </p>
        </LegalSub>
      </LegalSection>

      <LegalSection id="retention" number="06" title="Data retention">
        <p>
          We retain your account data for as long as your account is active and for up to
          30 days after account deletion, to allow for account recovery. After that period,
          personal data is permanently and irreversibly deleted from our systems.
        </p>
        <p>
          Certain financial records (such as invoice and payment information) may be retained
          for up to 7 years where required by applicable tax or accounting laws.
        </p>
        <p>
          Server log data is retained for 90 days for security monitoring purposes, then
          automatically deleted.
        </p>
        <p>
          You may request deletion of your data at any time by contacting us at{' '}
          <LegalLink href="mailto:privacy@portalkit.com">privacy@portalkit.com</LegalLink>.
          We will confirm deletion within 30 days unless retention is required by law.
        </p>
      </LegalSection>

      <LegalSection id="rights" number="07" title="Your rights">
        <p>
          Depending on your location, you have the following rights regarding your personal data.
          To exercise any of these rights, contact us at{' '}
          <LegalLink href="mailto:privacy@portalkit.com">privacy@portalkit.com</LegalLink>.
          We will respond within 30 days of receiving a verified request.
        </p>
        <ul className="list-disc list-outside pl-5 space-y-2">
          <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
          <li><strong>Rectification</strong> — request correction of inaccurate or incomplete data.</li>
          <li><strong>Erasure</strong> — request deletion of your personal data (&ldquo;right to be forgotten&rdquo;), subject to legal retention obligations.</li>
          <li><strong>Portability</strong> — receive your data in a structured, commonly used, machine-readable format.</li>
          <li><strong>Restriction</strong> — request that we temporarily stop processing your data in certain circumstances.</li>
          <li><strong>Objection</strong> — object to processing based on our legitimate interests.</li>
          <li><strong>Withdraw consent</strong> — where processing is based on consent, withdraw it at any time.</li>
        </ul>
        <p>
          If you are located in the EU or UK, you have the right to lodge a complaint with
          your local supervisory authority (e.g. the ICO in the UK, or your national data
          protection authority in the EU).
        </p>
        <p>
          If you are located in Australia, you have the right to make a complaint to the
          Office of the Australian Information Commissioner (OAIC) at{' '}
          <LegalLink href="https://www.oaic.gov.au">oaic.gov.au</LegalLink> if you believe
          we have mishandled your personal information.
        </p>
        <p>
          If you are a California resident, you have additional rights under the California
          Consumer Privacy Act (CCPA), including the right to know, delete, and opt out of
          the sale of personal information. We do not sell personal information.
        </p>
      </LegalSection>

      <LegalSection id="security" number="08" title="Security">
        <p>
          We implement industry-standard security measures including TLS 1.3 encryption
          in transit and AES-256 encryption at rest for all data stored on our platform.
          Client portal access is controlled by time-limited, cryptographically signed
          tokens rather than passwords. We conduct regular internal security reviews and
          engage third-party security researchers through our responsible disclosure
          programme.
        </p>
        <p>
          No method of transmission over the internet or electronic storage is 100% secure.
          While we use commercially reasonable measures to protect your information, we
          cannot guarantee absolute security.
        </p>
        <p>
          To report a security vulnerability, please see our{' '}
          <LegalLink href="/security">Security page</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection id="cookies" number="09" title="Cookies">
        <p>
          We use cookies and similar technologies to keep you signed in, protect against
          cross-site request forgery, remember your preferences, and understand how the
          platform is used. We do not use cookies for advertising or cross-site tracking.
        </p>
        <p>
          For a full breakdown of the cookies we use and how to manage them, see our{' '}
          <LegalLink href="/cookies">Cookie Policy</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection id="dnt" number="10" title="Do Not Track">
        <p>
          Some browsers offer a &ldquo;Do Not Track&rdquo; (DNT) signal. Because there is no
          consistent industry standard for responding to DNT signals, we do not currently
          respond to them. You can manage tracking preferences by adjusting your browser
          cookie settings or opting out of analytics in your account Settings → Privacy.
        </p>
      </LegalSection>

      <LegalSection id="children" number="11" title="Children's privacy">
        <p>
          The Service is not directed to individuals under the age of 16. We do not
          knowingly collect personal information from children under 16. If you become
          aware that a child has provided us with personal data, please contact us at{' '}
          <LegalLink href="mailto:privacy@portalkit.com">privacy@portalkit.com</LegalLink>{' '}
          immediately. We will take steps to delete the information promptly.
        </p>
      </LegalSection>

      <LegalSection id="changes" number="12" title="Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our
          practices, technology, legal requirements, or other factors. We will notify you
          of material changes by email or by a prominent notice within the Service at least
          14 days before the change takes effect.
        </p>
        <p>
          The &ldquo;Last updated&rdquo; date at the top of this page indicates when the policy was
          last revised. Continued use of the Service after changes become effective
          constitutes your acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="13" title="Contact">
        <p>
          For questions, concerns, or requests relating to this Privacy Policy or your
          personal data, contact us at:
        </p>
        <address className="not-italic mt-2 space-y-1 text-[15px] text-gray-700">
          <p className="font-semibold text-gray-900">PortalKit</p>
          <p>
            <LegalLink href="mailto:privacy@portalkit.com">privacy@portalkit.com</LegalLink>
          </p>
        </address>
        <p className="mt-4">
          We aim to respond to all privacy-related enquiries within 5 business days.
        </p>
      </LegalSection>

    </LegalPage>
  )
}
