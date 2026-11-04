import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { calculateTotals, priceLines } from '@/domain/cart';
import { products } from '@/services/catalog-service';
import { formatQuantity } from '@/shared/lib/format';
import { useDocumentTitle } from '@/shared/lib/use-document-title';
import { useCartStore } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';

import { CartSummary } from './CartSummary';
import { CartLineItem } from './components/CartLineItem';
import { EmptyCartState } from './components/EmptyCartState';

export function CartPage() {
  useDocumentTitle('Tu carrito');
  const lines = useCartStore((state) => state.lines);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeLine = useCartStore((state) => state.removeLine);
  const pushToast = useToastStore((state) => state.push);

  const pricedLines = priceLines(lines, products);
  const totals = calculateTotals(pricedLines);

  function handleRemove(key: string, name: string) {
    removeLine(key);
    pushToast(`${name} se quitó del carrito.`);
  }

  if (pricedLines.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <div className="container-shell py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Carrito</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Tu selección</h1>
          <p className="mt-2 text-sm text-sand-100/55">
            {formatQuantity(totals.itemCount, 'artículo', 'artículos')} en el carrito
          </p>
        </div>
        <Link to="/#catalogo" className="btn-ghost text-xs">
          Seguir comprando
        </Link>
      </div>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <ul className="space-y-4">
          {pricedLines.map((line) => (
            <li key={line.key}>
              <CartLineItem
                line={line}
                onQuantityChange={(next) => {
                  if (next > line.quantity) increment(line.key);
                  else if (next < line.quantity) decrement(line.key);
                }}
                onRemove={() => handleRemove(line.key, line.product.name)}
              />
            </li>
          ))}
        </ul>

        <div className="lg:sticky lg:top-28">
          <CartSummary totals={totals}>
            <Link to="/checkout" className="btn-primary w-full">
              Continuar al pago
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </CartSummary>
        </div>
      </div>
    </div>
  );
}
