import { useState } from 'react';
import { PackageX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import type { Product } from '@/models/product';
import { findProductBySlug, products } from '@/services/catalog-service';
import { EmptyState } from '@/shared/components/EmptyState';
import { useDocumentTitle } from '@/shared/lib/use-document-title';
import { useCartStore } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';

import { ProductBreadcrumbs } from './components/ProductBreadcrumbs';
import { ProductGallery } from './components/ProductGallery';
import { ProductPurchasePanel } from './components/ProductPurchasePanel';
import { RelatedProducts } from './components/RelatedProducts';

export function ProductPage() {
  const { slug = '' } = useParams();
  const product = findProductBySlug(slug);

  useDocumentTitle(product?.name);

  if (!product) {
    return (
      <div className="container-shell py-16">
        <EmptyState
          icon={<PackageX className="h-7 w-7" aria-hidden="true" />}
          title="No encontramos ese producto"
          description="Puede que el enlace esté roto o que la pieza ya no forme parte de la colección."
          action={
            <Link to="/#catalogo" className="btn-primary">
              Volver al catálogo
            </Link>
          }
        />
      </div>
    );
  }

  return <ProductDetail key={product.id} product={product} />;
}

function ProductDetail({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? '');
  const [quantity, setQuantity] = useState(1);
  const addLine = useCartStore((state) => state.addLine);
  const pushToast = useToastStore((state) => state.push);

  const related = [
    ...products.filter((item) => item.category === product.category && item.id !== product.id),
    ...products.filter((item) => item.category !== product.category && item.id !== product.id)
  ].slice(0, 3);

  function handleAddToCart() {
    addLine(product.id, selectedColor, quantity);
    pushToast(`${quantity} × ${product.name} se añadió al carrito.`);
  }

  return (
    <div className="container-shell pt-8 pb-4">
      <ProductBreadcrumbs product={product} />

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery product={product} />
        <ProductPurchasePanel
          product={product}
          selectedColor={selectedColor}
          quantity={quantity}
          onColorChange={setSelectedColor}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
        />
      </div>

      <RelatedProducts products={related} />
    </div>
  );
}
