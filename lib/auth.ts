import { User } from '@/types';

type StoredUser = Omit<User, 'createdAt'> & { passwordHash: string; createdAt: string };

type StoredSession = { token: string; userId: string; userRole: User['role']; createdAt: string };

const LS_USERS_KEY = 'soweto.users.v1';
const LS_SESSION_KEY = 'soweto.session.v1';

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  return safeJsonParse<StoredUser[]>(window.localStorage.getItem(LS_USERS_KEY)) ?? [];
}

function setUsers(users: StoredUser[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
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
  document.cookie = `token=${session.token}; path=/; max-age=86400`;
  document.cookie = `user-role=${session.userRole}; path=/; max-age=86400`;
}

function clearAuthCookies() {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export async function login(email: string, password: string): Promise<{ user: User; token: string } | null> {
  if (typeof window === 'undefined') return null;

  const users = getUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!found) return null;

  const passHash = hashPassword(password);
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
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    setSession(null);
    clearAuthCookies();
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!document.cookie.match(/token=([^;]+)/);
}

export function getUserRole(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/user-role=([^;]+)/);
  return match ? match[1] : null;
}

