# Frontend validation

Verified on 2026-11-10:

- TypeScript: passed.
- ESLint: passed without warnings.
- Production build: passed (Next.js 16.4.6).
- Playwright: 8/8 frontend tests passed in Chromium.
- Visual inspection: desktop chat, document library, landing, login, mobile chat/library, and source drawer. No horizontal overflow at the four required widths.
- Production dependency audit: zero reported vulnerabilities.
- Both supplied logo files match their original SHA-256 hashes.

The machine's installed Chromium 1248 was selected with `PLAYWRIGHT_EXECUTABLE_PATH` for this run; the config also supports Playwright's default bundled browser.

The test suite uses the explicitly labeled frontend preview. It makes no claim of real backend authentication, document indexing, or model inference.

Checks cover:

- Landing navigation, FAQ, CTA targets, loaded logo and favicon.
- Login field validation, password visibility, preserved email, and unavailable-auth feedback.
- Protected routes and API boundary; cross-origin mutation and unknown-path rejection.
- Preview upload/list refresh, filename search, selection, chat, source inspection, and deletion.
- New-chat confirmation, Enter / Shift+Enter behavior, preview exit and state reset.
- Invalid upload format, native dialog focus restoration, settings drawer.
- Empty document library and disabled empty-scope composer.
- 1440, 1024, 768, and 390 px layouts, overflow checks, mobile navigation, and screenshots.

Screenshots are written to `artifacts/screenshots/`; chat/documents show labeled example content. Landing/login are styled from the supplied design system because their separate exports were absent in the supplied archive.

Backend integration tests, successful real login, session expiry against a real auth provider, actual upload/indexing, and model-generated answers are deferred to the later backend connection step.
