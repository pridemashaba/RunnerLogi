import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    database: '/api/diagnostics/database',
    smtp: '/api/diagnostics/smtp',
  });
}
