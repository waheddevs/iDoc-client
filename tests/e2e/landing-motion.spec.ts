import { test, expect } from '@playwright/test';

test('landing entrances run once and the hero responds to the pointer', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const scene = page.locator('[data-hero-scene]');
  await expect(scene).toHaveAttribute('data-hero-state', 'done');
  const front = page.locator('[data-document-layer="front"]');
  const resting = await front.evaluate((element) => getComputedStyle(element).transform);
  const bounds = (await scene.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width * 0.85, bounds.y + bounds.height * 0.3);
  await expect
    .poll(() => front.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(resting);
  await page.mouse.move(0, 0);
  const steps = page.locator('#how-it-works article');
  await steps.first().scrollIntoViewIfNeeded();
  for (const step of await steps.all())
    await expect(step).toHaveAttribute('data-reveal-state', 'done');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(page.locator('footer')).toHaveAttribute('data-reveal-state', 'done');
  await steps.first().scrollIntoViewIfNeeded();
  expect(
    await steps.evaluateAll(
      (elements) => elements.flatMap((element) => element.getAnimations()).length,
    ),
  ).toBe(0);
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-hero-state', 'done');
  await expect(front).toHaveCSS('opacity', '1');
  await page.getByRole('link', { name: 'See how it works' }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  expect(errors).toEqual([]);
});

test('reduced motion stays static and changing the preference stops motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-hero-scene]')).toHaveAttribute('data-hero-state', 'done');
  expect(
    await page
      .locator('[data-reveal]')
      .evaluateAll((elements) =>
        elements.every(
          (element) =>
            element.getAnimations().length === 0 && getComputedStyle(element).opacity === '1',
        ),
      ),
  ).toBeTruthy();
  const front = page.locator('[data-document-layer="front"]');
  const resting = await front.evaluate((element) => getComputedStyle(element).transform);
  await front.hover();
  await expect(front).toHaveCSS('transform', resting);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const bounds = (await page.locator('[data-hero-scene]').boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width * 0.85, bounds.y + bounds.height * 0.3);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(front).toHaveCSS('transform', resting);
  expect(
    await page
      .locator('[data-reveal]')
      .evaluateAll((elements) => elements.flatMap((element) => element.getAnimations()).length),
  ).toBe(0);
});

test('mobile document entrance settles with no overflow or hover loop', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3100/');
  const scene = page.locator('[data-hero-scene]');
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute('data-hero-state', 'done');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  const front = page.locator('[data-document-layer="front"]');
  const settled = await front.evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(250);
  await expect(front).toHaveCSS('transform', settled);
  await page.screenshot({ path: 'artifacts/animations/hero-mobile.png', fullPage: true });
  await context.close();
});

test('landing content and navigation remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://localhost:3100/');
  await expect(page.getByRole('heading', { name: 'Your documents. Clear answers.' })).toBeVisible();
  await expect(page.locator('[data-document-layer="front"]')).toBeVisible();
  await page.getByText('Which files can I use?', { exact: true }).click();
  await expect(
    page.getByText('Upload PDF, DOCX, TXT, or Markdown files.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open workspace' }).first()).toHaveAttribute(
    'href',
    '/chat',
  );
  await context.close();
});
