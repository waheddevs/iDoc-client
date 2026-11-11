import { test, expect, type Page } from '@playwright/test';
const origin = 'http://localhost:3102';
const headers = { Origin: origin };
const password = 'Conversation password 123!';
async function setup(page: Page) {
  const email = 'chat-' + crypto.randomUUID() + '@example.com';
  expect(
    (
      await page.request.post('/api/backend/v1/auth/signup', { headers, data: { email, password } })
    ).status(),
  ).toBe(201);
  const upload = await page.request.post('/api/backend/v1/ingest/file', {
    headers,
    multipart: {
      file: {
        name: 'project.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(
          'The project codename is Aurora. The owner is Alice. It launches in June.',
        ),
      },
    },
  });
  expect(upload.status()).toBe(201);
  await page.goto('/chat');
  await expect(page.getByText('What would you like to know?', { exact: true })).toBeVisible();
  return { email, documentId: (await upload.json()).document_id };
}
async function ask(page: Page, question: string) {
  await page.getByLabel('Ask a question').fill(question);
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page).toHaveURL(/conversation=[a-f0-9]{32}/);
  await expect(page.getByRole('article', { name: 'iDoc response' }).last()).toBeVisible();
  return new URL(page.url()).searchParams.get('conversation')!;
}
const history = (page: Page) =>
  page.getByRole('region', { name: 'Chat history' }).filter({ visible: true });

test('autosave survives refresh, new chat, logout and reopening in another browser', async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const { email, documentId } = await setup(page);
  await page.getByRole('button', { name: 'Choose documents: All documents' }).click();
  await page.getByRole('checkbox', { name: /project.txt/ }).check();
  await page.getByRole('button', { name: 'Use documents' }).click();
  const id = await ask(page, 'What is the project codename?');
  await expect(
    history(page).getByRole('link', { name: 'What is the project codename?', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Chats are saved to your account.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('article', { name: 'iDoc response' })).toContainText('Aurora');
  await expect(page.getByRole('button', { name: 'Choose documents: project.txt' })).toBeVisible();
  await page.getByRole('button', { name: /View sources/ }).click();
  await expect(page.getByRole('dialog', { name: 'Sources' })).toContainText('project.txt');
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'New chat', exact: true })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(origin + '/chat');
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const second = await ask(page, 'When does it launch?');
  expect(second).not.toBe(id);
  await history(page)
    .getByRole('link', { name: 'What is the project codename?', exact: true })
    .click();
  await expect(page.getByRole('article', { name: 'Your message' })).toHaveText(
    'What is the project codename?',
  );
  await ask(page, 'Who owns this project?');
  await expect(page.getByRole('article', { name: 'iDoc response' })).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole('article')).toHaveCount(4);

  await history(page)
    .getByRole('button', { name: 'Rename chat: What is the project codename?' })
    .click();
  await page.getByLabel('Chat title').fill('Aurora project');
  await page.getByRole('button', { name: 'Save title' }).click();
  await expect(
    history(page).getByRole('link', { name: 'Aurora project', exact: true }),
  ).toBeVisible();
  const context = await browser.newContext({ baseURL: origin });
  try {
    expect(
      (
        await context.request.post('/api/backend/v1/auth/login', {
          headers,
          data: { email, password },
        })
      ).status(),
    ).toBe(200);
    const reopened = await context.newPage();
    await reopened.goto('/chat?conversation=' + id);
    await expect(reopened.getByRole('article')).toHaveCount(4);
    await expect(
      history(reopened).getByRole('link', { name: 'Aurora project', exact: true }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
  expect(
    (await page.request.delete('/api/backend/v1/documents/' + documentId, { headers })).status(),
  ).toBe(200);
  await page.reload();
  await page
    .getByRole('button', { name: /View sources/ })
    .first()
    .click();
  await expect(page.getByRole('dialog', { name: 'Sources' })).toContainText('Document removed');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(
    history(page).getByRole('link', { name: 'Aurora project', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'artifacts/screenshots/saved-chats-mobile.png' });
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'artifacts/screenshots/saved-chats-desktop.png' });
  await history(page).getByRole('button', { name: 'Delete chat: Aurora project' }).click();
  await page.getByRole('button', { name: 'Delete chat', exact: true }).click();
  await expect(page).toHaveURL(origin + '/chat');
  expect((await page.request.get('/api/backend/v1/conversations/' + id)).status()).toBe(404);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/login/);
  expect(
    (
      await page.request.post('/api/backend/v1/auth/login', { headers, data: { email, password } })
    ).status(),
  ).toBe(200);
  await page.goto('/chat?conversation=' + second);
  await expect(page.getByRole('article', { name: 'Your message' })).toHaveText(
    'When does it launch?',
  );
  expect(errors).toEqual([]);
});

