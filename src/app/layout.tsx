import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'
import './globals.css'
import { config } from '../lib/config'
import Header from '../components/Header'
import ClientWrapper from '../components/ClientWrapper'
import ConditionalFooter from '../components/ConditionalFooter'
import Providers from '../components/Providers'
import connectDB from '../lib/mongoose'
import SiteSettings from '../models/SiteSettings'
import Analytics from '../components/Analytics'
import Script from 'next/script'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true,
})

const oswald = Oswald({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-oswald',
  display: 'swap',
  preload: true,
})

// Get site settings for analytics
async function getSiteSettings() {
  try {
    await connectDB();
    const settings = await SiteSettings.getSiteSettings();
    if (process.env.NODE_ENV === 'development') {
      console.log('Layout - Site settings loaded:', {
        analytics: settings?.analytics,
        hasAnalytics: !!settings?.analytics
      });
    }
    return settings;
  } catch (error) {
    console.error('Site settings fetch error:', error);
    return null;
  }
}

// Dynamic metadata function
export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteSettings = await getSiteSettings();

    const title = siteSettings?.seo?.metaTitle || siteSettings?.siteName || config.app.name;
    const description = siteSettings?.seo?.metaDescription || siteSettings?.description || 'Modern kişisel blog ve portfolio sitesi';
    const keywords = siteSettings?.seo?.keywords || ['nextjs', 'react', 'typescript', 'portfolio', 'blog', 'engineering'];
    const siteName = siteSettings?.siteName || config.app.name;
    const logoUrl = siteSettings?.logo?.url;
    const googleSiteVerification = siteSettings?.analytics?.googleSiteVerification;

    return {
      title,
      description,
      keywords,
      authors: [{ name: 'Extreme Ecu', url: 'https://extremeecu.com' }],
      creator: 'Extreme Ecu',
      publisher: 'Extreme Ecu',
      openGraph: {
        type: 'website',
        locale: 'tr_TR',
        url: config.app.url,
        title,
        description,
        siteName,
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
        google: googleSiteVerification || 'jXX7ASmYpD2OOlPo5cKqGptc9Zy1yLxl00b-JqlQHZE',
      },
      icons: {
        icon: logoUrl || '/favicon.svg',
        apple: logoUrl || '/favicon.svg',
      },
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    // Fallback to static metadata
    return {
      title: config.app.name,
      description: 'Modern kişisel blog ve portfolio sitesi',
      keywords: ['nextjs', 'react', 'typescript', 'portfolio', 'blog', 'engineering'],
      authors: [{ name: 'Extreme Ecu', url: 'https://extremeecu.com' }],
      creator: 'Extreme Ecu',
      publisher: 'Extreme Ecu',
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
        google: 'jXX7ASmYpD2OOlPo5cKqGptc9Zy1yLxl00b-JqlQHZE',
      },
      icons: {
        icon: '/favicon.svg',
        apple: '/favicon.svg',
      },
    };
  }
}

import { ThemeProvider } from '../context/ThemeContext';
import LoadingBar from '../components/LoadingBar';
import { ToastProvider } from '../components/ui/useToast';
import FixralToastViewport from '../components/ui/FixralToast';



export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get site settings for analytics
  const siteSettings = await getSiteSettings();
  
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        {/* Performance and SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.svg" />

        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />



        {/* Analytics Scripts */}
        <Analytics
          googleAnalyticsId={siteSettings?.analytics?.googleAnalyticsId}
          googleTagManagerId={siteSettings?.analytics?.googleTagManagerId}
          googleSiteVerification={siteSettings?.analytics?.googleSiteVerification}
          facebookPixelId={siteSettings?.analytics?.facebookPixelId}
          hotjarId={siteSettings?.analytics?.hotjarId}
        />

        {/* Custom HTML Injection - Raw HTML exactly as entered */}
        {(siteSettings?.analytics?.customScripts?.head || 
          siteSettings?.analytics?.customScripts?.bodyStart || 
          siteSettings?.analytics?.customScripts?.bodyEnd) && (
          <Script
            id="custom-html-injector"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // Head HTML - inject exactly as provided
                  const headHTML = ${JSON.stringify(siteSettings?.analytics?.customScripts?.head || '')};
                  if (headHTML) {
                    document.head.insertAdjacentHTML('beforeend', headHTML);
                  }

                  // Body start HTML - inject at beginning of body
                  const bodyStartHTML = ${JSON.stringify(siteSettings?.analytics?.customScripts?.bodyStart || '')};
                  if (bodyStartHTML) {
                    document.body.insertAdjacentHTML('afterbegin', bodyStartHTML);
                  }

                  // Body end HTML - inject at end of body
                  const bodyEndHTML = ${JSON.stringify(siteSettings?.analytics?.customScripts?.bodyEnd || '')};
                  if (bodyEndHTML) {
                    document.body.insertAdjacentHTML('beforeend', bodyEndHTML);
                  }
                })();
              `
            }}
          />
        )}
      </head>
      <body className={`${inter.variable} ${oswald.variable} font-sans min-h-screen bg-[#f6f7f9] flex flex-col text-slate-800 antialiased`}>

        
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow">
          İçeriğe atla
        </a>
        <ThemeProvider>
          <ToastProvider>
            <LoadingBar />
            <Providers>
              <ClientWrapper>
                <Header />

                {/* Main content area with consistent container */}
                <main id="main-content" className="flex-grow">
                  <div>{children}</div>
                </main>

                <ConditionalFooter />
              </ClientWrapper>
            </Providers>
            {/* Global toast viewport */}
            <FixralToastViewport />
          </ToastProvider>
        </ThemeProvider>

        {/* Development tools - hidden on mobile to avoid UI overlay */}
        {config.isDevelopment && (
          <div id="dev-tools" className="hidden md:block fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
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