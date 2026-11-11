import { test, expect } from '@playwright/test';
test('landing links, FAQ, logo and favicon', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your documents. Clear answers.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open workspace' }).first()).toHaveAttribute(
    'href',
    '/chat',
  );
  await page.getByRole('link', { name: 'See how it works' }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await page.getByText('Which files can I use?', { exact: true }).click();
  await expect(
    page.getByText('Upload PDF, DOCX, TXT, or Markdown files.', { exact: false }),
  ).toBeVisible();
  expect(
    await page
      .locator('img[alt="iDoc"]')
      .first()
      .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
  ).toBeTruthy();
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    '/logo/idoc-favicon-black.png',
  );
});
test('login validates fields, toggles password and never fabricates sign-in', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Enter your email address.')).toBeVisible();
  await expect(page.getByText('Enter your password.')).toBeVisible();
  await page.getByLabel('Email address').fill('reader@example.com');
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Show password' }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Sign-in is not available yet' }),
  ).toBeVisible();
  await expect(page.getByLabel('Email address')).toHaveValue('reader@example.com');
  await expect(page).toHaveURL(/\/login$/);
});
test('protected routes and API remain closed without backend authentication', async ({
  page,
  request,
}) => {
  await page.goto('/chat');
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/documents');
  await expect(page).toHaveURL(/\/login/);
  expect((await request.get('/api/backend/v1/documents')).status()).toBe(503);
  expect(
    (
      await request.post('/api/backend/v1/auth/login', {
        headers: { Origin: 'https://untrusted.example' },
        data: {},
      })
    ).status(),
  ).toBe(403);
  expect((await request.get('/api/backend/unknown')).status()).toBe(404);
});
test('preview document upload, search, selection, chat sources and delete', async ({ page }) => {
  await page.goto('/preview/documents');
  await expect(page.getByText('Demo preview', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Upload documents', exact: true }).click();
  await page.getByLabel('Choose documents', { exact: true }).setInputFiles({
    name: 'test-notes.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('# Example test notes'),
  });
  await expect(page.getByText('Preview added', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search documents' }).fill('test-notes');
  await expect(page.getByRole('row').filter({ hasText: 'test-notes.md' })).toBeVisible();
  await page
    .getByRole('link', { name: 'Ask about test-notes.md' })
    .filter({ visible: true })
    .click();
  await expect(page.getByRole('button', { name: 'Choose documents: test-notes.md' })).toBeVisible();
  await page.getByLabel('Ask a question').fill('What is in this document?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(
    page.getByText('this is a frontend preview, not an AI-generated response.', { exact: false }),
  ).toBeVisible();
  await page.getByRole('button', { name: /View sources/ }).click();
  await expect(page.getByRole('dialog', { name: 'Sources' })).toBeVisible();
  await expect(
    page.getByText('Example passage: Upload your documents', { exact: false }),
  ).toBeVisible();
  await page.screenshot({ path: 'artifacts/screenshots/chat-active-sources.png', fullPage: true });
  expect(
    await page
      .getByRole('dialog', { name: 'Sources' })
      .evaluate((dialog) => getComputedStyle(dialog, '::backdrop').backdropFilter),
  ).toBe('none');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('dialog', { name: 'Sources' })).toHaveCSS('width', '390px');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  await page.screenshot({ path: 'artifacts/screenshots/chat-sources-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Documents', exact: true }).click();
  await page
    .getByRole('button', { name: 'Delete test-notes.md' })
    .filter({ visible: true })
    .click();
  await page.getByRole('button', { name: 'Delete document', exact: true }).click();
  await expect(page.getByText('test-notes.md', { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Chat', exact: true }).click();
  await page.getByRole('button', { name: /View sources/ }).click();
  await expect(page.getByText('Document removed · this is a saved excerpt.')).toBeVisible();
});
test('new chat confirmation, keyboard behavior and preview cleanup', async ({ page }) => {
  await page.goto('/preview/chat');
  await page.getByLabel('Ask a question').fill('Example question');
  await page.getByLabel('Ask a question').press('Shift+Enter');
  await expect(page.getByLabel('Ask a question')).toHaveValue('Example question\n');
  await page.getByLabel('Ask a question').press('Enter');
  await expect(page.getByText('Example answer', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'New chat', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Start a new chat?' })).toBeVisible();
  await page.getByRole('button', { name: 'Start new chat', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What would you like to know?' })).toBeVisible();
  await page.getByRole('button', { name: 'Leave preview' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/preview/chat');
  await expect(page.getByText('Example answer', { exact: true })).toHaveCount(0);
});
test('upload validation and modal focus', async ({ page }) => {
  await page.goto('/preview/documents');
  const trigger = page.getByRole('button', { name: 'Upload documents', exact: true });
  await trigger.click();
  await page.getByLabel('Choose documents', { exact: true }).setInputFiles({
    name: 'unsafe.exe',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('example'),
  });
  await expect(page.getByText('Unsupported format.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Workspace settings' })).toBeVisible();
  await expect(page.getByText('Preview · not connected', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
});
test('empty library state after deleting example documents', async ({ page }) => {
  await page.goto('/preview/documents');
  for (const name of ['Workspace_Guide.pdf', 'Project_Notes.md', 'Requirements.docx']) {
    await page
      .getByRole('button', { name: `Delete ${name}` })
      .filter({ visible: true })
      .click();
    await page.getByRole('button', { name: 'Delete document', exact: true }).click();
  }
  await expect(
    page.getByRole('heading', { name: 'No documents in your knowledge base yet' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Chat', exact: true }).click();
  await page.getByLabel('Ask a question').fill('Any documents?');
  await expect(page.getByRole('button', { name: 'Send question' })).toBeDisabled();
});
test('responsive layouts, mobile navigation and screenshots', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [path, name] of [
      ['/', 'landing'],
      ['/login', 'login'],
      ['/preview/chat', 'chat'],
      ['/preview/documents', 'documents'],
    ]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${path} at ${width}px`,
      ).toBeTruthy();
      await page.screenshot({ path: `artifacts/screenshots/${name}-${width}.png`, fullPage: true });
    }
  }
  await page.goto('/preview/chat');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Documents' }).click();
  await expect(page).toHaveURL(/\/preview\/documents$/);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Workspace settings' })).toBeVisible();
  expect(errors).toEqual([]);
});
