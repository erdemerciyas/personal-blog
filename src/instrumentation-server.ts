// Sentry is optional - only import if available
let Sentry: any = null;
try {
  Sentry = require('@sentry/nextjs');
} catch (_e) {
  console.warn('Sentry not installed, skipping server instrumentation');
}

export function register() {
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