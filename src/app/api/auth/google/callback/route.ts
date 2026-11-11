import { NextRequest, NextResponse } from 'next/server';
import { authEnabled, upstream } from '@/lib/server/backend';
import {
  appOrigin,
  authResponseHeaders,
  copyGoogleCookies,
  googleCookies,
  googleStateCookie,
} from '@/lib/server/google-auth';
import { googleErrors } from '@/features/auth/google-errors';

export async function GET(request: NextRequest) {
  let destination = '/login?google_error=google_failed';
  let backend: Response | undefined;
  let success = false;
  try {
    const query = new URLSearchParams();
    for (const key of ['code', 'state', 'error']) {
      const values = request.nextUrl.searchParams.getAll(key);
      if (values.length > 1 || (values[0]?.length || 0) > 4096) throw new Error('Invalid callback');
      if (values[0]) query.set(key, values[0]);
    }
    if (!authEnabled()) throw new Error('Authentication unavailable');
    backend = await upstream(`v1/auth/google/callback?${query}`, {
      headers: { Cookie: googleCookies(request) },
    });
    const data = await backend.json();
    if (backend.ok && ['/chat', '/documents', '/profile'].includes(data.next)) {
      success = true;
      destination = data.next + (data.linked === true ? '?google=linked' : '');
    } else {
      const code =
        typeof data.error?.code === 'string' && Object.hasOwn(googleErrors, data.error.code)
          ? data.error.code
          : 'google_failed';
      destination = `/login?google_error=${code}`;
    }
  } catch {
    /* Never reflect provider error descriptions or authorization codes into the page. */
  }
  const result = NextResponse.redirect(new URL(destination, appOrigin()), 303);
  for (const [name, value] of Object.entries(authResponseHeaders)) result.headers.set(name, value);
  if (backend?.ok && success) copyGoogleCookies(backend, result);
  // Use the same header API as copyGoogleCookies. Mixing ResponseCookies.set
  // with appended Set-Cookie headers can drop the newly issued session.
  result.headers.append(
    'Set-Cookie',
    `${googleStateCookie}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${appOrigin().startsWith('https:') ? '; Secure' : ''}`,
  );
  return result;
}
