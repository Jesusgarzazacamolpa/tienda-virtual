import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'emerald' | 'amber' | 'signal';
}

const TONES = {
  neutral: 'border-white/10 bg-white/5 text-sand-100/70',
  emerald: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200',
  amber: 'border-amber-300/25 bg-amber-300/10 text-amber-200',
  signal: 'border-signal-400/25 bg-signal-400/10 text-signal-300'
} as const;

export function StatCard({ icon: Icon, label, value, detail, tone = 'neutral' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-sand-100/50 uppercase">{label}</p>
        <span className={cn('grid h-8 w-8 place-items-center rounded-lg border', TONES[tone])}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl text-sand-50">{value}</p>
      <p className="mt-0.5 text-[11px] text-sand-100/40">{detail}</p>
    </div>
  );
}
