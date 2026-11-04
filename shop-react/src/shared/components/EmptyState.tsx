import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="surface flex flex-col items-center px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-signal-400/10 text-signal-300">
        {icon}
      </span>
      <h2 className="mt-5 text-xl font-semibold text-sand-50">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-sand-100/60">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
