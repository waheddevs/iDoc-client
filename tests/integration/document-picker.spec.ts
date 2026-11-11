import { test, expect } from '@playwright/test';

test('document picker keeps checkbox sizes, selection and layout consistent', async ({ page }) => {
  const names = [
    'Receipt.pdf',
    'A very long handbook filename with many words and references that wraps onto multiple lines in the document picker.pdf',
  ];
  await page.route('**/api/backend/v1/documents', (route) =>
    route.fulfill({
      json: {
        total: 2,
        documents: names.map((file_name, i) => ({
          document_id: 'picker-' + i,
          file_name,
          file_type: 'pdf',
          size_bytes: 1024 * (i + 1),
          num_chunks: 10,
          ingested_at: '2026-11-11',
          status: 'ready',
          total_pages: 12,
          text_pages: 10,
        })),
      },
    }),
  );
  await page.goto('/chat');
  const trigger = page.getByRole('button', { name: 'Choose documents: All documents' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Choose documents' });
  await expect(dialog.getByLabel('Find a document')).toBeFocused();
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of names) {
      const box = await dialog.getByRole('checkbox', { name, exact: true }).boundingBox();
      expect(box?.width).toBe(20);
      expect(box?.height).toBe(20);
    }
    expect(await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBeTruthy();
    await page.screenshot({ path: 'artifacts/screenshots/document-picker-' + width + '.png' });
  }
  await dialog.getByRole('checkbox', { name: names[1], exact: true }).check();
  await dialog.getByLabel('Find a document').fill('Receipt');
  await expect(dialog.getByRole('checkbox')).toHaveCount(1);
  await expect(dialog.getByText('1 selected', { exact: true })).toBeVisible();
  await dialog.getByLabel('Find a document').fill('missing');
  await expect(dialog.getByText('No matching documents.')).toBeVisible();
  await dialog.getByLabel('Find a document').fill('');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog.getByRole('checkbox', { name: names[1], exact: true })).not.toBeChecked();
  await dialog.getByRole('checkbox', { name: names[1], exact: true }).check();
  await dialog.getByRole('button', { name: 'Use documents' }).click();
  await expect(page.getByRole('button', { name: 'Choose documents: ' + names[1] })).toBeVisible();
});
