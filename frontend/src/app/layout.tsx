import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Prompt Bulk Tool',
  description: 'Webapp für Bulk-Prompt-Erstellung und automatisierte Ausführung',
  keywords: ['AI', 'Prompts', 'Automation', 'ChatGPT', 'Claude', 'Gemini'],
  authors: [{ name: 'Prompt Bulk Tool Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50 antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}