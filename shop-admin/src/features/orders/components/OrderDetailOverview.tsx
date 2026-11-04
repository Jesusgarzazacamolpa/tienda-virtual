import { CalendarDays, CreditCard, Mail, MapPin, Phone, Truck } from 'lucide-react';

import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatPrice, PAYMENT_LABELS } from '@/lib/format';
import type { Order } from '@/models/order';

interface OrderDetailOverviewProps {
  order: Order;
}

export function OrderDetailOverview({ order }: OrderDetailOverviewProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <StatusBadge status={order.status} />
        <div className="text-right">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-sand-100/40 uppercase">
            Total
          </p>
          <p className="font-display text-2xl text-sand-50">{formatPrice(order.total)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-ink-950/40 p-4">
          <h3 className="text-xs font-semibold tracking-[0.16em] text-sand-100/45 uppercase">
            Cliente
          </h3>
          <p className="mt-3 text-sm font-semibold text-sand-50">{order.customer.fullName}</p>
          <ul className="mt-2 space-y-2 text-xs text-sand-100/60">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-300/80" aria-hidden="true" />
              <a href={`mailto:${order.customer.email}`} className="break-all hover:text-sand-50">
                {order.customer.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Phone
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-300/80"
                aria-hidden="true"
              />
              <a href={`tel:${order.customer.phone}`} className="hover:text-sand-50">
                {order.customer.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-300/80"
                aria-hidden="true"
              />
              <span>
                {order.customer.address}
                <br />
                {order.customer.city}, {order.customer.state} · CP {order.customer.postalCode}
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-ink-950/40 p-4">
          <h3 className="text-xs font-semibold tracking-[0.16em] text-sand-100/45 uppercase">
            Envío y pago
          </h3>
          <ul className="mt-3 space-y-2.5 text-xs text-sand-100/65">
            <li className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-signal-300/80" aria-hidden="true" />
              {PAYMENT_LABELS[order.paymentMethod]}
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-signal-300/80" aria-hidden="true" />
              Entrega estimada: {formatDate(order.estimatedDelivery)}
            </li>
            <li className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-signal-300/80" aria-hidden="true" />
              {order.lines.length} {order.lines.length === 1 ? 'artículo' : 'artículos'}
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
