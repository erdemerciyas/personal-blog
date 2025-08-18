'use client';

import Script from 'next/script';

interface AnalyticsProps {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  googleSiteVerification?: string;
  facebookPixelId?: string;
  hotjarId?: string;
  customHeadScripts?: string;
  customBodyStartScripts?: string;
  customBodyEndScripts?: string;
}

export default function Analytics({
  googleAnalyticsId,
  googleTagManagerId,
  googleSiteVerification,
  facebookPixelId,
  hotjarId,
  customHeadScripts,
  customBodyStartScripts,
  customBodyEndScripts,
}: AnalyticsProps) {
  
  // Debug analytics props
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics component props:', {
      googleAnalyticsId,
      googleTagManagerId,
      googleSiteVerification,
      facebookPixelId,
      hotjarId,
      hasCustomHeadScripts: !!customHeadScripts,
      hasCustomBodyStartScripts: !!customBodyStartScripts,
      hasCustomBodyEndScripts: !!customBodyEndScripts,
    });
  }
  
  // Google Analytics 4
  const renderGoogleAnalytics = () => {
    if (!googleAnalyticsId) return null;

    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
      </>
    );
  };

  // Google Tag Manager
  const renderGoogleTagManager = () => {
    if (!googleTagManagerId) return null;

    return (
      <>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${googleTagManagerId}');
          `}
        </Script>
      </>
    );
  };

  // Facebook Pixel
  const renderFacebookPixel = () => {
    if (!facebookPixelId) return null;

    return (
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${facebookPixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
    );
  };

  // Hotjar
  const renderHotjar = () => {
    if (!hotjarId) return null;

    return (
      <Script id="hotjar" strategy="afterInteractive">
        {`
          (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${hotjarId},hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `}
      </Script>
    );
  };

  // Custom Scripts
  const renderCustomScripts = () => {
    const scripts = [];

    if (customHeadScripts) {
      scripts.push(
        <div key="custom-head" dangerouslySetInnerHTML={{ __html: customHeadScripts }} />
      );
    }

    if (customBodyStartScripts) {
      scripts.push(
        <Script
          key="custom-body-start"
          id="custom-body-start-scripts"
          strategy="afterInteractive"
        >
          {customBodyStartScripts}
        </Script>
      );
    }

    if (customBodyEndScripts) {
      scripts.push(
        <Script
          key="custom-body-end"
          id="custom-body-end-scripts"
          strategy="lazyOnload"
        >
          {customBodyEndScripts}
        </Script>
      );
    }

    return scripts;
  };

  return (
    <>
      {/* Google Site Verification Meta Tag */}
      {googleSiteVerification && (
        <meta name="google-site-verification" content={googleSiteVerification} />
      )}

      {/* Analytics Scripts */}
      {renderGoogleAnalytics()}
      {renderGoogleTagManager()}
      {renderFacebookPixel()}
      {renderHotjar()}
      {renderCustomScripts()}

      {/* GTM NoScript Fallback */}
      {googleTagManagerId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      )}

      {/* Facebook Pixel NoScript Fallback */}
      {facebookPixelId && (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}
    </>
  );
}