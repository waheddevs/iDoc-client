'use client';
import { Spinner } from '@/components/ui/Spinner';
import { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import { formatSize } from '@/lib/api/client';
import styles from './Documents.module.scss';
type Item = {
  id: string;
  file: File;
  status: 'Queued' | 'Processing' | 'Ready' | 'Already indexed' | 'Failed';
  error?: string;
  warning?: string;
};
export function UploadDialog() {
  const w = useWorkspace();
  const input = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const lock = useRef(false);
  const formats = w.config?.supported_extensions || ['pdf', 'docx', 'txt', 'md'];
  const max = w.config?.max_file_size_bytes || 20971520;
  const update = (id: string, changes: Partial<Item>) =>
    setQueue((items) => items.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  const process = async (items: Item[]) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    const uploadedIds: string[] = [];
    try {
      for (const item of items) {
        if (item.status === 'Failed') continue;
        update(item.id, { status: 'Processing' });
        try {
          const result = await w.upload(item.file);
          uploadedIds.push(result.document_id);
          update(item.id, {
            status: result.status === 'already_exists' ? 'Already indexed' : 'Ready',
            error: undefined,
            warning:
              result.total_pages != null &&
              result.text_pages != null &&
              result.text_pages < result.total_pages
                ? 'Text available on ' +
                  result.text_pages +
                  '/' +
                  result.total_pages +
                  ' pages. Images and scanned pages need OCR.'
                : undefined,
          });
        } catch (e) {
          update(item.id, {
            status: 'Failed',
            error: e instanceof Error ? e.message : 'Upload failed.',
          });
        }
      }
    } finally {
      if (uploadedIds.length) w.setSelected([...new Set(uploadedIds)].slice(0, 100));
      lock.current = false;
      setBusy(false);
    }
  };
  const add = (files: FileList | File[]) => {
    if (lock.current) return;
    const items = Array.from(files).map((file) => {
      const error = !formats.includes(file.name.split('.').pop()?.toLowerCase() || '')
        ? 'Unsupported format.'
        : file.size > max
          ? `File exceeds ${formatSize(max)}.`
          : file.size === 0
            ? 'File is empty.'
            : undefined;
      return { id: crypto.randomUUID(), file, status: error ? 'Failed' : 'Queued', error } as Item;
    });
    setQueue((current) => [...current, ...items]);
    void process(items);
  };
  return (
    <Dialog title="Upload documents" onClose={() => w.setUploadOpen(false)} busy={busy}>
      {w.preview && (
        <p className="notice">
          Preview only. Files are not uploaded or indexed; only their names and sizes are shown.
        </p>
      )}
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!busy) add(e.dataTransfer.files);
        }}
      >
        <UploadCloud size={32} />
        <p>
          Drag &amp; drop files here, or{' '}
          <button disabled={busy} onClick={() => input.current?.click()}>
            browse files
          </button>
        </p>
        <small>
          {formats.join(', ').toUpperCase()} · Max {formatSize(max)} per file
        </small>
        <input
          ref={input}
          type="file"
          multiple
          accept={formats.map((f) => `.${f}`).join(',')}
          aria-label="Choose documents"
          className="srOnly"
          disabled={busy}
          onChange={(e) => {
            if (e.target.files) add(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      <p className={styles.uploadNote}>
        <AlertCircle size={16} />
        Scanned PDFs require searchable text. OCR is not supported.
      </p>
      {queue.length > 0 && (
        <>
          <div className={styles.queueHeader}>
            <span>UPLOAD QUEUE ({queue.length})</span>
            <span role="status">{busy ? 'Processing one file at a time' : 'Queue complete'}</span>
          </div>
          <ul className={styles.queue} aria-live="polite">
            {queue.map((item) => (
              <li key={item.id}>
                <FileText size={21} />
                <div>
                  <strong>{item.file.name}</strong>
                  <small>{formatSize(item.file.size)}</small>
                  {item.error && <small className="error">{item.error}</small>}
                  {item.warning && <small>{item.warning}</small>}
                </div>
                <span
                  className={
                    item.status === 'Failed' ? 'error' : item.status === 'Ready' ? 'success' : ''
                  }
                >
                  {item.status === 'Processing' ? (
                    <Spinner size={16} />
                  ) : item.status === 'Ready' ? (
                    <CheckCircle2 size={15} />
                  ) : null}
                  {w.preview && item.status === 'Ready' ? 'Preview added' : item.status}
                </span>
                {item.status === 'Failed' && !busy && (
                  <button
                    onClick={() => {
                      const retry = { ...item, status: 'Queued' as const };
                      const ext = item.file.name.split('.').pop()?.toLowerCase() || '';
                      if (formats.includes(ext) && item.file.size <= max && item.file.size > 0) {
                        update(item.id, { status: 'Queued' });
                        void process([retry]);
                      }
                    }}
                  >
                    Retry
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      <div className={styles.dialogActions}>
        <button className="primary" disabled={busy} onClick={() => w.setUploadOpen(false)}>
          {busy ? 'Processing…' : 'Done'}
        </button>
      </div>
    </Dialog>
  );
}
