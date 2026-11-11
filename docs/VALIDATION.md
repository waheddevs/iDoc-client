# Frontend and backend integration validation

## Account forms and real authentication (2026-11-11)

- Reference desktop/mobile login layout implemented; signup uses the same styling. Screenshots visually reviewed at 1440 and 390 px in `artifacts/auth/`.
- TypeScript, ESLint and production build passed, including the new `/signup` route.
- Auth browser suite: 4/4 passed with real FastAPI accounts, session cookies, SQLite and Chroma. Model responses use deterministic test providers in this run. Only the explicit connection-failure case aborts a request.
- Separate real Ollama run: two-browser account lifecycle passed (signup, upload, owned chat/source lookup, foreign-document rejection, deletion, logout/login and session expiry). No browser API mocking in that flow.
- Closed-auth/login regression: 2/2 passed.
- Backend regression: 43 tests passed, followed by both migration checks including a new populated-table test. Total distinct backend checks: 44; one preexisting upstream Pydantic warning.
- Frontend-invalid fields issue no requests. Valid submissions reach backend validation; 422 fields and 409 duplicate email map to input messages. Invalid credentials and transport failures have a separate form alert. Pending submissions cannot repeat.
- Tested HttpOnly/SameSite cookies, revocation, ownership across list/upload/deduplication/delete/retrieval and source generation, persistent accounts, session rotation/expiry, rate limiting, origin rejection and login while models are unavailable.
- Live configuration now enables backend and frontend auth. `/login` and `/signup` return 200; anonymous `/chat` redirects to login; documents/session return 401. Invalid signup through the live Next adapter returns backend 422 with separate email/password errors.
- Existing local documents are preserved under the legacy owner. No test accounts or documents were added to the live user database. Email verification and password recovery are not implemented.

The earlier sections below record historical checks before account authentication was added.

Verified on 2026-11-10:

- TypeScript: passed.
- ESLint: passed without warnings.
- Production build: passed (Next.js 16.4.6).
- Playwright: 8/8 frontend tests passed in Chromium.
- Visual inspection: desktop chat, document library, landing, login, mobile chat/library, and source drawer. No horizontal overflow at the four required widths.
- Production dependency audit: zero reported vulnerabilities.
- Both supplied logo files match their original SHA-256 hashes.

The machine's installed Chromium 1248 was selected with `PLAYWRIGHT_EXECUTABLE_PATH` for this run; the config also supports Playwright's default bundled browser.

The original eight frontend tests use the labeled preview and closed authentication mode. The separate integration suite below connects to real FastAPI, storage, and Ollama.

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

At this earlier stage the backend only supported explicit local workspace access. Real account login/session expiry is now implemented and verified above.

## Integration verification (2026-11-10)

- TypeScript, ESLint and production build passed after the integration changes.
- Existing frontend regression suite: 8/8 passed (46.9 seconds).
- Real FastAPI/SQLite/Chroma with deterministic TEST-only providers: 2/2 browser integration tests passed (33.2 seconds).
- Real FastAPI/SQLite/Chroma with Ollama inference: 2/2 browser integration tests passed (56.8 seconds). No browser network mocking.
- Backend pytest suite rerun: 38/38 passed (22.98 seconds); one preexisting upstream Pydantic warning.
- Ollama 0.40.16 installed; `llama3.2:latest` (a80c4f17acd5) and `nomic-embed-text:latest` (0a109f422b47) downloaded with user authorization. Both ran on GPU.
- Real-provider lifecycle script completed: three sample documents indexed, five questions answered, fresh-process restart preserved the library/retrieval, then all sample documents deleted.
- Reviewed five actual answers: Aurora date/owner, Borealis budget, unsupported-question abstention, selected-document isolation, and ignoring an embedded document instruction. Each matched its expected outcome in this run. This small English sample is not a general accuracy, security, or multilingual-quality guarantee.
- Normal user configuration verified on ports 3000/8000: local workspace opens, `/ready` returns ready, settings show actual models, and both watch commands start successfully.

