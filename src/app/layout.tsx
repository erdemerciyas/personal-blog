import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { config } from '../core/lib/config'
import Header from '../components/Header'
import ClientWrapper from '../components/ClientWrapper'
import ConditionalFooter from '../components/ConditionalFooter'
import Providers from '../components/Providers'
import connectDB, { hasValidMongoUri } from '../lib/mongoose'
import SiteSettings from '../models/SiteSettings'
import Plugin from '../models/Plugin'
import Script from 'next/script'
import FloatingCta from '../components/FloatingCta';
import GlobalBreadcrumbsJsonLd from '../components/seo/GlobalBreadcrumbsJsonLd';
import PageTransitionWrapper from '../components/PageTransitionWrapper';

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
    const seoPlugin = await Plugin.findOne({ slug: 'seo-plugin', isActive: true });

    // Default SEO from Site Settings
    let title = siteSettings.siteName || 'Personal Blog';
    let description = siteSettings.description || 'Kişisel blog ve portfolyo sitesi';
    let keywords = siteSettings.seo?.keywords || [];

    // Override/Enhance with Plugin if active
    if (seoPlugin && seoPlugin.config) {
      if (seoPlugin.config.metaTitleSuffix && siteSettings.siteName) {
        title = `${siteSettings.siteName}${seoPlugin.config.metaTitleSuffix}`;
      }
      if (seoPlugin.config.globalMetaDescription) {
        description = seoPlugin.config.globalMetaDescription;
      }
      if (seoPlugin.config.globalKeywords && Array.isArray(seoPlugin.config.globalKeywords)) {
        keywords = [...keywords, ...seoPlugin.config.globalKeywords];
      }
    } else {
      // Fallback to old Site Settings SEO object
      if (siteSettings.seo?.metaTitle) title = siteSettings.seo.metaTitle;
      if (siteSettings.seo?.metaDescription) description = siteSettings.seo.metaDescription;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fixral.com';
    const logoUrl = typeof siteSettings.logo === 'string' ? siteSettings.logo : siteSettings.logo?.url;
    const googleVerification = siteSettings?.analytics?.googleSiteVerification || ENV_GOOGLE_VERIFICATION;

    // Analytics Verification from Plugin?
    const analyticsPlugin = await Plugin.findOne({ slug: 'analytics-plugin', isActive: true });
    let finalVerification = googleVerification;
    if (analyticsPlugin && analyticsPlugin.config?.googleSiteVerification) {
      finalVerification = analyticsPlugin.config.googleSiteVerification;
    }

    return {
      title: title,
      description: description,
      keywords: keywords,
      metadataBase: new URL(baseUrl),
      openGraph: {
        title: title,
        description: description,
        url: baseUrl,
        siteName: siteSettings.siteName,
        locale: 'tr_TR',
        type: 'website',
        images: [
          {
            url: siteSettings.logo?.url || '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image', // Could come from plugin config
        title: title,
        description: description,
        images: [siteSettings.logo?.url || '/og-image.jpg'],
      },
      verification: {
        google: finalVerification || undefined,
      },
      icons: {
        icon: siteSettings.favicon || logoUrl || '/favicon.svg',
        apple: siteSettings.favicon || logoUrl || '/favicon.svg',
      },
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: config.app.name,
      description: 'Modern kişisel blog ve portfolio sitesi',
      icons: {
        icon: '/favicon.svg',
        apple: '/favicon.svg',
      },
      metadataBase: new URL(config.app.url),
    };
  }
}

import { ThemeProvider } from '../context/ThemeContext';
import { ActiveThemeProvider } from '../providers/ActiveThemeProvider';
import { LoadingBar } from '../components';
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
      // Use SiteSettings single source of truth
      const siteSettings = await SiteSettings.getSiteSettings();

      // Check if analytics plugin is active
      const analyticsPlugin = await Plugin.findOne({ slug: 'analytics-plugin', isActive: true });

      if (analyticsPlugin && analyticsPlugin.config) {
        if (analyticsPlugin.config.enablePageViewTracking) {
          gaId = analyticsPlugin.config.googleAnalyticsId || undefined;
          gtmId = analyticsPlugin.config.googleTagManagerId || undefined;
        }
      } else {
        // Fallback to SiteSettings (Deprecated path, but kept for safety if plugin logic fails)
        if (siteSettings?.analytics?.enableAnalytics) {
          gaId = siteSettings.analytics.googleAnalyticsId || undefined;
          gtmId = siteSettings.analytics.googleTagManagerId || undefined;
        }
      }

    } catch (e) {
      console.error('Layout settings load error:', e);
    }
  }

  // Only use env fallback if DB didn't provide them AND we want to default to them?
  // Current logic: DB overrides env if DB exists. 
  // If DB retrieval failed or returned empty, usage of env is acceptable for dev/fallback.
  if (!gaId) gaId = ENV_GA_ID || undefined;
  if (!gtmId) gtmId = ENV_GTM_ID || undefined;


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
          <ActiveThemeProvider>
            <ToastProvider>
              <LoadingBar />
              <Providers>
                <ClientWrapper>
                  <Header />
                  <GlobalBreadcrumbsJsonLd />
                  <FloatingCta />
                  {/* Main content area with smooth transitions */}
                  <PageTransitionWrapper>
                    <div className="relative flex-grow">
                      <main id="main-content" className="relative z-100">
                        <div>{children}</div>
                      </main>
                    </div>
                  </PageTransitionWrapper>

                  <ConditionalFooter />
                </ClientWrapper>
              </Providers>
              {/* Global toast viewport */}
              <FixralToastViewport />
            </ToastProvider>
          </ActiveThemeProvider>
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