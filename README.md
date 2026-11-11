# iDoc client

Next.js App Router frontend based on the supplied Stitch workspace exports. React, strict TypeScript, Sass Modules, TanStack Query, React Hook Form, Zod, Lucide, and React Markdown. Connected to FastAPI in `../iDoc-server/idoc` with real account sessions and per-user documents.

## Run on Windows

Requires Node.js 22 or newer (developed with Node.js 24).

```powershell
cd D:\projects\iDoc\iDoc-client
npm.cmd ci
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm.cmd run dev -- --hostname 127.0.0.1
```

Open <http://localhost:3000>. Using `npm.cmd` avoids PowerShell script execution-policy restrictions.

| URL                   | Purpose                                                               |
| --------------------- | --------------------------------------------------------------------- |
| `/`                   | Public introduction and product walkthrough                           |
| `/login`              | Sign in with email/password or configured Google                      |
| `/signup`             | Create an account with its own document workspace                     |
| `/preview/chat`       | Isolated, labeled frontend preview with example documents and answers |
| `/preview/documents`  | Preview document library, selection, upload UI, and deletion          |
| `/chat`, `/documents` | Session-protected workspace and document library                      |
| `/dashboard`          | Redirect to `/chat`                                                   |

Use `/preview/chat` to review the frontend without a backend. Preview interactions are held in memory. File bytes are not uploaded, parsed, or indexed; only file metadata is used to demonstrate the library. Answers are explicitly marked examples. Reloading resets the preview. No credentials are stored in localStorage.

## Branding and designs

- Original supplied PNGs are stored unchanged in `public/logo/`.
- `src/components/brand/Logo.tsx` is the shared wordmark component.
- The favicon is `public/logo/idoc-favicon-black.png`.
- Original Stitch exports are preserved under `design/stitch_idoc_rag_interface_system/` for comparison. Their Tailwind scripts are reference material only; the application uses Sass Modules.
- The original workspace archive is supplemented by the supplied landing-page archive. Desktop/mobile login references live in `idoc_desktop_login_page` and `idoc_mobile_login_page`; their visual style is implemented with Sass Modules. The approved simplified login/signup design uses a full-page dot pattern, a subtle orange glow and a 360 px form on the right without an outer card, and a local transparent document illustration on the left. Three.js animates the image with a slow float and damped pointer tilt. Reduced motion or unavailable WebGL keeps the static image; screens up to 900 px hide the decoration and center the form. Prototype state switchers and fabricated service telemetry are omitted.
- Fabricated confidence percentages, telemetry, and model names in the exports were intentionally omitted from live screens. Preview examples are labeled.

## Verification

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Playwright starts an isolated development server on port 3100 with authentication disabled, exercises the frontend preview and closed auth boundary, and generates desktop/tablet/mobile screenshots in `artifacts/screenshots/`. It does not start or change the Python backend. See [validation notes](docs/VALIDATION.md).

## Backend connection

The adapter uses server-only `BACKEND_API_URL`; browsers call same-origin `/api/backend/*`. Use `BACKEND_AUTH_ENABLED=true`, `LOCAL_WORKSPACE_ENABLED=false`, and backend `IDOC_AUTH__ENABLED=true`. `/signup` creates an account and verifies its cookie session before opening the workspace. The backend checks document ownership before listing, deleting or retrieving passages. Existing legacy documents remain separate and are not assigned to new accounts. See [API integration notes](docs/API_INTEGRATION.md).

Production: `npm.cmd run build`, then `npm.cmd start`. Configure `APP_ORIGIN` to the exact browser-facing origin.

## Backend watch mode

In a separate PowerShell terminal:

```powershell
cd D:\projects\iDoc\iDoc-server\idoc
.\.venv-idoc\Scripts\python.exe -m uvicorn xantus.main:app --host 127.0.0.1 --port 8000 --reload --reload-dir xantus
```

Ollama must be running with configured `llama3.2` and `nomic-embed-text` models. New terminals include `ollama` on PATH; existing terminals can use `& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" list`. If Ollama is stopped, run that executable with `serve` in another terminal. No model downloads occur during application startup. Check `http://127.0.0.1:8000/ready`. Restart the backend after changing startup model configuration; Python source edits reload automatically.

## Full-stack tests

```powershell
npm.cmd run test:integration
npm.cmd run test:auth
$env:IDOC_E2E_REAL_MODEL='true'
npm.cmd run test:integration
Remove-Item Env:IDOC_E2E_REAL_MODEL
```

