import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import type { User } from '@/lib/api/types';
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
import { LandingMotion } from './LandingMotion';
import { DocumentScene } from './DocumentScene';
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
    'Yes. Questions, answers, and source excerpts are saved automatically in your workspace. Reopen previous conversations from Your chats in the sidebar. The frontend preview uses temporary example chats.',
  ],
];
export function Landing({ user = null }: { user?: User | null }) {
  return (
    <LandingMotion className={styles.page}>
      <nav data-reveal="down" className={styles.nav} aria-label="Main navigation">
        <Link href="/" aria-label="iDoc home">
          <Logo />
        </Link>
        <div className={styles.navLinks}>
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </div>
        {user ? (
          <Link href="/chat" aria-label="Open your dashboard" className={styles.profileLink}>
            <Avatar user={user} />
            <span>{user.name || user.email.split('@')[0]}</span>
          </Link>
        ) : (
          <Link href="/login" className="main-button">
            Sign in <ArrowUpRight size={15} />
          </Link>
        )}
      </nav>
      <main id="main">
        <section className={styles.hero}>
          <div className={styles.glow} />
          <div className={styles.heroCopy}>
            <span data-reveal="down" className={styles.badge}>
              <i />
              YOUR DOCUMENT WORKSPACE
            </span>
            <h1 data-reveal="focus" data-delay="80">
              Your documents.
              <br />
              <span>Clear answers.</span>
            </h1>
            <p data-reveal="rise" data-delay="160">
              Turn the information you already have into the answers you need. Ask, explore, and
              follow every insight back to its source.
            </p>
            <div data-reveal="rise" data-delay="240" className={styles.heroActions}>
              <Link className="button primary" href="/chat">
                Open workspace <ArrowRight size={17} />
              </Link>
              <a className="button" href="#how-it-works">
                See how it works
              </a>
            </div>
            <Link
              href="/preview/chat"
              className={styles.previewLink}
              data-reveal="left"
              data-delay="320"
            >
              Explore frontend preview <ArrowUpRight size={14} />
            </Link>
          </div>
          <DocumentScene />
        </section>
        <ProductPreview />
        <section className={styles.section} id="how-it-works">
          <span data-reveal="down" className="eyebrow">
            A simpler way to find answers
          </span>
          <h2 data-reveal="focus" data-delay="80">
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
              <article
                key={step.title}
                data-reveal={['left', 'rise', 'right'][i]}
                data-delay={i * 90}
              >
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
          <span data-reveal="down" className="eyebrow">
            Built for focused work
          </span>
          <h2 data-reveal="focus" data-delay="80">
            Less searching.
            <br />
            <span>More understanding.</span>
          </h2>
          <div className={styles.features}>
            {features.map((feature, i) => (
              <article
                key={feature.title}
                data-reveal={['expand', 'card', 'left', 'right'][i]}
                data-delay={i * 80}
              >
                <feature.icon size={23} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={`${styles.section} ${styles.spotlight}`}>
          <div data-reveal="left">
            <span data-reveal="down" className="eyebrow">
              Context you can inspect
            </span>
            <h2 data-reveal="focus" data-delay="80">
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
          <article data-reveal="right" data-delay="120" className={styles.sourceExample}>
            <header>
              <BookOpen size={18} />
              Source inspector <span>EXAMPLE</span>
            </header>
            <div>
              <small className="eyebrow">S1 · Example passage</small>
              <h3>Workspace_Guide.pdf</h3>
              <blockquote data-reveal="line" data-delay="240">
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
            <span data-reveal="down" className="eyebrow">
              A few useful answers
            </span>
            <h2 data-reveal="focus" data-delay="80">
              Before you begin.
            </h2>
          </div>
          <div>
            {faqs.map(([question, answer], i) => (
              <details key={question} data-reveal="right" data-delay={i * 70}>
                <summary>
                  {question}
                  <ChevronDown size={17} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section data-reveal="glow" className={styles.finalCta}>
          <span data-reveal="down" className="eyebrow">
            Make room for understanding
          </span>
          <h2 data-reveal="focus" data-delay="80">
            Your next answer
            <br />
            is in your documents.
          </h2>
          <Link className="button primary" href="/chat">
            Open workspace <ArrowRight size={17} />
          </Link>
        </section>
      </main>
      <footer data-reveal="rise" className={styles.footer}>
        <Link href="/" aria-label="iDoc home">
          <Logo />
        </Link>
        <span>A focused space for your documents.</span>
        <Link href="/login">
          Sign in <ArrowUpRight size={14} />
        </Link>
      </footer>
    </LandingMotion>
  );
}
function ProductPreview() {
  return (
    <section
      data-reveal="card"
      className={styles.product}
      aria-label="Illustrative product preview"
    >
      <div data-reveal="down" data-delay="80" className={styles.productHeader}>
        <span>
          <i />
          Inside your workspace
        </span>
        <span>ILLUSTRATIVE EXAMPLE</span>
      </div>
      <div className={styles.productBody}>
        <aside data-reveal="left" data-delay="100">
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
          <div data-reveal="rise" data-delay="160" className={styles.productQuestion}>
            How do I find the source behind an answer?
          </div>
          <div data-reveal="rise" data-delay="260" className={styles.exampleAnswer}>
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
          <div data-reveal="line" data-delay="360" className={styles.exampleInput}>
            <Search size={15} />
            Ask your documents…
            <ArrowRight size={16} />
          </div>
        </div>
        <div data-reveal="right" data-delay="300" className={styles.productSource}>
          <span data-reveal="down" className="eyebrow">
            Source · S1
          </span>
          <h3>Workspace_Guide.pdf</h3>
          <blockquote data-reveal="line" data-delay="240">
            Inspect the original source to verify the details behind an answer.
          </blockquote>
          <small>Example content</small>
        </div>
      </div>
    </section>
  );
}
