import { test, expect, type Page } from '@playwright/test';

const password = 'Workspace test password 123!';
const origin = 'http://localhost:3102';
const email = (prefix: string) => `${prefix}-${crypto.randomUUID()}@example.com`;
async function createAccount(page: Page, address: string) {
  await page.goto('/signup');
  await page.getByLabel('Email address').fill(address);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByRole('link', { name: 'Profile', exact: true })).toContainText(
    address.split('@')[0],
  );
}
async function upload(page: Page, name: string, text: string) {
  await page.goto('/documents');
  await page.getByRole('button', { name: 'Upload documents', exact: true }).click();
  await page
    .getByLabel('Choose documents', { exact: true })
    .setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from(text) });
  await expect(page.getByText('Ready', { exact: true })).toBeVisible({ timeout: 90000 });
  await page.getByRole('button', { name: 'Done', exact: true }).click();
}

test('client validation blocks requests; real backend errors map to separate fields', async ({
  page,
}) => {
  let submissions = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/v1/auth/signup') && request.method() === 'POST') submissions++;
  });
  await page.goto('/signup');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.locator('#email-error')).toHaveText(/Enter your email/);
  await expect(page.locator('#password-error')).toBeVisible();
  await expect(page.locator('#confirmPassword-error')).toBeVisible();
  expect(submissions).toBe(0);
  await page.getByLabel('Email address').fill('invalid-address');
  await page.getByLabel('Password', { exact: true }).fill('short');
  await page.getByLabel('Confirm password', { exact: true }).fill('different');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.locator('#email-error')).toHaveText(/valid email/);
  await expect(page.locator('#password-error')).toHaveText(/at least 8/);
  await expect(page.locator('#confirmPassword-error')).toHaveText(/do not match/);
  expect(submissions).toBe(0);
  const address = email('validation');
  await createAccount(page, address);
  expect(submissions).toBe(1);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Sign out?', exact: true })
    .getByRole('button', { name: 'Sign out', exact: true })
    .click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/signup');
  await page.getByLabel('Email address').fill(address.toUpperCase());
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.locator('#email-error')).toHaveText(/already uses this email/);
  await expect(page.getByLabel('Email address')).toBeFocused();
  await expect(page.locator('#password-error')).toHaveCount(0);
  expect(submissions).toBe(2);
  // Bypass the browser validator: FastAPI must independently reject invalid fields.
  const invalid = await page.request.post('/api/backend/v1/auth/signup', {
    headers: { Origin: origin },
    data: { email: 'bad', password: 'short' },
  });
  expect(invalid.status()).toBe(422);
  expect(Object.keys((await invalid.json()).error.fieldErrors).sort()).toEqual([
    'email',
    'password',
  ]);
  await page.goto('/login');
  await page.getByLabel('Email address').fill(address);
  await page.getByLabel('Password', { exact: true }).fill('incorrect-password');
  await page.getByRole('button', { name: 'Show password' }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Account access' }).getByRole('alert')).toHaveText(
    /Invalid email or password/,
  );
  await expect(page.getByLabel('Email address')).toHaveValue(address);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await expect(page.getByRole('region', { name: 'Account access' }).getByRole('alert')).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/chat$/);
});

