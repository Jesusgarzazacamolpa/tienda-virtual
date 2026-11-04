import { formatPrice } from '@/lib/format';

interface OrderDetailTotalsProps {
  subtotal: number;
  shipping: number;
  total: number;
}

export function OrderDetailTotals({ subtotal, shipping, total }: OrderDetailTotalsProps) {
  return (
    <dl className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm">
      <div className="flex justify-between gap-4 text-sand-100/60">
        <dt>Subtotal</dt>
        <dd>{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4 text-sand-100/60">
        <dt>Envío</dt>
        <dd>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-white/10 pt-2 text-base font-semibold text-sand-50">
        <dt>Total</dt>
        <dd>{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}
