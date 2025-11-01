import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { TokenPayload } from '../utils/jwt';

/**
 * Extended Express Request with authenticated user data
 */
export interface AuthRequest extends Request {
  user?: TokenPayload & {
    userId: string;
    email: string;
    workspaceId?: string;
    role?: string;
  };
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 * Adds user data to request object
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided',
      });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization header format. Use: Bearer <token>',
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
      return;
    }

    // Verify token
    const payload = authService.verifyToken(token);

    // Add user to request
    req.user = payload;

    next();
  } catch (error: any) {
    if (error.message === 'Token expired') {
      res.status(401).json({
        error: 'TokenExpired',
        message: 'Access token has expired. Please refresh your token.',
      });
      return;
    }

    if (error.message === 'Invalid token') {
      res.status(401).json({
        error: 'InvalidToken',
        message: 'Invalid access token',
      });
      return;
    }

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token verification failed',
    });
  }
};

/**
 * Optional authentication middleware
 * Does not fail if no token provided, but adds user to request if valid token exists
 */
export const optionalAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        const payload = authService.verifyToken(token);
        req.user = payload;
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

/**
 * Admin-only middleware
 * Must be used after authMiddleware
 */
export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
    });
    return;
  }

  next();
};

/**
 * Workspace membership middleware
 * Verifies user has access to the workspace in the request
 */
export const workspaceAccessMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  // Get workspace ID from request (params, body, or query)
  const workspaceId =
    req.params.workspaceId ||
    req.body.workspaceId ||
    req.query.workspaceId as string;

  if (!workspaceId) {
    res.status(400).json({
      error: 'BadRequest',
      message: 'Workspace ID required',
    });
    return;
  }

  // Check if user's workspace matches
  if (req.user.workspaceId !== workspaceId) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied to this workspace',
    });
    return;
  }

  next();
};

/**
 * Rate limiting middleware (simple in-memory version)
 * For production, use Redis-based rate limiting
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export const rateLimitMiddleware = (
  maxRequests: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const identifier = req.user?.userId || req.ip || 'anonymous';
    const now = Date.now();

    const record = requestCounts.get(identifier);

    if (!record || now > record.resetAt) {
      // Create new record
      requestCounts.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        error: 'TooManyRequests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
      });
      return;
    }

    record.count++;
    next();
  };
};

/**
 * Workspace ownership middleware
 * Verifies user is the owner of the workspace
 */
export const workspaceOwnerMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  const workspaceId =
    req.params.workspaceId ||
    req.body.workspaceId ||
    req.query.workspaceId as string;

  if (!workspaceId) {
    res.status(400).json({
      error: 'BadRequest',
      message: 'Workspace ID required',
    });
    return;
  }

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.userId,
          workspaceId: workspaceId,
        },
      },
    });

    await prisma.$disconnect();

    if (!membership || membership.role !== 'owner') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Workspace owner access required',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to verify workspace ownership',
    });
  }
};

