import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail';

export async function GET() {
  const start = Date.now();
  try {
    const info = await sendMail({
      to: process.env.SMTP_USER || 'test@example.com',
      subject: 'RunnerLogi SMTP Test',
      html: '<p>SMTP test email from RunnerLogi.</p>',
    });
    const elapsed = Date.now() - start;
    return NextResponse.json({
      ok: true,
      elapsedMs: elapsed,
      messageId: info?.messageId || null,
    });
  } catch (error) {
    const elapsed = Date.now() - start;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        elapsedMs: elapsed,
        error: message,
        troubleshooting: [
          'Verify SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are set in .env.local',
          'Check Brevo dashboard - SMTP key/credentials must be active',
          'Ensure FROM_EMAIL matches your Brevo verified sender',
        ],
      },
      { status: 500 }
    );
  }
}
