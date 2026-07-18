import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = (body.code ?? '').toString().trim();
    const password = (body.password ?? '').toString();

    if (!code || !password) {
      return NextResponse.json({ error: 'Code and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const result = (await sql`
      SELECT user_id FROM verification_codes
      WHERE code = ${code} AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `) as Array<{ user_id: string }>;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${result[0].user_id}`;
    await sql`UPDATE verification_codes SET used_at = CURRENT_TIMESTAMP WHERE code = ${code}`;

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong';
    console.error('[auth/reset-password] error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
