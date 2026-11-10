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
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  drawer?: boolean;
  busy?: boolean;
  readingPanel?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      className={`${styles.dialog} ${drawer ? styles.drawer : ''} ${readingPanel ? styles.readingPanel : ''}`}
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
