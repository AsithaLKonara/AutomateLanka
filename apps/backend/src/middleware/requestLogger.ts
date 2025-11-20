import { Request, Response, NextFunction } from 'express';
// @ts-ignore - Winston import issue
import winston from 'winston';

/**
 * Winston Logger Configuration
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT === 'json' 
    ? winston.format.json()
    : winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
  defaultMeta: {
    service: 'autolanka-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: process.env.LOG_FORMAT === 'json'
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            })
          ),
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Request Logger Middleware
 * Logs all HTTP requests with structured data
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
    workspaceId: (req as any).workspaceId,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const logData: any = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress,
      userId: (req as any).user?.id,
      workspaceId: (req as any).workspaceId,
    };

    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

export { logger };
export default requestLogger;

