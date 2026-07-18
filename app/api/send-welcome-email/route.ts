import { NextResponse } from 'next/server';
import { sendMail, emailTemplates, generateAuthCode } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email ?? '').toString().trim().toLowerCase();
    const name = (body.name ?? '').toString().trim();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const code = generateAuthCode();
    const template = emailTemplates.welcome(name || 'User', code);
    const info = await sendMail({ to: email, subject: template.subject, html: template.html });

    return NextResponse.json({ ok: true, messageId: info?.messageId || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    console.error('[api/send-welcome-email] error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
