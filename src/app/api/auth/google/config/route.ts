import { NextResponse } from 'next/server';
import { authEnabled, upstream } from '@/lib/server/backend';
import { authResponseHeaders } from '@/lib/server/google-auth';

export async function GET() {
  let enabled = false;
  if (authEnabled()) {
    try {
      const response = await upstream('v1/auth/google/config');
      enabled = response.ok && (await response.json()).enabled === true;
    } catch {
      /* Keep email authentication available if the provider cannot be checked. */
    }
  }
  return NextResponse.json({ enabled }, { headers: authResponseHeaders });
}
