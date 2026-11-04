import { expect, test, type Page } from '@playwright/test';

const ADMIN_TOKEN = 'orbita-admin-dev';

async function signIn(page: Page) {
  await page.goto('/');
  await page.getByLabel(/token de administrador/i).fill(ADMIN_TOKEN);
  await page.getByRole('button', { name: 'Entrar al panel' }).click();
  await expect(page).toHaveURL(/\/productos$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Productos' })).toBeVisible();
}

test.describe('Órbita Admin', () => {
  test('protege el panel con el token de administrador', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Entra al panel' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'El control de tu tienda, sin ruido.' })
    ).toBeVisible();

    await page.getByLabel(/token de administrador/i).fill('token-incorrecto');
    await page.getByRole('button', { name: 'Entrar al panel' }).click();

    await expect(page.getByRole('alert')).toContainText('El token no es válido');
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole('button', { name: 'Usar token de desarrollo' }).click();
    await page.getByRole('button', { name: 'Entrar al panel' }).click();

    await expect(page).toHaveURL(/\/productos$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Productos' })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'Terra Cup' })).toBeVisible();
  });

  test('crea un producto y actualiza su stock', async ({ page }) => {
    await signIn(page);

    const name = `Producto E2E ${Date.now()}`;

    await page.getByRole('button', { name: 'Nuevo producto' }).click();
    const createDialog = page.getByRole('dialog', { name: 'Agregar al catálogo' });
    await expect(createDialog).toBeVisible();

    await createDialog.getByLabel(/^nombre$/i).fill(name);
    await createDialog.getByLabel(/^precio \(mxn\)$/i).fill('999');
    await createDialog.getByLabel(/^stock$/i).fill('4');
    await createDialog.getByLabel(/descripción corta/i).fill('Producto creado por la suite E2E.');
    await createDialog
      .getByLabel(/^descripción$/i)
      .fill('Descripción de prueba creada por la suite de extremo a extremo.');

    await createDialog.getByRole('button', { name: 'Crear producto' }).click();

    await expect(page.getByText(`«${name}» se agregó al catálogo.`)).toBeVisible();
    await expect(createDialog).toBeHidden();

    await page.getByLabel('Buscar productos').fill(name);
    const row = page.getByRole('row').filter({ hasText: name });
    await expect(row).toBeVisible();
    await expect(row).toContainText('$999');
    await expect(row).toContainText(/bajo/i);

    await row.getByRole('button', { name: 'Editar' }).click();
    const editDialog = page.getByRole('dialog', { name });
    await expect(editDialog).toBeVisible();
    await expect(editDialog.getByLabel(/^nombre$/i)).toHaveValue(name);

    await editDialog.getByLabel(/^stock$/i).fill('7');
    await editDialog.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText(`«${name}» se actualizó correctamente.`)).toBeVisible();
    await expect(editDialog).toBeHidden();
    await expect(row).toContainText('7');
    await expect(row).toContainText(/bajo/i);
  });

  test('filtra pedidos y abre el detalle de un pedido', async ({ page }) => {
    await signIn(page);
    await page.goto('/pedidos');

    await expect(page.getByRole('heading', { level: 1, name: 'Pedidos' })).toBeVisible();
    await expect(page.getByText('4 de 4 pedidos')).toBeVisible();

    const pendingRow = page.getByRole('row').filter({ hasText: 'ORD-D4E5F6' });
    await expect(pendingRow).toContainText('Carlos Méndez');
    await expect(pendingRow).toContainText('Transferencia');
    await expect(pendingRow).toContainText('$2,580');

    await pendingRow.getByRole('button', { name: 'Ver detalle' }).click();
    const dialog = page.getByRole('dialog', { name: 'Carlos Méndez' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('ORD-D4E5F6');
    await expect(dialog).toContainText('Nomad Pack');
    await expect(dialog).toContainText('Terra Cup');
    await expect(dialog).toContainText('$2,580');
    await expect(dialog).toContainText('Vista de solo lectura');

    await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole('button', { name: 'Pendiente', exact: true }).click();
    await expect(page.getByText('1 de 4 pedidos')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'ORD-D4E5F6' })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'ORD-A1B2C3' })).toHaveCount(0);
  });

  test.describe('vista móvil', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('navega con las pestañas y abre un pedido en tarjeta', async ({ page }) => {
      await signIn(page);

      const panelNav = page
        .getByRole('navigation', { name: 'Secciones del panel' })
        .filter({ visible: true });

      await expect(panelNav.getByRole('link', { name: 'Productos' })).toBeVisible();
      await expect(panelNav.getByRole('link', { name: 'Pedidos' })).toBeVisible();
      await expect(page.getByRole('row')).toHaveCount(0);

      await panelNav.getByRole('link', { name: 'Pedidos' }).click();
      await expect(page).toHaveURL(/\/pedidos$/);

      await page.getByRole('button', { name: 'Ver detalle' }).first().click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('Vista de solo lectura')).toBeVisible();
    });
  });
});
