import { NextResponse } from 'next/server';

const dashboardStats = {
  totalDeliveries: 0,
  activeDeliveries: 0,
  revenue: 0,
  totalDrivers: 0,
  completionRate: 0,
  recentActivity: [],
};

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const range = requestUrl.searchParams.get('range') || 'week';

  return NextResponse.json({
    ...dashboardStats,
    range,
  });
}
