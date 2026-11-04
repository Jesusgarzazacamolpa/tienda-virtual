import { Outlet } from 'react-router-dom';

import { useSession } from '@/session/session-context';

import { PanelMobileHeader } from './components/PanelMobileHeader';
import { PanelSidebar } from './components/PanelSidebar';

export function AdminLayout() {
  const { signOut } = useSession();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>

      <PanelSidebar onSignOut={signOut} />

      <div className="flex min-h-dvh flex-col">
        <PanelMobileHeader onSignOut={signOut} />

        <main id="contenido" className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-white/5 px-4 py-4 text-center text-[11px] text-sand-100/35 sm:px-6 lg:px-10">
          Órbita Admin · Datos de demostración guardados en SQLite
        </footer>
      </div>
    </div>
  );
}
