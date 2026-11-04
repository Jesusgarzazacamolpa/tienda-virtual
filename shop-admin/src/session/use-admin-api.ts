import { useMemo } from 'react';

import { createAdminApi, type AdminApi } from '@/services/graphql-client';
import { useSession } from '@/session/session-context';

export function useAdminApi(): AdminApi {
  const { token, signOut } = useSession();
  const api = useMemo(() => (token ? createAdminApi(token, signOut) : null), [token, signOut]);

  if (!api) {
    throw new Error('No hay una sesión de administrador activa.');
  }

  return api;
}
