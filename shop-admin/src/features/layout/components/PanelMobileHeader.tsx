import { LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Brand } from '@/components/Brand';
import { cn } from '@/lib/cn';

import { navigation } from '../navigation';

interface PanelMobileHeaderProps {
  onSignOut: () => void;
}

export function PanelMobileHeader({ onSignOut }: PanelMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/80 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Brand subtitle="Admin" />
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Cerrar sesión"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-sand-100/60 transition hover:border-white/25 hover:text-sand-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <nav
        aria-label="Secciones del panel"
        className="flex gap-1 border-t border-white/5 px-4 py-2"
      >
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition',
                isActive
                  ? 'bg-signal-400/15 text-signal-300'
                  : 'text-sand-100/60 hover:bg-white/5 hover:text-sand-50'
              )
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
