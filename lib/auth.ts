import { User } from '@/types';

// Mock user database - replace with actual DB
const mockUsers: User[] = [
  {
    id: '1',
    email: 'runner@example.com',
    name: 'John Runner',
    role: 'runner',
    phone: '+1234567890',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date(),
  },
];

export async function login(email: string, password: string): Promise<{ user: User; token: string } | null> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  const user = mockUsers.find(u => u.email === email);
  if (user && password === 'password123') {
    const token = btoa(JSON.stringify({ userId: user.id, role: user.role }));
    return { user, token };
  }
  return null;
}

export async function register(userData: Partial<User> & { password: string }): Promise<{ user: User; token: string } | null> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const newUser: User = {
    id: Date.now().toString(),
    email: userData.email!,
    name: userData.name!,
    role: 'runner',
    phone: userData.phone,
    createdAt: new Date(),
  };

  const token = btoa(JSON.stringify({ userId: newUser.id, role: newUser.role }));
  return { user: newUser, token };
}

export async function logout(): Promise<void> {
  // Clear cookies/session
}

export function isAuthenticated(): boolean {
  // Check if token exists and is valid
  return typeof window !== 'undefined' && !!document.cookie.includes('auth-token');
}

export function getUserRole(): string | null {
  const match = document.cookie.match(/user-role=([^;]+)/);
  return match ? match[1] : null;
}
