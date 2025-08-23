import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NODE_ENV || 'development';
const SENTRY_RELEASE = process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'unknown';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  release: SENTRY_RELEASE,
  
  // Edge runtime has different capabilities
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.05 : 0.5,
  
  // Minimal configuration for edge runtime
  debug: false, // Edge runtime doesn't support debug mode well
  
  // No additional integrations for edge runtime
  integrations: [],
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'edge'
    }
  }
});