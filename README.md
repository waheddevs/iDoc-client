# iDoc client

Next.js App Router frontend based on the supplied Stitch workspace exports. React, strict TypeScript, Sass Modules, TanStack Query, React Hook Form, Zod, Lucide, and React Markdown. The Python backend in `../iDoc-server` is unchanged. Backend connection is deferred, as requested.

## Run on Windows

Requires Node.js 22 or newer (developed with Node.js 24).

```powershell
cd D:\projects\iDoc\iDoc-client
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

Open <http://localhost:3000>. Using `npm.cmd` avoids PowerShell script execution-policy restrictions.

| URL                   | Purpose                                                               |
| --------------------- | --------------------------------------------------------------------- |
| `/`                   | Public introduction and product walkthrough                           |
| `/login`              | Validated login form; does not simulate authentication                |
| `/preview/chat`       | Isolated, labeled frontend preview with example documents and answers |
| `/preview/documents`  | Preview document library, selection, upload UI, and deletion          |
| `/chat`, `/documents` | Protected workspace, ready for later backend integration              |
| `/dashboard`          | Redirect to `/chat`                                                   |

Use the **Explore frontend preview** link to review the frontend without a backend. Preview interactions are held in memory. File bytes are not uploaded, parsed, or indexed; only file metadata is used to demonstrate the library. Answers are explicitly marked examples. Reloading resets the preview. No credentials are stored in localStorage.

## Branding and designs

- Original supplied PNGs are stored unchanged in `public/logo/`.
- `src/components/brand/Logo.tsx` is the shared wordmark component.
- The favicon is `public/logo/idoc-favicon-black.png`.
- Original Stitch exports are preserved under `design/stitch_idoc_rag_interface_system/` for comparison. Their Tailwind scripts are reference material only; the application uses Sass Modules.
- The archive contains 12 screen HTML files, seven screenshots, and `obsidian_horizon/DESIGN.md`. It contains chat, document, upload, delete, settings, and mobile workspace screens. No standalone landing or login export, or separate 3D illustration asset, was found after rechecking every archive entry and HTML file. Landing/login apply the supplied typography, color system, wordmark, and requested content structure; the document scene is HTML/CSS. Replace these with their exact exports if supplied later.
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

## Later backend connection

The adapter uses server-only `BACKEND_API_URL`; browsers call same-origin `/api/backend/*`. Keep `BACKEND_AUTH_ENABLED=false` until the auth and ownership contract in [API integration notes](docs/API_INTEGRATION.md) is implemented and verified. Never use the preview as proof of real authentication, indexing, or model inference.

Production: `npm.cmd run build`, then `npm.cmd start`. Configure `APP_ORIGIN` to the exact browser-facing origin.
