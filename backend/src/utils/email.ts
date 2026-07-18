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

/** Sends email via SMTP when configured, otherwise logs to console for dev. */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { to, subject, text, html } = payload

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
