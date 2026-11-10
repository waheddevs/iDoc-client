import 'server-only';
import { z } from 'zod';
export const authEnabled = () => process.env.BACKEND_AUTH_ENABLED === 'true';
export const cookieName = () => process.env.SESSION_COOKIE_NAME || 'idoc_session';
export const userSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  name: z.string().optional(),
});
export const sessionSchema = z.object({ user: userSchema });
export function sessionCookie(raw: string) {
  return (
    raw
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${cookieName()}=`)) ?? ''
  );
}
export async function upstream(path: string, init: RequestInit = {}) {
  const base = (process.env.BACKEND_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  return fetch(`${base}/${path}`, {
    ...init,
    redirect: 'manual',
    cache: 'no-store',
    signal: AbortSignal.timeout(
      path.includes('chat/') || path.includes('ingest/') ? 180000 : 10000,
    ),
  });
}
export type SessionState =
  | { kind: 'authenticated'; user: z.infer<typeof userSchema> }
  | { kind: 'anonymous' | 'unavailable' | 'unsupported' };
export async function validateSession(raw: string): Promise<SessionState> {
  if (!authEnabled()) return { kind: 'unsupported' };
  const cookie = sessionCookie(raw);
  if (!cookie) return { kind: 'anonymous' };
  try {
    const response = await upstream('v1/auth/session', { headers: { cookie } });
    if (response.status === 401) return { kind: 'anonymous' };
    if (!response.ok) return { kind: 'unavailable' };
    const result = sessionSchema.safeParse(await response.json());
    return result.success
      ? { kind: 'authenticated', user: result.data.user }
      : { kind: 'unavailable' };
  } catch {
    return { kind: 'unavailable' };
  }
}
