import { Resend } from 'resend'

let resend: Resend | null = null

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

const from = process.env.RESEND_FROM_EMAIL || 'CXM <noreply@cxm.nz>'
const appUrl = process.env.APP_URL || 'http://localhost:3008'

export async function sendVerificationEmail(
  to: string,
  code: string,
  token: string
): Promise<void> {
  const link = `${appUrl}/verify?token=${token}`

  await getResend().emails.send({
    from,
    to,
    subject: 'Verify your email — CXM Project Builder',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0;">CXM</h1>
          <p style="color: #666; font-size: 14px; margin-top: 4px;">Project Builder</p>
        </div>
        <h2 style="font-size: 20px; color: #1a1a2e; margin-bottom: 16px;">Verify your email</h2>
        <p style="color: #444; font-size: 15px; line-height: 1.6;">
          Your verification code is:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a1a2e; background: #f4f4f8; padding: 16px 32px; border-radius: 12px; display: inline-block;">
            ${code}
          </span>
        </div>
        <p style="color: #444; font-size: 15px; line-height: 1.6;">
          Or click the button below to verify directly:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${link}" style="display: inline-block; padding: 14px 32px; background: #1a1a2e; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Verify Email
          </a>
        </div>
        <p style="color: #999; font-size: 13px; line-height: 1.5;">
          This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const link = `${appUrl}/reset-password?token=${token}`

  await getResend().emails.send({
    from,
    to,
    subject: 'Reset your password — CXM Project Builder',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0;">CXM</h1>
          <p style="color: #666; font-size: 14px; margin-top: 4px;">Project Builder</p>
        </div>
        <h2 style="font-size: 20px; color: #1a1a2e; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #444; font-size: 15px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${link}" style="display: inline-block; padding: 14px 32px; background: #1a1a2e; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Reset Password
          </a>
        </div>
        <p style="color: #999; font-size: 13px; line-height: 1.5;">
          This link expires in 15 minutes. If you didn't request this, your account is safe — no changes have been made.
        </p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await getResend().emails.send({
    from,
    to,
    subject: 'Welcome to CXM Project Builder',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0;">CXM</h1>
          <p style="color: #666; font-size: 14px; margin-top: 4px;">Project Builder</p>
        </div>
        <h2 style="font-size: 20px; color: #1a1a2e; margin-bottom: 16px;">Welcome${name ? `, ${name}` : ''}!</h2>
        <p style="color: #444; font-size: 15px; line-height: 1.6;">
          Your account is set up and ready to go. Start building your technology stack by creating your first project.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${appUrl}/projects/new" style="display: inline-block; padding: 14px 32px; background: #1a1a2e; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Start a Project
          </a>
        </div>
        <p style="color: #999; font-size: 13px;">
          Need help? Reply to this email and we'll get back to you.
        </p>
      </div>
    `,
  })
}
