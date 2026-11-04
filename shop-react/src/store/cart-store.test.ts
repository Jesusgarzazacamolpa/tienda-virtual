import { beforeEach, describe, expect, it } from 'vitest';

import { MAX_LINE_QUANTITY } from '@/models/cart';

import { useCartStore } from './cart-store';

describe('cart store', () => {
  beforeEach(() => {
    useCartStore.setState({ lines: [] });
  });

  it('agrega una línea nueva', () => {
    useCartStore.getState().addLine('p-aura-studio', 'Negro');

    expect(useCartStore.getState().lines).toEqual([
      { key: 'p-aura-studio::Negro', productId: 'p-aura-studio', color: 'Negro', quantity: 1 }
    ]);
  });

  it('fusiona cantidades del mismo producto y color', () => {
    useCartStore.getState().addLine('p-aura-studio', 'Negro', 2);
    useCartStore.getState().addLine('p-aura-studio', 'Negro', 3);

    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0]?.quantity).toBe(5);
  });

  it('separa el mismo producto por color', () => {
    useCartStore.getState().addLine('p-aura-studio', 'Negro');
    useCartStore.getState().addLine('p-aura-studio', 'Arena');

    expect(useCartStore.getState().lines).toHaveLength(2);
  });

  it('respeta el máximo de cantidad', () => {
    useCartStore.getState().addLine('p-aura-studio', 'Negro', 50);

    expect(useCartStore.getState().lines[0]?.quantity).toBe(MAX_LINE_QUANTITY);
  });

  it('incrementa y decrementa sin bajar de 1', () => {
    useCartStore.getState().addLine('p-aura-studio', 'Negro');
    const key = useCartStore.getState().lines[0]!.key;

    useCartStore.getState().increment(key);
    expect(useCartStore.getState().lines[0]?.quantity).toBe(2);

    useCartStore.getState().decrement(key);
    useCartStore.getState().decrement(key);
    expect(useCartStore.getState().lines[0]?.quantity).toBe(1);
  });

  it('elimina líneas y vacía el carrito', () => {
    const store = useCartStore.getState();
    store.addLine('p-aura-studio', 'Negro');
    store.addLine('p-terra-cup', 'Terracota');

    const key = useCartStore.getState().lines[0]!.key;
    useCartStore.getState().removeLine(key);
    expect(useCartStore.getState().lines).toHaveLength(1);

    useCartStore.getState().clear();
    expect(useCartStore.getState().lines).toEqual([]);
  });
});
