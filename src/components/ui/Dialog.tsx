'use client';
import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './Dialog.module.scss';
export function Dialog({
  title,
  children,
  onClose,
  drawer = false,
  busy = false,
  readingPanel = false,
  confirmation = false,
  icon,
  describedBy,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  drawer?: boolean;
  busy?: boolean;
  readingPanel?: boolean;
  confirmation?: boolean;
  icon?: React.ReactNode;
  describedBy?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLElement>('[data-dialog-initial-focus]')?.focus();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      aria-describedby={describedBy}
      aria-busy={busy || undefined}
      className={`${styles.dialog} ${drawer ? styles.drawer : ''} ${readingPanel ? styles.readingPanel : ''} ${confirmation ? styles.confirmation : ''}`}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className={styles.inner}>
        <header>
          {icon && (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          )}
          <h2 id={id}>{title}</h2>
          <button aria-label={`Close ${title}`} disabled={busy} onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
}
