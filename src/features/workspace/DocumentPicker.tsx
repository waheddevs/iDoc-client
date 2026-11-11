'use client';
import { useState } from 'react';
import { FileText, Layers, Search, Check, ArrowRight } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { formatSize } from '@/lib/api/client';
import { useWorkspace } from './WorkspaceContext';
import styles from './DocumentPicker.module.scss';
export function DocumentPicker() {
  const w = useWorkspace();
  const [selected, setSelected] = useState(
    w.selectedIds.filter((id) => w.docs.some((d) => d.document_id === id && d.status === 'ready')),
  );
  const [search, setSearch] = useState('');
  const ready = w.docs.filter((d) => d.status === 'ready');
  const filtered = ready.filter((d) =>
    d.file_name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <Dialog
      title="Choose documents"
      onClose={() => w.setScopeOpen(false)}
      className={styles.dialog}
    >
      <p className={styles.intro}>Give your next answer the right context.</p>
      {w.scopeInvalid && (
        <p className="notice">
          A selected document is no longer available. Choose another file or use all documents.
        </p>
      )}
      <button
        className={styles.all}
        aria-pressed={!selected.length}
        onClick={() => setSelected([])}
      >
        <span className={styles.fileIcon}>
          <Layers size={20} />
        </span>
        <span className={styles.details}>
          <strong>All documents ({ready.length})</strong>
          <small>Search across your entire library</small>
        </span>
        <span className={styles.check} data-checked={!selected.length} aria-hidden="true">
          {!selected.length && <Check size={13} />}
        </span>
      </button>
      <div className={styles.sectionLabel}>
        <span>Or choose specific files</span>
        <span>{ready.length} available</span>
      </div>
      <div className={styles.search}>
        <Search size={17} aria-hidden="true" />
        <input
          data-dialog-initial-focus
          type="search"
          aria-label="Find a document"
          placeholder="Find a document..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className={styles.options}>
        {filtered.map((doc) => (
          <label
            key={doc.document_id}
            className={styles.row}
            data-selected={selected.includes(doc.document_id)}
          >
            <span className={styles.fileIcon}>
              <FileText size={20} />
            </span>
            <span className={styles.details}>
              <strong>{doc.file_name}</strong>
              <small>
                {doc.file_type.toUpperCase()}
                <span aria-hidden="true"> &middot; </span>
                {formatSize(doc.size_bytes)}
              </small>
            </span>
            <input
              type="checkbox"
              aria-label={doc.file_name}
              checked={selected.includes(doc.document_id)}
              disabled={!selected.includes(doc.document_id) && selected.length >= 100}
              onChange={(e) =>
                setSelected((ids) =>
                  e.target.checked
                    ? [...ids, doc.document_id]
                    : ids.filter((id) => id !== doc.document_id),
                )
              }
            />
          </label>
        ))}
        {!filtered.length && (
          <div className={styles.empty}>
            <FileText size={24} />
            <p>
              {ready.length
                ? 'No matching documents.'
                : 'No documents yet. Upload a document to get started.'}
            </p>
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <span aria-live="polite">
          <strong>{selected.length ? selected.length + ' selected' : 'Using all documents'}</strong>
          <small>
            {selected.length >= 100 ? 'Selection limit reached' : 'Applies to your next question'}
          </small>
        </span>
        <button
          className="primary"
          disabled={!ready.length}
          onClick={() => {
            w.setSelected(selected);
            if (w.scopeInvalid) w.setChatError('');
            w.setScopeOpen(false);
          }}
        >
          Use documents
          <ArrowRight size={16} />
        </button>
      </div>
    </Dialog>
  );
}
