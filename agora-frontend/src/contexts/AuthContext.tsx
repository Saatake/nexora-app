import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api, { AUTH_TOKEN_KEY } from '../api/axios';

interface User {
  id: string;
  name: string;
  email: string;
  course?: string;
  bio?: string;
  roleType?: string;
  photoUrl?: string;
  featureTags?: string[];
  hasAiAccess?: boolean;
}

interface AuthContextData {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // restaura sessão ao carregar a página se o cookie/token ainda for válido
  useEffect(() => {
    api.get('/users/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = (loggedUser: User) => {
    setUser(loggedUser);
    setIsLoading(false); // evita race: /auth/me em voo não vai sobrescrever o login
  };

  const logout = async () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    await api.post('/auth/logout').catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
