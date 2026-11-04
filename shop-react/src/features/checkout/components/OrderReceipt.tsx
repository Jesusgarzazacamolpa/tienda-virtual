import type { Order } from '@/models/order';
import { formatPrice } from '@/shared/lib/format';

export function OrderReceipt({ order }: { order: Order }) {
  return (
    <div className="surface mt-4 p-6">
      <h2 className="text-lg font-semibold text-sand-50">Tu pedido</h2>
      <ul className="mt-4 divide-y divide-white/10">
        {order.lines.map((line) => (
          <li key={`${line.productId}-${line.color}`} className="flex items-center gap-4 py-4">
            <img
              src={line.image}
              alt={line.name}
              width={900}
              height={900}
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-sand-50">{line.name}</p>
              <p className="text-xs text-sand-100/45">
                {line.color} · {line.quantity} × {formatPrice(line.unitPrice)}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-sand-50">
              {formatPrice(line.unitPrice * line.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-2 space-y-2 border-t border-white/10 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-sand-100/55">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(order.totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sand-100/55">Envío</dt>
          <dd className="tabular-nums">
            {order.totals.shipping === 0 ? 'Gratis' : formatPrice(order.totals.shipping)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(order.totals.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
