import { expect, test } from '@playwright/test';

test.describe('Órbita storefront', () => {
  test('explora, filtra por categoría y abre un producto', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1, name: /Objetos que hacen tu día/ })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Aura Studio' })).toBeVisible();

    await page.getByRole('button', { name: 'Hogar', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Form Chair' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Aura Studio' })).toHaveCount(0);
    await expect(page.getByText('3 productos')).toBeVisible();

    await page.getByRole('searchbox', { name: 'Buscar productos' }).fill('taza');
    await expect(page.getByText('1 producto')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Terra Cup' })).toBeVisible();

    await page.getByRole('link', { name: 'Ver Terra Cup' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Terra Cup' })).toBeVisible();
    await expect(page.getByText('Hecha a mano').first()).toBeVisible();
  });

  test('completa una compra simulada y conserva el pedido al recargar', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Añadir Aura Studio al carrito' }).click();
    await expect(page.getByRole('status')).toContainText('Aura Studio se añadió al carrito');

    await page.getByRole('link', { name: /Carrito, 1 artículo/ }).click();
    await expect(page.getByRole('heading', { name: 'Tu selección' })).toBeVisible();
    await expect(page.getByText('Aura Studio', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Aumentar cantidad de Aura Studio' }).click();
    await page.getByRole('link', { name: 'Continuar al pago' }).click();

    await page.getByLabel('Nombre completo').fill('Ana López');
    await page.getByLabel('Correo').fill('ana@empresa.com');
    await page.getByLabel('Teléfono').fill('5512345678');
    await page.getByLabel('Calle y número').fill('Av. Reforma 123');
    await page.getByLabel('Ciudad').fill('Guadalajara');
    await page.getByLabel('Estado').fill('Jalisco');
    await page.getByLabel('Código postal').fill('44100');
    await page.getByLabel('Número de tarjeta').fill('4242 4242 4242 4242');
    await page.getByLabel('Nombre en la tarjeta').fill('Ana López');
    await page.getByLabel('Vencimiento').fill('12/28');
    await page.getByLabel('CVV').fill('123');

    await page.getByRole('button', { name: /Confirmar pedido/ }).click();

    await expect(page.getByRole('heading', { name: /Gracias, Ana/ })).toBeVisible();
    await expect(page.getByText(/ORD-[A-Z0-9]{6}/)).toBeVisible();

    const orderUrl = page.url();
    await page.reload();
    await expect(page.getByRole('heading', { name: /Gracias, Ana/ })).toBeVisible();
    expect(page.url()).toBe(orderUrl);
  });

  test('valida los datos antes de confirmar el pedido', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Añadir Terra Cup al carrito' }).click();
    await page.getByRole('link', { name: /Carrito, 1 artículo/ }).click();
    await page.getByRole('link', { name: 'Continuar al pago' }).click();

    await page.getByRole('button', { name: /Confirmar pedido/ }).click();

    await expect(page.getByText('Escribe tu nombre completo.')).toBeVisible();
    await expect(page.getByText('Escribe un correo válido.')).toBeVisible();
    await expect(page.getByText('El código postal debe tener 5 dígitos.')).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);
  });

  test('mantiene el carrito vacío con un estado claro', async ({ page }) => {
    await page.goto('/carrito');

    await expect(page.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explorar catálogo' })).toBeVisible();
  });
});

test.describe('Navegación móvil', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('muestra todas las categorías y filtra el catálogo', async ({ page }) => {
    await page.goto('/');

    const mobileNav = page.getByRole('navigation', { name: 'Categorías' });
    await expect(mobileNav).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeHidden();

    for (const label of ['Tienda', 'Audio', 'Calzado', 'Accesorios', 'Hogar']) {
      await expect(mobileNav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }

    const lastLink = await mobileNav
      .getByRole('link', { name: 'Hogar', exact: true })
      .boundingBox();
    expect(lastLink).not.toBeNull();
    expect((lastLink?.x ?? 0) + (lastLink?.width ?? 0)).toBeLessThanOrEqual(390);

    await mobileNav.getByRole('link', { name: 'Accesorios', exact: true }).click();

    await expect(page).toHaveURL(/categoria=accesorios/);
    await expect(page.getByText('2 productos')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nomad Pack' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Halo One' })).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(mobileNav).toBeVisible();
  });
});
