import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserFromToken } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST() {
  let userId: string | null = null;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const user = await getUserFromToken(token);
      if (user) {
        userId = user.id;
        await sql`
          UPDATE user_login_history
          SET logged_out_at = CURRENT_TIMESTAMP
          WHERE user_id = ${user.id}
            AND logged_out_at IS NULL
          ORDER BY logged_in_at DESC
          LIMIT 1
        `;
      }
    }
  } catch (error) {
    console.error('[auth/logout] failed to record logout:', error);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('token', '', { path: '/', maxAge: 0 });
  response.cookies.set('user-role', '', { path: '/', maxAge: 0 });
  return response;
}
