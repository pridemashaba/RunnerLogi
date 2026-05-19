import { config } from 'dotenv';
config({ path: '.env.local' });

// Supabase DB check removed.
// This repo currently uses localStorage + cookies demo auth in `lib/auth.ts`.

async function checkDatabase() {
  console.log('Supabase DB check removed (not configured in this build).');
  return;
}

checkDatabase();

