import type { Product } from '@/models/product';

import { ProductCard } from '../ProductCard';

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
