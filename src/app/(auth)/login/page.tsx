import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { LoginForm } from '@/features/auth/LoginForm';
import { authEnabled } from '@/lib/server/backend';
import styles from '@/features/auth/LoginForm.module.scss';
export const metadata = { title: 'Sign in' };
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const returnTo = ['/chat', '/documents'].includes(params.next || '') ? params.next! : '/chat';
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" aria-label="iDoc home">
          <Logo />
        </Link>
        <Link href="/">Back to home</Link>
      </nav>
      <main id="main">
        <LoginForm enabled={authEnabled()} returnTo={returnTo} />
      </main>
    </div>
  );
}
