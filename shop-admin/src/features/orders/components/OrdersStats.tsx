import { Check, CircleDollarSign, Clock, ReceiptText } from 'lucide-react';

import { StatCard } from '@/components/StatCard';
import { formatPrice } from '@/lib/format';

export interface OrderMetrics {
  total: number;
  revenue: number;
  pending: number;
  delivered: number;
}

export function OrdersStats({ total, revenue, pending, delivered }: OrderMetrics) {
  return (
    <section aria-label="Resumen de pedidos" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={ReceiptText}
        label="Pedidos"
        value={String(total)}
        detail="Registrados en la tienda"
      />
      <StatCard
        icon={CircleDollarSign}
        label="Ingresos"
        value={formatPrice(revenue)}
        detail="Sin pedidos cancelados"
        tone="signal"
      />
      <StatCard
        icon={Clock}
        label="Pendientes"
        value={String(pending)}
        detail="Por confirmar pago"
        tone={pending > 0 ? 'amber' : 'neutral'}
      />
      <StatCard
        icon={Check}
        label="Entregados"
        value={String(delivered)}
        detail="Pedidos completados"
        tone="emerald"
      />
    </section>
  );
}
