/**
 * AuthContext — single source of truth for auth state.
 *
 * Replaces scattered `localStorage.getItem('token')` / `localStorage.getItem('userId')`
 * calls across the app. Consumers use `useAuth()`.
 *
 * Provides:
 *  - token / userId / isAuthenticated (derived)
 *  - login(token, userId)  — called after successful login/register
 *  - logout()              — clears storage and redirects to /login
 */
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AuthState {
  token: string | null;
  userId: string | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (token: string, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStorage(): AuthState {
  return {
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(readStorage);

  const login = useCallback((token: string, userId: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    setAuth({ token, userId });
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setAuth({ token: null, userId: null });
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, isAuthenticated: !!auth.token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
