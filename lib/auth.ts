<<<<<<< HEAD
import { getSupabaseClient } from '@/lib/supabase';
import { User } from '@/types';

type StoredSession = {
  token: string;
  userId: string;
  userRole: User['role'];
  createdAt: string;
};

=======
import { User } from '@/types';

type StoredUser = Omit<User, 'createdAt'> & { passwordHash: string; createdAt: string };

type StoredSession = { token: string; userId: string; userRole: User['role']; createdAt: string };

const LS_USERS_KEY = 'soweto.users.v1';
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
const LS_SESSION_KEY = 'soweto.session.v1';

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

<<<<<<< HEAD
=======
function getUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  return safeJsonParse<StoredUser[]>(window.localStorage.getItem(LS_USERS_KEY)) ?? [];
}

function setUsers(users: StoredUser[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
}

>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
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

<<<<<<< HEAD
function setAuthCookies(session: StoredSession) {
=======
// Lightweight hash (demo only). Do NOT use for production auth.
function hashPassword(password: string) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 31 + password.charCodeAt(i)) >>> 0;
  }
  return `h_${hash.toString(16)}`;
}

function makeToken() {
  return `t_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function setAuthCookies(session: StoredSession) {
  // Keep compatibility with current app usage that reads token + user-role from cookies.
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
  document.cookie = `token=${session.token}; path=/; max-age=86400`;
  document.cookie = `user-role=${session.userRole}; path=/; max-age=86400`;
}

function clearAuthCookies() {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

<<<<<<< HEAD
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
=======
export async function login(email: string, password: string): Promise<{ user: User; token: string } | null> {
  if (typeof window === 'undefined') return null;

  const users = getUsers();
  console.log('[auth] login: users loaded:', users.length);

  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  console.log('[auth] login: email match found:', !!found, 'email:', email);
  if (!found) return null;

  const passHash = hashPassword(password);
  console.log('[auth] login: passwordHash matches:', found.passwordHash === passHash, 'userId:', found.id);

  if (found.passwordHash !== passHash) return null;


  const token = makeToken();
  const session: StoredSession = {
    token,
    userId: found.id,
    userRole: found.role,
    createdAt: new Date().toISOString(),
  };

  setSession(session);
  setAuthCookies(session);

  return {
    token,
    user: {
      id: found.id,
      email: found.email,
      name: found.name,
      role: found.role,
      phone: found.phone,
      createdAt: new Date(found.createdAt),
    },
  };
}

export async function register(
  userData: Partial<User> & { password: string }
): Promise<{ user: User; token: string } | null> {
  if (typeof window === 'undefined') return null;

  const name = userData.name?.trim();
  const email = userData.email?.trim();
  const phone = userData.phone?.trim();
  const password = userData.password;

  if (!name || !email || !password) return null;

  const users = getUsers();
  const emailTaken = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (emailTaken) return null;

  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const newUser: StoredUser = {
    id,
    email,
    name,
    phone: phone || undefined,
    role: 'runner',
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password),
  };

  users.unshift(newUser);
  setUsers(users);

  // Auto-login after register
  return login(email, password);
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
<<<<<<< HEAD
    try {
      const client = await getSupabaseClient();
      await client.auth.signOut();
    } catch {
      // best effort logout
    }
=======
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
    setSession(null);
    clearAuthCookies();
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
<<<<<<< HEAD
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
=======
  return !!document.cookie.match(/token=([^;]+)/);
}

export function getUserRole(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/user-role=([^;]+)/);
  return match ? match[1] : null;
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
}

