'use client';
import { useEffect, useRef, useState } from 'react';
import { Sparkles, FileText, RotateCcw, Copy, Check, ChevronRight, Upload } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { useWorkspace } from '@/features/workspace/WorkspaceContext';
import type { Message } from '@/lib/api/types';
import { MessageContent } from './MessageContent';
import { ChatComposer } from './ChatComposer';
import { isInsufficientAnswer } from './source-utils';
import styles from './ChatWorkspace.module.scss';
export function ChatWorkspace() {
  const w = useWorkspace();
  const [question, setQuestion] = useState('');
  const { pending, setPending, chatError: error, setChatError: setError } = w;
  const [copied, setCopied] = useState<number | null>(null);
  const [focusVersion, setFocusVersion] = useState(0);
  const lock = useRef(false);
  const threadEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (w.messages.length) threadEnd.current?.scrollIntoView({ block: 'end', behavior: 'instant' });
  }, [w.messages.length, pending]);
  const ready = w.docs.filter((d) => d.status === 'ready');
  const send = async (retry = false) => {
    if (lock.current || pending || !ready.length || (!retry && !question.trim())) return;
    if (w.scopeInvalid) {
      setError('A selected document is no longer ready. Choose available documents before asking.');
      w.setScopeOpen(true);
      return;
    }
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
    setFocusVersion((v) => v + 1);
  };
  const loading = !w.preview && w.documentsQuery.isPending;
  const failed = !w.preview && w.documentsQuery.isError;
  const composer = (
    <ChatComposer
      question={question}
      onChange={setQuestion}
      onSend={() => void send()}
      focusVersion={focusVersion}
    />
  );
  return (
    <div className={styles.chat}>
      {!w.messages.length ? (
        <div className={styles.welcome}>
          <div className={styles.welcomeIcon}>
            <FileText size={26} />
          </div>
          <h1>
            {loading || failed
              ? 'Your document workspace'
              : ready.length
                ? 'What would you like to know?'
                : 'Start with a document'}
          </h1>
          <p className={styles.intro}>
            {ready.length
              ? 'Ask a question. Find answers in your files.'
              : 'Upload a PDF, Word document, or text file to start chatting.'}
          </p>
          {loading ? (
            <p className={styles.pending} role="status">
              <Spinner size={20} />
              Loading your documents...
            </p>
          ) : failed ? (
            <div className="notice" role="alert">
              Could not load documents. <button onClick={() => void w.refresh()}>Try again</button>
            </div>
          ) : (
            !ready.length && (
              <button
                className={'primary ' + styles.uploadCta}
                onClick={() => w.setUploadOpen(true)}
              >
                <Upload size={18} />
                Upload a document
              </button>
            )
          )}
          {composer}
          {ready.length > 0 && (
            <div className={styles.prompts}>
              <button onClick={() => prompt('Summarize the key points in this document.')}>
                Summarize a document
              </button>
              <button onClick={() => prompt('What are the key requirements?')}>
                Find key requirements
              </button>
              <button onClick={() => prompt('Compare the main ideas across these documents.')}>
                Compare documents
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className={styles.thread}>
            {w.messages.map((message, index) => (
              <article
                key={index}
                className={message.role === 'user' ? styles.user : styles.answer}
                aria-label={message.role === 'user' ? 'Your message' : 'iDoc response'}
              >
                {message.role === 'assistant' && (
                  <div className={styles.author}>
                    <Sparkles size={18} /> iDoc {w.preview && <span>Example response</span>}
                  </div>
                )}
                <div className={styles.messageContent}>
                  <MessageContent message={message} />
                </div>
                {message.role === 'assistant' && (
                  <>
                    {isInsufficientAnswer(message.content) && (
                      <p className={styles.answerHint}>
                        Try a more specific question or choose another document. Retrieved passages
                        may not contain an answer.
                      </p>
                    )}
                    <div className={styles.answerActions}>
                      <button
                        aria-label={copied === index ? 'Copied' : 'Copy answer'}
                        title={copied === index ? 'Copied' : 'Copy answer'}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(message.content);
                            setCopied(index);
                          } catch {
                            setError('Could not copy the answer. Select the text to copy it.');
                          }
                        }}
                      >
                        {copied === index ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      {!!message.sources?.length && (
                        <button className={styles.citation} onClick={() => w.openSources(message)}>
                          <FileText size={16} />
                          {isInsufficientAnswer(message.content)
                            ? 'Retrieved passages'
                            : 'View sources'}
                          <span>
                            · {message.sources.length}{' '}
                            {message.sources.length === 1 ? 'passage' : 'passages'}
                          </span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </article>
            ))}
            {pending && (
              <p className={styles.pending} role="status">
                <Spinner size={20} />
                Looking through your documents...
              </p>
            )}
            {error && (
              <div className="notice" role="alert">
                {error}
                <div className={styles.errorActions}>
                  {w.messages.at(-1)?.role === 'user' && (
                    <button disabled={pending} onClick={() => void send(true)}>
                      <RotateCcw size={15} />
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
                      setFocusVersion((v) => v + 1);
                    }}
                  >
                    Edit question
                  </button>
                </div>
              </div>
            )}
            <div ref={threadEnd} className={styles.threadEnd} />
          </div>
          <div className={styles.docked}>{composer}</div>
        </>
      )}
    </div>
  );
}