test('refresh during generation restores the saved question and polls for the answer', async ({
  page,
}) => {
  await setup(page);
  await page.getByLabel('Ask a question').fill('E2E_SLOW_CHAT What is the project codename?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page).toHaveURL(/conversation=[a-f0-9]{32}/);
  const id = new URL(page.url()).searchParams.get('conversation')!;
  await expect
    .poll(
      async () =>
        (await (await page.request.get('/api/backend/v1/conversations/' + id)).json()).pending,
    )
    .toBe(true);
  await page.reload();
  await expect(page.getByRole('article', { name: 'Your message' })).toContainText('E2E_SLOW_CHAT');
  await expect(page.getByRole('article', { name: 'iDoc response' })).toContainText('Aurora');
  await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page.getByLabel('Ask a question')).toBeEnabled();
});

test('a failed submission can be retried and other accounts cannot read or change chats', async ({
  page,
  browser,
}) => {
  await setup(page);
  await page.route('**/api/backend/v1/chat/completions', (route) => route.abort(), { times: 1 });
  await page.getByLabel('Ask a question').fill('What is the project codename?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.getByRole('button', { name: 'Retry answer' })).toBeVisible();
  const id = new URL(page.url()).searchParams.get('conversation')!;
  await page.getByRole('button', { name: 'Retry answer' }).click();
  await expect(page.getByRole('article', { name: 'iDoc response' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('article')).toHaveCount(2);
  // A lost HTTP response must recover the saved answer instead of offering a duplicate retry.
  await page.route(
    '**/api/backend/v1/chat/completions',
    async (route) => {
      await route.fetch();
      await route.abort();
    },
    { times: 1 },
  );
  await page.getByLabel('Ask a question').fill('Who owns the project?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.getByRole('article', { name: 'iDoc response' })).toHaveCount(2);
  await expect(page.getByLabel('Ask a question')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Retry answer' })).toHaveCount(0);
  const other = await browser.newContext({ baseURL: origin });
  try {
    const outsider = await other.newPage();
    await setup(outsider);
    expect((await other.request.get('/api/backend/v1/conversations')).ok()).toBe(true);
    expect(
      (await (await other.request.get('/api/backend/v1/conversations')).json()).conversations,
    ).toEqual([]);
    expect((await other.request.get('/api/backend/v1/conversations/' + id)).status()).toBe(404);
    expect(
      (
        await other.request.patch('/api/backend/v1/conversations/' + id, {
          headers,
          data: { title: 'not mine' },
        })
      ).status(),
    ).toBe(404);
    expect(
      (await other.request.delete('/api/backend/v1/conversations/' + id, { headers })).status(),
    ).toBe(404);
    await outsider.goto('/chat?conversation=' + id);
    await expect(outsider.getByRole('main').getByRole('alert')).toContainText(
      'Conversation not found.',
    );
    await expect(outsider.getByRole('article')).toHaveCount(0);
  } finally {
    await other.close();
  }
});

test('new chat while an answer is pending preserves both conversations', async ({ page }) => {
  await setup(page);
  await page.getByLabel('Ask a question').fill('E2E_SLOW_CHAT Keep this first question');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page).toHaveURL(/conversation=[a-f0-9]{32}/);
  const first = new URL(page.url()).searchParams.get('conversation')!;
  await expect
    .poll(
      async () =>
        (await (await page.request.get('/api/backend/v1/conversations/' + first)).json()).pending,
    )
    .toBe(true);
  await page
    .getByRole('button', { name: 'New chat', exact: true })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(origin + '/chat');
  const second = await ask(page, 'This is a different conversation');
  expect(second).not.toBe(first);
  await expect(page.getByRole('article', { name: 'Your message' })).toHaveText(
    'This is a different conversation',
  );
  await expect
    .poll(
      async () =>
        (await (await page.request.get('/api/backend/v1/conversations/' + first)).json()).messages
          .length,
    )
    .toBe(2);
  await history(page)
    .getByRole('link', { name: 'E2E_SLOW_CHAT Keep this first question', exact: true })
    .click();
  await expect(page.getByRole('article', { name: 'Your message' })).toHaveText(
    'E2E_SLOW_CHAT Keep this first question',
  );
  await expect(page.getByRole('article')).toHaveCount(2);
});
