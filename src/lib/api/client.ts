export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/backend/${path}`, {
      ...init,
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(0, 'Could not connect. Check your connection and try again.');
  }
  const data = await response.json().catch(() => null);
  if (response.status === 401 && !['v1/auth/login', 'v1/auth/signup'].includes(path))
    window.dispatchEvent(new Event('idoc:session-expired'));
  if (!response.ok)
    throw new ApiError(
      response.status,
      data?.error?.message ?? 'The request could not be completed. Please try again.',
      data?.error?.code,
      data?.error?.fieldErrors,
    );
  return data as T;
}
export const json = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
export const queryKeys = {
  documents: ['documents'] as const,
  config: ['config'] as const,
  health: ['health'] as const,
  ready: ['ready'] as const,
};
export function formatSize(size: number) {
  return size >= 1048576
    ? `${(size / 1048576).toFixed(1)} MiB`
    : `${Math.max(1, Math.round(size / 1024))} KiB`;
}
