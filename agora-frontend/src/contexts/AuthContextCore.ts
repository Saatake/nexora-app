import { createContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  course?: string;
  bio?: string;
  roleType?: string;
}

export interface AuthContextData {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined);
