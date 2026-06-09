import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin));
  }

  try {
    const client = await getSupabaseClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[auth/callback] exchange error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
    }
  } catch (error) {
    console.error('[auth/callback] unexpected error:', error);
    return NextResponse.redirect(new URL('/login?error=unexpected', requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
