'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import type { ConversationSummary } from '@/lib/api/types';
import { deleteConversation, renameConversation } from './conversations-api';
import styles from './ConversationHistory.module.scss';

export function ConversationHistory({ onNavigate }: { onNavigate: () => void }) {
  const w = useWorkspace();
  const router = useRouter();
  const pathname = usePathname();
  const notify = useNotification();
  const [editing, setEditing] = useState<ConversationSummary | null>(null);
  const [removing, setRemoving] = useState<ConversationSummary | null>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (w.preview) return null;
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing || busy) return;
    const value = title.trim();
    if (!value || value.length > 80 || /[\x00-\x1f]/.test(value)) {
      setError('Enter a title between 1 and 80 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await renameConversation(editing.id, value);
      await w.refreshConversations();
      setEditing(null);
      notify.success('Chat renamed.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not rename this chat.');
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!removing || busy) return;
    setBusy(true);
    setError('');
    try {
      await deleteConversation(removing.id);
      if (w.activeId === removing.id) {
        w.clear();
        router.replace('/chat');
      }
      await w.refreshConversations();
      setRemoving(null);
      notify.success('Chat deleted.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete this chat.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <section className={styles.history} aria-label="Chat history">
        <h2>Your chats</h2>
        {w.conversationsQuery.isPending ? (
          <p role="status">
            <Spinner size={16} />
            Loading chats...
          </p>
        ) : w.conversationsQuery.isError ? (
          <div role="alert">
            Could not load chats.
            <button onClick={() => void w.refreshConversations()}>Try again</button>
          </div>
        ) : !w.conversationsQuery.data?.conversations.length ? (
          <p>Your saved chats will appear here.</p>
        ) : (
          <ul>
            {w.conversationsQuery.data.conversations.map((chat) => (
              <li key={chat.id}>
                <Link
                  href={'/chat?conversation=' + chat.id}
                  onClick={onNavigate}
                  title={chat.title}
                  aria-current={w.activeId === chat.id && pathname === '/chat' ? 'page' : undefined}
                >
                  {chat.pending ? <Spinner size={16} /> : <MessageSquare size={15} />}
                  <span>{chat.title}</span>
                </Link>
                <div className={styles.actions}>
                  <button
                    aria-label={'Rename chat: ' + chat.title}
                    title="Rename chat"
                    onClick={() => {
                      setEditing(chat);
                      setTitle(chat.title);
                      setError('');
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    aria-label={'Delete chat: ' + chat.title}
                    title="Delete chat"
                    disabled={chat.pending}
                    onClick={() => {
                      setRemoving(chat);
                      setError('');
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {editing && (
        <Dialog title="Rename chat" busy={busy} onClose={() => setEditing(null)}>
          <form onSubmit={save} className={styles.rename} noValidate>
            <label>
              Chat title
              <input
                value={title}
                maxLength={80}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError('');
                }}
                disabled={busy}
                aria-invalid={!!error}
                aria-describedby={error ? 'chat-title-error' : undefined}
              />
            </label>
            {error && (
              <p role="alert" id="chat-title-error">
                {error}
              </p>
            )}
            <div>
              <button type="button" disabled={busy} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={busy}>
                {busy && <Spinner size={16} />}Save title
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {removing && (
        <ConfirmDialog
          title="Delete this chat?"
          description="This conversation and its saved source excerpts will be permanently deleted. Your documents will stay in the library."
          subject={removing.title}
          icon={<Trash2 size={21} />}
          confirmLabel="Delete chat"
          pendingLabel="Deleting..."
          busy={busy}
          error={error}
          onClose={() => setRemoving(null)}
          onConfirm={remove}
        />
      )}
    </>
  );
}
