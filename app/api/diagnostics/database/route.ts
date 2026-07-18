import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  const start = Date.now();
  try {
    const result = await sql`SELECT NOW() AS now, version() AS version`;
    const elapsed = Date.now() - start;
    return NextResponse.json({
      ok: true,
      elapsedMs: elapsed,
      rows: result,
      hint: elapsed > 10000 ? 'Database was cold/waking up' : 'Database is responsive',
    });
  } catch (error) {
    const elapsed = Date.now() - start;
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? (error.stack ?? '') : '';
    return NextResponse.json(
      {
        ok: false,
        elapsedMs: elapsed,
        error: message,
        stack: stack.split('\n').slice(0, 5).join('\n'),
        troubleshooting: [
          'If login works but this fails, the DB may be cold/waking up - wait 30s and retry',
          'Check https://neon.tech - your DB may be suspended (free tier sleeps after inactivity)',
          'Verify NEON_DATABASE_URL in .env.local matches the Neon dashboard exactly',
          'Try a different network (mobile hotspot) to rule out ISP/ firewall blocking port 5432',
          'Stop dev server, delete .next folder, restart with npm run dev',
        ],
      },
      { status: 500 }
    );
  }
}
