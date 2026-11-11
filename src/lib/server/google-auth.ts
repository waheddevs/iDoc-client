import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { cookieName, sessionCookie } from './backend';

export const googleStateCookie = 'idoc_google_oauth';
export const authResponseHeaders = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
};

export function googleCookies(request: NextRequest) {
  const raw = request.headers.get('cookie') || '';
  const state = raw
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${googleStateCookie}=`));
  return [sessionCookie(raw), state].filter(Boolean).join('; ');
}

export function appOrigin() {
  return new URL(process.env.APP_ORIGIN || 'http://localhost:3000').origin;
}

export function copyGoogleCookies(upstream: Response, result: NextResponse) {
  const secure = new URL(appOrigin()).protocol === 'https:';
  for (const value of upstream.headers.getSetCookie()) {
    const name = value.slice(0, value.indexOf('='));
    if (![cookieName(), googleStateCookie].includes(name)) continue;
    const [pair, ...attributes] = value.split(';');
    const expiry = attributes.filter((part) => /^\s*(max-age|expires)=/i.test(part));
    result.headers.append(
      'Set-Cookie',
      `${pair}; Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}${expiry.length ? ';' + expiry.join(';') : ''}`,
    );
  }
}

export function googleFailure(status: number, message: string) {
  return NextResponse.json({ error: { message } }, { status, headers: authResponseHeaders });
}

export function googleAuthorizationUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return (
      url.origin === 'https://accounts.google.com' &&
      url.pathname === '/o/oauth2/v2/auth' &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
