import { NextRequest, NextResponse } from 'next/server'
import { sendContactFormEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { name, email, topic, message } = body as Record<string, string>

  if (!name?.trim() || !email?.trim() || !topic?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 422 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 422 })
  }

  if (message.trim().length < 10) {
    return NextResponse.json({ error: 'Message is too short.' }, { status: 422 })
  }

  try {
    await sendContactFormEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      topic: topic.trim(),
      message: message.trim(),
    })
  } catch (err) {
    console.error('[contact] Failed to send email:', err)
    return NextResponse.json(
      { error: 'Failed to send your message. Please try emailing us directly at hello@portalkit.com.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
