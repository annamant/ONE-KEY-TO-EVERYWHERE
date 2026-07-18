import nodemailer, { type Transporter } from 'nodemailer'

type EmailPayload = {
  to: string
  subject: string
  text: string
  html?: string
}

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (!process.env.SMTP_HOST) return null
  if (transporter) return transporter
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? '' }
      : undefined,
  })
  return transporter
}

/**
 * Prefer Resend's HTTPS API. Railway (Hobby/Free) blocks outbound SMTP
 * ports 465/587, so nodemailer→smtp.resend.com silently fails in production.
 * SMTP_PASS holds the Resend API key (re_...).
 */
async function sendViaResendApi(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASS
  if (!apiKey || !apiKey.startsWith('re_')) return false

  const from = process.env.SMTP_FROM ?? 'noreply@pulkra.com'
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
      html: payload.html ?? undefined,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Resend API ${res.status}: ${body.slice(0, 300)}`)
  }
  return true
}

/** Sends email via Resend HTTPS API (preferred), SMTP, or console in local dev. */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { to, subject, text, html } = payload

  // 1) Resend HTTPS — works on all Railway plans
  const sentViaApi = await sendViaResendApi(payload)
  if (sentViaApi) return

  // 2) SMTP fallback (local / Pro plan with SMTP allowed)
  const transport = getTransporter()
  if (transport) {
    await transport.sendMail({
      from: process.env.SMTP_FROM ?? `no-reply@${process.env.SMTP_HOST}`,
      to,
      subject,
      text,
      html,
    })
    return
  }

  // 3) Dev console
  console.log('\n─── EMAIL ───────────────────────────────────────')
  console.log(`To:      ${to}`)
  console.log(`Subject: ${subject}`)
  console.log('─'.repeat(50))
  console.log(text)
  console.log('─────────────────────────────────────────────────\n')
}

const APP_URL = process.env.APP_URL ?? 'http://localhost:5173'

export function membershipApprovedEmail(firstName: string): EmailPayload {
  return {
    to: '',
    subject: 'Welcome to One Key to Everywhere — your membership is approved',
    text: [
      `Hi ${firstName},`,
      '',
      'Great news — your Club membership has been approved.',
      '',
      'You can now log in and browse curated homes in Puglia, manage your key wallet, and book stays.',
      '',
      `Log in: ${APP_URL}/auth/login`,
      '',
      'Welcome to the Club.',
      '— One Key to Everywhere',
    ].join('\n'),
  }
}

export function ownerWaitlistAckEmail(firstName: string): EmailPayload {
  return {
    to: '',
    subject: 'We received your property enquiry',
    text: [
      `Hi ${firstName},`,
      '',
      'Thank you for reaching out about listing your home with One Key to Everywhere.',
      '',
      'Our team reviews every owner enquiry personally. We will be in touch within a few days.',
      '',
      '— One Key to Everywhere',
    ].join('\n'),
  }
}

export function memberWaitlistAckEmail(firstName: string): EmailPayload {
  return {
    to: '',
    subject: "You're on the Club waitlist",
    text: [
      `Hi ${firstName},`,
      '',
      "Thank you for your interest in One Key to Everywhere.",
      '',
      "Club memberships are limited and selective. We'll reach out when it's your moment.",
      '',
      '— One Key to Everywhere',
    ].join('\n'),
  }
}

export function passwordResetEmail(firstName: string, token: string): EmailPayload {
  const link = `${APP_URL}/auth/reset-password?token=${token}`
  return {
    to: '',
    subject: 'Reset your One Key to Everywhere password',
    text: [
      `Hi ${firstName},`,
      '',
      'We received a request to reset your password.',
      '',
      `Click the link below to choose a new password. The link expires in 1 hour:`,
      link,
      '',
      "If you didn't request a password reset, you can safely ignore this email.",
      '',
      '— One Key to Everywhere',
    ].join('\n'),
    html: [
      `<p>Hi ${firstName},</p>`,
      '<p>We received a request to reset your password.</p>',
      '<p><a href="' + link + '">Reset your password</a> (link expires in 1 hour)</p>',
      "<p>If you didn't request a password reset, you can safely ignore this email.</p>",
      '<p>— One Key to Everywhere</p>',
    ].join('\n'),
  }
}

export function emailVerificationEmail(firstName: string, token: string): EmailPayload {
  const link = `${APP_URL}/auth/verify-email?token=${token}`
  return {
    to: '',
    subject: 'Confirm your email — One Key to Everywhere',
    text: [
      `Hi ${firstName},`,
      '',
      'Welcome to One Key to Everywhere. Please confirm your email address to activate your account.',
      '',
      'Click the link below to verify your email. The link expires in 24 hours:',
      link,
      '',
      "If you didn't create an account, you can safely ignore this email.",
      '',
      '— One Key to Everywhere',
    ].join('\n'),
    html: [
      `<p>Hi ${firstName},</p>`,
      '<p>Welcome to One Key to Everywhere. Please confirm your email address to activate your account.</p>',
      '<p><a href="' + link + '">Verify your email</a> (link expires in 24 hours)</p>',
      "<p>If you didn't create an account, you can safely ignore this email.</p>",
      '<p>— One Key to Everywhere</p>',
    ].join('\n'),
  }
}
