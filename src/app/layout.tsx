import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { config } from '../lib/config'
import Header from '../components/Header'
import ClientWrapper from '../components/ClientWrapper'
import ConditionalFooter from '../components/ConditionalFooter'
import Providers from '../components/Providers'
import connectDB, { hasValidMongoUri } from '../lib/mongoose'
import SiteSettings from '../models/SiteSettings'
import Settings from '../models/Settings'
import Script from 'next/script'
import FloatingCta from '../components/FloatingCta';
import GlobalBreadcrumbsJsonLd from '../components/seo/GlobalBreadcrumbsJsonLd';

// Force dynamic rendering and disable caching for layout/metadata
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Env fallbacks for Google integrations
const ENV_GOOGLE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION
const ENV_GA_ID = process.env.NEXT_PUBLIC_GA_ID
const ENV_GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true,
})

// Lean Settings sonucu için minimal tip
interface ISettingsLean {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
}

// Dynamic metadata function
export async function generateMetadata(): Promise<Metadata> {
  try {
    if (!hasValidMongoUri()) {
      throw new Error('DB_DISABLED');
    }
    await connectDB();

    const siteSettings = await SiteSettings.getSiteSettings();
    const settingsDoc = await Settings.findOne({ isActive: true });

    const title = siteSettings?.seo?.metaTitle || siteSettings?.siteName || config.app.name;
    const description = siteSettings?.seo?.metaDescription || siteSettings?.description || 'Modern kişisel blog ve portfolio sitesi';
    const keywords = siteSettings?.seo?.keywords || ['nextjs', 'react', 'typescript', 'portfolio', 'blog', 'engineering'];
    const siteName = siteSettings?.siteName || config.app.name;
    const logoUrl = siteSettings?.logo?.url;
    const ogImage =
      (logoUrl && (logoUrl.startsWith('http') ? logoUrl : `${config.app.url}${logoUrl}`)) ||
      `${config.app.url}/favicon.svg`;

    return {
      title,
      description,
      keywords,
      authors: [{ name: 'Erdem Erciyas', url: 'https://www.erdemerciyas.com.tr' }],
      creator: 'Erdem Erciyas',
      publisher: 'FIXRAL',
      openGraph: {
        type: 'website',
        locale: 'tr_TR',
        url: config.app.url,
        title,
        description,
        siteName,
        images: [ogImage],
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
        google: settingsDoc?.googleSiteVerification || ENV_GOOGLE_VERIFICATION || undefined,
      },
      alternates: {
        canonical: config.app.url,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
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
      authors: [{ name: 'Erdem Erciyas', url: 'https://www.erdemerciyas.com.tr' }],
      creator: 'Erdem Erciyas',
      publisher: 'FIXRAL',
      openGraph: {
        type: 'website',
        locale: 'tr_TR',
        url: config.app.url,
        title: config.app.name,
        description: 'Modern kişisel blog ve portfolio sitesi',
        siteName: config.app.name,
        images: [`${config.app.url}/favicon.svg`],
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
        google: undefined,
      },
      alternates: {
        canonical: config.app.url,
      },
      twitter: {
        card: 'summary_large_image',
        title: config.app.name,
        description: 'Modern kişisel blog ve portfolio sitesi',
        images: [`${config.app.url}/favicon.svg`],
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
  let gaId: string | undefined;
  let gtmId: string | undefined;
  if (hasValidMongoUri()) {
    try {
      await connectDB();
      const settingsDoc = (await Settings.findOne({ isActive: true }).lean()) as ISettingsLean | null;
      gaId = settingsDoc?.googleAnalyticsId || undefined;
      gtmId = settingsDoc?.googleTagManagerId || undefined;
    } catch (e) {
      console.error('Layout settings load error:', e);
    }
  } else {
    // DB yoksa env değerlerini kullan
    gaId = ENV_GA_ID || undefined;
    gtmId = ENV_GTM_ID || undefined;
  }
  // DB olsa bile boş dönerse env fallback uygula
  gaId = gaId || ENV_GA_ID || undefined;
  gtmId = gtmId || ENV_GTM_ID || undefined;
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        {/* Performance and SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FIXRAL Blog" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* PWA iOS specific */}
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />

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

        {/* JSON-LD: Organization */}
        <Script id="ld-organization" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: config.app.name,
            url: config.app.url,
            logo: `${config.app.url}/favicon.svg`,
            sameAs: [
              'https://www.linkedin.com',
              'https://github.com/erdemerciyas'
            ]
          })}
        </Script>

        {/* JSON-LD: WebSite with SearchAction */}
        <Script id="ld-website" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: config.app.name,
            url: config.app.url,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${config.app.url}/?q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          })}
        </Script>
        {/* Google Tag Manager */}
        {gtmId && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}
        {/* Google Analytics */}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-gtag-init" strategy="afterInteractive">
              {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${inter.variable} font-sans min-h-screen bg-[#f6f7f9] flex flex-col text-fixral-charcoal antialiased`}>
        {/* GTM noscript */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow">
          İçeriğe atla
        </a>
        <ThemeProvider>
          <ToastProvider>
            <LoadingBar />
            <Providers>
              <ClientWrapper>
                <Header />
                <GlobalBreadcrumbsJsonLd />
                <FloatingCta />
                {/* Main content area (flat background) */}
                <div className="relative flex-grow">
                  <main id="main-content" className="relative z-10">
                    <div>{children}</div>
                  </main>
                </div>

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