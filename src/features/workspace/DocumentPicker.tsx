'use client';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { useWorkspace } from './WorkspaceContext';
import styles from './WorkspaceDrawers.module.scss';
export function DocumentPicker() {
  const w = useWorkspace();
  const [selected, setSelected] = useState(
    w.selectedIds.filter((id) => w.docs.some((d) => d.document_id === id && d.status === 'ready')),
  );
  const [search, setSearch] = useState('');
  const ready = w.docs.filter((d) => d.status === 'ready');
  return (
    <Dialog title="Choose documents" onClose={() => w.setScopeOpen(false)}>
      <p>Choose which files iDoc should use for your next question.</p>
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
        All documents ({ready.length})
      </button>
      <input
        className={styles.documentSearch}
        type="search"
        aria-label="Find a document"
        placeholder="Find a document..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className={styles.options}>
        {ready
          .filter((d) => d.file_name.toLowerCase().includes(search.toLowerCase()))
          .map((doc) => (
            <label key={doc.document_id}>
              <input
                type="checkbox"
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
              <FileText size={17} />
              <span>{doc.file_name}</span>
            </label>
          ))}
      </div>
      {!ready.length ? (
        <p>No documents yet. Upload a document to get started.</p>
      ) : (
        !ready.some((d) => d.file_name.toLowerCase().includes(search.toLowerCase())) && (
          <p>No matching documents.</p>
        )
      )}
      <div className={styles.pickerFooter}>
        <span>
          {selected.length ? selected.length + ' selected' : 'Using all documents'}
          {selected.length >= 100 && ' · Limit reached'}
        </span>
        <button
          className="primary"
          onClick={() => {
            w.setSelected(selected);
            if (w.scopeInvalid) w.setChatError('');
            w.setScopeOpen(false);
          }}
        >
          Use documents
        </button>
      </div>
    </Dialog>
  );
}
