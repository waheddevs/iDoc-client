'use client';
import { FileText, Check, RefreshCw, Server, BookOpen } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { useWorkspace } from './WorkspaceContext';
import { formatSize } from '@/lib/api/client';
import styles from './WorkspaceDrawers.module.scss';
export function WorkspaceDrawers() {
  const w = useWorkspace();
  return (
    <>
      {w.scopeOpen && (
        <Dialog title="Document scope" onClose={() => w.setScopeOpen(false)}>
          <p>Choose the documents to include in your next question.</p>
          <button className={styles.all} onClick={() => w.setSelected([])}>
            <BookOpen size={17} />
            All ready documents{!w.selectedIds.length && <Check size={16} />}
          </button>
          <div className={styles.options}>
            {w.docs
              .filter((d) => d.status === 'ready')
              .map((d) => (
                <label key={d.document_id}>
                  <input
                    type="checkbox"
                    checked={w.selectedIds.includes(d.document_id)}
                    onChange={(e) =>
                      w.setSelected(
                        e.target.checked
                          ? [...w.selectedIds, d.document_id]
                          : w.selectedIds.filter((id) => id !== d.document_id),
                      )
                    }
                  />
                  <FileText size={17} />
                  <span>{d.file_name}</span>
                </label>
              ))}
          </div>
          {!w.docs.length && <p>No documents yet. Upload a document to get started.</p>}
          <button className="primary" onClick={() => w.setScopeOpen(false)}>
            Apply scope
          </button>
        </Dialog>
      )}
      {w.settingsOpen && (
        <Dialog title="Workspace settings" drawer onClose={() => w.setSettingsOpen(false)}>
          <p>Connection and processing configuration. Read only.</p>
          <section className={styles.section}>
            <h3>
              <Server size={16} />
              Connection
            </h3>
            <dl>
              <dt>Status</dt>
              <dd>
                {w.preview
                  ? 'Preview · not connected'
                  : w.healthQuery.isSuccess
                    ? 'Connected'
                    : w.healthQuery.isPending
                      ? 'Checking…'
                      : 'Unavailable'}
              </dd>
            </dl>
          </section>
          {w.config ? (
            <>
              <section className={styles.section}>
                <h3>Configured models</h3>
                <dl>
                  <dt>Answer provider</dt>
                  <dd>{w.config.answer_provider}</dd>
                  <dt>Answer model</dt>
                  <dd>{w.config.answer_model}</dd>
                  <dt>Embedding provider</dt>
                  <dd>{w.config.embedding_provider}</dd>
                  <dt>Embedding model</dt>
                  <dd>{w.config.embedding_model}</dd>
                </dl>
              </section>
              <section className={styles.section}>
                <h3>Documents</h3>
                <dl>
                  <dt>Supported formats</dt>
                  <dd>{w.config.supported_extensions.join(', ').toUpperCase()}</dd>
                  <dt>Maximum file size</dt>
                  <dd>{formatSize(w.config.max_file_size_bytes)}</dd>
                  <dt>Scanned PDFs</dt>
                  <dd>{w.config.features.ocr ? 'OCR supported' : 'Searchable text required'}</dd>
                </dl>
              </section>
              <section className={styles.section}>
                <h3>Processing</h3>
                <p>
                  {w.preview
                    ? 'No model service is connected in this preview.'
                    : `Answers are processed ${w.config.answer_processing === 'local' ? 'locally' : 'by a cloud service'}. Embeddings are processed ${w.config.embedding_processing === 'local' ? 'locally' : 'by a cloud service'}.`}
                </p>
                <p>
                  Conversation history is kept for this workspace session. Refreshing clears it.
                </p>
              </section>
            </>
          ) : (
            <p role="status">
              {w.configQuery.isError
                ? 'Configuration could not be loaded.'
                : 'Loading configuration…'}
            </p>
          )}
          {!w.preview && (
            <button
              onClick={() => {
                void w.configQuery.refetch();
                void w.healthQuery.refetch();
              }}
            >
              <RefreshCw size={15} />
              Refresh connection
            </button>
          )}
        </Dialog>
      )}
      {w.activeSource && w.sources && (
        <Dialog title="Sources" drawer readingPanel onClose={() => w.setActiveSource(null)}>
          <p>Inspect the original passages behind this answer.</p>
          <div className={styles.tabs}>
            {w.sources.map((source) => (
              <button
                key={source.source_id}
                aria-pressed={w.activeSource === source.source_id}
                onClick={() => w.setActiveSource(source.source_id)}
              >
                {source.source_id}
              </button>
            ))}
          </div>
          {w.sources
            .filter((s) => s.source_id === w.activeSource)
            .map((source) => (
              <article key={source.source_id} className={styles.source}>
                <span className="eyebrow">{source.source_id} · Source passage</span>
                <h3>
                  <FileText size={18} />
                  {source.file_name}
                </h3>
                {source.page_label && <p>Page {source.page_label}</p>}
                {!w.docs.some((d) => d.document_id === source.document_id) && (
                  <p className="notice">Document removed · this is a saved excerpt.</p>
                )}
                <blockquote>{source.text}</blockquote>
              </article>
            ))}
          <p className="muted">
            Sources provide context. Verify important details in the original document.
          </p>
        </Dialog>
      )}
    </>
  );
}
