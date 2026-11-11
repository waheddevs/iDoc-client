'use client';
import { RefreshCw, Server } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { useWorkspace } from './WorkspaceContext';
import { formatSize } from '@/lib/api/client';
import styles from './WorkspaceDrawers.module.scss';
import { DocumentPicker } from './DocumentPicker';
import { SourcesPanel } from './SourcesPanel';
import { GoogleButton } from '@/features/auth/GoogleButton';
export function WorkspaceDrawers() {
  const w = useWorkspace();
  return (
    <>
      {w.scopeOpen && <DocumentPicker />}
      {w.settingsOpen && (
        <Dialog title="Workspace settings" drawer onClose={() => w.setSettingsOpen(false)}>
          <p>Account connections and read-only processing configuration.</p>
          {!w.preview && !w.local && (
            <section className={styles.section}>
              <h3>Google account</h3>
              <p>
                Link a Google account with the same email to sign in to this workspace. Your
                documents stay in this account.
              </p>
              <GoogleButton returnTo="/chat" intent="link" />
            </section>
          )}
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
              <dt>Model readiness</dt>
              <dd>
                {w.preview
                  ? 'Preview'
                  : w.readinessQuery.isSuccess
                    ? 'Ready'
                    : w.readinessQuery.isPending
                      ? 'Checking…'
                      : w.readinessQuery.error?.message || 'Unavailable'}
              </dd>
              <dt>Access</dt>
              <dd>
                {w.preview
                  ? 'Example data'
                  : w.local
                    ? 'Local single-user workspace'
                    : 'Authenticated workspace'}
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
                void w.readinessQuery.refetch();
              }}
            >
              <RefreshCw size={15} />
              Refresh connection
            </button>
          )}
        </Dialog>
      )}
      {w.activeSource && <SourcesPanel />}
    </>
  );
}
