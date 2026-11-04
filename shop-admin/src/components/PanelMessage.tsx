import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

interface PanelMessageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: 'default' | 'danger';
  action?: ReactNode;
}

export function PanelMessage({
  icon: Icon,
  title,
  description,
  tone = 'default',
  action
}: PanelMessageProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span
        className={cn(
          'grid h-12 w-12 place-items-center rounded-2xl border',
          tone === 'danger'
            ? 'border-rose-400/30 bg-rose-400/10 text-rose-200'
            : 'border-white/10 bg-white/5 text-sand-100/60'
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="font-display text-xl text-sand-50">{title}</h2>
      <p className="max-w-md text-sm text-sand-100/60">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
