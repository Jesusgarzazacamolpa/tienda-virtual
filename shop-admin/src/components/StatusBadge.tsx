import type { OrderStatus } from '@/models/order';
import { STATUS_LABELS } from '@/lib/format';
import { cn } from '@/lib/cn';

const TONES: Record<OrderStatus, string> = {
  PENDING: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  PAID: 'border-signal-400/30 bg-signal-400/10 text-signal-300',
  SHIPPED: 'border-violet-300/30 bg-violet-300/10 text-violet-200',
  DELIVERED: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200',
  CANCELLED: 'border-rose-300/30 bg-rose-300/10 text-rose-200'
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        TONES[status]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
