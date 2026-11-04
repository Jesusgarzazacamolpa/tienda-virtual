import { Pencil } from 'lucide-react';

import { cn } from '@/lib/cn';
import { CATEGORY_LABELS, formatPrice } from '@/lib/format';
import type { Product } from '@/models/catalog';

interface ProductsCardsProps {
  products: Product[];
  onEdit: (product: Product) => void;
}

export function ProductsCards({ products, onEdit }: ProductsCardsProps) {
  return (
    <ul className="divide-y divide-white/5 md:hidden">
      {products.map((product) => (
        <li key={product.id} className="p-4">
          <div className="flex items-start gap-3">
            <img
              src={product.image}
              alt=""
              loading="lazy"
              className="h-14 w-14 shrink-0 rounded-xl border border-white/10 object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-sand-50">{product.name}</p>
                  <p className="font-mono text-[11px] text-sand-100/40">{product.slug}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                    product.active
                      ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200'
                      : 'border-white/10 bg-white/5 text-sand-100/50'
                  )}
                >
                  {product.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sand-100/55">
                <span>{CATEGORY_LABELS[product.category]}</span>
                <span className="text-sand-50">{formatPrice(product.price)}</span>
                <span className={product.stock <= 10 ? 'text-amber-200' : undefined}>
                  {product.stock} en stock
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-sand-100/70 transition hover:border-white/25 hover:text-sand-50"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Editar producto
          </button>
        </li>
      ))}
    </ul>
  );
}
