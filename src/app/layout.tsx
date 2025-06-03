import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import ClientWrapper from '@/components/ClientWrapper';
import ConditionalFooter from '@/components/ConditionalFooter';

const inter = Inter({ subsets: ['latin'] });

// Remove metadata export since this needs to be a client component due to SessionProvider
// Metadata will be handled in individual pages as needed

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <title>Kişisel Blog - Teknoloji & Mühendislik</title>
        <meta name="description" content="Modern teknoloji ve mühendislik çözümleri." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Erdem Erciyas" />
        <meta name="developer" content="Erdem Erciyas" />
        <meta name="creator" content="Erdem Erciyas" />
        <meta name="copyright" content="© 2024 Erdem Erciyas. All rights reserved." />
        <meta property="og:site_name" content="Erdem Erciyas - Kişisel Blog" />
        <meta name="twitter:creator" content="@erdemdev" />
        <link rel="author" href="https://www.erciyasengineering.com" />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased`}>
        <ClientWrapper>
          <Header />

          {/* Main content area with consistent container */}
          <main className="flex-grow">
            {children}
          </main>

          <ConditionalFooter />
        </ClientWrapper>
      </body>
    </html>
  );
} 