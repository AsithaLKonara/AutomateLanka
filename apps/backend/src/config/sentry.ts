import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { RequestHandler, ErrorRequestHandler } from 'express';

/**
 * Initialize Sentry for error tracking
 */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log('⚠️  Sentry DSN not configured, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event: any, hint: any) {
      // Don't send events in development unless explicitly enabled
      if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_ENABLE_DEV) {
        return null;
      }
      return event;
    },
  });

  console.log('✅ Sentry initialized');
}

/**
 * Sentry error handler middleware for Express
 */
export const sentryErrorHandler: ErrorRequestHandler = Sentry.Handlers.errorHandler() as unknown as ErrorRequestHandler;

/**
 * Sentry request handler middleware for Express
 */
export const sentryRequestHandler: RequestHandler = Sentry.Handlers.requestHandler({
  user: ['id', 'email'],
  ip: true,
}) as unknown as RequestHandler;
