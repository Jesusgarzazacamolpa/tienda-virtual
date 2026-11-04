import type { Order } from '@/models/order';
import { formatLongDate, formatPrice } from '@/shared/lib/format';

import { paymentMethodLabel } from '@/services/order-service';

export function OrderDeliverySummary({ order }: { order: Order }) {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      <div className="surface p-5">
        <h2 className="text-xs font-semibold tracking-[0.16em] text-sand-100/45 uppercase">
          Entrega estimada
        </h2>
        <p className="mt-2 text-base font-semibold text-sand-50">
          {formatLongDate(order.estimatedDelivery)}
        </p>
        <p className="mt-1 text-sm text-sand-100/55">
          {order.customer.address}
          <br />
          {order.customer.city}, {order.customer.state} · CP {order.customer.postalCode}
        </p>
      </div>
      <div className="surface p-5">
        <h2 className="text-xs font-semibold tracking-[0.16em] text-sand-100/45 uppercase">Pago</h2>
        <p className="mt-2 text-base font-semibold text-sand-50">
          {paymentMethodLabel(order.paymentMethod)}
        </p>
        <p className="mt-1 text-sm text-sand-100/55">
          Total {formatPrice(order.totals.total)}
          {order.totals.shipping === 0 ? ' · envío gratis' : ''}
        </p>
      </div>
    </div>
  );
}