test('real account sessions isolate documents, chat sources and deletion across browsers', async ({
  page,
  browser,
}) => {
  const address = email('alice');
  await createAccount(page, address);
  const aliceSession = (await page.context().cookies()).find(
    (cookie) => cookie.name === 'idoc_session',
  )!;
  expect(aliceSession.httpOnly).toBe(true);
  expect(aliceSession.sameSite).toBe('Lax');
  expect(await page.evaluate(() => document.cookie)).not.toContain('idoc_session');
  await upload(
    page,
    'alice-private.txt',
    'The private project codename is Aurora. The owner is Alice.',
  );
  const aliceList = await (await page.request.get('/api/backend/v1/documents')).json();
  const aliceId = aliceList.documents[0].document_id;
  const bob = await browser.newContext({ baseURL: origin });
  const bobPage = await bob.newPage();
  try {
    await createAccount(bobPage, email('bob'));
    await bobPage.goto('/documents');
    await expect(bobPage.getByText('alice-private.txt', { exact: true })).toHaveCount(0);
    expect((await (await bob.request.get('/api/backend/v1/documents')).json()).total).toBe(0);
    expect(
      (
        await bob.request.delete(`/api/backend/v1/documents/${aliceId}`, {
          headers: { Origin: origin },
        })
      ).status(),
    ).toBe(404);
    expect(
      (
        await bob.request.post('/api/backend/v1/chat/completions', {
          headers: { Origin: origin },
          data: {
            messages: [{ role: 'user', content: 'What is the code?' }],
            document_ids: [aliceId],
          },
        })
      ).status(),
    ).toBe(404);
    await upload(
      bobPage,
      'bob-private.txt',
      'The private project codename is Borealis. The owner is Bob.',
    );
    const bobList = await (await bob.request.get('/api/backend/v1/documents')).json();
    const bobId = bobList.documents[0].document_id;
    expect(bobId).not.toBe(aliceId);
    await bobPage
      .getByRole('link', { name: 'Ask about bob-private.txt' })
      .filter({ visible: true })
      .click();
    await bobPage.getByLabel('Ask a question').fill('What is the private project codename?');
    const answer = bobPage.waitForResponse((response) =>
      response.url().endsWith('/v1/chat/completions'),
    );
    await bobPage.getByRole('button', { name: 'Send question' }).click();
    const response = await answer;
    expect(response.status()).toBe(200);
    expect(
      (await response.json()).sources.every(
        (source: { document_id: string }) => source.document_id === bobId,
      ),
    ).toBe(true);
    await bobPage.getByRole('button', { name: /View sources/ }).click();
    await expect(bobPage.getByRole('dialog', { name: 'Sources' })).toContainText('Borealis');
    await bobPage.keyboard.press('Escape');
    await bobPage.goto('/documents');
    await bobPage
      .getByRole('button', { name: 'Delete bob-private.txt' })
      .filter({ visible: true })
      .click();
    await bobPage.getByRole('button', { name: 'Delete document', exact: true }).click();
    await expect(bobPage.getByText('bob-private.txt', { exact: true })).toHaveCount(0);
    await page.reload();
    await expect(page.getByText('alice-private.txt', { exact: true }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await page
      .getByRole('dialog', { name: 'Sign out?', exact: true })
      .getByRole('button', { name: 'Sign out', exact: true })
      .click();
    await expect(page).toHaveURL(/\/login$/);
    expect(
      (
        await page.request.get('/api/backend/v1/documents', {
          headers: { Cookie: `idoc_session=${aliceSession.value}` },
        })
      ).status(),
    ).toBe(401);
    await page.goto('/documents');
    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel('Email address').fill(address);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL(/\/chat$/);
    await page.goto('/documents');
    await expect(page.getByText('alice-private.txt', { exact: true }).first()).toBeVisible();
    // Revoke session externally; a failed protected mutation must clear the active UI.
    await page.request.post('/api/backend/v1/auth/logout', { headers: { Origin: origin } });
    await page
      .getByRole('button', { name: 'Delete alice-private.txt' })
      .filter({ visible: true })
      .click();
    await page.getByRole('button', { name: 'Delete document', exact: true }).click();
    await expect(page).toHaveURL(/\/login\?reason=expired/);
  } finally {
    await bob.close();
  }
});

test('auth reference layout stays usable on desktop and mobile', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (/GL_INVALID|WebGL.*error/i.test(message.text())) errors.push(message.text());
  });
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['login', 'signup']) {
      await page.goto(`/${route}`);
      await expect(page.getByLabel('Email address')).toBeVisible();
      const illustration = page.locator('[data-auth-illustration]');
      if (width > 900) {
        await expect(illustration.locator('img')).toHaveJSProperty('complete', true);
        await expect(illustration).toHaveAttribute('data-animated', 'true');
      } else {
        await expect(illustration).toBeHidden();
        await expect(illustration.locator('canvas')).toHaveCount(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: `artifacts/auth/${route}-${width}.png`, fullPage: true });
    }
  }
  expect(errors).toEqual([]);
});

test('auth illustration animates and falls back when motion or WebGL is disabled', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/login');
  const illustration = page.locator('[data-auth-illustration]');
  const canvas = illustration.locator('canvas');
  await expect(illustration).toHaveAttribute('data-animated', 'true');
  const resting = await canvas.screenshot();
  const bounds = (await illustration.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width * 0.9, bounds.y + bounds.height * 0.2);
  await expect.poll(async () => (await canvas.screenshot()).equals(resting)).toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(canvas).toHaveCount(0);
  await expect(illustration.locator('img')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(illustration).toHaveAttribute('data-animated', 'true');
  await canvas.evaluate((element) => {
    (element as HTMLCanvasElement)
      .getContext('webgl2')
      ?.getExtension('WEBGL_lose_context')
      ?.loseContext();
  });
  await expect(canvas).toHaveCount(0);
  await expect(illustration.locator('img')).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
});

test('pending login blocks repeat submits and a network failure has its own message', async ({
  page,
}) => {
  let requests = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/backend/v1/auth/login', async (route) => {
    requests++;
    await pending;
    await route.abort('connectionfailed'); // Explicit transport-failure fixture only.
  });
  await page.goto('/login');
  await page.getByLabel('Email address').fill('network@example.com');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
  await page.getByLabel('Password', { exact: true }).press('Enter');
  await expect.poll(() => requests).toBe(1);
  release();
  await expect(page.getByRole('region', { name: 'Account access' }).getByRole('alert')).toHaveText(
    /Could not connect/,
  );
  await expect(page.locator('#email-error, #password-error')).toHaveCount(0);
  await expect(page.getByLabel('Email address')).toHaveValue('network@example.com');
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
});

test('logout confirmation supports cancel, failure and a single confirmed request', async ({
  page,
}) => {
  await createAccount(page, email('logout-dialog'));
  const trigger = page.getByRole('button', { name: 'Sign out', exact: true });
  const dialog = page.getByRole('dialog', { name: 'Sign out?', exact: true });
  let calls = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/backend/v1/auth/logout', async (route) => {
    calls++;
    if (calls === 1)
      return route.fulfill({
        status: 503,
        json: { error: { message: 'Could not sign out. Please retry.' } },
      });
    await gate;
    await route.continue();
  });
  await trigger.click();
  await expect(dialog.getByRole('button', { name: 'Stay here' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Stay here' }).click();
  await expect(trigger).toBeFocused();
  expect(calls).toBe(0);
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  expect(calls).toBe(0);
  await trigger.click();
  await page.screenshot({ path: 'artifacts/screenshots/logout-confirmation.png', animations: 'disabled' });
  await dialog.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('Could not sign out');
  await expect(page).toHaveURL(/\/chat$/);
  expect((await page.request.get('/api/backend/v1/auth/session')).status()).toBe(200);
  await dialog.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Signing out...' })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Stay here' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  expect(calls).toBe(2);
  release();
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.request.get('/api/backend/v1/auth/session')).status()).toBe(401);
});
