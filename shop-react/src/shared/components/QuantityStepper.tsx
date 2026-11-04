import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  label: string;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function QuantityStepper({
  value,
  onChange,
  label,
  min = 1,
  max = 10,
  size = 'md'
}: QuantityStepperProps) {
  const buttonClass =
    size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-10 w-10 rounded-xl border border-white/15 bg-white/5';

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Disminuir cantidad de ${label}`}
        className={`${buttonClass} grid place-items-center text-sand-100/80 transition hover:bg-white/10 hover:text-sand-50 disabled:cursor-not-allowed disabled:opacity-35`}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className={`min-w-9 text-center ${size === 'sm' ? 'text-sm' : 'text-base'} font-semibold tabular-nums`}
      >
        {value}
        <span className="sr-only"> unidades</span>
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Aumentar cantidad de ${label}`}
        className={`${buttonClass} grid place-items-center text-sand-100/80 transition hover:bg-white/10 hover:text-sand-50 disabled:cursor-not-allowed disabled:opacity-35`}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
