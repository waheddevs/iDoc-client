'use client';
import { useId, type ReactNode } from 'react';
import { AlertCircle, FileText, Trash2 } from 'lucide-react';
import { Dialog } from './Dialog';
import { Spinner } from './Spinner';
import styles from './ConfirmDialog.module.scss';

type Props = {
  title: string;
  description: string;
  subject?: string;
  confirmLabel: string;
  pendingLabel?: string;
  cancelLabel?: string;
  icon?: ReactNode;
  busy?: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  title,
  description,
  subject,
  confirmLabel,
  pendingLabel = 'Working...',
  cancelLabel = 'Cancel',
  icon = <Trash2 size={21} strokeWidth={1.7} />,
  busy = false,
  error,
  onClose,
  onConfirm,
}: Props) {
  const descriptionId = useId();
  return (
    <Dialog
      title={title}
      onClose={onClose}
      busy={busy}
      confirmation
      icon={icon}
      describedBy={descriptionId}
    >
      <p id={descriptionId} className={styles.description}>
        {description}
      </p>
      {subject && (
        <div className={styles.subject}>
          <FileText size={18} aria-hidden="true" />
          <span>{subject}</span>
        </div>
      )}
      {error && (
        <div className={styles.error} role="alert">
          <AlertCircle size={17} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancel}
          data-dialog-initial-focus
          disabled={busy}
          onClick={onClose}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={styles.confirm}
          disabled={busy}
          onClick={() => void onConfirm()}
        >
          {busy && <Spinner size={16} tone="inherit" />}
          {busy ? pendingLabel : confirmLabel}
        </button>
      </div>
      <span className="srOnly" role="status">
        {busy ? pendingLabel : ''}
      </span>
    </Dialog>
  );
}
