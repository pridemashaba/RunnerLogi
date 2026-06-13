<<<<<<< HEAD
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env vars');
}

async function createRouteSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl as string, supabaseKey as string, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.delete({ ...options, name });
      },
    },
  });
}

async function ensureCallbackProfile(client: Awaited<ReturnType<typeof createRouteSupabaseClient>>) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return;

  const metadata = data.user.user_metadata as Record<string, string> | undefined;
  const { error: profileError } = await client.from('profiles').upsert(
    {
      id: data.user.id,
      email: data.user.email,
      full_name: metadata?.name || metadata?.full_name || data.user.email?.split('@')[0] || data.user.id,
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    console.error('[auth/callback] profile error:', profileError);
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin));
  }

  try {
    const client = await createRouteSupabaseClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[auth/callback] exchange error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
    }
    await ensureCallbackProfile(client);
  } catch (error) {
    console.error('[auth/callback] unexpected error:', error);
    return NextResponse.redirect(new URL('/login?error=unexpected', requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
=======
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  return NextResponse.redirect(
    new URL('/dashboard', requestUrl.origin)
  );
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
}
