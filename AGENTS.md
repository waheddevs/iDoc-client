You are the frontend implementation engineer for iDoc.

Build the actual application, not another design proposal. Implement the existing approved Stitch designs as a functional Next.js frontend connected to the existing FastAPI backend.

PRODUCT

iDoc is an AI document workspace:
- Public landing page.
- Login.
- Protected document chat.
- Document library.
- Upload, document selection, source inspection, and deletion.
- Read-only workspace settings.
- Logout.

Primary journey:
Landing → Login → Chat dashboard → Upload documents → Ask questions → Inspect sources.

FIRST ACTIONS

1. Read applicable AGENTS.md instructions.
2. Inspect the current workspace, package files, existing frontend, backend, and documentation.
3. Locate the exported Stitch HTML, images, assets, and reference screenshots.
4. Read the backend OpenAPI schema and docs/API_CONTRACT.md if present.
5. Inspect existing authentication endpoints and session behavior.
6. Preserve existing work and reuse functioning code.

Do not overwrite an existing application with a new scaffold.

If no frontend exists, create a frontend directory beside the Python backend. If the current repository is already the frontend repository, use its root.

Do not clone the Python repository again merely to implement the frontend.

If design exports are missing, ask for their location while continuing independent setup and API inspection. Do not silently invent a replacement design.

DESIGN AUTHORITY

The approved Stitch exports and screenshots are the visual source of truth.

Preserve:
- Page composition.
- Typography hierarchy.
- Sidebar and navigation.
- Orange illumination.
- Document illustrations.
- Existing landing-page sections.
- Dashboard layout.
- Spacing, cards, and source-panel treatment.

Improve responsiveness, accessibility, and implementation quality without redesigning the product.

Do not add unrequested pages, promotional sections, analytics, pricing, teams, or fake statistics.

TECHNOLOGY

Use:
- Next.js App Router.
- React.
- TypeScript with strict checking.
- Sass Modules.
- CSS variables for shared design tokens.
- TanStack Query for client-side server data.
- React Hook Form and Zod for forms.
- Lucide React for functional icons.
- React Markdown for answer rendering.
- Playwright for focused browser tests.

Use compatible stable package versions and commit the lockfile. Preserve existing compatible versions when practical.

Do not introduce Tailwind, Bootstrap, Material UI, Redux, or a second styling framework.

If Stitch exported Tailwind HTML, translate its appearance into Sass Modules instead of retaining both styling systems.

Use Server Components by default. Add Client Components for interactive forms, dialogs, upload queues, chat, and query state.

Use CSS for simple motion. Do not introduce a large animation or WebGL dependency unless an approved asset genuinely requires it.

FOLDER STRUCTURE

Use this structure as a guide. Create files when implementing their responsibility; avoid empty placeholder modules.

frontend/
  public/
    assets/
      landing/
      illustrations/
      textures/
    brand/

  src/
    app/
      layout.tsx
      providers.tsx
      error.tsx
      not-found.tsx

      (marketing)/
        page.tsx

      (auth)/
        login/
          page.tsx

      (workspace)/
        layout.tsx
        loading.tsx
        error.tsx
        chat/
          page.tsx
        documents/
          page.tsx

      dashboard/
        page.tsx

      api/
        backend/
          [...path]/
            route.ts

    components/
      brand/
        Logo.tsx
        Logo.module.scss

      ui/
        Button/
        Input/
        Dialog/
        Drawer/
        Badge/
        Spinner/
        EmptyState/
        ErrorNotice/
        ConfirmDialog/

      layout/
        WorkspaceShell/
        Sidebar/
        WorkspaceHeader/
        MobileNavigation/

    features/
      landing/
        components/
          LandingNav/
          Hero/
          DocumentScene/
          ProductPreview/
          Workflow/
          Features/
          SourceSpotlight/
          FAQ/
          FinalCTA/
          Footer/

      auth/
        components/
          LoginForm/
        api.ts
        schemas.ts
        types.ts

      chat/
        components/
          ChatWorkspace/
          ChatWelcome/
          MessageList/
          Message/
          ChatComposer/
          DocumentScopePicker/
          SourcesPanel/
        hooks/
          useChatSession.ts
        api.ts
        types.ts

      documents/
        components/
          DocumentLibrary/
          DocumentTable/
          DocumentCard/
          UploadDialog/
          UploadQueue/
          DeleteDocumentDialog/
        hooks/
          useDocuments.ts
        api.ts
        schemas.ts
        types.ts

      settings/
        components/
          SettingsDrawer/
        api.ts
        types.ts

    lib/
      api/
        client.ts
        errors.ts
        query-keys.ts
      auth/
        session.server.ts
      server/
        backend.ts
      utils/
        format.ts

    styles/
      globals.scss
      _tokens.scss
      _mixins.scss

  tests/
    e2e/

  .env.example
  package.json
  tsconfig.json
  next.config.ts
  playwright.config.ts
  README.md

Keep component styles beside components.
Keep page files small.
Keep HTTP requests out of presentation components.
Do not put the entire application in one page.tsx file.

