'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useRef, useState } from 'react';
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
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useWorkspace } from './WorkspaceContext';
import { UploadDialog } from '@/features/documents/UploadDialog';
import { WorkspaceDrawers } from './WorkspaceDrawers';
import { signOut } from '@/features/auth/api';
import { LogoutDialog } from '@/features/auth/LogoutDialog';
import styles from './WorkspaceShell.module.scss';
import { ConversationHistory } from '@/features/chat/ConversationHistory';
import { GoogleLinkNotice } from '@/features/auth/GoogleLinkNotice';
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const w = useWorkspace();
  const pathname = usePathname();
  const router = useRouter();
  const client = useQueryClient();
  const [mobile, setMobile] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const logoutLock = useRef(false);
  const [error, setError] = useState('');
  const newChat = () => {
    w.clear();
    setConfirm(false);
    setMobile(false);
    router.push(`${w.base}/chat`);
  };
  const logout = async () => {
    if (logoutLock.current) return;
    logoutLock.current = true;
    setLoggingOut(true);
    setError('');
    try {
      if (!w.preview && !w.local) await signOut();
      w.clear();
      client.clear();
      window.location.replace(w.local ? '/' : '/login');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign out.');
      logoutLock.current = false;
      setLoggingOut(false);
    }
  };
  const links = (
    <>
      <button
        className={styles.newChat}
        onClick={() => (w.preview && w.messages.length ? setConfirm(true) : newChat())}
      >
        <Plus size={17} />
        New chat
      </button>
      <nav aria-label="Workspace">
        {(w.messages.length > 0 ||
          pathname.endsWith('/documents') ||
          pathname.endsWith('/profile')) && (
          <Link
            href={w.activeId ? `/chat?conversation=${w.activeId}` : `${w.base}/chat`}
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
      <ConversationHistory onNavigate={() => setMobile(false)} />
      <div className={styles.sidebarBottom}>
        <div className={styles.accountCard}>
          {!w.preview && !w.local ? (
            <Link
              href="/profile"
              aria-label="Profile"
              aria-current={pathname === '/profile' ? 'page' : undefined}
              className={styles.account}
              onClick={() => setMobile(false)}
            >
              <Avatar user={w.sessionQuery.data?.user} size={32} />
              <div>
                <strong>
                  {w.sessionQuery.data?.user.name ||
                    w.sessionQuery.data?.user.email.split('@')[0] ||
                    'Your account'}
                </strong>
                <small>Profile &amp; settings</small>
              </div>
            </Link>
          ) : (
            <div className={styles.account}>
              <UserRound size={19} />
              <span>{w.preview ? 'Demo workspace' : 'Local workspace'}</span>
            </div>
          )}
          <button
            className={styles.logoutIcon}
            onClick={() => {
              setError('');
              setLogoutOpen(true);
            }}
            disabled={loggingOut}
            aria-label={
              loggingOut
                ? 'Signing out'
                : w.preview
                  ? 'Leave preview'
                  : w.local
                    ? 'Leave workspace'
                    : 'Sign out'
            }
            title={
              loggingOut
                ? 'Signing out'
                : w.preview
                  ? 'Leave preview'
                  : w.local
                    ? 'Leave workspace'
                    : 'Sign out'
            }
          >
            {loggingOut ? <Spinner size={18} /> : <LogOut size={18} aria-hidden="true" />}
          </button>
        </div>
        <button
          onClick={() => {
            setMobile(false);
            w.setSettingsOpen(true);
          }}
        >
          <Settings size={18} />
          Settings
        </button>
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
        <header
          className={`${styles.header} ${pathname.endsWith('/profile') || pathname.endsWith('/documents') ? styles.compactHeader : ''}`}
        >
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
          {!pathname.endsWith('/profile') && !pathname.endsWith('/documents') && (
            <span className={styles.pageTitle}>
              {pathname.endsWith('/documents') ? 'Documents' : 'Chat'}
            </span>
          )}
          <button
            className={styles.mobileNewChat}
            aria-label="New chat"
            onClick={() => (w.preview && w.messages.length ? setConfirm(true) : newChat())}
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
        <ConfirmDialog
          title="Start a new chat?"
          icon={<MessageSquare size={21} strokeWidth={1.7} />}
          description="Your current conversation and source excerpts will be cleared."
          confirmLabel="Start new chat"
          cancelLabel="Keep conversation"
          onClose={() => setConfirm(false)}
          onConfirm={newChat}
        />
      )}
      {logoutOpen && (
        <LogoutDialog
          mode={w.preview ? 'preview' : w.local ? 'local' : 'account'}
          busy={loggingOut}
          error={error}
          onClose={() => {
            if (!logoutLock.current) setLogoutOpen(false);
          }}
          onConfirm={logout}
        />
      )}
      {w.uploadOpen && <UploadDialog />}
      <WorkspaceDrawers />
    </div>
  );
}