Integration tests use real FastAPI/storage with test-only models by default; `IDOC_E2E_REAL_MODEL=true` selects real configured inference. The legacy local suite uses ports 8101/3101. `npm.cmd run test:auth` uses ports 8102/3102 and tests real signup/login, frontend-first validation, backend field errors, cookie sessions, two-account document isolation and logout. All use isolated temporary data and stop their child servers. Set `PLAYWRIGHT_EXECUTABLE_PATH` if using an existing Chromium installation. Run suites sequentially because they share `.next-e2e`; the normal development server can stay running.

## Landing motion

Landing sections reveal once when first visible, with distinct entrance treatments and staggered cards. Text stays server-rendered and readable without JavaScript. The hero lazily loads Three.js Object3D transforms onto the existing HTML document faces: one assembly/floating entrance, one orbit-light sweep, then damped pointer parallax. It does not need a WebGL canvas. Animation frames stop when settled, offscreen, or in a hidden tab; touch devices have no hover motion. Reduced-motion preferences disable the effects, including when changed while the page is open.

Motion recording: `artifacts/animations/landing-motion.webm`. Desktop and mobile screenshots are in the same directory.

## Google sign-in setup

Login and signup share **Continue with Google**. Google OIDC runs on the FastAPI server; only iDoc's HttpOnly session cookie reaches the browser. Email/password login remains available. Google setup is optional: without valid configuration, the Google button is visibly unavailable.

1. In [Google Cloud Console](https://console.cloud.google.com/), select or create an `iDoc` project.
2. Open **Google Auth Platform ? Branding** and configure the app name `iDoc`, user support email and developer contact email. Choose **External** audience for personal Google accounts. While the app is in Testing, add your intended Google account under **Audience ? Test users**.
3. Open **Clients ? Create client ? Web application**. Name it `iDoc Web`. Add the exact **Authorized redirect URI** `http://localhost:3000/api/auth/google/callback`. This backend redirect flow does not require a browser SDK or JavaScript client secret.
4. Put the generated values into `../iDoc-server/idoc/.env` (never a `NEXT_PUBLIC_` variable):

```dotenv
IDOC_AUTH__ENABLED=true
IDOC_AUTH__GOOGLE_CLIENT_ID=<your-web-client-id>
IDOC_AUTH__GOOGLE_CLIENT_SECRET=<your-client-secret>
IDOC_AUTH__GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

5. Keep frontend `APP_ORIGIN=http://localhost:3000`, `BACKEND_AUTH_ENABLED=true` and backend CORS origins aligned with that origin. Restart the backend after changing `.env`; reload `/login`. `GET /api/auth/google/config` reports only `{ "enabled": true }` when local configuration is complete. A successful real sign-in is still required to confirm the Google Console configuration.
6. For deployment, replace the callback origin with your exact HTTPS domain in Google Console, backend `.env`, frontend `APP_ORIGIN` and backend CORS settings. Enable backend secure cookies.

The only requested Google scopes are `openid email`; no Drive or Gmail access is requested. An email collision never automatically merges accounts. Sign in with the existing password, open **Settings ? Link Google account**, and choose Google with the same email. Linking preserves the existing user ID and documents. Google-only accounts do not receive a generated password. The linked confirmation appears after the callback.

Google access/refresh tokens are neither returned to the frontend nor stored. OAuth state is browser-bound, expires after 10 minutes and can be used once; nonce, PKCE and signed ID-token claims are verified. Callback query strings are excluded from local dev access logs. Configure any deployment reverse-proxy logging to omit callback query strings as well.

`npm.cmd run test:auth` includes an explicit Google provider fixture, real iDoc auth/storage and browser tests. It does **not** authenticate against live Google; real Google credentials and interactive consent are needed for that final check. Backend tests separately verify genuine RSA-signed ID tokens, invalid claims/signatures, state replay/expiry, explicit linking and session/document isolation.

References: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [Google button guidelines](https://developers.google.com/identity/branding-guidelines).

## Account profile

The signed-in identity in the landing navigation opens the dashboard at /chat without clearing the session. Open **Profile** in the workspace sidebar for /profile.

Profiles support display-name editing, JPG/PNG/WebP photo upload and removal, password changes for password accounts, explicit Google linking, and signing out other sessions. Photos are limited to 5 MiB, decoded and normalized to 256 x 256 PNG by the backend, and served only to their owner. Google-only accounts manage their password through Google. Email is read-only; email changes are not implemented.

Forms validate before submission and display backend field errors separately. Profile updates persist in the backend and appear in both the sidebar and landing navigation. Password changes revoke other sessions while retaining the current one.

Chat history is still kept in memory for the active workspace session. The unfinished persistent-history implementation is intentionally excluded from this release.
