import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { categoryLabel, type Product } from '@/models/product';

export function ProductBreadcrumbs({ product }: { product: Product }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-sand-100/45">
        <li>
          <Link to="/" className="transition hover:text-sand-50">
            Tienda
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li>
          <Link
            to={`/?categoria=${product.category}#catalogo`}
            className="transition hover:text-sand-50"
          >
            {categoryLabel(product.category)}
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li aria-current="page" className="text-sand-100/75">
          {product.name}
        </li>
      </ol>
    </nav>
  );
}
