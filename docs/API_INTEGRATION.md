# Backend integration

The frontend connects to the existing FastAPI backend through the Next.js same-origin adapter. The Python backend implements the account and document-ownership boundary.

Inspected local references:

- `../iDoc-server/idoc/docs/API_CONTRACT.md`
- `../iDoc-server/idoc/docs/openapi.json`
- `../iDoc-server/idoc/xantus/models/schemas.py`

The server now implements email/password accounts, opaque cookie sessions and per-user document ownership. Enable `IDOC_AUTH__ENABLED=true` in the backend and `BACKEND_AUTH_ENABLED=true`, `LOCAL_WORKSPACE_ENABLED=false` in the frontend. Legacy account-free mode remains available only as an explicit local option.

## Local workspace

For legacy local access only, set backend `IDOC_AUTH__ENABLED=false`, frontend `LOCAL_WORKSPACE_ENABLED=true`, `BACKEND_AUTH_ENABLED=false`, `BACKEND_API_URL=http://127.0.0.1:8000`, and `APP_ORIGIN=http://localhost:3000`. Both URLs must be loopback URLs. Mutations require the exact visited origin. This mode intentionally has no account/session isolation. `/login` and `/signup` still display their forms with an unavailable-account notice. `/chat` and `/documents` open the legacy library. Leave workspace clears browser state and returns home.

Local mode is explicit and defaults off if unset. It is disabled when real backend authentication is enabled. Disabling local mode preserves the closed authentication boundary below. Do not publicly expose this local workspace.

`GET /ready` checks model/component readiness separately from `/health`. The sidebar and settings distinguish API connectivity from readiness. Standard backend error codes and safe messages survive the proxy; transport failures use `backend_unreachable`, proxy timeouts use `proxy_timeout`. A failed provider never produces a demo answer.

Document selection is bounded to 100 IDs. If a selected document disappears or is no longer ready, chat requires the reader to choose a new scope; it never silently broadens to all documents.

## Confirmed document contract

| Method | Backend path                  | Frontend use                                                  |
| ------ | ----------------------------- | ------------------------------------------------------------- |
| GET    | `/health`                     | Connection status                                             |
| GET    | `/v1/config`                  | Supported formats, size limit, model/processing configuration |
| GET    | `/v1/documents`               | `documents` and `total` envelope                              |
| POST   | `/v1/ingest/file`             | Browser multipart `file`; sequential queue                    |
| DELETE | `/v1/documents/{document_id}` | Delete by ID after confirmation                               |
| POST   | `/v1/chat/completions`        | `messages`, `document_ids`, context, sources; non-streaming   |

Sources are read from `sources[]`; answer text from `choices[0].message.content`. No source ID, page label, confidence, or model result is fabricated outside the labeled preview fixture module. Returned similarity scores are not presented as confidence.

## Authentication contract (implemented)

The centralized adapter forwards these implemented endpoints and preserves the session cookie:

- `POST /v1/auth/login`: JSON `{email,password}`. 200 JSON response and an opaque session cookie. 401 for invalid credentials. Rate limiting belongs to the backend.
- `POST /v1/auth/signup`: JSON `{email,password}`. 201 `{user:{id,email}}` and a session cookie. Signup passwords are 8–128 characters; emails are normalized. 409 for an existing email.
- `GET /v1/auth/session`: 200 `{user:{id:string,email:string,name?:string}}` only for a valid, nonexpired session. 401 otherwise. This endpoint must actually validate the session, not echo cookie presence.
- `POST /v1/auth/logout`: invalidate the backend session, return JSON, expire the session cookie.
- The cookie name defaults to `idoc_session` and is configured through server-only `SESSION_COOKIE_NAME`. HttpOnly, SameSite, Secure on HTTPS, host-only cookie scope.
- Every document/ingest/chat endpoint must independently authenticate, authorize document ownership, and restrict retrieval to that user. Frontend selection is not an authorization mechanism.

