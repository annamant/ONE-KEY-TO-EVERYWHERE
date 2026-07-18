type EmailPayload = {
  to: string
  subject: string
  text: string
  html?: string
}

/** Sends email. In dev, logs to console. Set SMTP env vars for production. */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { to, subject, text } = payload

  if (process.env.SMTP_HOST) {
    // Production hook — wire your SMTP provider here
    console.log(`[email] SMTP not fully configured — would send to ${to}: ${subject}`)
    return
  }

  console.log('\n─── EMAIL ───────────────────────────────────────')
  console.log(`To:      ${to}`)
  console.log(`Subject: ${subject}`)
  console.log('─'.repeat(50))
  console.log(text)
  console.log('─────────────────────────────────────────────────\n')
}

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
      'Log in: http://localhost:5173/auth/login',
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
