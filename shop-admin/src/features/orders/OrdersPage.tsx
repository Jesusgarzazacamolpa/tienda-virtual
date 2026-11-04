import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ReceiptText, RefreshCw } from 'lucide-react';

import { PanelMessage } from '@/components/PanelMessage';
import type { Order } from '@/models/order';
import { useAdminApi } from '@/session/use-admin-api';

import { OrderDetailDialog } from './components/OrderDetailDialog';
import { OrdersCards } from './components/OrdersCards';
import type { StatusFilter } from './components/OrdersFilters';
import { OrdersFilters } from './components/OrdersFilters';
import { OrdersHeader } from './components/OrdersHeader';
import { OrdersSkeleton } from './components/OrdersSkeleton';
import type { OrderMetrics } from './components/OrdersStats';
import { OrdersStats } from './components/OrdersStats';
import { OrdersTable } from './components/OrdersTable';

export function OrdersPage() {
  const api = useAdminApi();
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const ordersQuery = useQuery({
    queryKey: ['orders', api.token],
    queryFn: () => api.orders()
  });

  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);

  const stats = useMemo<OrderMetrics>(() => {
    const revenue = orders
      .filter((order) => order.status !== 'CANCELLED')
      .reduce((total, order) => total + order.total, 0);
    const pending = orders.filter((order) => order.status === 'PENDING').length;
    const delivered = orders.filter((order) => order.status === 'DELIVERED').length;
    return { total: orders.length, revenue, pending, delivered };
  }, [orders]);

  const filtered = useMemo(
    () => (status === 'ALL' ? orders : orders.filter((order) => order.status === status)),
    [orders, status]
  );

  const hasOrders = !ordersQuery.isPending && !ordersQuery.isError;

  return (
    <div className="animate-fade-up space-y-6">
      <OrdersHeader />

      <OrdersStats {...stats} />

      <section className="panel overflow-hidden">
        <OrdersFilters status={status} onChange={setStatus} />

        {ordersQuery.isPending ? <OrdersSkeleton /> : null}

        {ordersQuery.isError ? (
          <PanelMessage
            icon={AlertTriangle}
            tone="danger"
            title="No pudimos cargar los pedidos"
            description={
              ordersQuery.error instanceof Error
                ? ordersQuery.error.message
                : 'Revisa la conexión con la API e inténtalo de nuevo.'
            }
            action={
              <button type="button" onClick={() => ordersQuery.refetch()} className="btn-secondary">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Reintentar
              </button>
            }
          />
        ) : null}

        {hasOrders && filtered.length === 0 ? (
          <PanelMessage
            icon={ReceiptText}
            title="Sin pedidos en este estado"
            description="Cuando la tienda genere pedidos con este estado aparecerán aquí."
            action={
              <button type="button" onClick={() => setStatus('ALL')} className="btn-secondary">
                Ver todos los pedidos
              </button>
            }
          />
        ) : null}

        {hasOrders && filtered.length > 0 ? (
          <>
            <p
              role="status"
              className="border-b border-white/5 px-4 py-3 text-xs text-sand-100/45 sm:px-5"
            >
              Mostrando {filtered.length} de {orders.length} pedidos
            </p>
            <OrdersTable orders={filtered} onSelect={setSelectedOrder} />
            <OrdersCards orders={filtered} onSelect={setSelectedOrder} />
          </>
        ) : null}
      </section>

      <OrderDetailDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
