import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/server/backend';
export async function requireSession() {
  const state = await validateSession((await cookies()).toString());
  if (state.kind === 'authenticated') return state.user;
  if (state.kind === 'unavailable')
    throw new Error('Your session could not be verified. Please try again.');
  redirect(`/login${state.kind === 'unsupported' ? '?reason=unavailable' : ''}`);
}
