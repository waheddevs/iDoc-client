import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main" style={{ padding: 40, maxWidth: 640, margin: '80px auto' }}>
      <span className="eyebrow">404 · Page not found</span>
      <h1>Nothing to see here.</h1>
      <p>Return to your document workspace.</p>
      <Link className="button primary" href="/">
        Go home
      </Link>
    </main>
  );
}
