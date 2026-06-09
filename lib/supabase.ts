import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const fallbackAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = publishableKey || fallbackAnonKey!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase env vars');
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

export const signUp = async (email: string, password: string) => {
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env vars');

  const client = await getSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    },
  });

  if (error) {
    console.error('[supabase] signUp error:', error);
    throw error;
  }
  return data;
};

export const signInWithPassword = async (email: string, password: string) => {
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env vars');

  const client = await getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[supabase] signIn error:', error);
    throw error;
  }
  return data;
};

export const signOut = async () => {
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env vars');

  const client = await getSupabaseClient();
  const { error } = await client.auth.signOut();
  if (error) console.error('[supabase] signOut error:', error);
};

export const saveUserProfile = async (userId: string, profile: Record<string, unknown>) => {
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env vars');
  const client = await getSupabaseClient();
  const { data, error } = await client.from('profiles').upsert({ id: userId, ...profile }, { onConflict: 'id' });

  if (error) {
    console.error('[supabase] saveUserProfile error:', error);
    throw error;
  }
  return data;
};

export const fetchUserProfile = async (userId: string) => {
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env vars');
  const client = await getSupabaseClient();
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    console.error('[supabase] fetchUserProfile error:', error);
    throw error;
  }
  return data;
};

