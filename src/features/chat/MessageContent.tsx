'use client';
import { Children, Fragment, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '@/lib/api/types';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import styles from './ChatWorkspace.module.scss';
export function MessageContent({ message }: { message: Message }) {
  const w = useWorkspace();
  function citations(children: ReactNode) {
    return Children.map(children, (child) => {
      if (typeof child !== 'string') return child;
      return child.split(/(\[S\d+\])/g).map((text, index) => {
        const id = text.slice(1, -1);
        const source = message.sources?.find((s) => s.source_id === id);
        return source ? (
          <button
            key={index}
            className={styles.inlineCitation}
            aria-label={`Open source ${id}`}
            onClick={() => {
              w.openSources(message, id);
            }}
          >
            {text}
          </button>
        ) : (
          <Fragment key={index}>{text}</Fragment>
        );
      });
    });
  }
  return (
    <ReactMarkdown
      skipHtml
      components={{
        p: ({ children }) => <p>{citations(children)}</p>,
        li: ({ children }) => <li>{citations(children)}</li>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        img: ({ alt }) => <span>{alt || 'Image reference'}</span>,
      }}
    >
      {message.content}
    </ReactMarkdown>
  );
}