Integration tests verify real multipart upload, duplicate-content deduplication, library refresh, selected-document chat, matching source IDs, desktop/mobile source inspection, reload persistence, deletion, blocked stale scope, local exit, cross-origin/foreign-host rejection and standard error codes. Tests use isolated temporary data; the lifecycle run uses its own evaluation workspace. The user's document library is not seeded with sample data.

Evidence: `artifacts/integration/sources-desktop.png`, `sources-mobile.png`, `local-settings.png`, and `model-evaluation.json`. The latter preserves the actual provider answers and source excerpts from the five-case lifecycle test. Python application source is unchanged.

## Landing motion verification (2026-11-10)

- TypeScript, ESLint and production build passed.
- Targeted browser coverage: landing navigation, responsive layout, one-time reveals, hero pointer response, reduced-motion toggling, JavaScript-disabled fallback, and mobile touch settling.
- Desktop recording inspected: 41 reveal targets; no page errors; zero active reveal animations after scrolling. Hero animation stops at rest.
- Existing dimensions and content remain intact; responsive screenshot checks cover 1440, 1024, 768 and 390 px.
- Evidence: `artifacts/animations/landing-motion.webm`, `hero.png`, `hero-mobile.png`, and `landing.png`.

## Local host regression (2026-11-11)

Fixed the exact-host comparison that rejected `127.0.0.1` when `APP_ORIGIN` used `localhost`. Explicit loopback aliases now share the configured port. Mutation origins still must match the visited alias, configured scheme and port; foreign hosts, different ports, missing origins and cross-alias origins are rejected.

Five integration tests passed with real FastAPI/storage and test-only models, including browser upload/delete through both aliases and IPv6 Host-header checks. The closed-auth regression test also passed. Live user servers on port 3000 were checked through both names: chat and document reads returned 200, and same-origin mutation validation reached the backend (400 invalid_selection, not 403). No user documents were changed in the live checks.

## Google authentication verification (2026-11-11)

- TypeScript, ESLint and isolated production build passed with the Google routes.

- Full auth browser suite: 10/10 passed, including existing email/password validation, private document access, responsive auth layouts and illustration motion. New Google cases cover signup/returning signin, HttpOnly sessions and revocation, document ownership, same-email collision without automatic linking, explicit linking and success notice, cross-origin start rejection, invalid browser state, consent cancellation and unconfigured UI.
- Browser Google authorization and backend exchange are explicit fixtures under `tests/auth/google.spec.ts` and `tests/support/backend.py`. iDoc routes, SQLite sessions/accounts and storage are real. No production Google credentials are used by tests.
- Backend suite: 64/64 passed; after correcting the Google shared-IP throttle, focused auth/Google suite: 26/26 passed. JWT tests use genuine RSA signatures with isolated keys and validate signature/issuer/audience/expiry/nonce/email checks. State expiry/replay, session-bound linking and Google-only password rejection are covered.
- Callback cookie regression fixed: clearing OAuth state must not replace the appended session Set-Cookie header. Successful Google sessions now pass the end-to-end checks.
- Reviewed signup/login screenshots at desktop and mobile widths; screenshots are in `artifacts/auth/`.
- Live backend restarted in watch mode; health and readiness respond successfully, and `/v1/auth/google/config` plus frontend `/api/auth/google/config` return `enabled:false` because Client ID/Secret are absent. Backend `.env` contains empty placeholders and the localhost callback; existing secrets/configuration were preserved.
- Real Google consent is not yet verified. Attempted Google Cloud client creation could not start because both available computer/browser runtimes failed with a Windows sandbox helper initialization error. Console setup and exact redirect URI are documented in README.

## Develop release verification (2026-11-11)

Ran against clean archives of committed code, without local .env files or unfinished chat-history helpers. Frontend implementation revision: 338cb77; backend implementation revision: 3445362.

