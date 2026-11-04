import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/shared/components/EmptyState';

export function EmptyCartState() {
  return (
    <div className="container-shell py-16">
      <p className="eyebrow">Carrito</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Tu carrito</h1>
      <div className="mt-10">
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" aria-hidden="true" />}
          title="Tu carrito está vacío"
          description="Explora la colección y añade las piezas que te gusten. Guardamos tu carrito en este dispositivo."
          action={
            <Link to="/#catalogo" className="btn-primary">
              Explorar catálogo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
      </div>
    </div>
  );
}
