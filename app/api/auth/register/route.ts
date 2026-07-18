import { NextResponse } from 'next/server';
import { createUser, signToken } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

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

function toPublicUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone ?? '',
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = (body.name ?? '').toString().trim();
    const email = (body.email ?? '').toString().trim();
    const phone = (body.phone ?? '').toString().trim();
    const password = (body.password ?? '').toString();

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const user = await createUser({ name, email, phone, password });
    const token = signToken(user);

    const response = NextResponse.json({ user: toPublicUser(user), token });
    setAuthCookies(response, user, token);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    if (message.includes('already registered')) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    console.error('[auth/register] error:', error);
    if (message.includes('fetch failed') || message.includes('ETIMEDOUT') || message.includes('timeout')) {
      return NextResponse.json({ error: 'Database connection timeout. Please try again in a moment.' }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
