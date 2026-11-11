import { AuthShell } from '@/features/auth/AuthShell';
import { LoginForm } from '@/features/auth/LoginForm';
import { authEnabled } from '@/lib/server/backend';
import { canonicalizeAuthOrigin } from '@/lib/auth/auth-origin.server';
export const metadata = { title: 'Sign in' };
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; google_error?: string }>;
}) {
  const params = await searchParams;
  const returnTo = ['/chat', '/documents', '/profile'].includes(params.next || '') ? params.next! : '/chat';
  await canonicalizeAuthOrigin('/login', returnTo, params.google_error);
  return (
    <AuthShell>
      <LoginForm enabled={authEnabled()} returnTo={returnTo} googleError={params.google_error} />
    </AuthShell>
  );
}
