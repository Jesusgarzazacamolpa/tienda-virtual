import { ExternalLink, LogOut, Store } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Brand } from '@/components/Brand';
import { cn } from '@/lib/cn';

import { navigation, STORE_URL } from '../navigation';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition',
    isActive
      ? 'border-signal-400/30 bg-signal-400/10 text-sand-50'
      : 'border-transparent text-sand-100/60 hover:border-white/10 hover:bg-white/5 hover:text-sand-50'
  );
}

interface PanelSidebarProps {
  onSignOut: () => void;
}

export function PanelSidebar({ onSignOut }: PanelSidebarProps) {
  return (
    <aside className="hidden border-r border-white/10 bg-ink-950/70 px-5 py-6 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
      <Brand />

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-sand-100/45 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
          API conectada
        </p>
        <p className="mt-2 text-xs leading-relaxed text-sand-100/55">
          GraphQL con datos de <span className="font-mono text-sand-100/80">SQLite</span>
        </p>
      </div>

      <nav aria-label="Secciones del panel" className="mt-6 flex-1 space-y-1.5">
        {navigation.map(({ to, label, description, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass}>
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition',
                    isActive
                      ? 'border-signal-400/40 bg-signal-400/15 text-signal-300'
                      : 'border-white/10 bg-white/5 text-sand-100/60 group-hover:text-sand-50'
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block">{label}</span>
                  <span className="block text-xs font-normal text-sand-100/40">{description}</span>
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 pt-4">
        <a
          href={STORE_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost w-full justify-start"
        >
          <Store className="h-4 w-4" aria-hidden="true" />
          Ver tienda
          <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-50" aria-hidden="true" />
        </a>
        <a
          href="/graphql"
          target="_blank"
          rel="noreferrer"
          className="btn-ghost w-full justify-start"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Abrir GraphiQL
        </a>
        <button type="button" onClick={onSignOut} className="btn-ghost w-full justify-start">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
