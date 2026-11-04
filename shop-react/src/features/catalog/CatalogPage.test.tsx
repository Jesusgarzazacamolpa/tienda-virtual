import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { CatalogPage } from './CatalogPage';

function renderCatalog(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <CatalogPage />
    </MemoryRouter>
  );
}

describe('CatalogPage', () => {
  it('muestra el catálogo completo por defecto', () => {
    renderCatalog();

    expect(screen.getByRole('heading', { name: 'Piezas elegidas una por una' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Aura Studio' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Form Chair' })).toBeVisible();
    expect(screen.getByText('8 productos')).toBeVisible();
  });

  it('filtra por categoría desde la URL', () => {
    renderCatalog('/?categoria=hogar');

    expect(screen.getByRole('button', { name: 'Hogar' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Form Chair' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Aura Studio' })).not.toBeInTheDocument();
  });

  it('busca por texto y actualiza el contador', async () => {
    const user = userEvent.setup();
    renderCatalog('/?categoria=hogar');

    await user.type(screen.getByLabelText('Buscar productos'), 'taza');

    expect(await screen.findByRole('heading', { name: 'Terra Cup' })).toBeVisible();
    expect(screen.getByText(/1 producto/)).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Form Chair' })).not.toBeInTheDocument();
  });

  it('muestra un estado vacío y permite limpiar filtros', async () => {
    const user = userEvent.setup();
    renderCatalog('/?q=televisor');

    expect(screen.getByText('No encontramos coincidencias')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Ver todos los productos' }));

    expect(await screen.findByRole('heading', { name: 'Aura Studio' })).toBeVisible();
    expect(screen.getByText('8 productos')).toBeVisible();
  });
});
