'use client';
import { LogOut } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type Props = {
  mode: 'account' | 'preview' | 'local';
  busy: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};
export function LogoutDialog({ mode, busy, error, onClose, onConfirm }: Props) {
  const label =
    mode === 'preview' ? 'Leave preview' : mode === 'local' ? 'Leave workspace' : 'Sign out';
  return (
    <ConfirmDialog
      title={label + '?'}
      description={
        mode === 'preview'
          ? 'Your demo conversation will be cleared when you leave.'
          : mode === 'local'
            ? 'Your saved chats and documents will be here when you return.'
            : 'Your chats and documents are saved. Sign in again whenever you want to continue.'
      }
      icon={<LogOut size={21} strokeWidth={1.7} />}
      confirmLabel={label}
      pendingLabel={mode === 'account' ? 'Signing out...' : 'Leaving...'}
      cancelLabel="Stay here"
      busy={busy}
      error={error}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
