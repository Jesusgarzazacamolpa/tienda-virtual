import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { PricedLine } from '@/models/cart';
import { QuantityStepper } from '@/shared/components/QuantityStepper';
import { formatPrice } from '@/shared/lib/format';

interface CartLineItemProps {
  line: PricedLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartLineItem({ line, onQuantityChange, onRemove }: CartLineItemProps) {
  return (
    <article className="surface flex gap-4 p-4 sm:gap-5 sm:p-5">
      <Link
        to={`/producto/${line.product.slug}`}
        className="shrink-0 overflow-hidden rounded-2xl bg-sand-100"
      >
        <img
          src={line.product.image}
          alt={line.product.name}
          width={900}
          height={900}
          loading="lazy"
          className="h-24 w-24 object-cover sm:h-28 sm:w-28"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-sand-50">
              <Link to={`/producto/${line.product.slug}`} className="transition hover:text-signal-300">
                {line.product.name}
              </Link>
            </h2>
            <p className="mt-0.5 text-xs text-sand-100/45">
              Color: {line.color} · {formatPrice(line.unitPrice)} c/u
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Quitar ${line.product.name} del carrito`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sand-100/45 transition hover:bg-white/10 hover:text-rose-300"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            onChange={onQuantityChange}
            label={line.product.name}
            max={Math.min(10, line.product.stock)}
          />
          <p className="text-base font-semibold tabular-nums text-sand-50">
            {formatPrice(line.lineTotal)}
          </p>
        </div>
      </div>
    </article>
  );
}
