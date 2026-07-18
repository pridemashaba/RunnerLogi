import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  website: string | null;
};

export async function GET() {
  const cookieStore = await cookies();
  const user = await getUserFromToken(cookieStore.get('token')?.value);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = (await sql`
    SELECT u.id, u.email, u.name, u.phone,
           p.company_name, p.address, p.city, p.state, p.zip_code, p.country, p.website
    FROM users u
    LEFT JOIN user_profiles p ON p.id = u.id
    WHERE u.id = ${user.id}
    LIMIT 1
  `) as ProfileRow[];

  const row = rows[0];
  return NextResponse.json({
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone ?? '',
    companyName: row.company_name ?? '',
    address: row.address ?? '',
    city: row.city ?? '',
    state: row.state ?? '',
    zipCode: row.zip_code ?? '',
    country: row.country ?? '',
    website: row.website ?? '',
  });
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const user = await getUserFromToken(cookieStore.get('token')?.value);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const name = (body.name ?? '').toString().trim();
  const phone = (body.phone ?? '').toString().trim();
  const companyName = (body.companyName ?? '').toString().trim();
  const address = (body.address ?? '').toString().trim();
  const city = (body.city ?? '').toString().trim();
  const state = (body.state ?? '').toString().trim();
  const zipCode = (body.zipCode ?? '').toString().trim();
  const country = (body.country ?? '').toString().trim();
  const website = (body.website ?? '').toString().trim();

  await sql`
    UPDATE users SET name = ${name || user.name}, phone = ${phone || null}
    WHERE id = ${user.id}
  `;

  await sql`
    INSERT INTO user_profiles (id, company_name, address, city, state, zip_code, country, website)
    VALUES (${user.id}, ${companyName || null}, ${address || null}, ${city || null},
            ${state || null}, ${zipCode || null}, ${country || null}, ${website || null})
    ON CONFLICT (id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      state = EXCLUDED.state,
      zip_code = EXCLUDED.zip_code,
      country = EXCLUDED.country,
      website = EXCLUDED.website
  `;

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name,
    phone,
    companyName,
    address,
    city,
    state,
    zipCode,
    country,
    website,
  });
}
