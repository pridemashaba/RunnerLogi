import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env vars');
}

function getPeriodStart(period: string) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === 'quarter') {
    start.setMonth(now.getMonth() - 3);
    return start;
  }

  if (period === 'year') {
    start.setFullYear(now.getFullYear() - 1);
    return start;
  }

  start.setDate(now.getDate() - 30);
  return start;
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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const period = requestUrl.searchParams.get('period') || 'month';
  const validPeriods = ['month', 'quarter', 'year'];
  const selectedPeriod = validPeriods.includes(period) ? period : 'month';

  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id);

    if (selectedPeriod !== 'year') {
      query = query.gte('date', getPeriodStart(selectedPeriod).toISOString());
    }

    const { data: invoices, error } = await query.order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(invoices || []);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
