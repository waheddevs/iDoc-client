'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { MessageContent } from './MessageContent';
import {
  ArrowUp,
  Paperclip,
  ChevronDown,
  Sparkles,
  ListChecks,
  Scale,
  FileText,
  ArrowRight,
  BookOpen,
  RotateCcw,
  Copy,
  Check,
  LoaderCircle,
} from 'lucide-react';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import type { Message } from '@/lib/api/types';
import { formatSize } from '@/lib/api/client';
import styles from './ChatWorkspace.module.scss';
export function ChatWorkspace() {
  const w = useWorkspace();
  const [question, setQuestion] = useState('');
  const { pending, setPending, chatError: error, setChatError: setError } = w;
  const [copied, setCopied] = useState<number | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const lock = useRef(false);
  const ready = w.docs.filter((d) => d.status === 'ready');
  const send = async (retry = false) => {
    if (lock.current || pending || !ready.length || (!retry && !question.trim())) return;
    const history: Message[] = retry
      ? w.messages
      : [...w.messages, { role: 'user', content: question.trim() }];
    if (history.length > 32 || history.reduce((n, m) => n + m.content.length, 0) > 24000) {
      setError('This conversation has reached its limit. Start a new chat to continue.');
      return;
    }
    const version = w.conversationVersion.current;
    lock.current = true;
    setPending(true);
    setError('');
    if (!retry) {
      w.setMessages(history);
      setQuestion('');
    }
    try {
      const result = await w.answer(history);
      if (version !== w.conversationVersion.current) return;
      const content = result.choices[0]?.message.content;
      if (!content)
        throw new Error('No supporting answer was returned. Try a more specific question.');
      w.setMessages([...history, { role: 'assistant', content, sources: result.sources || [] }]);
    } catch (e) {
      if (version === w.conversationVersion.current)
        setError(e instanceof Error ? e.message : 'The answer could not be completed.');
    } finally {
      lock.current = false;
      if (version === w.conversationVersion.current) setPending(false);
    }
  };
  const prompt = (text: string) => {
    setQuestion(text);
    textarea.current?.focus();
  };
  const composer = (
    <div className={styles.composer}>
      <label className="srOnly" htmlFor="question">
        Ask a question
      </label>
      <textarea
        ref={textarea}
        id="question"
        placeholder={
          ready.length ? 'What would you like to know?' : 'Upload a document to get started…'
        }
        value={question}
        maxLength={8000}
        disabled={pending}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (!error) void send();
          }
        }}
      />
      <div className={styles.composerBottom}>
        <button className={styles.scope} onClick={() => w.setScopeOpen(true)}>
          <BookOpen size={15} />
          <span>
            {w.selectedIds.length
              ? `${w.selectedIds.length} selected`
              : `All documents (${ready.length})`}
          </span>
          <ChevronDown size={13} />
        </button>
        <div>
          <button
            className={styles.attach}
            aria-label="Upload documents"
            onClick={() => w.setUploadOpen(true)}
          >
            <Paperclip size={18} />
          </button>
          <button
            className={`primary ${styles.send}`}
            aria-label="Send question"
            disabled={!question.trim() || pending || !ready.length || !!error}
            onClick={() => void send()}
          >
            {pending ? <LoaderCircle size={20} /> : <ArrowUp size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
  return (
    <div className={`${styles.chat} ${w.messages.length ? styles.active : ''}`}>
      {!w.messages.length ? (
        <div className={styles.welcome}>
          <div className={styles.horizon} />
          <span className={styles.badge}>
            <i />
            YOUR DOCUMENT WORKSPACE
          </span>
          <h1>
            Your documents.
            <br className={styles.mobileBreak} />
            <span> Clear answers.</span>
          </h1>
          <p className={styles.intro}>
            Ask questions, uncover insights, and trace
            <br className={styles.desktopBreak} /> every answer back to its source.
          </p>
          {composer}
          <div className={styles.prompts}>
            <button onClick={() => prompt('Summarize the key points in this document.')}>
              <Sparkles size={17} />
              Summarize a document
            </button>
            <button onClick={() => prompt('What are the key requirements?')}>
              <ListChecks size={17} />
              Find key requirements
            </button>
            <button onClick={() => prompt('Compare the main ideas across these documents.')}>
              <Scale size={17} />
              Compare information
            </button>
          </div>
          <section className={styles.corpus}>
            <div className={styles.corpusTitle}>
              <span className="eyebrow">
                <i />
                Active documents ({ready.length})
              </span>
              <Link href={`${w.base}/documents`}>
                Manage <ArrowRight size={14} />
              </Link>
            </div>
            {!w.preview && w.documentsQuery.isError ? (
              <div className="notice" role="alert">
                Could not load documents.{' '}
                <button onClick={() => void w.refresh()}>Try again</button>
              </div>
            ) : !w.preview && w.documentsQuery.isPending ? (
              <p role="status">Loading documents…</p>
            ) : ready.length ? (
              <div className={styles.corpusGrid}>
                {ready.slice(0, 4).map((doc) => (
                  <button
                    key={doc.document_id}
                    onClick={() => w.setSelected([doc.document_id])}
                    aria-pressed={w.selectedIds.includes(doc.document_id)}
                  >
                    <FileText size={21} />
                    <strong>{doc.file_name}</strong>
                    <small>
                      <span>{w.preview ? 'Example' : `${doc.num_chunks} chunks`}</span>
                      <span>{formatSize(doc.size_bytes)}</span>
                    </small>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <FileText size={23} />
                <span>Your knowledge base is ready for its first document.</span>
                <button onClick={() => w.setUploadOpen(true)}>
                  Upload a document <ArrowRight size={14} />
                </button>
              </div>
            )}
          </section>
          <div className={styles.footer}>
            <BookOpen size={14} />
            <span>Answers with original source passages</span>
            <span className={styles.footerDivider}>·</span>
            <span>{w.preview ? 'Example workspace' : `${ready.length} documents ready`}</span>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.thread}>
            <div className={styles.sessionLabel}>
              CURRENT CONVERSATION <span>Session only</span>
            </div>
            {w.messages.map((message, index) => (
              <article
                key={index}
                className={message.role === 'user' ? styles.user : styles.answer}
              >
                <div className={styles.author}>
                  {message.role === 'assistant' ? (
                    <>
                      <span className={styles.aiIcon}>
                        <Sparkles size={16} />
                      </span>
                      iDoc
                      <span className="muted">
                        {w.preview ? 'Example response' : 'Document answer'}
                      </span>
                    </>
                  ) : (
                    <span>You</span>
                  )}
                </div>
                <div className={styles.messageContent}>
                  <MessageContent message={message} />
                </div>
                {message.role === 'assistant' && (
                  <div className={styles.answerActions}>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(message.content);
                          setCopied(index);
                        } catch {
                          setError('Could not copy the answer. Select the text to copy it.');
                        }
                      }}
                    >
                      {copied === index ? <Check size={14} /> : <Copy size={14} />}{' '}
                      {copied === index ? 'Copied' : 'Copy answer'}
                    </button>
                    {message.sources?.map((source) => (
                      <button
                        key={source.source_id}
                        className={styles.citation}
                        onClick={() => {
                          w.setSources(message.sources || []);
                          w.setActiveSource(source.source_id);
                        }}
                      >
                        <FileText size={13} />
                        {source.source_id}
                        <span>{source.file_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}
            {pending && (
              <p className={styles.pending} role="status">
                <LoaderCircle size={18} />
                Finding an answer in your documents…
              </p>
            )}
            {error && (
              <div className="notice" role="alert">
                {error}
                <div className={styles.errorActions}>
                  {w.messages.at(-1)?.role === 'user' && (
                    <button disabled={pending} onClick={() => void send(true)}>
                      <RotateCcw size={14} />
                      Retry answer
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (w.messages.at(-1)?.role === 'user') {
                        setQuestion(w.messages.at(-1)?.content || '');
                        w.setMessages(w.messages.slice(0, -1));
                      }
                      setError('');
                    }}
                  >
                    Edit question
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className={styles.docked}>
            {composer}
            <small>
              Verify important details in the original sources. Enter to send · Shift+Enter for a
              new line.
            </small>
          </div>
        </>
      )}
    </div>
  );
}
