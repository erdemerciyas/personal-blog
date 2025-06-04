import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '../lib/auth'
import { config } from '../lib/config'
import Header from '../components/Header'
import ClientWrapper from '../components/ClientWrapper'
import ConditionalFooter from '../components/ConditionalFooter'
import Providers from '../components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: config.app.name,
  description: 'Modern kişisel blog ve portfolio sitesi',
  keywords: ['nextjs', 'react', 'typescript', 'portfolio', 'blog', 'engineering'],
  authors: [{ name: 'Erdem Erciyas', url: 'https://www.erdemerciyas.com.tr' }],
  creator: 'Erdem Erciyas',
  publisher: 'Erdem Erciyas',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: config.app.url,
    title: config.app.name,
    description: 'Modern kişisel blog ve portfolio sitesi',
    siteName: config.app.name,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Add your Google verification code
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        {/* Performance and SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased`}>
        <Providers session={session}>
          <ClientWrapper>
            <Header />

            {/* Main content area with consistent container */}
            <main className="flex-grow">
              {children}
            </main>

            <ConditionalFooter />
          </ClientWrapper>
        </Providers>
        
        {/* Development tools */}
        {config.isDevelopment && (
          <div id="dev-tools" className="fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100 transition-opacity">
            <div className="bg-gray-900 text-white p-2 rounded text-xs">
              <div>ENV: {config.nodeEnv}</div>
              <div>Cloudinary: {config.cloudinary.isConfigured ? '✅' : '❌'}</div>
              <div>OpenAI: {config.openai.isConfigured ? '✅' : '❌'}</div>
            </div>
          </div>
        )}
      </body>
    </html>
  )
} 