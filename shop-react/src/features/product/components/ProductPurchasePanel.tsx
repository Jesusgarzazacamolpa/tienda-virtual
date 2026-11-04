import { Check, RotateCcw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { categoryLabel, type Product } from '@/models/product';
import { QuantityStepper } from '@/shared/components/QuantityStepper';
import { Rating } from '@/shared/components/Rating';
import { formatPrice } from '@/shared/lib/format';

interface ProductPurchasePanelProps {
  product: Product;
  selectedColor: string;
  quantity: number;
  onColorChange: (color: string) => void;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
}

const shippingNotes = [
  { icon: Truck, title: 'Envío en 2 a 4 días', detail: 'Gratis desde $1,500' },
  { icon: RotateCcw, title: 'Devolución en 30 días', detail: 'Sin preguntas' }
];

export function ProductPurchasePanel({
  product,
  selectedColor,
  quantity,
  onColorChange,
  onQuantityChange,
  onAddToCart
}: ProductPurchasePanelProps) {
  return (
    <div>
      <p className="eyebrow">{categoryLabel(product.category)}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{product.name}</h1>
      <p className="mt-2 text-lg text-sand-100/60">{product.tagline}</p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Rating value={product.rating} reviewCount={product.reviewCount} className="text-sm" />
        <span className="h-4 w-px bg-white/15" aria-hidden="true" />
        <span
          className={`text-sm font-medium ${product.stock <= 10 ? 'text-amber-300' : 'text-emerald-300'}`}
        >
          {product.stock <= 10 ? `Últimas ${product.stock} piezas` : 'En stock'}
        </span>
      </div>

      <p className="mt-6 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-semibold text-sand-50">{formatPrice(product.price)}</span>
        {product.compareAtPrice && (
          <>
            <span className="text-base text-sand-100/40 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
            <span className="rounded-full bg-signal-400/15 px-2.5 py-1 text-xs font-semibold text-signal-300">
              Ahorras {formatPrice(product.compareAtPrice - product.price)}
            </span>
          </>
        )}
      </p>

      <p className="mt-6 text-sm leading-relaxed text-sand-100/65">{product.description}</p>

      <fieldset className="mt-8">
        <legend className="text-sm font-medium text-sand-50">
          Color: <span className="text-sand-100/55">{selectedColor}</span>
        </legend>
        <div className="mt-3 flex items-center gap-3">
          {product.colors.map((color) => (
            <label key={color.name} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={color.name}
                checked={selectedColor === color.name}
                onChange={() => onColorChange(color.name)}
                className="peer sr-only"
              />
              <span
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 transition peer-checked:ring-2 peer-checked:ring-signal-400 peer-checked:ring-offset-2 peer-checked:ring-offset-ink-950 peer-focus-visible:ring-2 peer-focus-visible:ring-signal-300"
                style={{ backgroundColor: color.hex }}
              >
                {selectedColor === color.name && (
                  <Check className="h-4 w-4 text-ink-950/80" aria-hidden="true" />
                )}
              </span>
              <span className="sr-only">{color.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <QuantityStepper
          value={quantity}
          onChange={onQuantityChange}
          label={product.name}
          max={Math.min(10, product.stock)}
        />
        <button type="button" onClick={onAddToCart} className="btn-primary flex-1">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          Añadir al carrito · {formatPrice(product.price * quantity)}
        </button>
      </div>

      <Link
        to="/carrito"
        className="mt-3 inline-flex text-xs font-medium text-sand-100/50 transition hover:text-signal-300"
      >
        Ver carrito y continuar
      </Link>

      <ul className="mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">
        {product.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-sand-100/70">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal-400" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {shippingNotes.map(({ icon: Icon, title, detail }) => (
          <div key={title} className="surface flex items-start gap-3 p-4">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-signal-300" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-sand-50">{title}</p>
              <p className="mt-0.5 text-xs text-sand-100/50">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 flex items-center gap-2 text-xs text-sand-100/40">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Compra demo: el pago es simulado y no se realiza ningún cargo.
      </p>
    </div>
  );
}
