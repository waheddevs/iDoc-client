import type { Metadata } from 'next';
import '@/styles/globals.scss';
import { Providers } from './providers';
export const metadata: Metadata = {
  title: { default: 'iDoc — Your documents. Clear answers.', template: '%s · iDoc' },
  description: 'Ask questions about your documents and inspect the passages behind each answer.',
  icons: { icon: '/logo/idoc-favicon-black.png', apple: '/logo/idoc-favicon-black.png' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skipLink" href="#main">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
