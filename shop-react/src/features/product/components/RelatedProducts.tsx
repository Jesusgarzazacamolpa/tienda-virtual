import { Link } from 'react-router-dom';

import type { Product } from '@/models/product';

import { ProductCard } from '../../catalog/ProductCard';

export function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="relacionados-titulo" className="mt-24">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">También te puede gustar</p>
          <h2 id="relacionados-titulo" className="mt-3 text-2xl font-semibold tracking-tight">
            Completa el conjunto
          </h2>
        </div>
        <Link to="/#catalogo" className="btn-ghost hidden text-xs sm:inline-flex">
          Ver todo
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((item) => (
          <li key={item.id}>
            <ProductCard product={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
