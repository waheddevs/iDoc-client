import { test, expect } from '@playwright/test';

// Explicit browser API fixtures for pending, missing-answer and grouped-source UI states.
test('simplified chat handles document selection, processing and retrieved passages', async ({
  page,
}) => {
  const fileName =
    'A-very-long-document-name-for-checking-mobile-layout-and-selected-file-visibility.pdf';
  const docs = [
    {
      document_id: 'ui-doc',
      file_name: fileName,
      file_type: 'pdf',
      size_bytes: 1024,
      num_chunks: 2,
      ingested_at: '2026-11-11T00:00:00Z',
      status: 'ready',
    },
  ];
  await page.route('**/api/backend/v1/documents', (route) =>
    route.fulfill({ json: { documents: docs, total: docs.length } }),
  );
  let releaseAnswer!: () => void;
  const answerGate = new Promise<void>((resolve) => {
    releaseAnswer = resolve;
  });
  await page.route('**/api/backend/v1/chat/completions', async (route) => {
    expect(route.request().postDataJSON().document_ids).toEqual(['ui-doc']);
    await answerGate;
    await route.fulfill({
      json: {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Available documents do not provide enough information.',
            },
          },
        ],
        sources: [1, 2].map((index) => ({
          source_id: 'S' + index,
          document_id: 'ui-doc',
          file_name: fileName,
          page_label: '1',
          chunk_index: index - 1,
          text: 'Retrieved test passage ' + index,
          score: null,
        })),
      },
    });
  });
  await page.goto('/chat');
  const picker = page.getByRole('button', { name: 'Choose documents: All documents' });
  await expect(picker).toHaveCount(1);
  await picker.click();
  await page.getByRole('checkbox', { name: fileName }).check();
  await page.getByRole('button', { name: 'Close Choose documents' }).click();
  await expect(picker).toBeVisible();
  await picker.click();
  await page.getByRole('checkbox', { name: fileName }).check();
  await page.getByRole('button', { name: 'Use documents' }).click();
  await expect(page.getByRole('button', { name: 'Choose documents: ' + fileName })).toBeVisible();
  await page.getByLabel('Ask a question').fill('What does this file say?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Looking through your documents' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send question' })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Choose documents:/ })).toBeDisabled();
  await expect(page.locator('[role="status"] .MuiCircularProgress-root')).toHaveCSS(
    'width',
    '20px',
  );
  releaseAnswer();
  await page.getByRole('button', { name: /Retrieved passages/ }).click();
  const panel = page.getByRole('dialog', { name: 'Sources' });
  await expect(panel).toContainText('did not provide enough information');
  await expect(panel.getByRole('heading', { name: fileName })).toHaveCount(1);
  await panel.getByRole('button', { name: /Passage 2/ }).click();
  await expect(panel.getByText('Retrieved test passage 2')).toBeVisible();
  await page.screenshot({
    path: 'artifacts/screenshots/chat-retrieved-passages.png',
    fullPage: true,
  });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /Retrieved passages/ })).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  await page.getByLabel('Ask a question').fill('First line\nSecond line\nThird line\nFourth line');
  expect(await page.getByLabel('Ask a question').evaluate((e) => e.clientHeight)).toBeGreaterThan(
    90,
  );
  await page.getByRole('button', { name: /Retrieved passages/ }).click();
  await expect(panel).toHaveCSS('width', '390px');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1280, height: 800 });
  let releaseUpload!: () => void;
  const uploadGate = new Promise<void>((resolve) => {
    releaseUpload = resolve;
  });
  await page.route('**/api/backend/v1/ingest/file', async (route) => {
    await uploadGate;
    docs.push({
      ...docs[0],
      document_id: 'upload-ui',
      file_name: 'new-notes.txt',
      file_type: 'txt',
    });
    await route.fulfill({ status: 201, json: { document_id: 'upload-ui', status: 'success' } });
  });
  await page.getByRole('button', { name: 'Upload documents', exact: true }).click();
  await page
    .getByLabel('Choose documents', { exact: true })
    .setInputFiles({
      name: 'new-notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Explicit UI fixture'),
    });
  await expect(page.getByText('Processing', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Processing/ })).toBeDisabled();
  releaseUpload();
  await expect(page.getByText('Ready', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByText('Ready to ask')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose documents: new-notes.txt' })).toBeVisible();
});