- Production build and TypeScript: passed.
- ESLint: passed.
- Auth/profile Playwright suite: 15 passed.
- Workspace integration Playwright suite: 7 passed.
- Frontend/animation Playwright suite: 12 passed.
- Backend pytest suite: 74 passed, with the existing upstream Pydantic warning.

Account and document flows use real FastAPI/SQLite storage with isolated test data. Google authorization and AI providers are explicit test fixtures. The chat UI and deletion-error tests use targeted browser response fixtures; preview tests use clearly labeled example data. These checks do not assert live Google consent or AI answer quality.

Cold-start verification exposed a logout/session-expiry race and a test clicking the workspace before account hydration. Logout intent now survives provider remounts; auth tests wait for the verified profile identity before workspace actions. The complete suites above passed after those fixes.

Verified profile navigation, persistent names and normalized photo upload/removal, owner isolation, frontend-first and backend field validation, password changes, other-session revocation, safe confirmation focus, and layouts at 1440/1024/768/390 pixels. Chat history remains session-only in this release. Local credentials, databases, generated caches, debug reports and unfinished history code are excluded from the commits.


## Automatic saved chats (2026-11-11)

- Auth/profile regression suite: 20 passed. The final conversation suite: 4 passed, covering refresh, saved scope and excerpts, New chat, logout/login, another browser, rename/delete, owner isolation, pending refresh, concurrent navigation and a lost HTTP response without a duplicate answer.
- Backend API/history suite after the final model-unavailable fix: 32 passed. Covers durable SQLite reopen, authoritative server history, owner/origin checks, failed-question retry, atomic concurrent writes, revision conflicts, expired pending recovery, late-answer rejection and bounded history. The existing Pydantic metadata warning remains.
- Preview/frontend regression: 8 passed. Local backend integration: 7 passed. The explicit chat UI fixture now implements the saved-conversation response contract.
- TypeScript, ESLint and isolated production build passed. Browser screenshots checked at desktop and mobile sizes under artifacts/screenshots/saved-chats-*.png.
- Account/session/storage tests use real FastAPI and isolated SQLite/Chroma data. Model outputs and Google exchange are explicit test providers; no production user documents or accounts are modified.
- Live development backend already runs with reload and exposes the conversation endpoints. No credential changes are required.


## Document picker and summary pipeline - 2026-11-11

- Redesigned document picker checked at 1440, 1024, 768 and 390 px; checkbox boxes remain 20x20 px regardless of filename wrapping. Search, draft cancellation, apply, focus restoration, no matches and extraction warnings tested. Screenshots: artifacts/screenshots/document-picker-{width}.png.
- Backend full suite: 97 passed. Follow-up summary suite after source-ID propagation changes: 16 passed. Providers in these tests are deterministic test doubles; ingestion, Chroma, SQLite, ownership and persistence are real and isolated.
- Browser integration suite: 8 passed. Authenticated conversation suite: 4 passed (refresh, pending answers, logout/login, another browser, ownership, retry and New chat). Browser provider responses are explicitly test-only; UI status fixture verifies nonstandard prose still follows answer_status.
- TypeScript, ESLint, isolated production build and git diff whitespace checks passed.
- Real configured Ollama (llama3.2 + nomic-embed-text): short document without an abstract produced grounded key points and [S1]; final reusable smoke test passed for section synthesis and Korean text with citations, names and date checks. Earlier iterations exposed dropped citations and confusion between text batches and project phases; prompt/provenance fixes resolved these fixtures. This is a small smoke corpus, not a general model-quality guarantee.
- Read-only inspection of existing PDFs found 1/1 and 663/709 pages with extractable text (2 and 670 indexed chunks respectively). No uploaded source text was copied to artifacts, and existing user documents were not changed.
- Limitations: summaries review at most 32 passages across four section calls plus synthesis (up to five explicitly selected documents). Larger inputs show partial coverage. Scanned pages require external OCR. Page extraction counts are available for new uploads; legacy rows may remain null.
- Backend live OpenAPI exposes mode, answer_status and coverage. Full API contract regenerated. No commit or push performed for this change.
