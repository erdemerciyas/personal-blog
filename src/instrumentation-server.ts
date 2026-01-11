// Sentry is optional - only import if available
let Sentry: any = null;

function loadSentry() {
  try {
    // Use completely dynamic require to avoid webpack bundling
    const moduleName = '@sentry/nextjs';
    return eval('require')(moduleName);
  } catch {
    return null;
  }
}

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry = loadSentry();
  if (!Sentry) {
    console.warn('Sentry not installed, skipping server instrumentation');
  }
} else {
  console.warn('Sentry not installed, skipping Sentry configuration');
}

/**
 * Initialize plugins and themes on server startup
 */
async function initializePluginsAndThemes() {
  try {
    const Plugin = (await import('./models/Plugin')).default;
    const Theme = (await import('./models/Theme')).default;
    const connectDB = (await import('./lib/mongoose')).default;

    await connectDB();

    // Check if seeding is needed
    const pluginCount = await Plugin.countDocuments();
    const themeCount = await Theme.countDocuments();

    if (pluginCount === 0 || themeCount === 0) {
      console.log('🚀 Initializing plugins and themes...');

      // Seed plugins
      if (pluginCount === 0) {
        const seoPlugin = {
          name: 'SEO Plugin',
          slug: 'seo-plugin',
          version: '1.0.0',
          author: 'Fixral',
          description: 'SEO optimizasyonu için meta etiketleri, Open Graph ve schema markup ekler',
          isActive: false,
          type: 'built-in',
          config: {
            enableSchemaMarkup: true,
            enableOpenGraph: true,
            enableTwitterCards: true,
          },
          hooks: [
            {
              name: 'page:meta',
              callback: 'filterPageMeta',
              priority: 10,
            },
            {
              name: 'page:head',
              callback: 'addSchemaMarkup',
              priority: 10,
            },
            {
              name: 'page:content',
              callback: 'optimizeContent',
              priority: 10,
            },
          ],
          components: [],
          dependencies: [],
        };

        const analyticsPlugin = {
          name: 'Analytics Plugin',
          slug: 'analytics-plugin',
          version: '1.0.0',
          author: 'Fixral',
          description: 'Google Analytics ve diğer analiz araçlarını entegre eder',
          isActive: false,
          type: 'built-in',
          config: {
            googleAnalyticsId: '',
            enablePageViewTracking: true,
            enableEventTracking: true,
          },
          hooks: [
            {
              name: 'page:loaded',
              callback: 'trackPageView',
              priority: 10,
            },
          ],
          components: [
            {
              id: 'analytics-widget',
              type: 'widget',
              component: 'components/AnalyticsWidget',
              name: 'Analytics Widget',
              description: 'Analytics verilerini gösteren widget',
            },
          ],
          dependencies: [],
        };

        const socialSharePlugin = {
          name: 'Social Share Plugin',
          slug: 'social-share-plugin',
          version: '1.0.0',
          author: 'Fixral',
          description: 'Sosyal medya paylaşım butonları ekler',
          isActive: false,
          type: 'built-in',
          config: {
            platforms: ['facebook', 'twitter', 'linkedin', 'whatsapp'],
            showIcons: true,
            showCount: false,
          },
          hooks: [
            {
              name: 'page:content',
              callback: 'addShareButtons',
              priority: 20,
            },
          ],
          components: [
            {
              id: 'share-buttons',
              type: 'widget',
              component: 'components/ShareButtons',
              name: 'Social Share Buttons',
              description: 'Sosyal medya paylaşım butonları',
            },
          ],
          dependencies: [],
        };

        for (const pluginData of [seoPlugin, analyticsPlugin, socialSharePlugin]) {
          try {
            await Plugin.create(pluginData);
            console.log(`  ✓ Created plugin: ${pluginData.name}`);
          } catch (error: any) {
            if (error.code === 11000) {
              console.log(`  ✓ Plugin already exists: ${pluginData.name}`);
            } else {
              console.error(`  ✗ Failed to create plugin ${pluginData.name}:`, error);
            }
          }
        }
      }

      // Seed themes
      if (themeCount === 0) {
        const defaultTheme = {
          name: 'Default Theme',
          slug: 'default',
          version: '1.0.0',
          author: 'Fixral',
          description: 'Modern ve responsive varsayılan tema',
          thumbnail: '/themes/default/thumbnail.png',
          isActive: true,
          config: {
            colors: {
              primary: '#003450',
              secondary: '#3A506B',
              accent: '#003450',
              background: '#F8F9FA',
              text: '#3D3D3D',
            },
            fonts: {
              heading: 'Inter',
              body: 'Inter',
            },
            layout: {
              maxWidth: 1280,
              sidebar: false,
              headerStyle: 'fixed',
              footerStyle: 'simple',
            },
            features: {
              heroSlider: true,
              portfolioGrid: true,
              blogList: true,
              contactForm: true,
            },
          },
          templates: [
            {
              id: 'home-default',
              name: 'Default Home',
              type: 'home',
              component: 'templates/HomeTemplate',
              screenshot: '/themes/default/screenshots/home.png',
              description: 'Ana sayfa için varsayılan şablon',
            },
            {
              id: 'page-default',
              name: 'Default Page',
              type: 'page',
              component: 'templates/PageTemplate',
              screenshot: '/themes/default/screenshots/page.png',
              description: 'Standart sayfa şablonu',
            },
            {
              id: 'blog-default',
              name: 'Blog List',
              type: 'archive',
              component: 'templates/BlogTemplate',
              screenshot: '/themes/default/screenshots/blog.png',
              description: 'Blog listesi için şablon',
            },
            {
              id: 'single-default',
              name: 'Single Post',
              type: 'single',
              component: 'templates/SingleTemplate',
              screenshot: '/themes/default/screenshots/single.png',
              description: 'Tekil blog yazısı için şablon',
            },
            {
              id: 'portfolio-default',
              name: 'Portfolio Grid',
              type: 'archive',
              component: 'templates/PortfolioTemplate',
              screenshot: '/themes/default/screenshots/portfolio.png',
              description: 'Portfolyo grid şablonu',
            },
          ],
        };

        const fixralTheme = {
          name: 'Fixral Theme',
          slug: 'fixral',
          version: '1.0.0',
          author: 'Fixral',
          description: 'Fixral için özel tasarlanmış modern ve responsive tema',
          thumbnail: '/themes/fixral/thumbnail.png',
          isActive: false,
          config: {
            colors: {
              primary: '#003450',
              secondary: '#3A506B',
              accent: '#003450',
              background: '#F8F9FA',
              text: '#3D3D3D',
            },
            fonts: {
              heading: 'Inter',
              body: 'Inter',
            },
            layout: {
              maxWidth: 1280,
              sidebar: false,
              headerStyle: 'fixed',
              footerStyle: 'simple',
            },
            features: {
              heroSlider: true,
              portfolioGrid: true,
              blogList: true,
              contactForm: true,
            },
          },
          templates: [
            {
              id: 'home-fixral',
              name: 'Fixral Home',
              type: 'home',
              component: 'templates/HomeTemplate',
              screenshot: '/themes/fixral/screenshots/home.png',
              description: 'Fixral ana sayfa şablonu',
            },
            {
              id: 'page-fixral',
              name: 'Fixral Page',
              type: 'page',
              component: 'templates/PageTemplate',
              screenshot: '/themes/fixral/screenshots/page.png',
              description: 'Fixral standart sayfa şablonu',
            },
            {
              id: 'blog-fixral',
              name: 'Fixral Blog List',
              type: 'archive',
              component: 'templates/BlogTemplate',
              screenshot: '/themes/fixral/screenshots/blog.png',
              description: 'Fixral blog listesi şablonu',
            },
            {
              id: 'single-fixral',
              name: 'Fixral Single Post',
              type: 'single',
              component: 'templates/SingleTemplate',
              screenshot: '/themes/fixral/screenshots/single.png',
              description: 'Fixral tekil blog yazısı şablonu',
            },
            {
              id: 'portfolio-fixral',
              name: 'Fixral Portfolio Grid',
              type: 'archive',
              component: 'templates/PortfolioTemplate',
              screenshot: '/themes/fixral/screenshots/portfolio.png',
              description: 'Fixral portfolyo grid şablonu',
            },
          ],
        };

        try {
          await Theme.create(defaultTheme);
          console.log('  ✓ Created theme: Default Theme');
        } catch (error: any) {
          if (error.code === 11000) {
            console.log('  ✓ Theme already exists: Default Theme');
          } else {
            console.error('  ✗ Failed to create theme Default Theme:', error);
          }
        }

        try {
          await Theme.create(fixralTheme);
          console.log('  ✓ Created theme: Fixral Theme');
        } catch (error: any) {
          if (error.code === 11000) {
            console.log('  ✓ Theme already exists: Fixral Theme');
          } else {
            console.error('  ✗ Failed to create theme Fixral Theme:', error);
          }
        }
      }

      console.log('✅ Plugins and themes initialized successfully');
    } else {
      console.log(`✓ Plugins: ${pluginCount}, Themes: ${themeCount} (already initialized)`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize plugins and themes:', error);
  }
}

export function register() {
  // Initialize plugins and themes on server startup
  initializePluginsAndThemes().catch((error) => {
    console.error('Failed to initialize plugins and themes:', error);
  });

  if (process.env.NEXT_RUNTIME === 'nodejs' && Sentry) {
    const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
    const SENTRY_ENVIRONMENT = process.env.NODE_ENV || 'development';
    const SENTRY_RELEASE = process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'unknown';

    Sentry.init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,
      release: SENTRY_RELEASE,
      
      // Performance Monitoring
      tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
      
      // Server-side error filtering
      beforeSend(event: any, hint: any) {
        const error = hint.originalException;
        
        if (error && typeof error === 'object' && 'message' in error) {
          const message = String(error.message).toLowerCase();
          
          // Filter out database connection errors in development
          if (
            SENTRY_ENVIRONMENT === 'development' &&
            (message.includes('db_disabled') || message.includes('mongodb'))
          ) {
            return null;
          }
          
          // Filter out expected validation errors
          if (
            message.includes('validation failed') ||
            message.includes('cast to objectid failed') ||
            message.includes('duplicate key error')
          ) {
            return null;
          }
        }
        
        return event;
      },
      
      // Use newer integrations API
      integrations: [
        Sentry.httpIntegration(),
      ],
      
      // Additional configuration
      debug: SENTRY_ENVIRONMENT === 'development',
      
      // Custom tags
      initialScope: {
        tags: {
          component: 'server'
        }
      }
    });
  }
}