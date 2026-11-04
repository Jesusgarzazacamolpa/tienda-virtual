import { cn } from '@/lib/cn';

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: string;
}

export function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition',
        active
          ? 'border-signal-400/50 bg-signal-400/15 text-signal-300'
          : 'border-white/10 text-sand-100/55 hover:border-white/25 hover:text-sand-50'
      )}
    >
      {children}
    </button>
  );
}
