import { User } from './types';

// Mock authentication for development
export const mockUser: User = {
  id: 'user-1',
  email: 'dr.reviewer@example.com',
  name: 'Dr. Reviewer',
  role: 'REVIEWER',
};

export async function getSession(): Promise<User | null> {
  // In production, this would use proper session management
  return mockUser;
}

export async function signIn(email: string): Promise<User> {
  // Mock sign in
  return {
    id: 'user-1',
    email,
    name: 'Dr. User',
    role: 'REVIEWER',
  };
}

export async function signOut(): Promise<void> {
  // Mock sign out
  console.log('Signed out');
}

export function requireRole(user: User | null, allowedRoles: ('CONTRIBUTOR' | 'REVIEWER')[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
