import { test, expect, type Page } from '@playwright/test';

const origin = 'http://localhost:3102';
const password = 'Google linking test password 123!';
const identity = () => {
  const sub = crypto.randomUUID();
  return { sub, email: `google-${sub}@example.com` };
};

// Explicit Google authorization-page fixture only. The Next adapter, backend
// OAuth state/nonce/PKCE store, sessions and document ownership are real.
async function googleProvider(page: Page, user: ReturnType<typeof identity>, cancel = false) {
  await page.route('https://accounts.google.com/**', async (route) => {
    const authorization = new URL(route.request().url());
    expect(authorization.searchParams.get('client_id')).toBe('test-google-client');
    expect(authorization.searchParams.get('response_type')).toBe('code');
    expect(authorization.searchParams.get('code_challenge_method')).toBe('S256');
    expect(authorization.searchParams.get('code_challenge')).toBeTruthy();
    expect(authorization.searchParams.get('nonce')).toBeTruthy();
    const callback = new URL(authorization.searchParams.get('redirect_uri')!);
    expect(callback.href).toBe(`${origin}/api/auth/google/callback`);
    callback.searchParams.set('state', authorization.searchParams.get('state')!);
    if (cancel) callback.searchParams.set('error', 'access_denied');
    else {
      callback.searchParams.set(
        'code',
        Buffer.from(
          JSON.stringify({ ...user, nonce: authorization.searchParams.get('nonce') }),
        ).toString('base64url'),
      );
    }
    await route.fulfill({ status: 302, headers: { location: callback.href }, body: '' });
  });
}

async function session(page: Page) {
  const response = await page.request.get('/api/backend/v1/auth/session');
  expect(response.status()).toBe(200);
  return (await response.json()).user as { id: string; email: string };
}

test('loopback auth aliases redirect before Google state is issued', async ({ page }) => {
  const user = identity();
  await googleProvider(page, user);
  for (const route of ['login', 'signup']) {
    await page.goto(`http://127.0.0.1:3102/${route}?next=%2Fdocuments`);
    await expect(page).toHaveURL(`${origin}/${route}?next=%2Fdocuments`);
    await expect(
      page.getByRole('button', { name: 'Continue with Google', exact: true }),
    ).toBeEnabled();
  }
  await page.getByRole('button', { name: 'Continue with Google', exact: true }).click();
  await expect(page).toHaveURL(`${origin}/documents`);
  expect((await session(page)).email).toBe(user.email);
  const cookies = await page.context().cookies();
  expect(cookies.find((cookie) => cookie.name === 'idoc_session')?.domain).toBe('localhost');
  expect(cookies.some((cookie) => cookie.name === 'idoc_google_oauth')).toBe(false);
  const rejectedOrigins: Record<string, string>[] = [
    { Origin: 'http://127.0.0.1:3102' },
    { Origin: 'http://localhost:3999' },
    { Origin: origin, 'Sec-Fetch-Site': 'cross-site' },
  ];
  for (const headers of rejectedOrigins) {
    const response = await page.request.post('/api/auth/google/start', {
      headers,
      data: { next: '/chat', intent: 'signin' },
    });
    expect(response.status()).toBe(403);
  }
});

test('Google signup and returning signin use real private sessions and owner-scoped documents', async ({
  page,
  browser,
}) => {
  const user = identity();
  await googleProvider(page, user);
  await page.goto('/signup?next=/documents');
  await page.getByRole('button', { name: 'Continue with Google', exact: true }).click();
  await expect(page).toHaveURL(`${origin}/documents`);
  const originalUser = await session(page);
  expect(originalUser.email).toBe(user.email);
  const cookies = await page.context().cookies();
  const originalSession = cookies.find((cookie) => cookie.name === 'idoc_session')!;
  expect(originalSession.httpOnly).toBe(true);
  expect(originalSession.sameSite).toBe('Lax');
  expect(cookies.some((cookie) => cookie.name === 'idoc_google_oauth')).toBe(false);
  expect(await page.evaluate(() => document.cookie)).not.toContain('idoc_session');
  const uploaded = await page.request.post('/api/backend/v1/ingest/file', {
    headers: { Origin: origin },
    multipart: {
      file: {
        name: 'google-private.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('The private Google account document contains the Aurora project.'),
      },
    },
  });
  expect(uploaded.ok()).toBe(true);
  const ownDocuments = await (await page.request.get('/api/backend/v1/documents')).json();
  expect(ownDocuments.total).toBe(1);
  const stranger = await browser.newContext({ baseURL: origin });
  try {
    const strangerPage = await stranger.newPage();
    await googleProvider(strangerPage, identity());
    await strangerPage.goto('/login');
    await strangerPage.getByRole('button', { name: 'Continue with Google', exact: true }).click();
    await expect(strangerPage).toHaveURL(/\/chat$/);
    expect((await (await stranger.request.get('/api/backend/v1/documents')).json()).total).toBe(0);
    expect(
      (
        await stranger.request.delete(
          `/api/backend/v1/documents/${ownDocuments.documents[0].document_id}`,
          { headers: { Origin: origin } },
        )
      ).status(),
    ).toBe(404);
  } finally {
    await stranger.close();
  }
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    (
      await page.request.get('/api/backend/v1/auth/session', {
        headers: { Cookie: `idoc_session=${originalSession.value}` },
      })
    ).status(),
  ).toBe(401);
  await page.getByRole('button', { name: 'Continue with Google', exact: true }).click();
  await expect(page).toHaveURL(/\/chat$/);
  expect((await session(page)).id).toBe(originalUser.id);
  expect((await (await page.request.get('/api/backend/v1/documents')).json()).total).toBe(1);
});

