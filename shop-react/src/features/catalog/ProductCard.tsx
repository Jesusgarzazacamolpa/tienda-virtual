import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { categoryLabel, type Product } from '@/models/product';
import { useCartStore } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';
import { Rating } from '@/shared/components/Rating';
import { formatPrice } from '@/shared/lib/format';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addLine = useCartStore((state) => state.addLine);
  const pushToast = useToastStore((state) => state.push);
  const defaultColor = product.colors[0]?.name ?? 'Estándar';

  function handleQuickAdd() {
    addLine(product.id, defaultColor, 1);
    pushToast(`${product.name} se añadió al carrito.`);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]">
      <Link
        to={`/producto/${product.slug}`}
        className="relative block overflow-hidden bg-sand-100"
        aria-label={`Ver ${product.name}`}
      >
        <img
          src={product.image}
          alt={product.name}
          width={900}
          height={900}
          loading="lazy"
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        {product.badge && (
          <span className="absolute top-4 left-4 rounded-full bg-ink-950/85 px-3 py-1 text-[11px] font-semibold tracking-wide text-sand-50 uppercase backdrop-blur">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] font-medium tracking-[0.18em] text-sand-100/45 uppercase">
          {categoryLabel(product.category)}
        </p>
        <h3 className="mt-1 text-base font-semibold text-sand-50">
          <Link to={`/producto/${product.slug}`} className="transition hover:text-signal-300">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-sand-100/55">
          {product.tagline}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <Rating value={product.rating} reviewCount={product.reviewCount} />
          <span className="flex items-center gap-1.5">
            {product.colors.map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="h-3 w-3 rounded-full border border-white/30"
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              />
            ))}
            <span className="sr-only">
              {product.colors.length} {product.colors.length === 1 ? 'color' : 'colores'}
            </span>
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-semibold text-sand-50">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-sand-100/40 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Añadir ${product.name} al carrito`}
            className="grid h-10 w-10 place-items-center rounded-full bg-signal-400 text-ink-950 transition hover:bg-signal-300"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
