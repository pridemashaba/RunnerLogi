import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const range = requestUrl.searchParams.get('range') || 'week';

  const usersRow = (await sql`
    SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_active = true) AS active FROM users
  `) as Array<{ total: string; active: string }>;

  const loginsRow = (await sql`
    SELECT COUNT(*) AS total FROM user_login_history
  `) as Array<{ total: string }>;

  const deliveriesRow = (await sql`
    SELECT COUNT(*) AS total FROM deliveries
  `) as Array<{ total: string }>;

  const totalUsers = Number(usersRow[0]?.total ?? 0);
  const activeUsers = Number(usersRow[0]?.active ?? 0);
  const totalLogins = Number(loginsRow[0]?.total ?? 0);
  const totalDeliveries = Number(deliveriesRow[0]?.total ?? 0);

  return NextResponse.json({
    totalUsers,
    activeUsers,
    totalLogins,
    totalDeliveries,
    range,
  });
}
