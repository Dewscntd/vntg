import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Filter out known non-critical errors
    const error = hint.originalException;
    if (error && error.message) {
      // Filter out network errors that are not actionable
      if (error.message.includes('Network Error') || 
          error.message.includes('Failed to fetch')) {
        return null;
      }
      
      // Filter out browser extension errors
      if (error.message.includes('extension://') ||
          error.message.includes('moz-extension://')) {
        return null;
      }
      
      // Filter out script loading errors from ad blockers
      if (error.message.includes('Script error') ||
          error.message.includes('Non-Error promise rejection')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Additional configuration
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'client',
    },
  },
});
