'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  MessageSquare,
  Folder,
  Settings,
  LogOut,
  Menu,
  UserRound,
  ArrowUpRight,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Dialog } from '@/components/ui/Dialog';
import { useWorkspace } from './WorkspaceContext';
import { UploadDialog } from '@/features/documents/UploadDialog';
import { WorkspaceDrawers } from './WorkspaceDrawers';
import { signOut } from '@/features/auth/api';
import styles from './WorkspaceShell.module.scss';
import { GoogleLinkNotice } from '@/features/auth/GoogleLinkNotice';
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const w = useWorkspace();
  const pathname = usePathname();
  const router = useRouter();
  const client = useQueryClient();
  const [mobile, setMobile] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');
  const newChat = () => {
    w.clear();
    setConfirm(false);
    setMobile(false);
    router.push(`${w.base}/chat`);
  };
  const logout = async () => {
    setLoggingOut(true);
    setError('');
    try {
      if (!w.preview && !w.local) await signOut();
      w.clear();
      client.clear();
      window.location.replace(w.local ? '/' : '/login');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign out.');
      setLoggingOut(false);
    }
  };
  const links = (
    <>
      <button
        className={styles.newChat}
        onClick={() => (w.messages.length ? setConfirm(true) : newChat())}
      >
        <Plus size={17} />
        New chat
      </button>
      <nav aria-label="Workspace">
        {(w.messages.length > 0 ||
          pathname.endsWith('/documents') ||
          pathname.endsWith('/profile')) && (
          <Link
            href={`${w.base}/chat`}
            onClick={() => setMobile(false)}
            aria-current={pathname.endsWith('/chat') ? 'page' : undefined}
          >
            <MessageSquare size={18} />
            Chat
          </Link>
        )}
        <Link
          href={`${w.base}/documents`}
          onClick={() => setMobile(false)}
          aria-current={pathname.endsWith('/documents') ? 'page' : undefined}
        >
          <Folder size={18} />
          Documents
        </Link>
      </nav>
      <div className={styles.sidebarBottom}>
        <div className={styles.account}><UserRound size={19} /><span>{w.preview ? 'Demo workspace' : w.local ? 'Local workspace' : w.sessionQuery.data?.user.email || 'Your account'}</span></div>
        <button
          onClick={() => {
            setMobile(false);
            w.setSettingsOpen(true);
          }}
        >
          <Settings size={18} />
          Settings
        </button>
        <button onClick={logout} disabled={loggingOut}>
          <LogOut size={18} />
          {loggingOut
            ? 'Leaving…'
            : w.preview
              ? 'Leave preview'
              : w.local
                ? 'Leave workspace'
                : 'Sign out'}
        </button>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </div>
    </>
  );
  return (
    <div className={`${styles.shell} ${w.activeSource ? styles.sourceOpen : ''}`}>
      <aside className={styles.sidebar}>
        <Link href="/" aria-label="iDoc home" className={styles.brand}>
          <Logo />
        </Link>
        {links}
      </aside>
      <div className={styles.main}>
        <header className={styles.header}>
          <button
            className={styles.mobileMenu}
            aria-label="Open navigation"
            onClick={() => setMobile(true)}
          >
            <Menu size={20} />
          </button>
          <Link href="/" className={styles.mobileBrand} aria-label="iDoc home">
            <Logo />
          </Link>
          <span className={styles.pageTitle}>
            {pathname.endsWith('/profile')
              ? 'Profile'
              : pathname.endsWith('/documents')
                ? 'Documents'
                : 'Chat'}
          </span>
          <button
            className={styles.mobileNewChat}
            aria-label="New chat"
            onClick={() => (w.messages.length ? setConfirm(true) : newChat())}
          >
            <Plus size={20} />
          </button>
        </header>
        {!w.preview && !w.local && (
          <Suspense fallback={null}>
            <GoogleLinkNotice />
          </Suspense>
        )}
        {w.preview && (
          <div className={styles.previewBanner}>
            <span>
              <strong>Demo preview</strong> · Example data. Files stay in this browser session.
            </span>
            <Link href="/login">
              Sign in <ArrowUpRight size={14} />
            </Link>
          </div>
        )}
        <main id="main" className={styles.content}>
          {children}
        </main>
      </div>
      {mobile && (
        <Dialog title="Navigation" onClose={() => setMobile(false)}>
          <div className={styles.mobileNav}>{links}</div>
        </Dialog>
      )}
      {confirm && (
        <Dialog title="Start a new chat?" onClose={() => setConfirm(false)}>
          <p>Your current conversation and source excerpts will be cleared.</p>
          <div className={styles.actions}>
            <button onClick={() => setConfirm(false)}>Keep conversation</button>
            <button className="primary" onClick={newChat}>
              Start new chat
            </button>
          </div>
        </Dialog>
      )}
      {w.uploadOpen && <UploadDialog />}
      <WorkspaceDrawers />
    </div>
  );
}
