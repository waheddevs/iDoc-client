import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/Logo';
import { AuthIllustration } from './AuthIllustration';
import styles from './LoginForm.module.scss';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="iDoc home">
          <Logo />
        </Link>
        <Link className={styles.back} href="/">
          <ArrowLeft size={15} /> Back to home
        </Link>
      </header>
      <main id="main" className={styles.formPanel}>
        <div className={styles.composition}>
          <AuthIllustration />
          <section className={styles.formContainer} aria-label="Account access">
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
