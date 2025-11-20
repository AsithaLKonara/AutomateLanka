import { Request, Response, NextFunction } from 'express';
import { logger } from './requestLogger';
import * as Sentry from '@sentry/node';

/**
 * Error Handler Middleware
 * Handles all errors and sends appropriate responses
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.userId,
  });

  // Send to Sentry (if configured)
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err, {
      tags: {
        url: req.originalUrl,
        method: req.method,
      },
      user: {
        id: (req as any).user?.userId,
        email: (req as any).user?.email,
      },
    });
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Handle specific error types
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid input data',
      details: isDevelopment ? err.errors || err.issues : undefined,
    });
    return;
  }

  if (err.name === 'UnauthorizedError' || err.message?.includes('Unauthorized')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  if (err.name === 'ForbiddenError' || err.message?.includes('Forbidden')) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied',
    });
    return;
  }

  if (err.name === 'NotFoundError' || err.message?.includes('not found')) {
    res.status(404).json({
      error: 'NotFound',
      message: 'Resource not found',
    });
    return;
  }

  if (err.name === 'ConflictError' || err.message?.includes('already exists')) {
    res.status(409).json({
      error: 'Conflict',
      message: err.message || 'Resource already exists',
    });
    return;
  }

  // Database errors
  if (err.code === 'P2002') {
    res.status(409).json({
      error: 'Conflict',
      message: 'Unique constraint violation',
      details: isDevelopment ? err.meta : undefined,
    });
    return;
  }

  if (err.code?.startsWith('P')) {
    logger.error('Prisma error', { code: err.code, meta: err.meta });
    res.status(500).json({
      error: 'DatabaseError',
      message: 'Database operation failed',
      details: isDevelopment ? { code: err.code } : undefined,
    });
    return;
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    error: err.name || 'InternalServerError',
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: err.stack }),
  });
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;

