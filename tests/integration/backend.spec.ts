import { test, expect } from '@playwright/test';

for (const hostname of ['localhost', '127.0.0.1']) {
  test(`local workspace works through ${hostname} for pages, uploads and deletion`, async ({
    page,
  }) => {
    const origin = `http://${hostname}:3101`;
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${origin}/chat`);
    await expect(page.getByLabel('Ask a question')).toBeVisible();
    await page.getByRole('link', { name: 'Documents', exact: true }).click();
    await expect(page).toHaveURL(`${origin}/documents`);
    const name = `host-${hostname}.txt`;
    await page.getByRole('button', { name: 'Upload documents', exact: true }).click();
    await page.getByLabel('Choose documents', { exact: true }).setInputFiles({
      name,
      mimeType: 'text/plain',
      buffer: Buffer.from(`Loopback regression fixture for ${hostname}.`),
    });
    await expect(page.getByText('Ready', { exact: true })).toBeVisible({ timeout: 120000 });
    await page.getByRole('button', { name: 'Done', exact: true }).click();
    await page.reload();
    await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible();
    await page
      .getByRole('button', { name: `Delete ${name}` })
      .filter({ visible: true })
      .click();
    await page.getByRole('button', { name: 'Delete document', exact: true }).click();
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('local aliases still reject foreign hosts, ports and cross-origin mutations', async ({
  request,
}) => {
  for (const host of [
    'localhost:3102',
    '127.0.0.1:3102',
    '[::1]:3102',
    'localhost.attacker.test:3101',
    '127.0.0.1.attacker.test:3101',
    '192.168.1.2:3101',
  ]) {
    expect(
      (await request.get('/api/backend/v1/documents', { headers: { Host: host } })).status(),
    ).toBe(403);
  }
  for (const origin of [
    'http://localhost:3102',
    'http://127.0.0.1:3101',
    'https://localhost:3101',
    'null',
    'http://localhost:3101.attacker.test',
  ]) {
    expect(
      (
        await request.post('/api/backend/v1/chat/completions', {
          headers: { Origin: origin },
          data: {},
        })
      ).status(),
    ).toBe(403);
  }
  expect((await request.post('/api/backend/v1/chat/completions', { data: {} })).status()).toBe(403);
  // IPv6 authority is accepted even when the test listener binds only IPv4.
  expect(
    (await request.get('/api/backend/v1/documents', { headers: { Host: '[::1]:3101' } })).status(),
  ).toBe(200);
  const ipv6 = await request.post('/api/backend/v1/chat/completions', {
    headers: { Host: '[::1]:3101', Origin: 'http://[::1]:3101' },
    data: {},
  });
  expect(ipv6.status()).toBe(400);
  expect((await ipv6.json()).error.code).toBe('invalid_input');
});

test('local mode, readiness, error codes and request boundaries', async ({ page, request }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  await page.goto('/chat');
  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByLabel('Ask a question')).toBeVisible();
  expect((await request.get('/api/backend/ready')).status()).toBe(200);
  const badScope = await request.post('/api/backend/v1/chat/completions', {
    headers: { Origin: 'http://localhost:3101' },
    data: { messages: [{ role: 'user', content: 'Question' }], document_ids: [], stream: false },
  });
  expect(badScope.status()).toBe(400);
  expect((await badScope.json()).error.code).toBe('invalid_selection');
  expect(
    (
      await request.post('/api/backend/v1/ingest/file', {
        headers: { Origin: 'https://elsewhere.example' },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.get('/api/backend/v1/documents', { headers: { Host: 'elsewhere.example' } })
    ).status(),
  ).toBe(403);
  expect((await request.get('/api/backend/unknown')).status()).toBe(404);
  await page.getByRole('button', { name: 'Leave workspace' }).click();
  await page
    .getByRole('dialog', { name: 'Leave workspace?' })
    .getByRole('button', { name: 'Leave workspace', exact: true })
    .click();
  await expect(page).toHaveURL('/');
});

test('real HTTP upload, duplicate, scoped answer, source, persistence and deletion', async ({
  page,
  request,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/documents');
  const file = {
    name: 'integration-aurora.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(
      'The project codename is Aurora. Maya Chen owns the Aurora project. The launch date is 15 March 2027.',
    ),
  };
  const upload = async (duplicate = false) => {
    await page.getByRole('button', { name: 'Upload documents', exact: true }).click();
    await page.getByLabel('Choose documents', { exact: true }).setInputFiles(file);
    await expect(
      page.getByText(duplicate ? 'Already indexed' : 'Ready', { exact: true }),
    ).toBeVisible({ timeout: 120000 });
    await page.getByRole('button', { name: 'Done', exact: true }).click();
  };
  await upload();
  await upload(true);
  let library = await (await request.get('/api/backend/v1/documents')).json();
  expect(library.total).toBe(1);
  const id = library.documents[0].document_id;
  const second = await request.post('/api/backend/v1/ingest/file', {
    headers: { Origin: 'http://localhost:3101' },
    multipart: {
      file: {
        name: 'integration-borealis.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from(
          'The separate project is Borealis, owned by Noah Patel. Its launch is December 2028.',
        ),
      },
    },
    timeout: 120000,
  });
  expect(second.status()).toBe(201);
  await page.reload();
  await expect(page.getByRole('row').filter({ hasText: file.name })).toBeVisible();
  await page
    .getByRole('link', { name: `Ask about ${file.name}` })
    .filter({ visible: true })
    .click();
  await expect(page.getByRole('button', { name: `Choose documents: ${file.name}` })).toBeVisible();
  const completion = page.waitForResponse(
    (response) =>
      response.url().endsWith('/v1/chat/completions') && response.request().method() === 'POST',
    { timeout: 180000 },
  );
  await page.getByLabel('Ask a question').fill('What is the project codename? Cite the source.');
  await page.getByRole('button', { name: 'Send question' }).click();
  const response = await completion;
  expect(response.status(), await response.text()).toBe(200);
  const answer = await response.json();
  expect(answer.choices[0].message.content).toMatch(/Aurora/i);
  expect(answer.sources.length).toBeGreaterThan(0);
  expect(
    answer.sources.every((source: { document_id: string }) => source.document_id === id),
  ).toBeTruthy();
  const citations = [...answer.choices[0].message.content.matchAll(/\[(S\d+)\]/g)].map(
    (match: RegExpMatchArray) => match[1],
  );
  expect(citations.length).toBeGreaterThan(0);
  expect(
    citations.every((citation: string) =>
      answer.sources.some((source: { source_id: string }) => source.source_id === citation),
    ),
  ).toBeTruthy();
  await testInfo.attach('answer-and-sources', {
    body: JSON.stringify(answer, null, 2),
    contentType: 'application/json',
  });
  await page.getByRole('button', { name: /View sources/ }).click();
  await expect(page.getByRole('dialog', { name: 'Sources' })).toContainText('Maya Chen');
  await page.screenshot({ path: testInfo.outputPath('sources-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('dialog', { name: 'Sources' })).toHaveCSS('width', '390px');
  await page.screenshot({ path: testInfo.outputPath('sources-mobile.png'), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Documents', exact: true }).click();
  await page
    .getByRole('button', { name: `Delete ${file.name}` })
    .filter({ visible: true })
    .click();
  await page.getByRole('button', { name: 'Delete document', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: file.name })).toHaveCount(0);
  await page.getByRole('link', { name: 'Chat', exact: true }).click();
  await page.getByLabel('Ask a question').fill('What is the codename now?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.getByRole('dialog', { name: 'Choose documents' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Choose documents' })).toContainText(
    'no longer available',
  );
  await page.getByRole('button', { name: 'All documents', exact: false }).click();
  await page.getByRole('button', { name: 'Use documents' }).click();
  library = await (await request.get('/api/backend/v1/documents')).json();
  expect(library.total).toBe(1);
  for (const doc of library.documents) {
    expect(
      (
        await request.delete(`/api/backend/v1/documents/${doc.document_id}`, {
          headers: { Origin: 'http://localhost:3101' },
        })
      ).status(),
    ).toBe(200);
  }
  await page.reload();
  await expect(page.getByRole('button', { name: 'Send question' })).toBeDisabled();
  expect(errors).toEqual([]);
});
