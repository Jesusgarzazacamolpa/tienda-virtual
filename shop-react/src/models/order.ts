import type { CartTotals } from './cart';

export type PaymentMethod = 'card' | 'transfer';

export interface OrderLine {
  productId: string;
  slug: string;
  name: string;
  color: string;
  quantity: number;
  unitPrice: number;
  image: string;
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
  lines: OrderLine[];
  totals: CartTotals;
}
