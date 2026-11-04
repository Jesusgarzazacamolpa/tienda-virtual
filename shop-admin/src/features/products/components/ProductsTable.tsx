import { Pencil } from 'lucide-react';

import { cn } from '@/lib/cn';
import { CATEGORY_LABELS, formatPrice } from '@/lib/format';
import type { Product } from '@/models/catalog';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
}

export function ProductsTable({ products, onEdit }: ProductsTableProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Categoría</th>
            <th scope="col" className="text-right">
              Precio
            </th>
            <th scope="col">Stock</th>
            <th scope="col">Estado</th>
            <th scope="col" className="text-right">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt=""
                    loading="lazy"
                    className="h-11 w-11 shrink-0 rounded-xl border border-white/10 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-sand-50">{product.name}</p>
                    <p className="truncate font-mono text-[11px] text-sand-100/40">
                      {product.slug}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-sand-100/70">
                  {CATEGORY_LABELS[product.category]}
                </span>
              </td>
              <td className="text-right">
                <span className="text-sm font-semibold text-sand-50">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice ? (
                  <span className="block text-[11px] text-sand-100/35 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                ) : null}
              </td>
              <td>
                <span
                  className={cn(
                    'text-sm font-medium',
                    product.stock <= 10 ? 'text-amber-200' : 'text-sand-100/80'
                  )}
                >
                  {product.stock}
                </span>
                {product.stock <= 10 ? (
                  <span className="ml-1.5 text-[10px] font-semibold tracking-wide text-amber-200/70 uppercase">
                    bajo
                  </span>
                ) : null}
              </td>
              <td>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
                    product.active
                      ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200'
                      : 'border-white/10 bg-white/5 text-sand-100/50'
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                  {product.active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="text-right">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-sand-100/70 transition hover:border-white/25 hover:text-sand-50"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
