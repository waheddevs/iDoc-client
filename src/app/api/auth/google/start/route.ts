import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authEnabled, upstream } from '@/lib/server/backend';
import {
  appOrigin,
  authResponseHeaders,
  copyGoogleCookies,
  googleAuthorizationUrl,
  googleCookies,
  googleFailure,
} from '@/lib/server/google-auth';
import { googleErrorMessage } from '@/features/auth/google-errors';

const input = z
  .object({ next: z.enum(['/chat', '/documents', '/profile']), intent: z.enum(['signin', 'link']) })
  .strict();

export async function POST(request: NextRequest) {
  if (
    request.headers.get('origin') !== appOrigin() ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    return googleFailure(403, 'This request origin is not allowed.');
  if (!authEnabled()) return googleFailure(503, googleErrorMessage('google_unavailable'));
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return googleFailure(415, 'Expected a JSON request.');
  try {
    const reader = request.body?.getReader();
    if (!reader) return googleFailure(400, 'Invalid sign-in request.');
    let raw = '';
    let size = 0;
    const decoder = new TextDecoder();
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 2048) {
        await reader.cancel();
        return googleFailure(413, 'The request is too large.');
      }
      raw += decoder.decode(chunk.value, { stream: true });
    }
    raw += decoder.decode();
    let parsed;
    try {
      parsed = input.safeParse(JSON.parse(raw));
    } catch {
      return googleFailure(400, 'Invalid sign-in request.');
    }
    if (!parsed.success) return googleFailure(400, 'Invalid sign-in request.');
    const response = await upstream('v1/auth/google/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: appOrigin(),
        Cookie: googleCookies(request),
      },
      body: JSON.stringify(parsed.data),
    });
    const data = await response.json();
    if (!response.ok)
      return googleFailure(
        response.status,
        googleErrorMessage(data.error?.code || 'google_failed'),
      );
    if (!googleAuthorizationUrl(data.authorization_url))
      return googleFailure(502, googleErrorMessage('google_failed'));
    const result = NextResponse.json(
      { authorization_url: data.authorization_url },
      { headers: authResponseHeaders },
    );
    copyGoogleCookies(response, result);
    return result;
  } catch {
    return googleFailure(503, googleErrorMessage('google_unavailable'));
  }
}
