'use client';

import { useEffect, useRef } from 'react';
import { ArrowUpRight, BookOpen, FileText, Quote } from 'lucide-react';
import styles from './Landing.module.scss';

export function DocumentScene() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    // Load only this decorative island; the page and document text stay server rendered.
    void import('./hero-motion')
      .then(({ animateDocuments }) => {
        if (!disposed) cleanup = animateDocuments(element);
      })
      .catch(() => {
        /* The original static document composition remains usable. */
      });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);
  return (
    <div ref={root} className={styles.documentScene} aria-hidden="true" data-hero-scene>
      <div className={styles.orbit}>
        <span className={styles.orbitLight} data-orbit-light />
      </div>
      <div className={styles.backDoc} data-document-layer="back">
        <FileText size={28} />
        <span />
        <span />
        <span />
        <small>RESEARCH NOTES</small>
      </div>
      <div className={styles.frontDoc} data-document-layer="front">
        <div>
          <FileText size={25} />
          <small>KNOWLEDGE, CONNECTED</small>
        </div>
        <h3>
          From information
          <br />
          to understanding.
        </h3>
        <span />
        <span />
        <span className={styles.highlight} />
        <span />
        <div className={styles.docBottom}>
          <span>DOCUMENT WORKSPACE</span>
          <BookOpen size={22} />
        </div>
      </div>
      <div className={styles.sourceChip} data-document-layer="source">
        <Quote size={17} />
        <span>Answers with sources</span>
        <ArrowUpRight size={16} />
      </div>
    </div>
  );
}
