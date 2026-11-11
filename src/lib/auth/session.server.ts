import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession, localWorkspaceEnabled, localHostAllowed } from '@/lib/server/backend';
export async function requireSession() {
  if (localWorkspaceEnabled()) {
    if (!localHostAllowed((await headers()).get('host')))
      throw new Error('Local workspace host is not allowed.');
    return null;
  }
  const state = await validateSession((await cookies()).toString());
  if (state.kind === 'authenticated') return state.user;
  if (state.kind === 'unavailable')
    throw new Error('Your session could not be verified. Please try again.');
  redirect(`/login${state.kind === 'unsupported' ? '?reason=unavailable' : ''}`);
}
