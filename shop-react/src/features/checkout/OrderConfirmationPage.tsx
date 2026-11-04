import { useState } from 'react';
import { ArrowRight, PackageX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { getOrder } from '@/services/order-service';
import { EmptyState } from '@/shared/components/EmptyState';
import { useDocumentTitle } from '@/shared/lib/use-document-title';

import { OrderConfirmationHeader } from './components/OrderConfirmationHeader';
import { OrderDeliverySummary } from './components/OrderDeliverySummary';
import { OrderReceipt } from './components/OrderReceipt';

export function OrderConfirmationPage() {
  const { orderId = '' } = useParams();
  const [order] = useState(() => getOrder(orderId));

  useDocumentTitle('Pedido confirmado');

  if (!order) {
    return (
      <div className="container-shell py-16">
        <EmptyState
          icon={<PackageX className="h-7 w-7" aria-hidden="true" />}
          title="No encontramos ese pedido"
          description="El enlace puede haber expirado o el pedido se guardó en otro dispositivo. Puedes seguir explorando el catálogo."
          action={
            <Link to="/#catalogo" className="btn-primary">
              Volver al catálogo
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-shell py-14">
      <div className="mx-auto max-w-3xl">
        <OrderConfirmationHeader order={order} />
        <OrderDeliverySummary order={order} />
        <OrderReceipt order={order} />

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/#catalogo" className="btn-primary">
            Seguir comprando
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/" className="btn-secondary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
