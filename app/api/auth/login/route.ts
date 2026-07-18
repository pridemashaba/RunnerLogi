import { NextResponse } from 'next/server';
import { verifyCredentials, signToken } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';
import { sql } from '@/lib/db';

function setAuthCookies(response: NextResponse, user: AuthUser, token: string) {
  response.cookies.set('token', token, {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
  });
  response.cookies.set('user-role', user.role, {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email ?? '').toString().trim();
    const password = (body.password ?? '').toString();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await verifyCredentials(email, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken(user);
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone ?? '',
      },
      token,
    });
    setAuthCookies(response, user, token);

    try {
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0].trim() : null;
      const userAgent = request.headers.get('user-agent') ?? null;
      await sql`
        INSERT INTO user_login_history (user_id, ip_address, user_agent)
        VALUES (${user.id}, ${ip}, ${userAgent})
      `;
    } catch (logError) {
      console.error('[auth/login] failed to record login:', logError);
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    console.error('[auth/login] error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
