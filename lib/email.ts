import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL ?? 'PortalKit <noreply@portalkit.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://portalkit.app'

interface SendOptions {
  to: string
  subject: string
  html: string
}

async function send(opts: SendOptions) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
  if (error) console.error('[email]', error)
}

// ── Email templates ──────────────────────────────────────────────────────────

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: #f8f9ff; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5eeff; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0051d5 0%, #316bf3 100%); padding: 28px 32px; }
    .header h1 { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; }
    .header p { color: rgba(255,255,255,0.7); font-size: 13px; margin: 4px 0 0; }
    .body { padding: 32px; }
    .body p { color: #0b1c30; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .body p.muted { color: #45464d; font-size: 13px; }
    .button { display: inline-block; background: #0051d5; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 8px 0; }
    .divider { border: none; border-top: 1px solid #e5eeff; margin: 24px 0; }
    .footer { background: #f8f9ff; padding: 20px 32px; border-top: 1px solid #e5eeff; }
    .footer p { color: #76777d; font-size: 12px; margin: 0; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .status-pending { background: #fff8e1; color: #b45309; }
    .status-approved { background: #f0fdf4; color: #15803d; }
    .status-changes { background: #fff7ed; color: #b45309; }
    .status-paid { background: #f0fdf4; color: #15803d; }
    .status-overdue { background: #fef2f2; color: #b91c1c; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PortalKit</h1>
      <p>Your client collaboration workspace</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>You're receiving this because you're connected on PortalKit. <a href="${APP_URL}" style="color:#0051d5;">Manage preferences</a></p>
    </div>
  </div>
</body>
</html>`
}

// Client receives portal magic link
export async function sendPortalMagicLink({
  to,
  clientName,
  freelancerName,
  businessName,
  portalUrl,
}: {
  to: string
  clientName: string
  freelancerName: string
  businessName: string
  portalUrl: string
}) {
  await send({
    to,
    subject: `${businessName} has shared your client portal`,
    html: baseTemplate(`
      <p>Hi ${clientName},</p>
      <p><strong>${businessName}</strong> (${freelancerName}) has set up a private portal for you to review project updates, files, and invoices.</p>
      <p>Click the button below to access your portal — no account or password needed.</p>
      <a href="${portalUrl}" class="button">Open My Portal →</a>
      <hr class="divider" />
      <p class="muted">This link is valid for 24 hours. If it expires, you can request a new one from ${freelancerName}.</p>
    `),
  })
}

// Freelancer receives magic link to log in
export async function sendFreelancerMagicLink({
  to,
  loginUrl,
}: {
  to: string
  loginUrl: string
}) {
  await send({
    to,
    subject: 'Your PortalKit sign-in link',
    html: baseTemplate(`
      <p>Here is your sign-in link for PortalKit.</p>
      <p>Click the button below — it's valid for 24 hours and can only be used once.</p>
      <a href="${loginUrl}" class="button">Sign In to PortalKit →</a>
      <hr class="divider" />
      <p class="muted">If you didn't request this, you can safely ignore this email.</p>
    `),
  })
}

// Client receives notification: new file uploaded
export async function sendFileUploadedEmail({
  to,
  clientName,
  freelancerName,
  businessName,
  projectTitle,
  filename,
  portalUrl,
}: {
  to: string
  clientName: string
  freelancerName: string
  businessName: string
  projectTitle: string
  filename: string
  portalUrl: string
}) {
  await send({
    to,
    subject: `New file ready for review: ${filename}`,
    html: baseTemplate(`
      <p>Hi ${clientName},</p>
      <p><strong>${businessName}</strong> has uploaded a new file for your review on the <strong>${projectTitle}</strong> project.</p>
      <p><strong>File:</strong> ${filename}</p>
      <p>Open your portal to review it and leave feedback.</p>
      <a href="${portalUrl}/files" class="button">Review File →</a>
      <hr class="divider" />
      <p class="muted">Sent by ${freelancerName} via PortalKit.</p>
    `),
  })
}

// Freelancer receives notification: client reviewed a file
export async function sendFileReviewedEmail({
  to,
  freelancerName,
  clientName,
  projectTitle,
  filename,
  status,
  comment,
  dashboardUrl,
}: {
  to: string
  freelancerName: string
  clientName: string
  projectTitle: string
  filename: string
  status: 'approved' | 'changes_requested'
  comment: string | null
  dashboardUrl: string
}) {
  const statusLabel = status === 'approved' ? 'Approved' : 'Changes Requested'
  const statusClass = status === 'approved' ? 'status-approved' : 'status-changes'

  await send({
    to,
    subject: `${clientName} ${status === 'approved' ? 'approved' : 'requested changes on'} "${filename}"`,
    html: baseTemplate(`
      <p>Hi ${freelancerName},</p>
      <p><strong>${clientName}</strong> has reviewed <strong>${filename}</strong> on the <strong>${projectTitle}</strong> project.</p>
      <p>Status: <span class="status-badge ${statusClass}">${statusLabel}</span></p>
      ${comment ? `<p><strong>Comment:</strong> "${comment}"</p>` : ''}
      <a href="${dashboardUrl}" class="button">View in Dashboard →</a>
    `),
  })
}

// Client receives notification: invoice sent
export async function sendInvoiceSentEmail({
  to,
  clientName,
  freelancerName,
  businessName,
  invoiceNumber,
  total,
  currency,
  dueDate,
  portalUrl,
}: {
  to: string
  clientName: string
  freelancerName: string
  businessName: string
  invoiceNumber: string
  total: number
  currency: string
  dueDate: string | null
  portalUrl: string
}) {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)
  const due = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Upon receipt'

  await send({
    to,
    subject: `Invoice ${invoiceNumber} from ${businessName} — ${formatted} due`,
    html: baseTemplate(`
      <p>Hi ${clientName},</p>
      <p><strong>${businessName}</strong> has sent you an invoice.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#45464d;font-size:14px;">Invoice number</td><td style="padding:8px 0;font-weight:600;text-align:right;">${invoiceNumber}</td></tr>
        <tr><td style="padding:8px 0;color:#45464d;font-size:14px;">Amount due</td><td style="padding:8px 0;font-weight:700;font-size:18px;color:#0051d5;text-align:right;">${formatted}</td></tr>
        <tr><td style="padding:8px 0;color:#45464d;font-size:14px;">Due date</td><td style="padding:8px 0;font-weight:600;text-align:right;">${due}</td></tr>
      </table>
      <a href="${portalUrl}/invoices" class="button">Pay Invoice →</a>
      <hr class="divider" />
      <p class="muted">Payment is processed securely by Stripe. Sent by ${freelancerName} via PortalKit.</p>
    `),
  })
}

// Freelancer receives notification: invoice paid
export async function sendInvoicePaidEmail({
  to,
  freelancerName,
  clientName,
  invoiceNumber,
  total,
  currency,
  dashboardUrl,
}: {
  to: string
  freelancerName: string
  clientName: string
  invoiceNumber: string
  total: number
  currency: string
  dashboardUrl: string
}) {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)

  await send({
    to,
    subject: `Payment received: ${invoiceNumber} — ${formatted}`,
    html: baseTemplate(`
      <p>Hi ${freelancerName},</p>
      <p>Great news — <strong>${clientName}</strong> has paid invoice <strong>${invoiceNumber}</strong>.</p>
      <p style="font-size:24px;font-weight:700;color:#15803d;">${formatted} received</p>
      <p class="muted">Stripe will process your payout according to your normal payout schedule.</p>
      <a href="${dashboardUrl}" class="button">View Dashboard →</a>
    `),
  })
}

// ── Milestone emails ───────────────────────────────────────────────────────
export async function sendMilestoneCompletedEmail({
  to,
  clientName,
  freelancerName,
  milestoneTitle,
  projectTitle,
  portalUrl,
}: {
  to: string
  clientName: string
  freelancerName: string
  milestoneTitle: string
  projectTitle: string
  portalUrl: string
}) {
  await send({
    to,
    subject: `✅ Milestone completed: ${milestoneTitle}`,
    html: baseTemplate(`
      <p>Hi ${clientName},</p>
      <p><strong>${freelancerName}</strong> has marked the milestone <strong>"${milestoneTitle}"</strong> as complete on the project <strong>${projectTitle}</strong>.</p>
      <p>View the update in your portal.</p>
      <a href="${portalUrl}" class="button">Open Portal →</a>
    `),
  })
}

export async function sendMilestoneReminderEmail({
  to,
  freelancerName,
  clientName,
  milestoneTitle,
  projectTitle,
  dueDate,
  daysAway,
  dashboardUrl,
}: {
  to: string
  freelancerName: string
  clientName: string
  milestoneTitle: string
  projectTitle: string
  dueDate: string
  daysAway: number
  dashboardUrl: string
}) {
  await send({
    to,
    subject: `⏰ Milestone due in ${daysAway} days: ${milestoneTitle}`,
    html: baseTemplate(`
      <p>Hi ${freelancerName},</p>
      <p>The milestone <strong>"${milestoneTitle}"</strong> for project <strong>${projectTitle}</strong> is due on ${dueDate} (${daysAway} days).</p>
      <a href="${dashboardUrl}" class="button">View Project →</a>
    `),
  })
}

export async function sendMilestoneClientUpcomingEmail({
  to,
  clientName,
  milestoneTitle,
  projectTitle,
  dueDate,
  daysAway,
  portalUrl,
}: {
  to: string
  clientName: string
  milestoneTitle: string
  projectTitle: string
  dueDate: string
  daysAway: number
  portalUrl: string
}) {
  await send({
    to,
    subject: `📅 Coming up: ${milestoneTitle} — ${daysAway} days away`,
    html: baseTemplate(`
      <p>Hi ${clientName},</p>
      <p>An upcoming milestone <strong>"${milestoneTitle}"</strong> is scheduled for ${dueDate} on your project <strong>${projectTitle}</strong>.</p>
      <a href="${portalUrl}" class="button">Open Portal →</a>
    `),
  })
}

// Client receives: project status changed
export async function sendStatusChangedEmail({
  to,
  clientName,
  freelancerName,
  businessName,
  projectTitle,
  newStatus,
  portalUrl,
}: {
  to: string
  clientName: string
  freelancerName: string
  businessName: string
  projectTitle: string
  newStatus: string
  portalUrl: string
}) {
  const labels: Record<string, string> = {
    briefing: 'Briefing',
    in_progress: 'In Progress',
    review: 'Ready for Review',
    done: 'Complete',
  }
  const label = labels[newStatus] ?? newStatus

  await send({
    to,
    subject: `Project update: ${projectTitle} is now "${label}"`,
    html: baseTemplate(`
      <p>Hi ${clientName},</p>
      <p><strong>${businessName}</strong> has updated the status of <strong>${projectTitle}</strong>.</p>
      <p>New status: <strong>${label}</strong></p>
      <a href="${portalUrl}" class="button">View Portal →</a>
      <hr class="divider" />
      <p class="muted">Sent by ${freelancerName} via PortalKit.</p>
    `),
  })
}

// Recipient receives: new message
export async function sendNewMessageEmail({
  to,
  recipientName,
  senderName,
  senderBusiness,
  projectTitle,
  messagePreview,
  portalUrl,
}: {
  to: string
  recipientName: string
  senderName: string
  senderBusiness: string
  projectTitle: string
  messagePreview: string
  portalUrl: string
}) {
  const preview = messagePreview.length > 200 ? messagePreview.slice(0, 200) + '…' : messagePreview

  await send({
    to,
    subject: `New message from ${senderBusiness} on "${projectTitle}"`,
    html: baseTemplate(`
      <p>Hi ${recipientName},</p>
      <p><strong>${senderName}</strong> sent you a message on <strong>${projectTitle}</strong>:</p>
      <blockquote style="border-left:3px solid #0051d5;margin:16px 0;padding:12px 16px;background:#eff4ff;border-radius:0 8px 8px 0;color:#0b1c30;font-size:14px;line-height:1.6;">
        ${preview}
      </blockquote>
      <a href="${portalUrl}/messages" class="button">Reply →</a>
    `),
  })
}

// Freelancer receives: weekly digest
export async function sendWeeklyDigest({
  to,
  freelancerName,
  pendingApprovals,
  outstandingAmount,
  currency,
  unreadMessages,
  dashboardUrl,
}: {
  to: string
  freelancerName: string
  pendingApprovals: number
  outstandingAmount: number
  currency: string
  unreadMessages: number
  dashboardUrl: string
}) {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(outstandingAmount)

  await send({
    to,
    subject: `Your PortalKit weekly summary`,
    html: baseTemplate(`
      <p>Hi ${freelancerName},</p>
      <p>Here's your weekly summary:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="background:#eff4ff;border-radius:8px;">
          <td style="padding:12px 16px;font-size:14px;color:#45464d;">Files pending approval</td>
          <td style="padding:12px 16px;font-weight:700;text-align:right;font-size:16px;">${pendingApprovals}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;font-size:14px;color:#45464d;">Outstanding invoices</td>
          <td style="padding:12px 16px;font-weight:700;text-align:right;font-size:16px;color:#0051d5;">${formatted}</td>
        </tr>
        <tr style="background:#eff4ff;">
          <td style="padding:12px 16px;font-size:14px;color:#45464d;">Unread messages</td>
          <td style="padding:12px 16px;font-weight:700;text-align:right;font-size:16px;">${unreadMessages}</td>
        </tr>
      </table>
      <a href="${dashboardUrl}" class="button">Open Dashboard →</a>
    `),
  })
}

// Client receives: payment receipt after successful invoice payment
export async function sendPaymentReceiptEmail({
  to,
  clientName,
  businessName,
  invoiceNumber,
  total,
  currency,
  paidAt,
  lineItems,
  portalUrl,
}: {
  to: string
  clientName: string
  businessName: string
  invoiceNumber: string
  total: number
  currency: string
  paidAt: string
  lineItems: { description: string; quantity: number; unit_price: number }[]
  portalUrl: string
}) {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)
  const fmtItem   = (amt: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amt)
  const paidDate  = new Date(paidAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const itemRows = lineItems.map(item => `
    <tr>
      <td style="padding:8px 0;font-size:14px;color:#45464d;">${item.description} × ${item.quantity}</td>
      <td style="padding:8px 0;font-size:14px;text-align:right;font-weight:600;">${fmtItem(item.quantity * item.unit_price)}</td>
    </tr>
  `).join('')

  await send({
    to,
    subject: `Payment receipt — ${invoiceNumber} from ${businessName}`,
    html: baseTemplate(`
      <p>Hi ${clientName},</p>
      <p>Thank you! Your payment for invoice <strong>${invoiceNumber}</strong> from <strong>${businessName}</strong> has been successfully processed.</p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:20px 0;display:flex;align-items:center;gap:12px;">
        <div style="background:#15803d;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="color:white;font-size:16px;">✓</span>
        </div>
        <div>
          <p style="margin:0;font-weight:700;color:#15803d;font-size:18px;">${formatted} received</p>
          <p style="margin:4px 0 0;font-size:12px;color:#166534;">Paid on ${paidDate}</p>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #e5eeff;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#eff4ff;">
            <th style="padding:10px 16px;font-size:12px;color:#45464d;text-align:left;font-weight:600;text-transform:uppercase;">Item</th>
            <th style="padding:10px 16px;font-size:12px;color:#45464d;text-align:right;font-weight:600;text-transform:uppercase;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr style="background:#eff4ff;">
            <td style="padding:10px 16px;font-weight:700;font-size:15px;">Total paid</td>
            <td style="padding:10px 16px;font-weight:700;font-size:15px;text-align:right;color:#0051d5;">${formatted}</td>
          </tr>
        </tfoot>
      </table>

      <p>You can view this invoice at any time from your portal.</p>
      <a href="${portalUrl}/invoices" class="button">View in Portal →</a>
      <hr class="divider" />
      <p class="muted">Payment processed securely by Stripe. This is your receipt — please keep it for your records.</p>
    `),
  })
}

export async function sendMeetingInviteEmail({
  to,
  clientName,
  freelancerName,
  title,
  scheduledAt,
  durationMins,
  meetLink,
}: {
  to: string
  clientName: string
  freelancerName: string
  title: string
  scheduledAt: string
  durationMins: number
  meetLink: string
}) {
  const when = new Date(scheduledAt).toLocaleString()
  await send({
    to,
    subject: `📅 Meeting scheduled: ${title} on ${when}`,
    html: baseTemplate(`
      <p>Hi ${clientName},</p>
      <p><strong>${freelancerName}</strong> has scheduled a meeting: <strong>${title}</strong></p>
      <p>${when} · ${durationMins} minutes</p>
      <a href="${meetLink}" class="button">Join Meeting →</a>
    `),
  })
}

export async function sendMeetingInviteConfirmEmail({
  to,
  freelancerName,
  clientName,
  title,
  scheduledAt,
  meetLink,
}: {
  to: string
  freelancerName: string
  clientName: string
  title: string
  scheduledAt: string
  meetLink: string
}) {
  const when = new Date(scheduledAt).toLocaleString()
  await send({
    to,
    subject: `Meeting scheduled with ${clientName}: ${title}`,
    html: baseTemplate(`
      <p>Hi ${freelancerName},</p>
      <p>Your meeting with <strong>${clientName}</strong> is scheduled for ${when}.</p>
      <a href="${meetLink}" class="button">Open Meeting →</a>
    `),
  })
}

export async function sendMeetingReminderEmail({
  to,
  recipientName,
  title,
  timeframe,
  meetLink,
}: {
  to: string
  recipientName: string
  title: string
  timeframe: string
  meetLink: string
}) {
  await send({
    to,
    subject: `⏰ Meeting in ${timeframe}: ${title}`,
    html: baseTemplate(`
      <p>Hi ${recipientName},</p>
      <p>Your meeting <strong>${title}</strong> is coming up (${timeframe}).</p>
      <a href="${meetLink}" class="button">Join Meeting →</a>
    `),
  })
}

export async function sendMeetingCancelledEmail({
  to,
  clientName,
  title,
}: {
  to: string
  clientName: string
  title: string
}) {
  await send({
    to,
    subject: `Meeting cancelled: ${title}`,
    html: baseTemplate(`
      <p>Hi ${clientName},</p>
      <p>The meeting <strong>${title}</strong> has been cancelled. No further action is required.</p>
    `),
  })
}

// Waitlist signup confirmation
export async function sendWaitlistConfirmEmail({
  to,
  isFoundingMember,
}: {
  to: string
  isFoundingMember: boolean
}) {
  await send({
    to,
    subject: isFoundingMember
      ? "You're on the PortalKit founding member list"
      : "You're on the PortalKit waitlist",
    html: baseTemplate(
      isFoundingMember
        ? `
          <p>You're in.</p>
          <p>You've secured a <strong>founding member spot</strong> for PortalKit — that means <strong>40% off your subscription, forever</strong>, applied automatically when you sign up.</p>
          <p>We're putting the finishing touches on PortalKit right now and will email you as soon as it's ready.</p>
          <p><strong>What founding members get:</strong></p>
          <ul style="color:#0b1c30;font-size:15px;line-height:1.8;margin:0 0 16px;padding-left:20px;">
            <li>40% off Pro or Business plan, forever</li>
            <li>Early access before public launch</li>
            <li>Direct line to the team</li>
          </ul>
          <hr class="divider" />
          <p class="muted">Your discount is tied to this email address and will be applied automatically at checkout.</p>
        `
        : `
          <p>You're on the waitlist.</p>
          <p>All 20 founding member spots have been claimed, but we'll email you when PortalKit launches with a special offer for early members.</p>
          <hr class="divider" />
          <p class="muted">We'll be in touch soon.</p>
        `,
    ),
  })
}

// Team member receives: invitation to join a workspace
export async function sendTeamInviteEmail({
  to,
  ownerName,
  businessName,
  role,
  acceptUrl,
}: {
  to: string
  ownerName: string
  businessName: string
  role: string
  acceptUrl: string
}) {
  await send({
    to,
    subject: `${ownerName} invited you to join ${businessName} on PortalKit`,
    html: baseTemplate(`
      <p>Hi there,</p>
      <p><strong>${ownerName}</strong> has invited you to join their PortalKit workspace as a <strong>${role}</strong>.</p>
      <p>PortalKit is a client portal platform for freelancers and agencies. As a team member, you'll be able to manage clients, projects, files, and invoices together.</p>
      <a href="${acceptUrl}" class="button">Accept invitation →</a>
      <hr class="divider" />
      <p class="muted">This invitation expires in 7 days. If you didn't expect this, you can safely ignore this email.</p>
    `),
  })
}
