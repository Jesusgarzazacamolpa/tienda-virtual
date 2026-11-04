import { CreditCard } from 'lucide-react';

import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatPrice, PAYMENT_LABELS } from '@/lib/format';
import type { Order } from '@/models/order';

interface OrdersTableProps {
  orders: Order[];
  onSelect: (order: Order) => void;
}

export function OrdersTable({ orders, onSelect }: OrdersTableProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Pedido</th>
            <th scope="col">Cliente</th>
            <th scope="col">Estado</th>
            <th scope="col">Pago</th>
            <th scope="col" className="text-right">
              Artículos
            </th>
            <th scope="col" className="text-right">
              Total
            </th>
            <th scope="col" className="text-right">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <p className="font-mono text-xs font-semibold text-sand-50">{order.id}</p>
                <p className="mt-0.5 text-[11px] text-sand-100/40">{formatDate(order.createdAt)}</p>
              </td>
              <td>
                <p className="text-sm font-medium text-sand-50">{order.customer.fullName}</p>
                <p className="text-[11px] text-sand-100/40">{order.customer.email}</p>
              </td>
              <td>
                <StatusBadge status={order.status} />
              </td>
              <td>
                <span className="inline-flex items-center gap-1.5 text-xs text-sand-100/65">
                  <CreditCard className="h-3.5 w-3.5 text-sand-100/40" aria-hidden="true" />
                  {PAYMENT_LABELS[order.paymentMethod]}
                </span>
              </td>
              <td className="text-right text-sm text-sand-100/70">{order.lines.length}</td>
              <td className="text-right text-sm font-semibold text-sand-50">
                {formatPrice(order.total)}
              </td>
              <td className="text-right">
                <button
                  type="button"
                  onClick={() => onSelect(order)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-sand-100/70 transition hover:border-white/25 hover:text-sand-50"
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
