import { AuthShell } from '@/features/auth/AuthShell';
import { LoginForm } from '@/features/auth/LoginForm';
import { authEnabled } from '@/lib/server/backend';
import { canonicalizeAuthOrigin } from '@/lib/auth/auth-origin.server';
export const metadata = { title: 'Create account' };
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; google_error?: string }>;
}) {
  const params = await searchParams;
  const returnTo = ['/chat', '/documents', '/profile'].includes(params.next || '') ? params.next! : '/chat';
  await canonicalizeAuthOrigin('/signup', returnTo, params.google_error);
  return (
    <AuthShell>
      <LoginForm
        mode="signup"
        enabled={authEnabled()}
        returnTo={returnTo}
        googleError={params.google_error}
      />
    </AuthShell>
  );
}
