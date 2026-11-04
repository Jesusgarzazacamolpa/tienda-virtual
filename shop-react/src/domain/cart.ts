import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
  type CartLine,
  type CartTotals,
  type PricedLine
} from '@/models/cart';
import type { Product } from '@/models/product';

export function priceLines(lines: CartLine[], catalog: Product[]): PricedLine[] {
  return lines.flatMap((line) => {
    const product = catalog.find((item) => item.id === line.productId);
    if (!product) return [];
    return [
      {
        ...line,
        product,
        unitPrice: product.price,
        lineTotal: product.price * line.quantity
      }
    ];
  });
}

export function calculateTotals(lines: PricedLine[]): CartTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = subtotal === 0 || hasFreeShipping ? 0 : SHIPPING_COST;

  return {
    itemCount,
    subtotal,
    shipping,
    total: subtotal + shipping,
    freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    hasFreeShipping
  };
}
