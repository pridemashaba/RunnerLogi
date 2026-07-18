import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  is_active: boolean;
  delivery_count: number;
  login_count: number;
};

export async function GET() {
  const rows = (await sql`
    SELECT u.id, u.email, u.name, u.role, u.phone, u.is_active,
           COUNT(d.id) AS delivery_count,
           COUNT(l.id) AS login_count
    FROM users u
    LEFT JOIN deliveries d ON d.seller_id = u.id
    LEFT JOIN user_login_history l ON l.user_id = u.id
    GROUP BY u.id, u.email, u.name, u.role, u.phone, u.is_active
    ORDER BY u.created_at DESC
  `) as UserRow[];

  return NextResponse.json(
    rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      phone: row.phone ?? '',
      active: row.is_active,
      count: Number(row.delivery_count),
      logins: Number(row.login_count),
    }))
  );
}
