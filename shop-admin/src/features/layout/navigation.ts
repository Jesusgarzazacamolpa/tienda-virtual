import { Package, ReceiptText } from 'lucide-react';

export const STORE_URL = import.meta.env['VITE_STORE_URL'] ?? 'http://localhost:4400';

export const navigation = [
  {
    to: '/productos',
    label: 'Productos',
    description: 'Catálogo e inventario',
    icon: Package
  },
  {
    to: '/pedidos',
    label: 'Pedidos',
    description: 'Ventas y entregas',
    icon: ReceiptText
  }
];
