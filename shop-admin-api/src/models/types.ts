export const CATEGORIES = ['AUDIO', 'CALZADO', 'ACCESORIOS', 'HOGAR'] as const;
export type Category = (typeof CATEGORIES)[number];

export const ORDER_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Color {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  badge: string | null;
  tagline: string;
  description: string;
  image: string;
  colors: Color[];
  active: boolean;
  createdAt: string;
}

export interface ProductDraft {
  name: string;
  category: Category;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  badge: string | null;
  tagline: string;
  description: string;
  image: string;
  colors: Color[];
  active: boolean;
}

export type PaymentMethod = 'card' | 'transfer';

export interface OrderLine {
  productId: string;
  name: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface Order {
  id: string;
  createdAt: string;
  estimatedDelivery: string;
  customer: OrderCustomer;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
}
