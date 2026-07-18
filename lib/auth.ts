import { randomBytes, scrypt, timingSafeEqual, createHmac } from 'crypto';
import { sql } from '@/lib/db';

export type AuthRole = 'seller' | 'runner' | 'admin';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  phone: string | null;
};

const AUTH_SECRET = process.env.AUTH_SECRET || 'runnerlogi_dev_secret_change_me_in_production';
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 1 day

function base64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString('hex');
    scrypt(password, salt, 64, (err, derived) => {
      if (err) return reject(err);
      resolve(`${salt}:${derived.toString('hex')}`);
    });
  });
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return resolve(false);
    scrypt(password, salt, 64, (err, derived) => {
      if (err) return reject(err);
      try {
        resolve(timingSafeEqual(Buffer.from(hash, 'hex'), derived));
      } catch {
        resolve(false);
      }
    });
  });
}

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  phone: string | null;
};

export async function createUser(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<AuthUser> {
  const email = input.email.toLowerCase();
  const passwordHash = await hashPassword(input.password);

  const inserted = (await sql`
    INSERT INTO users (email, name, phone, role, password_hash)
    VALUES (${email}, ${input.name.trim()}, ${input.phone || null}, 'seller', ${passwordHash})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, name, role, phone
  `) as UserRow[];

  if (inserted.length === 0) {
    throw new Error('Email already registered');
  }

  return inserted[0];
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const rows = (await sql`
    SELECT id, email, name, role, phone, password_hash
    FROM users
    WHERE email = ${email.toLowerCase()}
    LIMIT 1
  `) as Array<UserRow & { password_hash: string }>;

  const row = rows[0];
  if (!row) return null;

  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    phone: row.phone,
  };
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const rows = (await sql`
    SELECT id, email, name, role, phone
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `) as UserRow[];

  return rows[0] ?? null;
}

export function signToken(user: AuthUser): string {
  const payload = base64Url(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    })
  );
  const signature = base64Url(
    createHmac('sha256', AUTH_SECRET).update(payload).digest()
  );
  return `${payload}.${signature}`;
}

export function verifyToken(token: string): { sub: string } | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = base64Url(
    createHmac('sha256', AUTH_SECRET).update(payload).digest()
  );
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as {
      sub: string;
      exp: number;
    };
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: data.sub };
  } catch {
    return null;
  }
}

export async function getUserFromToken(token: string | undefined): Promise<AuthUser | null> {
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return getUserById(decoded.sub);
}
