import { supabase } from '@/lib/supabaseClient';
import { User } from '@/types';

export async function login(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return null;
  }

  const userId = authData.user.id;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return {
    token: authData.session?.access_token ?? '',
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      phone: profile.phone,
      createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
    },
  };
}

export async function register(userData: Partial<User> & { password: string }): Promise<{ user: User; token: string } | null> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email!,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        phone: userData.phone,
      },
    },
  });

  if (authError || !authData.user) {
    return null;
  }

  const userId = authData.user.id;

  // Create profile in the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: 'runner',
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (profileError || !profile) {
    return null;
  }

  return {
    token: authData.session?.access_token ?? '',
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      phone: profile.phone,
      createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
    },
  };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!document.cookie.includes('token=');
}

export function getUserRole(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/user-role=([^;]+)/);
  return match ? match[1] : null;
}