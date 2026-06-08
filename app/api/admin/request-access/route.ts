import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/service'
import { generateAdminToken, hashAdminToken } from '@/lib/admin-auth'

const SENT = NextResponse.json({ sent: true })

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch { return SENT }

  const email = (body as { email?: string }).email?.trim().toLowerCase() ?? ''

  // Always return { sent: true } — never reveal whether the email matched
  if (!email || email !== process.env.ADMIN_EMAIL?.toLowerCase()) return SENT

  const service = createServiceClient()

  // Rate limit: max 3 tokens per hour to prevent abuse
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
  const { count } = await service
    .from('admin_tokens')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', oneHourAgo)
  if ((count ?? 0) >= 3) return SENT

  const token   = generateAdminToken()
  const hash    = hashAdminToken(token)
  const expires = new Date(Date.now() + 3600000).toISOString() // 1 hour

  const { error: dbErr } = await service.from('admin_tokens').insert({
    token_hash: hash,
    expires_at: expires,
  })
  if (dbErr) { console.error('[admin/request-access] DB:', dbErr); return SENT }

  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const magicLink = `${appUrl}/api/admin/verify?token=${token}`

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error: emailErr } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'PortalKit <noreply@portalkit.app>',
    to: email,
    subject: 'PortalKit Admin — magic link',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;background:#f8f9ff;margin:0;padding:0}
    .wrap{max-width:480px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5eeff;overflow:hidden}
    .hdr{background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px}
    .hdr h1{color:#fff;font-size:18px;font-weight:700;margin:0}
    .hdr p{color:rgba(255,255,255,.7);font-size:13px;margin:4px 0 0}
    .body{padding:32px}
    .body p{color:#0b1c30;font-size:15px;line-height:1.6;margin:0 0 16px}
    .body p.muted{color:#45464d;font-size:13px}
    .btn{display:inline-block;background:#0051d5;color:#fff;font-size:14px;font-weight:600;padding:13px 28px;border-radius:8px;text-decoration:none}
    .footer{background:#f8f9ff;padding:16px 32px;border-top:1px solid #e5eeff}
    .footer p{color:#76777d;font-size:12px;margin:0}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h1>PortalKit Admin</h1>
      <p>One-time access link</p>
    </div>
    <div class="body">
      <p>Click the button below to open the admin panel. This link expires in <strong>1 hour</strong> and works only once.</p>
      <a href="${magicLink}" class="btn">Open Admin Panel →</a>
      <hr style="border:none;border-top:1px solid #e5eeff;margin:24px 0"/>
      <p class="muted">If you didn't request this, ignore it — no action is needed.</p>
    </div>
    <div class="footer">
      <p>PortalKit · sent to ${email}</p>
    </div>
  </div>
</body>
</html>`,
  })

  if (emailErr) console.error('[admin/request-access] email:', emailErr)
  return SENT
}
