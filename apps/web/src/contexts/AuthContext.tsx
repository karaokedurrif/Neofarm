'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'socio';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => false,
  logout: () => {},
});

// Hardcoded users (demo — matches capones-backend admin_routes pattern)
const DEMO_USERS: Array<User & { password: string }> = [
  { id: 1, name: 'Jesús', email: 'jesus@ovosfera.com', password: 'ovosfera2025', role: 'admin', avatar: '🧑‍🌾' },
  { id: 2, name: 'Fran', email: 'fran@ovosfera.com', password: 'ovosfera2025', role: 'socio', avatar: '👨‍🔬' },
  { id: 3, name: 'David', email: 'david@ovosfera.com', password: 'ovosfera2025', role: 'admin', avatar: '👨‍💻' },
];

const AUTH_KEY = 'ovosfera_auth';
const PUBLIC_ROUTES = ['/', '/login', '/register'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
    setLoading(false);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_ROUTES.some(r => r === '/' ? pathname === '/' : pathname === r || pathname?.startsWith(r + '/'));
    if (!user && !isPublic) {
      router.replace('/login');
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const found = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return false;

    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(safeUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    router.replace('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

