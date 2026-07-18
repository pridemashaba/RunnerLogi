'use client';

const LS_SESSION_KEY = 'runnerlogi.session.v1';

type StoredSession = {
  token: string;
  userId: string;
  userRole: string;
};

type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
};

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

export type RegisterResult =
  | { user: PublicUser; token: string }
  | { error: string }
  | null;

export async function register(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<RegisterResult> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      return { error: json.error || 'Registration failed' };
    }
    setSession({ token: json.token, userId: json.user.id, userRole: json.user.role });
    return { user: json.user, token: json.token };
  } catch {
    return null;
  }
}

export type LoginResult =
  | { user: PublicUser; token: string }
  | { error: string }
  | null;

export async function login(data: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      return { error: json.error || 'Login failed' };
    }
    setSession({ token: json.token, userId: json.user.id, userRole: json.user.role });
    return { user: json.user, token: json.token };
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // best effort
  }
  setSession(null);
}

export type ProfileData = {
  id: string;
  email: string;
  name: string;
  phone: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
};

export async function fetchUserProfile(): Promise<ProfileData | null> {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    return (await res.json()) as ProfileData;
  } catch {
    return null;
  }
}

export async function updateUserProfile(
  updates: Record<string, string>
): Promise<ProfileData | null> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return null;
    return (await res.json()) as ProfileData;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.localStorage.getItem(LS_SESSION_KEY);
}

export function getSessionRole(): string | null {
  return getSession()?.userRole ?? null;
}
