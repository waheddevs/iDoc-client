import 'server-only';
import { z } from 'zod';
export const authEnabled = () => process.env.BACKEND_AUTH_ENABLED === 'true';
export function localWorkspaceEnabled() {
  if (process.env.LOCAL_WORKSPACE_ENABLED !== 'true' || authEnabled()) return false;
  const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
  for (const value of [
    process.env.APP_ORIGIN || 'http://localhost:3000',
    process.env.BACKEND_API_URL || 'http://127.0.0.1:8000',
  ]) {
    const url = new URL(value);
    if (!loopback.has(url.hostname) || !['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Local workspace requires loopback frontend and backend URLs.');
    }
  }
  return true;
}
export function localHostAllowed(host: string | null) {
  if (!host) return false;
  // Accept explicit loopback aliases, not arbitrary names resolving to loopback.
  const match = /^(localhost|127\.0\.0\.1|\[::1\])(?::([0-9]{1,5}))?$/i.exec(host);
  if (!match) return false;
  const configured = new URL(process.env.APP_ORIGIN || 'http://localhost:3000');
  const defaultPort = configured.protocol === 'https:' ? 443 : 80;
  return Number(match[2] || defaultPort) === Number(configured.port || defaultPort);
}
export function localOriginAllowed(origin: string | null, host: string | null) {
  if (!origin || !host || !localHostAllowed(host)) return false;
  const configured = new URL(process.env.APP_ORIGIN || 'http://localhost:3000');
  // A mutation must still originate from the exact alias being visited.
  return origin === new URL(`${configured.protocol}//${host}`).origin;
}
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
      path.startsWith('v1/auth/google/callback')
        ? 90000
        : path.includes('chat/') || path.includes('ingest/')
          ? 180000
          : 10000,
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
