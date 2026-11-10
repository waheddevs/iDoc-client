'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" style={{ padding: 40, maxWidth: 640, margin: '80px auto' }}>
      <h1>We couldn’t load this page</h1>
      <p>The service may be temporarily unavailable. Try again in a moment.</p>
      <button onClick={reset}>Try again</button>{' '}
      <Link className="button" href="/">
        Return home
      </Link>
    </main>
  );
}
