import type { ReactNode } from 'react';

import type { CartTotals, PricedLine } from '@/models/cart';
import { FREE_SHIPPING_THRESHOLD } from '@/models/cart';
import { formatPrice } from '@/shared/lib/format';

interface CartSummaryProps {
  totals: CartTotals;
  items?: PricedLine[];
  title?: string;
  children?: ReactNode;
}

export function CartSummary({ totals, items, title = 'Resumen', children }: CartSummaryProps) {
  const progress = Math.min(100, Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="surface p-6">
      <h2 className="text-lg font-semibold text-sand-50">{title}</h2>

      {items && items.length > 0 && (
        <ul className="mt-4 space-y-3 border-b border-white/10 pb-4">
          {items.map((line) => (
            <li key={line.key} className="flex items-center gap-3">
              <span className="relative shrink-0">
                <img
                  src={line.product.image}
                  alt=""
                  width={900}
                  height={900}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-signal-400 px-1 text-[10px] font-bold text-ink-950">
                  {line.quantity}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-sand-50">
                  {line.product.name}
                </span>
                <span className="block text-xs text-sand-100/45">{line.color}</span>
              </span>
              <span className="text-sm font-medium tabular-nums text-sand-100/80">
                {formatPrice(line.lineTotal)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sand-100/55">Subtotal</dt>
          <dd className="font-medium tabular-nums">{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sand-100/55">Envío</dt>
          <dd className="font-medium tabular-nums">
            {totals.shipping === 0 ? (
              <span className="text-emerald-300">Gratis</span>
            ) : (
              formatPrice(totals.shipping)
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3 text-base">
          <dt className="font-semibold text-sand-50">Total</dt>
          <dd className="font-semibold tabular-nums text-sand-50">{formatPrice(totals.total)}</dd>
        </div>
      </dl>

      <div className="mt-5">
        {totals.hasFreeShipping ? (
          <p className="text-xs font-medium text-emerald-300">Tu pedido tiene envío gratis.</p>
        ) : (
          <p className="text-xs text-sand-100/55">
            Te faltan{' '}
            <span className="font-semibold text-sand-100/80">
              {formatPrice(totals.freeShippingRemaining)}
            </span>{' '}
            para el envío gratis.
          </p>
        )}
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Progreso hacia envío gratis"
        >
          <div
            className="h-full rounded-full bg-signal-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {children && <div className="mt-6">{children}</div>}

      <p className="mt-4 text-center text-[11px] text-sand-100/35">
        Precios en MXN con IVA incluido. Compra simulada.
      </p>
    </div>
  );
}
