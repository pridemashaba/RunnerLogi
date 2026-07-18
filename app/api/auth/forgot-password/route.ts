import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendMail, generateAuthCode, emailTemplates } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email ?? '').toString().trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = (await sql`
      SELECT id, name FROM users WHERE email = ${email} LIMIT 1
    `) as Array<{ id: string; name: string }>;

    if (user.length === 0) {
      return NextResponse.json({ message: 'If an account exists, reset instructions have been sent.' });
    }

    const code = generateAuthCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await sql`
      INSERT INTO verification_codes (user_id, code, expires_at)
      VALUES (${user[0].id}, ${code}, ${expiresAt})
      ON CONFLICT (user_id) DO UPDATE SET
        code = EXCLUDED.code,
        expires_at = EXCLUDED.expires_at,
        used_at = NULL
    `;

    const template = emailTemplates.passwordReset(user[0].name || 'User', code);
    await sendMail({ to: email, subject: template.subject, html: template.html });

    return NextResponse.json({ message: 'If an account exists, reset instructions have been sent.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong';
    console.error('[auth/forgot-password] error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
