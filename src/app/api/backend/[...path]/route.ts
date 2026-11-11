import { NextRequest, NextResponse } from 'next/server';
import {
  authEnabled,
  cookieName,
  sessionCookie,
  upstream,
  validateSession,
  localWorkspaceEnabled,
  localHostAllowed,
  localOriginAllowed,
} from '@/lib/server/backend';
export const runtime = 'nodejs';
const rules: Record<string, string[]> = {
  health: ['GET'],
  ready: ['GET'],
  'v1/config': ['GET'],
  'v1/documents': ['GET'],
  'v1/ingest/file': ['POST'],
  'v1/chat/completions': ['POST'],
  'v1/auth/login': ['POST'],
  'v1/auth/signup': ['POST'],
  'v1/auth/session': ['GET'],
  'v1/auth/logout': ['POST'],
};
function fail(status: number, message: string, code = 'proxy_error') {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}
async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const path = (await context.params).path.join('/');
  const allowed = rules[path] ?? (/^v1\/documents\/[a-zA-Z0-9_-]+$/.test(path) ? ['DELETE'] : []);
  if (!allowed.includes(request.method)) return fail(404, 'This operation is not available.');
  const local = localWorkspaceEnabled();
  if (local && !localHostAllowed(request.headers.get('host')))
    return fail(403, 'Local workspace host is not allowed.', 'invalid_host');
  if (request.method !== 'GET') {
    const origin = process.env.APP_ORIGIN || request.nextUrl.origin;
    const originAllowed = local
      ? localOriginAllowed(request.headers.get('origin'), request.headers.get('host'))
      : request.headers.get('origin') === origin;
    if (!originAllowed || request.headers.get('sec-fetch-site') === 'cross-site')
      return fail(403, 'This request origin is not allowed.');
  }
  const isAuth = path.startsWith('v1/auth/');
  if (isAuth && !authEnabled())
    return fail(503, 'Sign-in is not available yet. Please contact your workspace administrator.');
  const rawCookie = request.headers.get('cookie') || '';
  if (
    !local &&
    path !== 'health' &&
    path !== 'ready' &&
    path !== 'v1/config' &&
    path !== 'v1/auth/login' &&
    path !== 'v1/auth/signup' &&
    path !== 'v1/auth/logout'
  ) {
    const state = await validateSession(rawCookie);
    if (state.kind === 'anonymous')
      return fail(401, 'Your session has expired. Please sign in again.');
    if (state.kind !== 'authenticated')
      return fail(503, 'Your session could not be verified. Please try again later.');
    if (path === 'v1/auth/session')
      return NextResponse.json({ user: state.user }, { headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const headers = new Headers({ Accept: 'application/json' });
    const origin = request.headers.get('origin');
    if (origin) headers.set('origin', origin);
    const cookie = sessionCookie(rawCookie);
    if (cookie) headers.set('cookie', cookie);
    const type = request.headers.get('content-type');
    if (type) headers.set('content-type', type);
    const max = path === 'v1/ingest/file' ? 20 * 1024 * 1024 + 65536 : path === 'v1/profile/avatar' ? 5 * 1024 * 1024 + 65536 : 65536;
    if (Number(request.headers.get('content-length') || 0) > max)
      return fail(413, 'The request is too large.');
    let body: Uint8Array | undefined;
    if (request.method !== 'GET') {
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      if (reader) {
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          size += part.value.length;
          if (size > max) {
            await reader.cancel();
            return fail(413, 'The request is too large.');
          }
          chunks.push(part.value);
        }
      }
      body = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.length;
      }
    }
    const response = await upstream(path, {
      method: request.method,
      headers,
      body: body as BodyInit | undefined,
    });
    if (response.status >= 300 && response.status < 400)
      return fail(502, 'The service returned an unexpected response.');
    if (path === 'v1/profile/avatar' && request.method === 'GET' && response.ok) {
      if (!response.headers.get('content-type')?.startsWith('image/png')) return fail(502, 'Invalid image response.');
      return new NextResponse(await response.arrayBuffer(), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
    }
    const data = await response.json().catch(() => null);
    if (!data) return fail(502, 'The service returned an invalid response.');
    const fieldErrors: Record<string, string> = {};
    if ((isAuth || path.startsWith('v1/profile')) && [400, 409, 422].includes(response.status)) {
      const fields = data.error?.details?.field_errors;
      for (const field of ['email', 'password', 'name', 'current_password', 'new_password', 'confirm_password']) {
        if (typeof fields?.[field] === 'string') fieldErrors[field] = fields[field].slice(0, 250);
      }
    }
    const result = NextResponse.json(
      response.ok
        ? data
        : {
            error: {
              code: typeof data.error?.code === 'string' ? data.error.code : 'upstream_error',
              ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}),
              message:
                response.status === 401
                  ? 'Invalid email or password.'
                  : typeof data.error?.message === 'string'
                    ? data.error.message
                    : 'The service is temporarily unavailable. Please try again.',
            },
          },
      { status: response.status, headers: { 'Cache-Control': 'no-store' } },
    );
    if (isAuth)
      for (const value of response.headers.getSetCookie()) {
        if (!value.startsWith(`${cookieName()}=`)) continue;
        const pair = value.split(';')[0];
        const attributes = value
          .split(';')
          .slice(1)
          .filter((a) => !/^\s*(domain|path|samesite|httponly|secure)(=|\s*$)/i.test(a));
        result.headers.append(
          'Set-Cookie',
          `${pair}; Path=/; HttpOnly; SameSite=Lax${request.nextUrl.protocol === 'https:' ? '; Secure' : ''}${attributes.length ? ';' + attributes.join(';') : ''}`,
        );
      }
    return result;
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError')
      return fail(504, 'The service took too long to respond. Please try again.', 'proxy_timeout');
    return fail(
      503,
      'The service could not be reached. Please start the backend and try again.',
      'backend_unreachable',
    );
  }
}
export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
