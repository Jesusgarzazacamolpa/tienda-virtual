import type { Product } from '@/models/product';

export function ProductGallery({ product }: { product: Product }) {
  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-sand-100">
        <img
          src={product.image}
          alt={product.name}
          width={900}
          height={900}
          className="aspect-square w-full object-cover"
        />
        {product.badge && (
          <span className="absolute top-5 left-5 rounded-full bg-ink-950/85 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-sand-50 uppercase backdrop-blur">
            {product.badge}
          </span>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-sand-100/35">
        Imagen de referencia. Pieza demo del catálogo.
      </p>
    </div>
  );
}
