import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { products } from '@/data/products';
import { useCartStore } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';

import { ProductCard } from './ProductCard';

const aura = products[0]!;

describe('ProductCard', () => {
  beforeEach(() => {
    useCartStore.setState({ lines: [] });
    useToastStore.setState({ toasts: [] });
  });

  it('muestra nombre, precio y categoría', () => {
    render(
      <MemoryRouter>
        <ProductCard product={aura} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Aura Studio' })).toBeVisible();
    expect(screen.getByText('$3,490')).toBeVisible();
    expect(screen.getByText('Audio')).toBeVisible();
  });

  it('agrega al carrito con el color por defecto y avisa con un toast', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProductCard product={aura} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Añadir Aura Studio al carrito' }));

    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0]).toMatchObject({
      productId: aura.id,
      color: 'Negro',
      quantity: 1
    });
    expect(useToastStore.getState().toasts[0]?.message).toContain('Aura Studio');
  });
});
