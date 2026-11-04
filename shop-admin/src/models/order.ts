export const ORDER_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PaymentMethod = 'CARD' | 'TRANSFER';

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