test('same email never auto-links; authenticated explicit Google link keeps the original account', async ({
  page,
}) => {
  const user = identity();
  const signup = await page.request.post('/api/backend/v1/auth/signup', {
    headers: { Origin: origin },
    data: { email: user.email, password },
  });
  expect(signup.status()).toBe(201);
  const originalUser = (await signup.json()).user;
  await page.request.post('/api/backend/v1/auth/logout', { headers: { Origin: origin } });
  await googleProvider(page, user);
  await page.goto('/login');
  await page.getByRole('button', { name: 'Continue with Google', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?google_error=google_link_required/);
  expect((await page.request.get('/api/backend/v1/auth/session')).status()).toBe(401);
  await expect(page.getByRole('alert')).toContainText(/sign in|link/i);
  await page.getByLabel('Email address').fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByLabel('Ask a question')).toBeVisible();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Workspace settings' })).toBeVisible();
  await page.getByRole('button', { name: 'Link Google account', exact: true }).click();
  await expect(page).toHaveURL(`${origin}/chat?google=linked`);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('status').filter({ hasText: 'Google account linked.' }),
  ).toBeVisible();
  await expect(page.getByLabel('Ask a question')).toBeVisible();
  expect((await session(page)).id).toBe(originalUser.id);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('button', { name: 'Continue with Google', exact: true }).click();
  await expect(page).toHaveURL(/\/chat$/);
  expect((await session(page)).id).toBe(originalUser.id);
});

test('Google start rejects foreign origins and unsafe destinations; callbacks require browser state', async ({
  page,
  browser,
}) => {
  const rejectedOrigins: Record<string, string>[] = [{ Origin: 'https://untrusted.example' }, {}];
  for (const headers of rejectedOrigins) {
    const response = await page.request.post('/api/auth/google/start', {
      headers,
      data: { next: '/chat', intent: 'signin' },
    });
    expect(response.status()).toBe(403);
  }
  const unsafe = await page.request.post('/api/auth/google/start', {
    headers: { Origin: origin },
    data: { next: 'https://untrusted.example', intent: 'signin' },
  });
  expect([400, 422]).toContain(unsafe.status());
  const start = await page.request.post('/api/auth/google/start', {
    headers: { Origin: origin },
    data: { next: '/chat', intent: 'signin' },
  });
  expect(start.status()).toBe(200);
  const authorization = new URL((await start.json()).authorization_url);
  const state = authorization.searchParams.get('state')!;
  const oauthCookie = (await page.context().cookies()).find(
    (cookie) => cookie.name === 'idoc_google_oauth',
  )!;
  expect(oauthCookie.httpOnly).toBe(true);
  expect(oauthCookie.sameSite).toBe('Lax');
  const stranger = await browser.newContext({ baseURL: origin });
  try {
    const foreignPage = await stranger.newPage();
    await foreignPage.goto(`/api/auth/google/callback?state=${state}&code=invalid`);
    await expect(foreignPage).toHaveURL(/\/login\?google_error=google_invalid_state/);
    expect((await stranger.request.get('/api/backend/v1/auth/session')).status()).toBe(401);
  } finally {
    await stranger.close();
  }
  await page.goto('/api/auth/google/callback?state=invalid&code=invalid');
  await expect(page).toHaveURL(/\/login\?google_error=google_invalid_state/);
  expect((await page.request.get('/api/backend/v1/auth/session')).status()).toBe(401);
});

test('cancelled Google consent returns a useful message without a session', async ({ page }) => {
  await googleProvider(page, identity(), true);
  await page.goto('/login');
  await page.getByRole('button', { name: 'Continue with Google', exact: true }).click();
  await expect(page).toHaveURL(/\/login\?google_error=google_cancelled/);
  await expect(page.getByRole('alert')).toContainText(/cancel/i);
  expect((await page.request.get('/api/backend/v1/auth/session')).status()).toBe(401);
  expect(
    (await page.context().cookies()).some((cookie) => cookie.name === 'idoc_google_oauth'),
  ).toBe(false);
});

test('unconfigured Google is clearly unavailable and does not start authorization', async ({
  page,
}) => {
  // Explicit unavailable-config UI fixture; other Google tests use the real config endpoint.
  await page.route('**/api/auth/google/config', (route) =>
    route.fulfill({ json: { enabled: false } }),
  );
  let starts = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/auth/google/start')) starts++;
  });
  for (const path of ['/login', '/signup']) {
    await page.goto(path);
    await expect(
      page.getByRole('button', { name: 'Continue with Google', exact: true }),
    ).toBeDisabled();
    await expect(page.getByText(/Google.*not.*available|Google.*not.*configured/i)).toBeVisible();
  }
  expect(starts).toBe(0);
});
