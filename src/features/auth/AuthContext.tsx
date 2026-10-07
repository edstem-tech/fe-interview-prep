import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as backend from './mockBackend';
import type { User } from './mockBackend';
import { tokenStore } from './tokenStore';
import { api, setAuthFailureHandler } from './apiClient';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // If a refresh ever fails under the hood, drop to anonymous.
    setAuthFailureHandler(() => {
      setUser(null);
      setStatus('anonymous');
    });

    let active = true;
    async function restore() {
      // No refresh token → nothing to restore; we can show login immediately.
      if (!tokenStore.getRefresh()) {
        if (active) setStatus('anonymous');
        return;
      }
      try {
        // The access token is gone after a reload; api.me() transparently refreshes
        // it from the persisted refresh token, so we never flash the login page.
        const restored = await api.me();
        if (active) {
          setUser(restored);
          setStatus('authenticated');
        }
      } catch {
        if (active) {
          tokenStore.clear();
          setUser(null);
          setStatus('anonymous');
        }
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);

  async function login(username: string, password: string): Promise<void> {
    const result = await backend.login(username, password);
    tokenStore.setAccess(result.accessToken);
    tokenStore.setRefresh(result.refreshToken);
    setUser(result.user);
    setStatus('authenticated');
  }

  function logout(): void {
    tokenStore.clear();
    setUser(null);
    setStatus('anonymous');
  }

  return (
    <AuthContext.Provider value={{ status, user, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
