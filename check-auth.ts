import { config } from 'dotenv';
config({ path: '.env.local' });

// Supabase auth check removed.
// This repo currently uses localStorage + cookies demo auth in `lib/auth.ts`.

async function checkAuthUsers() {
  console.log('Supabase auth check removed (not configured in this build).');
  return;
}

checkAuthUsers();

