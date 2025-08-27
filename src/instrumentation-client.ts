// Sentry is optional - only import if available
let Sentry: any = null;
try {
  Sentry = require('@sentry/nextjs');
} catch (e) {
  console.warn('Sentry not installed, skipping client instrumentation');
}

// Export router transition hook as required by Sentry (only if Sentry is available)
export const onRouterTransitionStart = Sentry ? Sentry.captureRouterTransitionStart : undefined;

export function register() {
  if (process.env.NEXT_RUNTIME === 'browser' && Sentry) {
    const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
    const SENTRY_ENVIRONMENT = process.env.NODE_ENV || 'development';
    const SENTRY_RELEASE = process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'unknown';

    Sentry.init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,
      release: SENTRY_RELEASE,
      
      // Performance Monitoring
      tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
      
      // Client-side error filtering
      beforeSend(event: any, hint: any) {
        // Filter out known non-critical errors
        const error = hint.originalException;
        
        if (error && typeof error === 'object' && 'message' in error) {
          const message = String(error.message).toLowerCase();
          
          // Skip common browser errors that aren't actionable
          if (
            message.includes('script error') ||
            message.includes('non-error promise rejection') ||
            message.includes('loading chunk') ||
            message.includes('network error') ||
            message.includes('chunkloaderror')
          ) {
            return null;
          }
        }
        
        // Filter out localhost errors in production
        if (SENTRY_ENVIRONMENT === 'production' && event.request?.url?.includes('localhost')) {
          return null;
        }
        
        return event;
      },
      
      // Basic integrations only to avoid import issues
      integrations: [],
      
      // Additional configuration
      debug: SENTRY_ENVIRONMENT === 'development',
      
      // Custom tags
      initialScope: {
        tags: {
          component: 'client'
        }
      }
    });
  }
}