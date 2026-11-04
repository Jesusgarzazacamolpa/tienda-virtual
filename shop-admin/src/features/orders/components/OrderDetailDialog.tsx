import { DialogHeader, Modal } from '@/components/Modal';
import { formatDateTime } from '@/lib/format';
import type { Order } from '@/models/order';

import { OrderDetailLines } from './OrderDetailLines';
import { OrderDetailOverview } from './OrderDetailOverview';
import { OrderDetailTotals } from './OrderDetailTotals';

interface OrderDetailDialogProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailDialog({ order, onClose }: OrderDetailDialogProps) {
  return (
    <Modal open={order !== null} onClose={onClose} labelledBy="order-dialog-title">
      {order ? (
        <>
          <DialogHeader
            id="order-dialog-title"
            eyebrow={`Pedido ${order.id}`}
            title={order.customer.fullName}
            description={`Creado el ${formatDateTime(order.createdAt)}`}
            onClose={onClose}
          />

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <OrderDetailOverview order={order} />
            <OrderDetailLines lines={order.lines} />
            <OrderDetailTotals
              subtotal={order.subtotal}
              shipping={order.shipping}
              total={order.total}
            />
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
            <p className="text-[11px] text-sand-100/40">Vista de solo lectura</p>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cerrar
            </button>
          </footer>
        </>
      ) : null}
    </Modal>
  );
}
