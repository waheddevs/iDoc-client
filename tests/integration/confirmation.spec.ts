import { test, expect } from '@playwright/test';

test('delete confirmation keeps the document on failure and prevents duplicate submissions', async ({
  page,
}) => {
  // Isolated browser API fixture: no user documents are deleted.
  const doc = {
    document_id: 'confirmation-fixture',
    file_name: 'Review-notes.pdf',
    file_type: 'pdf',
    size_bytes: 1024,
    num_chunks: 1,
    ingested_at: '2026-01-01T00:00:00Z',
    status: 'ready',
  };
  let removed = false;
  let attempts = 0;
  let releaseFailure!: () => void;
  const failureGate = new Promise<void>((resolve) => {
    releaseFailure = resolve;
  });
  await page.route('**/api/backend/v1/documents', (route) =>
    route.fulfill({ json: { documents: removed ? [] : [doc] } }),
  );
  await page.route('**/api/backend/v1/documents/confirmation-fixture', async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await failureGate;
      await route.fulfill({
        status: 503,
        json: {
          error: { code: 'unavailable', message: 'Could not delete document. Please try again.' },
        },
      });
    } else {
      removed = true;
      await route.fulfill({ status: 204 });
    }
  });
  await page.goto('/documents');
  const trigger = page
    .getByRole('button', { name: 'Delete Review-notes.pdf' })
    .filter({ visible: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Delete document', exact: true });
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole('button', { name: 'Delete document', exact: true }).click();
  await expect(dialog).toHaveAttribute('aria-busy', 'true');
  await expect(dialog.getByRole('button', { name: 'Deleting...' })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  expect(attempts).toBe(1);
  releaseFailure();
  await expect(dialog.getByRole('alert')).toContainText('Could not delete document');
  await expect(page.getByRole('row').filter({ hasText: 'Review-notes.pdf' })).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Delete document', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'No documents in your knowledge base yet' }),
  ).toBeVisible();
  expect(attempts).toBe(2);
});