Login/signup first run Zod validation through React Hook Form. Invalid fields never trigger an HTTP request. FastAPI independently validates every request; `error.details.field_errors` is normalized to `error.fieldErrors` by the adapter and mapped to each input. Invalid credentials, connection failure and rate limits use a separate form alert. Email is preserved after failure; successful navigation requires a verified session. Password confirmation is checked in the browser and is not sent to the backend. Repeated submission is blocked while pending.

Passwords use salted scrypt; session token hashes and account records persist in SQLite. Cookies are HttpOnly, SameSite=Lax, host-only and Secure over HTTPS. Logout revokes the current session and clears client caches. Expired-session responses clear the active workspace and return to login. Mutation Origin checks run in both the Next adapter and FastAPI. Signup/login rotate any prior session cookie.

Existing documents migrate to the reserved legacy `local` owner; new accounts do not inherit them. Same bytes uploaded by different users create independently owned documents. Retrieval scopes the vector query to the current user's ready IDs before generation; foreign IDs return 404. Authentication remains available while models are offline. Email verification/password recovery are not implemented.

## Adapter behavior

Supported paths/methods are allowlisted. No arbitrary destination URLs or browser-supplied provider credentials. Authenticated requests are uncached and only the named session cookie is forwarded. Cookie mutations require a matching Origin; cross-site fetches are rejected. Set-Cookie headers are individually preserved with browser-facing host/path scope. Reads/session checks use a 10-second timeout; indexing/chat use 180 seconds. Requests are bounded; non-idempotent mutations are not automatically retried. Server failures return generic messages, not internal traces.

HTTPS deployments must set backend `IDOC_AUTH__COOKIE_SECURE=true`, configure exact allowed frontend origins, and use HTTPS for the browser-facing app. The local verification uses HTTP on loopback. Public deployment is not part of this task.

## Integration tests

`npm.cmd run test:integration` starts real FastAPI with deterministic test-only model providers and isolated temporary SQLite/Chroma storage, then a local-mode Next.js server. No browser API mocking is used. `IDOC_E2E_REAL_MODEL=true` uses the configured real providers instead. Ports: 8101 and 3101. `IDOC_BACKEND_DIR` and `IDOC_PYTHON` optionally override the sibling checkout and its Windows virtualenv interpreter. Tests do not access the user document database. Playwright stops its own child servers at the end.

`npm.cmd run test:auth` uses ports 8102/3102 with actual FastAPI accounts and isolated SQLite/Chroma storage. It verifies frontend and backend validation separately, cookie attributes, duplicate-email errors, login/logout, session expiry and two-user isolation through upload, chat, sources and deletion. Use `IDOC_E2E_REAL_MODEL=true` for Ollama inference in the same flow. Screenshots: `artifacts/auth/`.

## Google account authentication

