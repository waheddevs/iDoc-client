import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  Upload,
  MessageSquare,
  BookOpen,
  Search,
  Layers,
  Quote,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import styles from './Landing.module.scss';
const features = [
  {
    icon: FileText,
    title: 'Your documents, together',
    text: 'Bring PDFs, Word documents, Markdown, and text files into one focused workspace.',
  },
  {
    icon: MessageSquare,
    title: 'Ask in your own words',
    text: 'Move from reading every page to asking the questions that matter to you.',
  },
  {
    icon: Quote,
    title: 'Go straight to the source',
    text: 'Open the exact passages behind an answer and check the details yourself.',
  },
  {
    icon: Layers,
    title: 'Choose your context',
    text: 'Ask across your library or narrow the conversation to selected documents.',
  },
];
const faqs = [
  [
    'Which files can I use?',
    'Upload PDF, DOCX, TXT, or Markdown files. The default limit is 20 MiB per file. PDFs need searchable text; scanned-image OCR is not currently supported.',
  ],
  [
    'Where do the answers come from?',
    'iDoc retrieves passages from your selected documents and sends them to the configured answer model. Source references let you inspect those passages. Always verify important details.',
  ],
  [
    'Is all processing local?',
    'It depends on the workspace configuration. Answer and embedding providers can run locally or in the cloud. The settings panel shows the configured processing location.',
  ],
  [
    'Are conversations saved?',
    'Your current conversation stays in memory for the active workspace session. Refreshing the page clears it. Uploaded documents are managed by the connected backend.',
  ],
];
export function Landing() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" aria-label="iDoc home">
          <Logo />
        </Link>
        <div className={styles.navLinks}>
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </div>
        <Link href="/login" className="button">
          Sign in <ArrowUpRight size={15} />
        </Link>
      </nav>
      <main id="main">
        <section className={styles.hero}>
          <div className={styles.glow} />
          <div className={styles.heroCopy}>
            <span className={styles.badge}>
              <i />
              YOUR DOCUMENT WORKSPACE
            </span>
            <h1>
              Your documents.
              <br />
              <span>Clear answers.</span>
            </h1>
            <p>
              Turn the information you already have into the answers you need. Ask, explore, and
              follow every insight back to its source.
            </p>
            <div className={styles.heroActions}>
              <Link className="button primary" href="/chat">
                Open workspace <ArrowRight size={17} />
              </Link>
              <a className="button" href="#how-it-works">
                See how it works
              </a>
            </div>
            <Link href="/preview/chat" className={styles.previewLink}>
              Explore frontend preview <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className={styles.documentScene} aria-hidden="true">
            <div className={styles.orbit} />
            <div className={styles.backDoc}>
              <FileText size={28} />
              <span />
              <span />
              <span />
              <small>RESEARCH NOTES</small>
            </div>
            <div className={styles.frontDoc}>
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
            <div className={styles.sourceChip}>
              <Quote size={17} />
              <span>Answers with sources</span>
              <ArrowUpRight size={16} />
            </div>
          </div>
        </section>
        <ProductPreview />
        <section className={styles.section} id="how-it-works">
          <span className="eyebrow">A simpler way to find answers</span>
          <h2>
            From document to insight.
            <br />
            <span>In three steps.</span>
          </h2>
          <div className={styles.steps}>
            {[
              {
                icon: Upload,
                title: 'Bring your documents',
                text: 'Upload the files you want to understand. Keep them organized in your library.',
              },
              {
                icon: MessageSquare,
                title: 'Start a conversation',
                text: 'Ask a question. Select a document, or let your whole library provide context.',
              },
              {
                icon: BookOpen,
                title: 'Follow the source',
                text: 'Inspect the supporting passage. See exactly where the information came from.',
              },
            ].map((step, i) => (
              <article key={step.title}>
                <div>
                  <step.icon size={22} />
                  <span>0{i + 1}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.section} id="features">
          <span className="eyebrow">Built for focused work</span>
          <h2>
            Less searching.
            <br />
            <span>More understanding.</span>
          </h2>
          <div className={styles.features}>
            {features.map((feature) => (
              <article key={feature.title}>
                <feature.icon size={23} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={`${styles.section} ${styles.spotlight}`}>
          <div>
            <span className="eyebrow">Context you can inspect</span>
            <h2>
              An answer is just
              <br />
              the beginning.
            </h2>
            <p>
              Follow a citation to its original passage. Keep your source material in view, and make
              your own judgment about what it supports.
            </p>
            <Link className="button" href="/preview/chat">
              Explore the workspace <ArrowRight size={16} />
            </Link>
          </div>
          <article className={styles.sourceExample}>
            <header>
              <BookOpen size={18} />
              Source inspector <span>EXAMPLE</span>
            </header>
            <div>
              <small className="eyebrow">S1 · Example passage</small>
              <h3>Workspace_Guide.pdf</h3>
              <blockquote>
                “Upload your documents, ask a question, then inspect the original source.”
              </blockquote>
              <p>
                <ShieldCheck size={15} />
                Original passage, available alongside the answer.
              </p>
            </div>
          </article>
        </section>
        <section className={`${styles.section} ${styles.faq}`} id="faq">
          <div>
            <span className="eyebrow">A few useful answers</span>
            <h2>Before you begin.</h2>
          </div>
          <div>
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <ChevronDown size={17} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className={styles.finalCta}>
          <span className="eyebrow">Make room for understanding</span>
          <h2>
            Your next answer
            <br />
            is in your documents.
          </h2>
          <Link className="button primary" href="/chat">
            Open workspace <ArrowRight size={17} />
          </Link>
        </section>
      </main>
      <footer className={styles.footer}>
        <Link href="/" aria-label="iDoc home">
          <Logo />
        </Link>
        <span>A focused space for your documents.</span>
        <Link href="/login">
          Sign in <ArrowUpRight size={14} />
        </Link>
      </footer>
    </div>
  );
}
function ProductPreview() {
  return (
    <section className={styles.product} aria-label="Illustrative product preview">
      <div className={styles.productHeader}>
        <span>
          <i />
          Inside your workspace
        </span>
        <span>ILLUSTRATIVE EXAMPLE</span>
      </div>
      <div className={styles.productBody}>
        <aside>
          <Logo />
          <span>
            <MessageSquare size={15} />
            Chat
          </span>
          <span>
            <FileText size={15} />
            Documents
          </span>
        </aside>
        <div className={styles.productChat}>
          <div className={styles.productQuestion}>How do I find the source behind an answer?</div>
          <div className={styles.exampleAnswer}>
            <span className="accent">
              <MessageSquare size={18} />
            </span>
            <div>
              <strong>Connect the answer to its context.</strong>
              <p>
                Open a source reference to inspect the original passage alongside your conversation.
              </p>
              <span className={styles.sourceTag}>S1 · Workspace_Guide.pdf</span>
            </div>
          </div>
          <div className={styles.exampleInput}>
            <Search size={15} />
            Ask your documents…
            <ArrowRight size={16} />
          </div>
        </div>
        <div className={styles.productSource}>
          <span className="eyebrow">Source · S1</span>
          <h3>Workspace_Guide.pdf</h3>
          <blockquote>
            Inspect the original source to verify the details behind an answer.
          </blockquote>
          <small>Example content</small>
        </div>
      </div>
    </section>
  );
}