ROUTES

/ — landing page.
/login — login.
/chat — main protected dashboard.
/documents — protected document library.
/dashboard — redirect to /chat for compatibility.

Settings and Sources are drawers, not separate pages.

Use route groups to share layouts without changing these URLs.

VISUAL SYSTEM

Match the exports first. Use these values as fallback design tokens:
- Background: #08090B.
- Sidebar: #0D0F12.
- Surface: #121418.
- Elevated surface: #191C21.
- Border: #292D34.
- Primary text: #F5F5F5.
- Secondary text: #A1A1AA.
- Orange accent: #FF6B2B.
- Primary white-text button: #C2410C.
- Button hover: #9A3412.

Maintain strong contrast and readable body text.

LOGO — EXACT REQUIREMENT

The wordmark must read “iDoc”.

Construct it as one reusable component:
- Bold white lowercase “i” stem.
- Orange circular dot centered directly above the stem.
- White “Doc” immediately beside it.
- No orange dot or shape after the “c”.
- No separate icon.

Use a single SVG or a carefully aligned grouped construction so the orange dot cannot drift outside the logo.

Keep the “i” stem aligned with the baseline of “Doc”.
Keep the dot inside the logo’s viewBox/component bounds.
Use consistent proportions at navigation and sidebar sizes.
Expose an accessible name: iDoc.

Apply this component everywhere. Do not reproduce the broken detached-dot logo from earlier design attempts.

LANDING PAGE

Implement the approved sections:
- Navigation.
- Hero with document-focused illustration.
- Dashboard preview.
- How it works.
- Features.
- Source-inspection section.
- FAQ.
- Final CTA.
- Footer.

Reuse exported 3D assets and patterns.
Keep text and controls as actual HTML, not baked into screenshots.

Use optimized images with explicit dimensions.
Use a static rendered illustration when live 3D is unnecessary.
Use CSS/SVG for simple patterns.

“See how it works” scrolls to the corresponding section.
“Sign in” opens /login.
“Open workspace” opens /chat when authenticated, otherwise /login.

Do not show fabricated customers, testimonials, usage figures, or accuracy scores.
Label illustrative product content as an example.
Do not claim all processing is local when cloud providers are configured.

AUTHENTICATION

The backend is the authority for authentication.

Inspect the actual auth contract before coding the adapter.

Expected capabilities are:
- Sign in.
- Read current authenticated user/session.
- Sign out.
- Reject unauthorized API access.

If those capabilities do not exist:
- Implement the frontend form and adapter boundary.
- Document the exact required backend contract.
- Keep protected operations inaccessible.
- Do not simulate a successful login.
- Continue independent frontend work.
- Report the missing backend capability as an integration blocker.

Do not add a second independent user database or a frontend-only password system.

Use a server-validated session with HttpOnly cookies when supported by the backend.
Never store access credentials or a “loggedIn=true” flag in localStorage.

Login behavior:
- Validate email and required password.
- Allow password visibility toggle.
- Disable repeated submission while pending.
- Show generic invalid-credentials feedback.
- Preserve the email on failure.
- Redirect only after verified success.

Use /chat as the default destination.
Allow only approved same-origin return paths, such as /chat and /documents.

Verify the session when accessing protected data and routes. A client redirect or a layout check alone is not sufficient authorization.

On logout or session expiry:
- Clear private query caches.
- Clear current conversation state.
- Close private document/source views.
- Navigate to /login.

Handle authentication failure separately from temporary server unavailability.

Do not add signup, password reset, social login, or remember-me functionality unless the backend implements it.

API CONNECTION

Use the existing FastAPI backend.

Preferred browser path:
Browser → same-origin Next.js API adapter → FastAPI.

Use a server-only BACKEND_API_URL.
Do not expose model-provider credentials through NEXT_PUBLIC variables.

For the API adapter:
- Allowlist supported upstream paths and methods.
- Do not accept arbitrary destination URLs.
- Forward only required headers and session credentials.
- Preserve required Set-Cookie headers correctly.
- Align cookie scope with the browser-facing origin.
- Apply appropriate origin/CSRF protection to cookie-authenticated mutations.
- Preserve useful upstream error statuses.
- Do not leak internal stack traces.
- Do not cache authenticated responses publicly.

Use configured request timeouts appropriate for chat and indexing.
Do not automatically retry non-idempotent operations blindly.

Expected document endpoints:
- GET /health
- GET /v1/config
- GET /v1/documents
- POST /v1/ingest/file
- DELETE /v1/documents/{document_id}
- POST /v1/chat/completions

Confirm these against the actual backend. Centralize discrepancies in the API adapter rather than spreading assumptions across components.

Never silently fall back to mock answers when the API fails.

CHAT

Support:
- Empty workspace.
- Ready-to-chat welcome screen.
- Current conversation.
- Pending answer.
- Provider failure and retry.
- No supporting answer.
- Sources panel.
- Selected-document changes.

Request:
- Conversation messages.
- use_context=true.
- include_sources=true.
- stream=false.
- document_ids=null for all documents, or a nonempty selected list.

