import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
const origin = 'http://localhost:3102';
const password = 'Profile password 123!';
const headers = { Origin: origin };
async function signup(page: Page) {
  const email = 'profile-' + crypto.randomUUID() + '@example.com';
  const response = await page.request.post('/api/backend/v1/auth/signup', {
    headers,
    data: { email, password },
  });
  expect(response.status()).toBe(201);
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Profile & settings' })).toBeVisible();
  return email;
}
async function login(request: APIRequestContext, email: string, value = password) {
  const response = await request.post('/api/backend/v1/auth/login', {
    headers,
    data: { email, password: value },
  });
  expect(response.status()).toBe(200);
}

test('profile details, normalized photo and dashboard navigation survive reload', async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const email = await signup(page);
  let saves = 0;
  page.on('request', (request) => {
    if (request.url().endsWith('/v1/profile') && request.method() === 'PATCH') saves++;
  });
  await page.getByLabel('Display name').fill('   ');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Enter your display name.')).toBeVisible();
  expect(saves).toBe(0);
  await page.getByLabel('Display name').fill('iDoc Reader');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Your profile has been updated.' }),
  ).toBeVisible();
  expect(saves).toBe(1);
  await expect(page.getByLabel('Email address')).toHaveValue(email);
  await expect(page.getByLabel('Email address')).toHaveAttribute('readonly', '');
  await page
    .getByLabel('Choose profile photo')
    .setInputFiles({ name: 'photo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(page.getByRole('alert').filter({ hasText: 'Choose a JPG' })).toBeVisible();
  await page.getByLabel('Choose profile photo').setInputFiles('public/logo/idoc-favicon-black.png');
  await expect(
    page.getByRole('status').filter({ hasText: 'Profile photo updated.' }),
  ).toBeVisible();
  const photo = page.locator('main').getByRole('img', { name: 'iDoc Reader profile photo' });
  await expect(photo).toBeVisible();
  await expect.poll(() => photo.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(256);
  await page.reload();
  await expect(page.getByLabel('Display name')).toHaveValue('iDoc Reader');
  await expect(photo).toBeVisible();
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: 'artifacts/screenshots/profile-' + width + '.png',
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const before = (await page.context().cookies()).find((c) => c.name === 'idoc_session')!.value;
  await page
    .getByRole('link', { name: 'iDoc home', exact: true })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(origin + '/');
  const dashboard = page.getByRole('link', { name: 'Open your dashboard' });
  await expect(dashboard).toContainText('iDoc Reader');
  await expect(dashboard.getByRole('img')).toBeVisible();
  await dashboard.click();
  await expect(page).toHaveURL(origin + '/chat');
  expect((await page.context().cookies()).find((c) => c.name === 'idoc_session')!.value).toBe(
    before,
  );
  await page.getByRole('link', { name: 'Profile', exact: true }).click();
  await expect(page).toHaveURL(origin + '/profile');
  const outsider = await browser.newContext({ baseURL: origin });
  try {
    expect((await outsider.request.get('/api/backend/v1/profile')).status()).toBe(401);
    const other = await outsider.newPage();
    await signup(other);
    expect((await outsider.request.get('/api/backend/v1/profile/avatar')).status()).toBe(404);
    expect((await (await outsider.request.get('/api/backend/v1/profile')).json()).user.name).toBe(
      '',
    );
  } finally {
    await outsider.close();
  }
  const avatar = await page.request.get('/api/backend/v1/profile/avatar');
  expect(avatar.headers()['content-type']).toBe('image/png');
  expect(avatar.headers()['cache-control']).toBe('no-store');
  await page.getByRole('button', { name: 'Remove photo' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Profile photo removed.' }),
  ).toBeVisible();
  expect((await page.request.get('/api/backend/v1/profile/avatar')).status()).toBe(404);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove photo' })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .getByRole('dialog', { name: 'Navigation' })
    .getByRole('link', { name: 'Chat', exact: true })
    .click();
  await expect(page).toHaveURL(origin + '/chat');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .getByRole('dialog', { name: 'Navigation' })
    .getByRole('link', { name: 'Profile', exact: true })
    .click();
  await expect(page).toHaveURL(origin + '/profile');
  expect(errors).toEqual([]);
});

test('password validation, password change and session revocation use the real backend', async ({
  page,
  browser,
}) => {
  const email = await signup(page);
  const secondary = await browser.newContext({ baseURL: origin });
  try {
    await login(secondary.request, email);
    let attempts = 0;
    page.on('request', (request) => {
      if (request.url().endsWith('/profile/password')) attempts++;
    });
    await page.getByRole('button', { name: 'Update password' }).click();
    await expect(page.getByText('Enter your current password.')).toBeVisible();
    expect(attempts).toBe(0);
    await page.getByLabel('Current password', { exact: true }).fill('incorrect password');
    await page.getByLabel('New password', { exact: true }).fill('New profile password 456!');
    await page.getByLabel('Confirm new password', { exact: true }).fill('different password');
    await page.getByRole('button', { name: 'Update password' }).click();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();
    expect(attempts).toBe(0);
    await page
      .getByLabel('Confirm new password', { exact: true })
      .fill('New profile password 456!');
    await page.getByRole('button', { name: 'Update password' }).click();
    await expect(page.getByText('Current password is incorrect.')).toBeVisible();
    await expect(page.getByLabel('Current password', { exact: true })).toBeFocused();
    expect(attempts).toBe(1);
    await page.getByLabel('Current password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Update password' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Password updated.' })).toBeVisible();
    expect((await secondary.request.get('/api/backend/v1/auth/session')).status()).toBe(401);
    expect((await page.request.get('/api/backend/v1/auth/session')).status()).toBe(200);
    expect(
      (
        await secondary.request.post('/api/backend/v1/auth/login', {
          headers,
          data: { email, password },
        })
      ).status(),
    ).toBe(401);
    await login(secondary.request, email, 'New profile password 456!');
    await page.getByRole('button', { name: 'Sign out other sessions', exact: true }).click();
    await page.getByRole('button', { name: 'Sign out others', exact: true }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Other sessions signed out.' }),
    ).toBeVisible();
    expect((await secondary.request.get('/api/backend/v1/auth/session')).status()).toBe(401);
    expect((await page.request.get('/api/backend/v1/auth/session')).status()).toBe(200);
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  } finally {
    await secondary.close();
  }
});

test('profile API independently rejects invalid images, names and foreign origins', async ({
  page,
}) => {
  await signup(page);
  expect(
    (
      await page.request.patch('/api/backend/v1/profile', { headers, data: { name: ' ' } })
    ).status(),
  ).toBe(422);
  expect(
    (
      await page.request.patch('/api/backend/v1/profile', {
        headers,
        data: { name: 'x', user_id: 'another-user' },
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await page.request.patch('/api/backend/v1/profile', {
        headers: { Origin: 'https://foreign.example' },
        data: { name: 'x' },
      })
    ).status(),
  ).toBe(403);
  const invalid = await page.request.post('/api/backend/v1/profile/avatar', {
    headers,
    multipart: {
      file: { name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('not an image') },
    },
  });
  expect(invalid.status()).toBe(422);
  const large = await page.request.post('/api/backend/v1/profile/avatar', {
    headers,
    multipart: {
      file: { name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) },
    },
  });
  expect(large.status()).toBe(413);
  const passwordError = await page.request.post('/api/backend/v1/profile/password', {
    headers,
    data: { current_password: password, new_password: 'short', confirm_password: 'short' },
  });
  expect(passwordError.status()).toBe(422);
  expect((await passwordError.json()).error.fieldErrors.new_password).toBeTruthy();
});

test('Google-only profile shows the right security controls and returns to dashboard', async ({
  page,
}) => {
  const sub = crypto.randomUUID();
  await page.route('https://accounts.google.com/**', async (route) => {
    const url = new URL(route.request().url());
    const callback = new URL(url.searchParams.get('redirect_uri')!);
    callback.searchParams.set('state', url.searchParams.get('state')!);
    callback.searchParams.set(
      'code',
      Buffer.from(
        JSON.stringify({
          sub,
          email: 'google-profile-' + sub + '@example.com',
          nonce: url.searchParams.get('nonce'),
        }),
      ).toString('base64url'),
    );
    await route.fulfill({ status: 302, headers: { location: callback.href }, body: '' });
  });
  await page.goto('/login?next=/profile');
  await page.getByRole('button', { name: 'Continue with Google', exact: true }).click();
  await expect(page).toHaveURL(origin + '/profile');
  await expect(page.getByRole('heading', { name: 'Password managed by Google' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Update password' })).toHaveCount(0);
  await expect(page.getByText('Connected', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Chat', exact: true }).click();
  await expect(page).toHaveURL(origin + '/chat');
});

test('profile layout is wide, compact and notifications dismiss without shifting forms', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await signup(page);
  await expect(page.getByText('Your account', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Back to workspace' })).toHaveCount(0);
  await expect(page.locator('header').getByText('Profile', { exact: true })).toHaveCount(0);
  const heading = page.getByRole('heading', { name: 'Profile & settings' });
  await expect(heading.locator('..')).toHaveCSS('text-align', 'left');
  expect((await heading.boundingBox())!.y).toBeLessThan(50);
  const card = page.getByRole('region', { name: 'Personal details' });
  expect((await card.boundingBox())!.width).toBeGreaterThan(1100);
  const brand = page.locator('aside').getByRole('link', { name: 'iDoc home' });
  await expect(brand).toHaveCSS('border-bottom-width', '1px');
  await page.getByLabel('Display name').fill('Notification reader');
  const before = await card.boundingBox();
  await page.getByRole('button', { name: 'Save changes' }).click();
  const notices = page.getByRole('region', { name: 'Notifications', exact: true });
  const success = notices.getByRole('status');
  await expect(success).toHaveText('Your profile has been updated.');
  expect(await card.boundingBox()).toEqual(before);
  const box = (await notices.boundingBox())!;
  expect(box.x + box.width).toBeGreaterThan(1400);
  expect(box.y).toBeLessThan(30);
  await page.screenshot({ path: 'artifacts/screenshots/profile-notification.png' });
  await notices.getByRole('button', { name: 'Dismiss notification' }).click();
  await expect(success).toHaveCount(0);

  await page.clock.install();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(success).toBeVisible();
  await success.hover();
  await page.clock.fastForward(10000);
  await expect(success).toBeVisible();
  await page.mouse.move(400, 650);
  await notices.getByRole('button').focus();
  await page.clock.fastForward(10000);
  await expect(success).toBeVisible();
  await page.getByLabel('Display name').focus();
  await page.clock.fastForward(6100);
  await expect(success).toHaveCount(0);
});

test('notifications fit mobile, respect reduced motion and cap repeated messages', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await signup(page);
  await page.clock.install();
  const notices = page.getByRole('region', { name: 'Notifications', exact: true });
  for (let i = 0; i < 4; i++) {
    await page.getByLabel('Choose profile photo').setInputFiles({
      name: 'photo.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg/>'),
    });
    await expect(notices.getByRole('alert')).toHaveCount(Math.min(i + 1, 3));
  }
  const toast = notices.locator('[data-tone]').first();
  await expect(toast).toHaveCSS('animation-name', 'none');
  const box = (await notices.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'artifacts/screenshots/profile-notification-mobile.png' });
  await page.clock.fastForward(8100);
  await expect(notices.getByRole('alert')).toHaveCount(0);
  await page
    .getByLabel('Choose profile photo')
    .setInputFiles({ name: 'photo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(notices.getByRole('alert')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('idoc:signing-out')));
  await expect(notices.getByRole('alert')).toHaveCount(0);
});
