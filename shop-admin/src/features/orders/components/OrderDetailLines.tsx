import { ReceiptText } from 'lucide-react';

import { formatPrice } from '@/lib/format';
import type { OrderLine } from '@/models/order';

interface OrderDetailLinesProps {
  lines: OrderLine[];
}

export function OrderDetailLines({ lines }: OrderDetailLinesProps) {
  return (
    <section className="mt-5">
      <h3 className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-sand-100/45 uppercase">
        <ReceiptText className="h-4 w-4" aria-hidden="true" />
        Artículos
      </h3>
      <ul className="mt-3 divide-y divide-white/5 rounded-2xl border border-white/10">
        {lines.map((line, index) => (
          <li
            key={`${line.productId}-${line.color}-${index}`}
            className="flex items-center gap-3 px-4 py-3"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-sand-100/70">
              {line.quantity}×
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sand-50">{line.name}</p>
              <p className="text-xs text-sand-100/45">Color {line.color}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-sand-50">
                {formatPrice(line.quantity * line.unitPrice)}
              </p>
              <p className="text-[11px] text-sand-100/40">{formatPrice(line.unitPrice)} c/u</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
