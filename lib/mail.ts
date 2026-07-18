import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || '587');
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.FROM_EMAIL || 'RunnerLogi <no-reply@runnerlogi.com>';

if (!host || !user || !pass) {
  console.warn('[mail] SMTP is not fully configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS.');
}

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error('[mail] failed to send email:', error);
    throw error;
  }
}

export function generateAuthCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const emailTemplates = {
  welcome: (name: string, code: string) => ({
    subject: 'Welcome to RunnerLogi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to RunnerLogi, ${name}!</h2>
        <p>Your account has been created successfully.</p>
        <p>Use the verification code below to complete your setup:</p>
        <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 24px; letter-spacing: 4px; font-weight: bold; border-radius: 8px; margin: 16px 0;">
          ${code}
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      </div>
    `,
  }),
  passwordReset: (name: string, code: string) => ({
    subject: 'Reset your RunnerLogi password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Use the code below:</p>
        <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 24px; letter-spacing: 4px; font-weight: bold; border-radius: 8px; margin: 16px 0;">
          ${code}
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  }),
};
