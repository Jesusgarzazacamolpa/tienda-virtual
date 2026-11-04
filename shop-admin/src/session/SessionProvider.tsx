import { useCallback, useMemo, useState, type ReactNode } from 'react';

import {
  SESSION_STORAGE_KEY,
  SessionContext,
  type SessionContextValue
} from '@/session/session-context';

function readStoredToken(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken);

  const signIn = useCallback((nextToken: string) => {
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, nextToken);
    } catch {
      // La sesión sigue activa en memoria aunque el navegador bloquee el almacenamiento.
    }
    setToken(nextToken);
  }, []);

  const signOut = useCallback(() => {
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Sin almacenamiento disponible no hay nada que limpiar.
    }
    setToken(null);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ token, signIn, signOut }),
    [token, signIn, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
