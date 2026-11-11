'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Check, CircleAlert, Info, X } from 'lucide-react';
import styles from './NotificationContext.module.scss';

type Tone = 'success' | 'error' | 'info';
type Options = { duration?: number };
type Notice = { id: number; message: string; tone: Tone; duration: number };
type NotificationApi = Record<Tone, (message: string, options?: Options) => number> & {
  dismiss: (id: number) => void;
  clear: () => void;
};
const NotificationContext = createContext<NotificationApi | null>(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used inside NotificationProvider.');
  return context;
}

function Notification({ notice, dismiss }: { notice: Notice; dismiss: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const remaining = useRef(notice.duration);
  const paused = hovered || focused;
  useEffect(() => {
    if (paused || notice.duration === 0) return;
    const started = Date.now();
    const timer = window.setTimeout(() => dismiss(notice.id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - started));
    };
  }, [dismiss, notice.id, notice.duration, paused]);
  const Icon = notice.tone === 'success' ? Check : notice.tone === 'error' ? CircleAlert : Info;
  return (
    <div
      className={styles.notice}
      data-tone={notice.tone}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <span className={styles.icon}>
        <Icon size={17} aria-hidden="true" />
      </span>
      <div
        role={notice.tone === 'error' ? 'alert' : 'status'}
        aria-atomic="true"
        className={styles.message}
      >
        {notice.message}
      </div>
      <button
        type="button"
        onClick={() => dismiss(notice.id)}
        aria-label="Dismiss notification"
        className={styles.close}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const nextId = useRef(0);
  const dismiss = useCallback(
    (id: number) => setNotices((items) => items.filter((item) => item.id !== id)),
    [],
  );
  const clear = useCallback(() => setNotices([]), []);
  const show = useCallback((tone: Tone, message: string, options?: Options) => {
    const id = ++nextId.current;
    const duration = Math.max(0, options?.duration ?? (tone === 'error' ? 8000 : 6000));
    setNotices((items) => [...items.slice(-2), { id, message, tone, duration }]);
    return id;
  }, []);
  const api = useMemo<NotificationApi>(
    () => ({
      success: (message, options) => show('success', message, options),
      error: (message, options) => show('error', message, options),
      info: (message, options) => show('info', message, options),
      dismiss,
      clear,
    }),
    [show, dismiss, clear],
  );
  useEffect(() => {
    window.addEventListener('idoc:signing-out', clear);
    window.addEventListener('idoc:session-expired', clear);
    return () => {
      window.removeEventListener('idoc:signing-out', clear);
      window.removeEventListener('idoc:session-expired', clear);
    };
  }, [clear]);
  return (
    <NotificationContext.Provider value={api}>
      {children}
      <section aria-label="Notifications" className={styles.viewport}>
        {notices.map((notice) => (
          <Notification key={notice.id} notice={notice} dismiss={dismiss} />
        ))}
      </section>
    </NotificationContext.Provider>
  );
}
