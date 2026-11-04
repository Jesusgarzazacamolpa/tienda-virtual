import { Route, Routes } from 'react-router-dom';

import { CartPage } from '@/features/cart/CartPage';
import { CatalogPage } from '@/features/catalog/CatalogPage';
import { CheckoutPage } from '@/features/checkout/CheckoutPage';
import { OrderConfirmationPage } from '@/features/checkout/OrderConfirmationPage';
import { NotFoundPage } from '@/features/not-found/NotFoundPage';
import { ProductPage } from '@/features/product/ProductPage';
import { Footer } from '@/shared/components/Footer';
import { Header } from '@/shared/components/Header';
import { ScrollManager } from '@/shared/components/ScrollManager';
import { Toaster } from '@/shared/components/Toaster';

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollManager />
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" className="flex-1">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/producto/:slug" element={<ProductPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pedido/:orderId" element={<OrderConfirmationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
