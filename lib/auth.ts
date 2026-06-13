import { getSupabaseClient } from '@/lib/supabase';
import { User } from '@/types';

type StoredSession = {
  token: string;
  userId: string;
  userRole: User['role'];
  createdAt: string;
};

const LS_SESSION_KEY = 'soweto.session.v1';

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getSession(): StoredSession | null {
  if (typeof window === 'undefined') return null;
  return safeJsonParse<StoredSession>(window.localStorage.getItem(LS_SESSION_KEY));
}

function setSession(session: StoredSession | null) {
  if (typeof window === 'undefined') return;
  if (!session) {
    window.localStorage.removeItem(LS_SESSION_KEY);
    return;
  }
  window.localStorage.setItem(LS_SESSION_KEY, JSON.stringify(session));
}

function setAuthCookies(session: StoredSession) {
  document.cookie = `token=${session.token}; path=/; max-age=86400`;
  document.cookie = `user-role=${session.userRole}; path=/; max-age=86400`;
}

function clearAuthCookies() {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export async function getUser() {
  if (typeof window === 'undefined') return null;

  const session = getSession();
  if (!session) return null;

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;

    const email = data.user.email ?? '';
    const name =
      (data.user.user_metadata as Record<string, string> | undefined)?.name ||
      (data.user.user_metadata as Record<string, string> | undefined)?.full_name ||
      email.split('@')[0];

    return {
      id: data.user.id,
      email,
      name,
      role: session.userRole,
      createdAt: new Date(data.user.created_at),
    } satisfies User;
  } catch {
    return null;
  }
}

type SupabaseUser = {
  id: string;
  email?: string | null;
  user_metadata?: unknown;
};

async function ensureUserProfile(
  client: Awaited<ReturnType<typeof getSupabaseClient>>,
  user: SupabaseUser,
  fallbackName: string
) {
  const metadata = user.user_metadata as Record<string, string> | undefined;
  const { error } = await client.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      full_name: metadata?.name || metadata?.full_name || fallbackName,
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('[auth] ensureUserProfile error:', error);
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string; message?: string } | { error: string } | null> {
  if (typeof window === 'undefined') return null;

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.user || !data.session) {
      if (error?.message?.toLowerCase().includes('email not confirmed')) {
        return { error: 'Please verify your email before signing in.' };
      }
      return null;
    }

    const token = data.session.access_token;
    const role =
      ((data.user.user_metadata as Record<string, string> | undefined)?.role as User['role']) || 'runner';

    const storedSession: StoredSession = {
      token,
      userId: data.user.id,
      userRole: role,
      createdAt: new Date().toISOString(),
    };

    setSession(storedSession);
    setAuthCookies(storedSession);
    await ensureUserProfile(client, data.user, email);

    return {
      token,
      user: {
        id: data.user.id,
        email: data.user.email ?? '',
        name:
          (data.user.user_metadata as Record<string, string> | undefined)?.name ||
          (data.user.user_metadata as Record<string, string> | undefined)?.full_name ||
          email.split('@')[0],
        role,
        createdAt: new Date(data.user.created_at),
      },
    };
  } catch {
    return null;
  }
}

export async function register(
  userData: { name?: string; email: string; phone?: string; password: string }
): Promise<
  | { user: User; token: string; needsEmailConfirmation?: boolean; message?: string }
  | { needsEmailConfirmation: true; message: string }
  | { error: string }
  | null
> {
  if (typeof window === 'undefined') return null;

  try {
    const { name, email, password } = userData;

    const metadata: Record<string, string> = {
      name: name?.trim() ?? email.split('@')[0],
    };
    if (userData.phone && userData.phone.trim()) {
      metadata.phone = userData.phone.trim();
    }

    const client = await getSupabaseClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        data: metadata,
      },
    });

    if (error) {
      if (error.message.includes('after 25 seconds')) {
        return { error: 'Too many registration attempts. Please wait a moment and try again.' };
      }
      return { error: error.message };
    }
    if (!data.user) {
      return { error: 'Registration failed. Please try again.' };
    }

    const role: User['role'] = 'runner';

    try {
      await ensureUserProfile(client, data.user, metadata.name);
    } catch (profileError) {
      console.error('[auth] profile creation error:', profileError);
    }

    if (data.session?.access_token) {
      const storedSession: StoredSession = {
        token: data.session.access_token,
        userId: data.user.id,
        userRole: role,
        createdAt: new Date().toISOString(),
      };

      setSession(storedSession);
      setAuthCookies(storedSession);
    }

    if (!data.session) {
      return {
        needsEmailConfirmation: true,
        message: 'Please verify your email before signing in.',
      };
    }

    const token = data.session.access_token;

    return {
      token,
      user: {
        id: data.user.id,
        email: data.user.email ?? '',
        name: metadata.name,
        role,
        phone: metadata.phone,
        createdAt: new Date(data.user.created_at),
      },
    };
  } catch (error) {
    console.error('[auth] register failed:', error);
    return null;
  }
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const client = await getSupabaseClient();
      await client.auth.signOut();
    } catch {
      // best effort logout
    }
    setSession(null);
    clearAuthCookies();
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.localStorage.getItem(LS_SESSION_KEY);
}

export function getSessionRole(): string | null {
  if (typeof window === 'undefined') return null;
  const session = getSession();
  return session?.userRole ?? null;
}

export async function updateUserProfile(updates: Record<string, unknown>) {
  if (typeof window === 'undefined') return null;
  const session = getSession();
  if (!session) return null;

  try {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('profiles')
      .upsert({ id: session.userId, ...updates }, { onConflict: 'id' });

    if (error) {
      console.error('[auth] updateUserProfile error:', error);
      return null;
    }

    return { id: session.userId, ...updates };
  } catch {
    return null;
  }
}

export async function fetchUserProfile() {
  const session = getSession();
  if (!session) return null;

  try {
    const client = await getSupabaseClient();
    const { data, error } = await client.from('profiles').select('*').eq('id', session.userId).single();

    if (error) {
      console.error('[auth] fetchUserProfile error:', error);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

