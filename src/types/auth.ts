export type UserRole = 'citizen' | 'officer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  designation?: string;
  department?: string;
  jurisdiction?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token?: string;
}

export const USER_ROLES: UserRole[] = ['citizen', 'officer', 'admin'];
