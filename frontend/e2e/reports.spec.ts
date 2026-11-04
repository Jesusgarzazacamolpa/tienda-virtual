import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { loginThroughApi, seedSession } from './support/session';

test.describe('Reportería', () => {
  test.beforeEach(async ({ page, request }) => {
    const session = await loginThroughApi(request);
    await seedSession(page, session);
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Reportería', level: 1 })).toBeVisible();
  });

  test('descarga el listado de usuarios en PDF y XLSX', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Usuarios', level: 2 })).toBeVisible();

    const pdfDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'PDF', exact: true }).click();
    const pdf = await pdfDownload;

    expect(pdf.suggestedFilename()).toMatch(/^usuarios-\d{8}-\d{4}\.pdf$/);
    const pdfPath = await pdf.path();
    expect(pdfPath).not.toBeNull();
    const pdfBytes = await readFile(pdfPath!);
    expect(pdfBytes.subarray(0, 5).toString('latin1')).toBe('%PDF-');

    const xlsxDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Excel (XLSX)', exact: true }).click();
    const xlsx = await xlsxDownload;

    expect(xlsx.suggestedFilename()).toMatch(/^usuarios-\d{8}-\d{4}\.xlsx$/);
    const xlsxPath = await xlsx.path();
    expect(xlsxPath).not.toBeNull();
    const xlsxBytes = await readFile(xlsxPath!);
    expect(xlsxBytes.subarray(0, 2).toString('latin1')).toBe('PK');
  });

  test('aplica el filtro de búsqueda al reporte', async ({ page }) => {
    const search = page.getByRole('textbox', { name: 'Buscar por nombre, apellido o correo' });
    await search.fill('admin');
    await expect(page.getByText('«admin»')).toBeVisible();

    const filteredRequest = page.waitForRequest(
      request => request.url().includes('/api/v1/reports/users') && request.url().includes('search=admin')
    );
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'PDF', exact: true }).click();

    expect((await filteredRequest).url()).toContain('search=admin');
    expect((await download).suggestedFilename()).toMatch(/^usuarios-\d{8}-\d{4}\.pdf$/);
  });
});
