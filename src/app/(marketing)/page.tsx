import { cookies } from 'next/headers';
import { Landing } from '@/features/landing/Landing';
import { validateSession, upstream } from '@/lib/server/backend';
import type { User } from '@/lib/api/types';
export default async function Home() {
  const raw = (await cookies()).toString();
  const session = await validateSession(raw);
  let user: User | null = session.kind === 'authenticated' ? session.user : null;
  if (user) {
    try {
      const response = await upstream('v1/profile', {headers:{cookie:raw}});
      if (response.ok) user = (await response.json()).user;
    } catch { /* Keep the verified identity when profile details are unavailable. */ }
  }
  return <Landing user={user}/>;
}
