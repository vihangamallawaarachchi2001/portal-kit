import type { Metadata } from 'next'
import { LegalPage, LegalSection, LegalLink } from '@/components/public/legal-page'

export const metadata: Metadata = {
  title: 'Terms of Service — PortalKit',
  description: 'Read the Terms of Service governing your use of the PortalKit platform.',
}

const TOC = [
  { id: 'acceptance',  label: '1. Acceptance of terms'       },
  { id: 'service',     label: '2. Description of service'    },
  { id: 'accounts',   label: '3. User accounts'              },
  { id: 'acceptable', label: '4. Acceptable use'             },
  { id: 'payment',    label: '5. Payment and billing'        },
  { id: 'ip',         label: '6. Intellectual property'      },
  { id: 'privacy',    label: '7. Privacy'                    },
  { id: 'uptime',     label: '8. Availability and uptime'    },
  { id: 'warranties', label: '9. Disclaimer of warranties'   },
  { id: 'liability',  label: '10. Limitation of liability'   },
  { id: 'termination',label: '11. Termination'               },
  { id: 'dispute',    label: '12. Dispute resolution'        },
  { id: 'general',    label: '13. General'                   },
]

const RELATED = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookie Policy',  href: '/cookies' },
  { label: 'Security',       href: '/security'},
]

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      titleLine1="Terms of"
      titleAccent="Service."
      description="The agreement that governs your use of the PortalKit platform. Please read it carefully."
      updatedDate="12 June 2026"
      toc={TOC}
      relatedLinks={RELATED}
    >

      <LegalSection id="acceptance" number="01" title="Acceptance of terms">
        <p>
          By accessing or using PortalKit (&ldquo;the Service&rdquo;), you agree to be bound by
          these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, do not
          access or use the Service.
        </p>
        <p>
          These Terms form a legally binding agreement between you (individually, or on
          behalf of your employer or another entity) and PortalKit (&ldquo;we&rdquo;, &ldquo;our&rdquo;,
          or &ldquo;us&rdquo;). If you are entering into these Terms on behalf of an organisation,
          you represent that you have authority to bind that organisation to these Terms.
        </p>
        <p>
          Nothing in these Terms is intended to exclude, restrict, or modify any rights
          you may have under applicable consumer protection law, including (where applicable)
          the Australian Consumer Law (ACL) or EU/UK consumer rights legislation.
        </p>
      </LegalSection>

      <LegalSection id="service" number="02" title="Description of service">
        <p>
          PortalKit provides a cloud-based client portal platform that enables freelancers
          and agencies to share files, track project progress, send and collect invoices,
          communicate with clients, and manage project delivery through a branded,
          shareable portal link.
        </p>
        <p>
          We reserve the right to modify, suspend, or discontinue any feature or aspect of
          the Service at any time. Where practicable, we will provide at least 14 days&apos;
          notice of material changes that negatively affect your use of the Service.
        </p>
        <p>
          The Service is intended for business use by freelancers, contractors, and agencies.
          It is not a consumer product and is not designed for use by private individuals
          acting outside a professional capacity.
        </p>
      </LegalSection>

      <LegalSection id="accounts" number="03" title="User accounts">
        <p>
          You must create an account to access the Service. You are responsible for
          maintaining the confidentiality of your account credentials and for all activities
          that occur under your account, whether or not authorised by you.
        </p>
        <p>
          You must provide accurate, current, and complete information when creating your
          account and keep it up to date. You may not impersonate any other person or entity,
          or use a name or email address that you do not have the right to use.
        </p>
        <p>
          You must be at least 18 years of age to create an account and use the Service.
          By creating an account, you represent and warrant that you meet this requirement.
        </p>
        <p>
          You may not transfer your account to any other person or entity without our prior
          written consent. You agree to notify us immediately of any unauthorised access to
          or use of your account.
        </p>
      </LegalSection>

      <LegalSection id="acceptable" number="04" title="Acceptable use">
        <p>You agree to use the Service only for lawful purposes and in accordance with
          these Terms. You agree not to use the Service to:</p>
        <ul className="list-disc list-outside pl-5 space-y-1.5">
          <li>Upload, transmit, or distribute content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
          <li>Infringe any intellectual property, privacy, or other rights of any third party</li>
          <li>Distribute malware, viruses, trojans, spyware, or any other malicious software or code</li>
          <li>Send spam, unsolicited commercial messages, or bulk communications</li>
          <li>Attempt to gain unauthorised access to any portion of the Service, other user accounts, or related systems or networks</li>
          <li>Use automated tools, scrapers, or bots to access or interact with the Service without our prior written consent</li>
          <li>Reverse-engineer, decompile, disassemble, or attempt to derive the source code of any part of the Service</li>
          <li>Resell, sublicense, or use the Service to build a substantially similar competing product or service</li>
          <li>Circumvent any rate limits, security controls, or access restrictions</li>
          <li>Engage in any activity that places a disproportionate load on our infrastructure</li>
        </ul>
        <p>
          We reserve the right to investigate suspected violations and to suspend or
          terminate accounts, with or without notice, where a violation is found or
          reasonably suspected.
        </p>
      </LegalSection>

      <LegalSection id="payment" number="05" title="Payment and billing">
        <p>
          Paid plans are billed on a monthly or annual basis. Billing begins on the date
          you upgrade and renews automatically on the same date each billing cycle unless
          you cancel before the renewal date. All prices are displayed in USD unless
          otherwise stated.
        </p>
        <p>
          We offer a 14-day free trial on paid plans. You will not be charged during the
          trial period. If you do not cancel before the trial ends, your selected plan
          will be billed automatically using the payment method you provided.
        </p>
        <p>
          All fees are non-refundable except where required by applicable law. If you
          downgrade your plan mid-cycle, no refund or credit is issued for the unused
          remainder of the billing period. If you cancel an annual plan within the first
          14 days and have not used the Service, you may request a pro-rata refund by
          contacting us at{' '}
          <LegalLink href="mailto:billing@portalkit.com">billing@portalkit.com</LegalLink>.
        </p>
        <p>
          We reserve the right to change pricing with at least 30 days&apos; advance notice
          to your registered email address. Continued use of the Service after a price change
          takes effect constitutes your acceptance of the new price.
        </p>
        <p>
          If you are located in Australia, your rights under the Australian Consumer Law
          (Schedule 2 of the <em>Competition and Consumer Act 2010</em> (Cth)) are not
          excluded, restricted, or modified by anything in these Terms.
        </p>
      </LegalSection>

      <LegalSection id="ip" number="06" title="Intellectual property">
        <p>
          <strong>Your content:</strong> You retain all ownership rights in the content you
          upload, create, or store through the Service (&ldquo;User Content&rdquo;). By using the
          Service, you grant PortalKit a limited, non-exclusive, royalty-free, worldwide
          licence to store, copy, display, and transmit your User Content solely as
          necessary to provide the Service to you. This licence terminates when you delete
          the content or close your account.
        </p>
        <p>
          <strong>Our platform:</strong> PortalKit and its underlying technology, software,
          trademarks, trade names, logos, and design elements are owned by PortalKit or
          its licensors. Nothing in these Terms grants you any right, title, or interest
          in our intellectual property except the limited right to use the Service as
          described in these Terms.
        </p>
        <p>
          <strong>Feedback:</strong> If you submit suggestions, ideas, enhancement requests,
          or other feedback about the Service, you grant us a perpetual, royalty-free
          licence to use that feedback without compensation or attribution.
        </p>
      </LegalSection>

      <LegalSection id="privacy" number="07" title="Privacy">
        <p>
          Your use of the Service is also governed by our{' '}
          <LegalLink href="/privacy">Privacy Policy</LegalLink>, which is incorporated
          into these Terms by reference. By agreeing to these Terms, you also agree to
          our Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection id="uptime" number="08" title="Availability and uptime">
        <p>
          We target 99.9% monthly uptime for the Service and will communicate planned
          maintenance in advance. We do not guarantee any specific availability level and
          are not liable for any losses resulting from downtime, data unavailability, or
          interruptions outside our reasonable control.
        </p>
        <p>
          Scheduled maintenance windows will be communicated via email or the Service
          interface at least 48 hours in advance where practicable.
        </p>
      </LegalSection>

      <LegalSection id="warranties" number="09" title="Disclaimer of warranties">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS PROVIDED
          &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
          OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </p>
        <p>
          We do not warrant that the Service will be uninterrupted, timely, error-free, or
          free of viruses or other harmful components. We do not warrant the accuracy or
          completeness of any content on the Service.
        </p>
        <p>
          Nothing in this clause limits any statutory guarantee or consumer right that
          cannot be excluded under applicable law.
        </p>
      </LegalSection>

      <LegalSection id="liability" number="10" title="Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PORTALKIT&apos;S TOTAL AGGREGATE
          LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT
          EXCEED THE GREATER OF (A) THE TOTAL FEES YOU PAID TO PORTALKIT IN THE 12 MONTHS
          IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) USD $100.
        </p>
        <p>
          IN NO EVENT SHALL PORTALKIT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          EXEMPLARY, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA,
          REVENUE, GOODWILL, BUSINESS OPPORTUNITIES, OR ANTICIPATED SAVINGS, EVEN IF
          ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p>
          These limitations apply regardless of the legal theory under which damages are
          sought (contract, tort, strict liability, or otherwise) and regardless of whether
          the limited remedies fail of their essential purpose.
        </p>
        <p>
          Nothing in these Terms excludes or limits liability for fraud, fraudulent
          misrepresentation, death or personal injury caused by negligence, or any other
          liability that cannot be excluded or limited under applicable law.
        </p>
      </LegalSection>

      <LegalSection id="termination" number="11" title="Termination">
        <p>
          You may cancel your account at any time from your account settings. Cancellation
          takes effect at the end of the current billing period, and you will retain access
          to the Service until that date.
        </p>
        <p>
          We may suspend or terminate your access to the Service immediately, with or without
          notice, if you materially breach these Terms, fail to pay outstanding fees, or
          engage in activity that poses a risk to our platform, other users, or third parties.
        </p>
        <p>
          Upon termination, you may export your data for up to 30 days. After that period,
          all user data will be permanently deleted in accordance with our{' '}
          <LegalLink href="/privacy">Privacy Policy</LegalLink>. We will send reminder
          emails before permanent deletion occurs.
        </p>
        <p>
          Provisions that by their nature should survive termination (including intellectual
          property, limitation of liability, dispute resolution, and payment obligations)
          will continue to apply after termination.
        </p>
      </LegalSection>

      <LegalSection id="dispute" number="12" title="Dispute resolution">
        <p>
          These Terms are governed by the laws of the State of Delaware, USA, without
          regard to conflict of law principles, except that mandatory consumer protection
          laws in your jurisdiction (including the Australian Consumer Law) will also apply
          to the extent required.
        </p>
        <p>
          Before initiating any legal proceedings, you agree to contact us at{' '}
          <LegalLink href="mailto:legal@portalkit.com">legal@portalkit.com</LegalLink>{' '}
          to attempt to resolve the dispute informally. We will make a good-faith effort
          to resolve disputes within 30 days of notice.
        </p>
        <p>
          If informal resolution fails, disputes shall be resolved by binding arbitration
          administered by the American Arbitration Association (AAA) under its Commercial
          Arbitration Rules, seated in Delaware. Judgement on any arbitration award may
          be entered by any court of competent jurisdiction.
        </p>
        <p>
          Either party may seek injunctive or other equitable relief in any court of
          competent jurisdiction without waiving the right to arbitration. The class action
          waiver below does not apply where prohibited by law.
        </p>
        <p>
          YOU AGREE THAT ANY DISPUTES WILL BE RESOLVED ON AN INDIVIDUAL BASIS AND NOT
          AS PART OF A CLASS ACTION, CONSOLIDATED PROCEEDING, OR CLASS-WIDE ARBITRATION.
        </p>
      </LegalSection>

      <LegalSection id="general" number="13" title="General">
        <p>
          These Terms, together with the{' '}
          <LegalLink href="/privacy">Privacy Policy</LegalLink> and{' '}
          <LegalLink href="/cookies">Cookie Policy</LegalLink>, constitute the entire
          agreement between you and PortalKit regarding the Service and supersede any
          prior agreements or representations.
        </p>
        <p>
          If any provision of these Terms is found to be invalid or unenforceable, the
          remaining provisions will remain in full force and effect. Our failure to
          enforce any provision of these Terms will not constitute a waiver of our right
          to enforce it in the future.
        </p>
        <p>
          We may update these Terms from time to time. We will notify you of material
          changes by email at least 14 days before they take effect. Continued use of the
          Service after changes take effect constitutes your acceptance of the updated Terms.
        </p>
        <p>
          For questions about these Terms, contact us at{' '}
          <LegalLink href="mailto:legal@portalkit.com">legal@portalkit.com</LegalLink>.
        </p>
      </LegalSection>

    </LegalPage>
  )
}