Disable sending if no documents are ready, the question is empty, or another answer is pending.

Enter sends.
Shift+Enter adds a newline.
Respect IME composition when handling Enter.

Render Markdown safely.
Disable raw HTML.
Treat document excerpts as text, not executable content.

Keep pending and failed messages distinct. Retry must not duplicate the user question.

Store the current conversation in memory for the active authenticated workspace session. Refresh may clear it; do not imply persistent chat history.

“New chat” clears the current conversation and sources with confirmation when needed.

SOURCES

Use source IDs returned by the backend.
Never invent source references, page numbers, or confidence values.

A source reference opens the corresponding passage in the Sources panel.

Display:
- Source identifier.
- Filename.
- Page label when available.
- Passage text.

Use a sheet on mobile.
Do not require a full PDF viewer.

If a source document has since been deleted, distinguish a saved excerpt from an available document.

DOCUMENT LIBRARY

Fetch real documents from the backend.
Support:
- Filename search.
- Desktop table.
- Mobile cards.
- Actual document count.
- File type, size, chunk count, and upload date.
- Ask about this.
- Delete confirmation.

“Ask about this” opens /chat with the document selected.

Do not add analytics cards unless real backend data exists for them.

UPLOAD

Support PDF, DOCX, TXT, MD.
Read supported formats and the upload limit from public configuration, with the agreed 20 MiB limit as the fallback.

Support drag-and-drop and file browsing.
Queue multiple files, but submit them sequentially to the single-file endpoint.

Show:
- Queued.
- Processing.
- Ready.
- Already indexed.
- Failed.

Use indeterminate progress unless genuine upload progress is available.
Do not invent server processing stages or percentages.

Let the browser set multipart boundaries; do not manually set multipart Content-Type.

Handle individual failures without losing the entire queue.
Refresh the library after successful indexing.
Do not mark a file ready before backend confirmation.

DELETION

Use document_id, never filename, for deletion.
Show which document will be removed.
Keep it visible until the server confirms success.
Show a retryable error on failure.

After success:
- Invalidate the document list.
- Remove it from selected-document scope.
- Preserve existing chat excerpts with an appropriate removed-document label.

SETTINGS

Implement a read-only drawer showing:
- Connection state.
- Answer provider/model.
- Embedding provider/model.
- Supported formats and upload limit.
- Local/cloud processing information.

Keep API keys, environment-variable names, and internal paths out of the interface.

RESPONSIVENESS AND ACCESSIBILITY

Verify at 1440px, 1024px, 768px, and 390px.

Requirements:
- No horizontal overflow.
- Mobile navigation.
- Readable chat width.
- Accessible composer above the mobile keyboard.
- Mobile document cards.
- Sources/settings sheets.
- Dialog focus trapping and focus restoration.
- Escape-to-close where appropriate.
- Visible keyboard focus.
- Proper input labels.
- Loading and error announcements.
- Reduced-motion support.

Avoid making the whole application a Client Component.

IMPLEMENTATION ORDER

1. Inspect source designs and backend contract.
2. Set up or adapt the frontend foundation.
3. Implement tokens, Logo, and shared components.
4. Build the landing page.
5. Build login and real session integration.
6. Build the protected workspace shell.
7. Implement document list and upload.
8. Implement chat and sources.
9. Implement deletion and settings.
10. Complete responsive states and verification.

Prioritize one real end-to-end flow before extra polish:
Sign in → upload → select document → ask → inspect source.

Use mock responses only in explicitly isolated tests or previews. Never make them the default production behavior.

BACKEND BOUNDARY

Do not reimplement RAG in Next.js.

Authentication, ownership checks, and user-specific vector retrieval belong to the backend. Frontend filtering does not provide user isolation.

If the backend still uses a shared unauthenticated workspace, record that gap clearly and do not claim the application supports isolated user accounts.

Keep unrelated Python changes out of this frontend task unless explicitly authorized.

VERIFICATION

Run:
- TypeScript checking.
- ESLint.
- Production build.

Add focused browser checks for:
- Landing navigation and CTA destinations.
- Invalid login and successful login.
- Protected route access.
- Upload and document-list refresh.
- Chat answer and source selection.
- Document deletion.
- Logout and private-state cleanup.
- Mobile navigation and layout.

Use clearly labeled test fixtures when testing UI states with mocked APIs.
Run a real backend smoke test when credentials and services are available.
Report mocked tests and real integration checks separately.

Visually compare implemented pages against the provided Stitch references at desktop and mobile sizes.

Do not stop after the development server starts. Check the actual rendered pages, broken assets, console errors, and the core interaction flow.

DELIVERABLES

Provide:
- Working frontend source.
- Reusable components and Sass Modules.
- Correct iDoc logo.
- Safe .env.example.
- Dependency lockfile.
- Windows-friendly README.
- API integration notes.
- Validation results.
- Screenshots of the implemented landing, login, chat, and documents screens.
- A precise list of remaining backend blockers, if any.

Continue through implementation and verification. Do not substitute another planning document for the requested application.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
