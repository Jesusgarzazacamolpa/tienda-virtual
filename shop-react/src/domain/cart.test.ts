import { describe, expect, it } from 'vitest';

import { products } from '@/data/products';
import {
  cartLineKey,
  clampQuantity,
  FREE_SHIPPING_THRESHOLD,
  MAX_LINE_QUANTITY,
  SHIPPING_COST
} from '@/models/cart';

import { calculateTotals, priceLines } from './cart';

const aura = products[0]!;
const terra = products.find((product) => product.slug === 'terra-cup')!;

describe('cart domain', () => {
  it('genera una llave estable por producto y color', () => {
    expect(cartLineKey('p-1', 'Negro')).toBe('p-1::Negro');
  });

  it('limita la cantidad entre 1 y el máximo', () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(-4)).toBe(1);
    expect(clampQuantity(99)).toBe(MAX_LINE_QUANTITY);
    expect(clampQuantity(3.9)).toBe(3);
  });

  it('descarta líneas cuyo producto ya no existe', () => {
    const priced = priceLines(
      [
        { key: 'a', productId: aura.id, color: 'Negro', quantity: 2 },
        { key: 'b', productId: 'fantasma', color: 'Negro', quantity: 1 }
      ],
      products
    );

    expect(priced).toHaveLength(1);
    expect(priced[0]?.lineTotal).toBe(aura.price * 2);
  });

  it('cobra envío por debajo del umbral y lo regala desde el umbral', () => {
    const low = priceLines(
      [{ key: 'a', productId: terra.id, color: 'Terracota', quantity: 1 }],
      products
    );
    const high = priceLines(
      [{ key: 'a', productId: aura.id, color: 'Negro', quantity: 1 }],
      products
    );

    const lowTotals = calculateTotals(low);
    const highTotals = calculateTotals(high);

    expect(lowTotals.shipping).toBe(SHIPPING_COST);
    expect(lowTotals.freeShippingRemaining).toBe(FREE_SHIPPING_THRESHOLD - terra.price);
    expect(highTotals.shipping).toBe(0);
    expect(highTotals.hasFreeShipping).toBe(true);
    expect(highTotals.total).toBe(aura.price);
  });

  it('regala el envío exactamente en el umbral', () => {
    const line = priceLines(
      [{ key: 'a', productId: aura.id, color: 'Arena', quantity: 1 }],
      products
    );

    const totals = calculateTotals([{ ...line[0]!, lineTotal: FREE_SHIPPING_THRESHOLD }]);

    expect(totals.shipping).toBe(0);
    expect(totals.freeShippingRemaining).toBe(0);
  });

  it('devuelve totales en cero con el carrito vacío', () => {
    const totals = calculateTotals([]);

    expect(totals).toEqual({
      itemCount: 0,
      subtotal: 0,
      shipping: 0,
      total: 0,
      freeShippingRemaining: FREE_SHIPPING_THRESHOLD,
      hasFreeShipping: false
    });
  });
});
