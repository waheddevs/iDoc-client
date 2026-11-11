import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authEnabled, localHostAllowed } from '@/lib/server/backend';
import { appOrigin } from '@/lib/server/google-auth';
import { googleErrors } from '@/features/auth/google-errors';

export async function canonicalizeAuthOrigin(
  route: '/login' | '/signup',
  returnTo: string,
  googleError?: string,
) {
  if (!authEnabled()) return;
  const canonical = new URL(appOrigin());
  const host = (await headers()).get('host');
  // OAuth state and sessions are host-only cookies. Start on the same origin
  // as the registered callback, rather than accepting a second POST origin.
  if (
    !['localhost', '127.0.0.1', '[::1]'].includes(canonical.hostname) ||
    !host ||
    host === canonical.host ||
    !localHostAllowed(host)
  )
    return;
  const destination = new URL(route, canonical);
  destination.searchParams.set(
    'next',
    ['/chat', '/documents', '/profile'].includes(returnTo) ? returnTo : '/chat',
  );
  if (googleError && Object.hasOwn(googleErrors, googleError))
    destination.searchParams.set('google_error', googleError);
  redirect(destination.href);
}
