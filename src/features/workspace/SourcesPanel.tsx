'use client';
import { FileText } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import type { Source } from '@/lib/api/types';
import { useWorkspace } from './WorkspaceContext';
import styles from './WorkspaceDrawers.module.scss';
export function SourcesPanel() {
  const w = useWorkspace();
  if (!w.sources || !w.activeSource) return null;
  const groups = new Map<string, Source[]>();
  for (const source of w.sources)
    groups.set(source.document_id, [...(groups.get(source.document_id) || []), source]);
  const active = w.sources.find((source) => source.source_id === w.activeSource);
  return (
    <Dialog title="Sources" drawer readingPanel onClose={() => w.setActiveSource(null)}>
      <p>
        {w.sourcesAreRetrieved
          ? 'These passages were retrieved, but did not provide enough information to answer your question.'
          : 'Read the original passages found for this response.'}
      </p>
      <div className={styles.sourceGroups}>
        {[...groups.entries()].map(([id, sources]) => (
          <section key={id} className={styles.sourceGroup}>
            <h3>
              <FileText size={17} />
              <span>{sources[0].file_name}</span>
            </h3>
            <div className={styles.tabs}>
              {sources.map((source, index) => (
                <button
                  key={source.source_id}
                  aria-pressed={source.source_id === w.activeSource}
                  onClick={() => w.setActiveSource(source.source_id)}
                >
                  {source.page_label ? 'Page ' + source.page_label + ' · ' : ''}Passage {index + 1}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      {active && (
        <article className={styles.source}>
          <div className={styles.sourceMeta}>
            {active.page_label ? 'Page ' + active.page_label : 'Document excerpt'}
            <span>{active.source_id}</span>
          </div>
          {!w.docs.some((doc) => doc.document_id === active.document_id) && (
            <p className="notice">Document removed · this is a saved excerpt.</p>
          )}
          <blockquote>{active.text}</blockquote>
        </article>
      )}
      <p className={styles.sourceNote}>
        A retrieved passage may not support every claim. Check important details in the original
        document.
      </p>
    </Dialog>
  );
}
