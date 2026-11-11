'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  FolderOpen,
  Upload,
  Search,
  FileText,
  Trash2,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import type { Doc } from '@/lib/api/types';
import { formatSize } from '@/lib/api/client';
import styles from './Documents.module.scss';
export function DocumentLibrary() {
  const w = useWorkspace();
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<Doc | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const filtered = w.docs.filter((d) => d.file_name.toLowerCase().includes(search.toLowerCase()));
  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    setError('');
    try {
      await w.remove(deleting.document_id);
      setDeleting(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete document.');
    } finally {
      setBusy(false);
    }
  };
  const actions = (doc: Doc) => (
    <div className={styles.rowActions}>
      {doc.status === 'ready' && (
        <Link
          title="Ask about this document"
          aria-label={`Ask about ${doc.file_name}`}
          href={`${w.base}/chat`}
          onClick={() => {
            w.clear();
            w.setSelected([doc.document_id]);
          }}
        >
          <MessageSquare size={16} />
          <span>Ask about this</span>
        </Link>
      )}
      <button
        aria-label={`Delete ${doc.file_name}`}
        onClick={() => {
          setError('');
          setDeleting(doc);
        }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
  return (
    <div className={styles.library}>
      <div className={styles.heading}>
        <div>
          <h1>Documents</h1>
          <p>Manage the documents that power your answers.</p>
        </div>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.searchCard}>
          <label>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search documents..."
              aria-label="Search documents"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <span className={styles.count} aria-live="polite">
            {search.trim() ? `${filtered.length} of ` : ''}
            {w.docs.length} document{w.docs.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button className={styles.primary} onClick={() => w.setUploadOpen(true)}>
          <Upload size={17} />
          Upload documents
        </button>
      </div>
      <section className={styles.panel} aria-label="Document library">
        {!w.preview && w.documentsQuery.isPending ? (
          <p role="status">Loading your documents…</p>
        ) : !w.preview && w.documentsQuery.isError ? (
          <div className="notice" role="alert">
            Documents could not be loaded.{' '}
            <button onClick={() => void w.refresh()}>
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : w.docs.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <FolderOpen size={42} />
            </div>
            <h2>No documents in your knowledge base yet</h2>
            <p>
              Upload your first document and start a conversation.
              <br />
              Your answers will link back to the original passages.
            </p>
            <button className={styles.primary} onClick={() => w.setUploadOpen(true)}>
              <Upload size={17} />
              Upload your first document
            </button>
            <small>
              PDF, DOCX, TXT, MD · up to {formatSize(w.config?.max_file_size_bytes || 20971520)}
            </small>
          </div>
        ) : !filtered.length ? (
          <div className={styles.empty}>
            <Search size={28} />
            <h2>No matching documents</h2>
            <p>Try another filename.</p>
            <button onClick={() => setSearch('')}>Clear search</button>
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Document name</th>
                    <th>Size</th>
                    <th>Chunks</th>
                    <th>Uploaded</th>
                    <th>Status</th>
                    <th>
                      <span className="srOnly">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.document_id}>
                      <td>
                        <div className={styles.fileName}>
                          <span>
                            <FileText size={19} />
                          </span>
                          <div>
                            <strong>{doc.file_name}</strong>
                            <small>{doc.file_type.toUpperCase()}</small>
                          </div>
                        </div>
                      </td>
                      <td>{formatSize(doc.size_bytes)}</td>
                      <td>{w.preview ? '—' : doc.num_chunks}</td>
                      <td>
                        {new Date(doc.ingested_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          timeZone: 'UTC',
                        })}
                      </td>
                      <td>
                        <span className={styles.status}>{w.preview ? 'Example' : doc.status}</span>
                      </td>
                      <td>{actions(doc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.cards}>
              {filtered.map((doc) => (
                <article key={doc.document_id}>
                  <div className={styles.fileName}>
                    <span>
                      <FileText size={21} />
                    </span>
                    <div>
                      <strong>{doc.file_name}</strong>
                      <small>
                        {doc.file_type.toUpperCase()} · {formatSize(doc.size_bytes)}
                      </small>
                    </div>
                  </div>
                  <p>
                    {w.preview ? 'Example document' : `${doc.num_chunks} chunks · ${doc.status}`}
                  </p>
                  {actions(doc)}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
      {deleting && (
        <ConfirmDialog
          title="Delete document"
          description="This document will be removed from your library and future answers. Existing conversation excerpts will remain."
          subject={deleting.file_name}
          confirmLabel="Delete document"
          pendingLabel="Deleting..."
          busy={busy}
          error={error}
          onClose={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