| Browser route                   | Backend route                  | Behavior                                                                                                                                                                                                                               |
| ------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/auth/google/config`   | `GET /v1/auth/google/config`   | Public `{enabled}` only; missing setup keeps email login usable.                                                                                                                                                                       |
| `POST /api/auth/google/start`   | `POST /v1/auth/google/start`   | Same-origin JSON `{next, intent}`. `next` is `/chat` or `/documents`; `intent` is `signin` or `link`. Returns an allowlisted Google authorization URL and HttpOnly `idoc_google_oauth` cookie.                                         |
| `GET /api/auth/google/callback` | `GET /v1/auth/google/callback` | Forwards only `code`, `state`, `error` and allowlisted cookies. Backend consumes browser-bound state, exchanges the code and verifies signed claims. Next returns a 303 to the workspace, or `/login?google_error=<allowlisted code>`. |

Backend success: `{next, linked}` plus rotated `idoc_session`; linking adds a confirmation query on the workspace destination. All responses are non-cacheable. Callback responses use `Referrer-Policy: no-referrer` and clear the temporary OAuth cookie. Provider descriptions, authorization codes and tokens are never reflected into UI errors.

The backend identifies Google users by `sub`, never solely by email. A matching password-account email returns `google_link_required`. Explicit linking must begin with a valid iDoc session and finish with that same session and matching verified Google email. Google-only accounts cannot use password login. Ownership always uses the existing iDoc user ID.

Configuration and Console steps are in the README's Google sign-in setup section. Real Google availability cannot be confirmed by fixture tests.

Local auth pages canonicalize explicit loopback aliases to the configured APP_ORIGIN before rendering. For example, 127.0.0.1:3000/login redirects to localhost:3000/login when localhost is configured. This preserves the same host-only OAuth state/session cookies as the registered callback. The same-port allowlist and POST Origin/CSRF checks remain strict; this does not allow extra mutation origins. Login/signup destinations remain limited to /chat, /documents and /profile.

## Profile API

All routes below require the existing account session and are forwarded through the same-origin /api/backend adapter. Mutations require the configured Origin. Responses and avatar bytes are not publicly cached.

| Backend route | Method | Behavior |
| --- | --- | --- |
| /v1/profile | GET | Returns user identity, display name, avatar version, password availability and Google connection status. |
| /v1/profile | PATCH | Saves a validated display name of 1-80 characters. |
| /v1/profile/avatar | POST | Accepts multipart file; JPG/PNG/WebP up to 5 MiB; server decodes and normalizes it. |
| /v1/profile/avatar | GET | Returns the current user's private PNG avatar, or 404 when absent. |
| /v1/profile/avatar | DELETE | Removes the current user's photo. |
| /v1/profile/password | POST | Checks current_password, new_password and confirm_password; revokes other sessions on success. |
| /v1/profile/sessions/revoke | POST | Revokes other sessions while retaining the current cookie session. |

The adapter maps name/current_password/new_password/confirm_password errors to fieldErrors. Google-only accounts have no local password. Profile is a protected workspace route; local unauthenticated mode redirects /profile to /chat. Approved authentication return destinations include /chat, /documents and /profile.


## Saved conversations

Chats are automatically stored in the backend data directory in conversations.sqlite. The existing session identifies their owner; local mode uses the shared local owner. Browser storage is not used for private messages.

- GET/POST /v1/conversations: list the owner's chats / create an empty chat.
- GET/PATCH/DELETE /v1/conversations/{id}: read, rename with {title}, or delete an owned chat. Unknown or foreign IDs return 404.
- POST /v1/chat/completions accepts conversation_id and conversation_revision together. The client sends the latest question; the server builds context from the stored messages, saves the question before inference and saves the answer plus sources afterwards.
- Concurrent/stale writes return 409. Failed questions remain retryable without duplicates. Interrupted pending operations expire after four minutes; an obsolete answer cannot overwrite a newer revision.
- /chat?conversation={id} restores messages, scope and pending/error state. New chat opens a fresh draft without deleting saved history. An empty draft is created on the server only when the first question is sent.
- The sidebar lists, renames and explicitly deletes chats. Document deletion preserves the previously saved source excerpts. Demo preview chats remain temporary.


## Document summaries and answer metadata

The backend detects explicit summary requests (including English, Uzbek and Korean cues). A summary with an implicit all-document scope and multiple ready files returns `summary_selection_required`; the client opens the picker. Explicit combined summaries support up to five documents.

Completion responses and saved assistant messages now include `mode` (question/summary), `answer_status` (answered/insufficient_evidence/unverified), and optional `coverage` with total_chunks, reviewed_chunks, partial and basis=indexed_text. The UI uses these fields rather than guessing status from prose; older saved messages retain a text fallback. Status describes model abstention/citation availability, not factual accuracy verification.

Summary coverage is bounded to 32 passages across up to four section passes plus synthesis, under configured context limits. Large documents receive a clearly marked partial overview, not a claim that every page was read. Sources retain original document IDs, chunk indices and page labels. Ordinary questions continue using scoped semantic retrieval.

New PDF uploads return/store total_pages and text_pages. Upload and picker views explain partial extraction. Existing documents may have null counts (no automatic re-upload or reindex); scanned/image-only content still requires external OCR.
