import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Error filtering for server-side
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    const error = hint.originalException;
    if (error && error.message) {
      // Filter out expected database connection errors during deployment
      if (
        error.message.includes('Connection terminated') ||
        error.message.includes('Connection refused')
      ) {
        return null;
      }

      // Filter out Stripe test mode errors in production
      if (error.message.includes('test mode') && process.env.NODE_ENV === 'production') {
        return null;
      }
    }

    return event;
  },

  // Custom tags
  initialScope: {
    tags: {
      component: 'server',
    },
  },
});
