import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatPrice, PAYMENT_LABELS } from '@/lib/format';
import type { Order } from '@/models/order';

interface OrdersCardsProps {
  orders: Order[];
  onSelect: (order: Order) => void;
}

export function OrdersCards({ orders, onSelect }: OrdersCardsProps) {
  return (
    <ul className="divide-y divide-white/5 md:hidden">
      {orders.map((order) => (
        <li key={order.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-semibold text-sand-50">{order.id}</p>
              <p className="mt-0.5 text-[11px] text-sand-100/40">{formatDate(order.createdAt)}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-3 text-sm font-medium text-sand-50">{order.customer.fullName}</p>
          <p className="text-[11px] text-sand-100/40">{order.customer.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sand-100/55">
            <span>{PAYMENT_LABELS[order.paymentMethod]}</span>
            <span>
              {order.lines.length} {order.lines.length === 1 ? 'artículo' : 'artículos'}
            </span>
            <span className="font-semibold text-sand-50">{formatPrice(order.total)}</span>
          </div>
          <button
            type="button"
            onClick={() => onSelect(order)}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-sand-100/70 transition hover:border-white/25 hover:text-sand-50"
          >
            Ver detalle
          </button>
        </li>
      ))}
    </ul>
  );
}
