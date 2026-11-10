# Deferred backend integration

Scope for this delivery: frontend only. No Python source was modified and no real model/provider request is required for UI development.

Inspected local references:

- `../iDoc-server/idoc/docs/API_CONTRACT.md`
- `../iDoc-server/idoc/docs/openapi.json`
- `../iDoc-server/idoc/xantus/models/schemas.py`

The current server describes a **single-user unauthenticated workspace**. It has document/config/chat endpoints but no authentication or ownership isolation. The frontend must not be treated as a multi-user deployment until those backend capabilities exist.

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

## Required authentication contract (proposal, not existing endpoints)

The centralized adapter currently reserves these paths for future integration. Adjust only the adapter/auth module if the final backend contract differs.

- `POST /v1/auth/login`: JSON `{email,password}`. 200 JSON response and an opaque session cookie. 401 for invalid credentials. Rate limiting belongs to the backend.
- `GET /v1/auth/session`: 200 `{user:{id:string,email:string,name?:string}}` only for a valid, nonexpired session. 401 otherwise. This endpoint must actually validate the session, not echo cookie presence.
- `POST /v1/auth/logout`: invalidate the backend session, return JSON, expire the session cookie.
- The cookie name defaults to `idoc_session` and is configured through server-only `SESSION_COOKIE_NAME`. HttpOnly, SameSite, Secure on HTTPS, host-only cookie scope.
- Every document/ingest/chat endpoint must independently authenticate, authorize document ownership, and restrict retrieval to that user. Frontend selection is not an authorization mechanism.

Set `BACKEND_AUTH_ENABLED=true` **only after** all of the above are implemented. Without it, login returns unavailable and protected routes redirect to login. Preview routes are separate and contain no real user data.

## Adapter behavior

Supported paths/methods are allowlisted. No arbitrary destination URLs or browser-supplied provider credentials. Authenticated requests are uncached and only the named session cookie is forwarded. Cookie mutations require a matching Origin; cross-site fetches are rejected. Set-Cookie headers are individually preserved with browser-facing host/path scope. Reads/session checks use a 10-second timeout; indexing/chat use 180 seconds. Requests are bounded; non-idempotent mutations are not automatically retried. Server failures return generic messages, not internal traces.

Before connecting: verify the final auth schema and cookies, HTTPS behavior, expiry/logout, unauthorized APIs, ownership checks, real upload/list/delete, model availability, answer/source mapping, and multi-user retrieval isolation. Successful login and real backend smoke tests are deliberately deferred.
