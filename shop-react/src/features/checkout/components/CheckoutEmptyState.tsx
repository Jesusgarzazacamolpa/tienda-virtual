import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/shared/components/EmptyState';

export function CheckoutEmptyState() {
  return (
    <div className="container-shell py-16">
      <EmptyState
        icon={<ShoppingBag className="h-7 w-7" aria-hidden="true" />}
        title="No hay productos para pagar"
        description="Tu carrito está vacío. Añade algunas piezas y vuelve para completar el pedido simulado."
        action={
          <Link to="/#catalogo" className="btn-primary">
            Explorar catálogo
          </Link>
        }
      />
    </div>
  );
}
