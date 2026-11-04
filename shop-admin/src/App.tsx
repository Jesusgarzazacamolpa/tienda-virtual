import { Navigate, Route, Routes } from 'react-router-dom';

import { TokenGate } from '@/features/auth/TokenGate';
import { AdminLayout } from '@/features/layout/AdminLayout';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { ProductsPage } from '@/features/products/ProductsPage';
import { useSession } from '@/session/session-context';

export function App() {
  const { token } = useSession();

  if (!token) return <TokenGate />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/productos" replace />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/pedidos" element={<OrdersPage />} />
        <Route path="*" element={<Navigate to="/productos" replace />} />
      </Route>
    </Routes>
  );
}
