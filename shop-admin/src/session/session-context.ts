import { createContext, useContext } from 'react';

export const SESSION_STORAGE_KEY = 'orbita-admin-token';

export interface SessionContextValue {
  token: string | null;
  signIn: (token: string) => void;
  signOut: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error('useSession debe usarse dentro de <SessionProvider>.');
  }

  return value;
}
