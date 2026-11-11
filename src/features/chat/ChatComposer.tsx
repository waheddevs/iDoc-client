'use client';
import { useEffect, useRef } from 'react';
import { ArrowUp, Paperclip, ChevronDown, FileText, Check, X, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import styles from './ChatWorkspace.module.scss';

type Props = {
  question: string;
  onChange: (value: string) => void;
  onSend: () => void;
  focusVersion: number;
};
export function ChatComposer({ question, onChange, onSend, focusVersion }: Props) {
  const w = useWorkspace();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const ready = w.docs.filter((d) => d.status === 'ready');
  const selected = w.docs.find((d) => d.document_id === w.selectedIds[0]);
  const selection = w.scopeInvalid
    ? 'Choose available documents'
    : w.selectedIds.length === 1
      ? selected?.file_name || 'Selected document'
      : w.selectedIds.length > 1
        ? w.selectedIds.length + ' documents'
        : 'All documents';
  useEffect(() => {
    const input = textarea.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 180) + 'px';
  }, [question]);
  useEffect(() => {
    if (focusVersion) textarea.current?.focus();
  }, [focusVersion]);
  const busy = w.pending || w.uploadNotice?.status === 'processing';
  return (
    <div className={styles.composerArea}>
      <div className={styles.composer}>
        {w.uploadNotice && (
          <div className={styles.uploadStatus} role="status">
            {w.uploadNotice.status === 'processing' ? (
              <Spinner size={16} />
            ) : w.uploadNotice.status === 'ready' ? (
              <Check size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span title={w.uploadNotice.name}>{w.uploadNotice.name}</span>
            <small>
              {w.uploadNotice.status === 'processing'
                ? 'Processing...'
                : w.uploadNotice.status === 'ready'
                  ? w.preview
                    ? 'Preview added'
                    : 'Ready to ask'
                  : 'Upload failed'}
            </small>
            {w.uploadNotice.status !== 'processing' && (
              <button aria-label="Dismiss upload status" onClick={() => w.setUploadNotice(null)}>
                <X size={14} />
              </button>
            )}
          </div>
        )}
        <label className="srOnly" htmlFor="question">
          Ask a question
        </label>
        <textarea
          ref={textarea}
          id="question"
          rows={1}
          placeholder={
            ready.length ? 'Ask about your documents...' : 'Upload a document to get started...'
          }
          value={question}
          maxLength={8000}
          disabled={w.pending}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (!busy && !w.chatError) onSend();
            }
          }}
        />
        <div className={styles.composerBottom}>
          <div className={styles.composerTools}>
            <button
              className={styles.attach}
              aria-label="Upload documents"
              title="Upload documents"
              disabled={busy}
              onClick={() => w.setUploadOpen(true)}
            >
              <Paperclip size={20} />
            </button>
            {ready.length > 0 && (
              <button
                className={styles.scope}
                aria-label={'Choose documents: ' + selection}
                title={selection}
                disabled={busy}
                onClick={() => w.setScopeOpen(true)}
              >
                <FileText size={16} />
                <span>{selection}</span>
                <ChevronDown size={14} />
              </button>
            )}
          </div>
          <button
            className={'primary ' + styles.send}
            aria-label="Send question"
            disabled={!question.trim() || busy || !ready.length || !!w.chatError}
            onClick={onSend}
          >
            {w.pending ? <Spinner size={20} tone="inherit" /> : <ArrowUp size={20} />}
          </button>
        </div>
      </div>
      <p className={styles.sessionNote}>
        Chats are not saved. Refreshing clears this conversation.
      </p>
    </div>
  );
}
