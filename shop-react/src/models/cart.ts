import type { Product } from './product';

export const MAX_LINE_QUANTITY = 10;
export const FREE_SHIPPING_THRESHOLD = 1500;
export const SHIPPING_COST = 149;

export interface CartLine {
  key: string;
  productId: string;
  color: string;
  quantity: number;
}

export interface PricedLine extends CartLine {
  product: Product;
  lineTotal: number;
  unitPrice: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  freeShippingRemaining: number;
  hasFreeShipping: boolean;
}

export function cartLineKey(productId: string, color: string): string {
  return `${productId}::${color}`;
}

export function clampQuantity(quantity: number): number {
  return Math.max(1, Math.min(MAX_LINE_QUANTITY, Math.trunc(quantity)));
}
