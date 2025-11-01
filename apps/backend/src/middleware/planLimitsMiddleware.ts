import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { billingService } from '../services/billingService';

/**
 * Middleware to check if workspace can create a new workflow
 * Based on plan limits
 */
export const checkWorkflowLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.workspaceId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const check = await billingService.checkLimit(req.user.workspaceId, 'workflows');

    if (!check.allowed) {
      return res.status(403).json({
        error: 'PlanLimitReached',
        message: check.reason || 'Workflow limit reached',
        action: 'upgrade',
      });
    }

    next();
  } catch (error) {
    console.error('Check workflow limit error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to check workflow limit',
    });
  }
};

/**
 * Middleware to check if workspace can execute a run
 * Based on plan limits
 */
export const checkRunLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.workspaceId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const check = await billingService.checkLimit(req.user.workspaceId, 'runs');

    if (!check.allowed) {
      return res.status(403).json({
        error: 'PlanLimitReached',
        message: check.reason || 'Monthly run limit reached',
        action: 'upgrade',
      });
    }

    next();
  } catch (error) {
    console.error('Check run limit error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to check run limit',
    });
  }
};

/**
 * Middleware to check if workspace can invite a member
 * Based on plan limits
 */
export const checkMemberLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.workspaceId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const check = await billingService.checkLimit(req.user.workspaceId, 'members');

    if (!check.allowed) {
      return res.status(403).json({
        error: 'PlanLimitReached',
        message: check.reason || 'Member limit reached',
        action: 'upgrade',
      });
    }

    next();
  } catch (error) {
    console.error('Check member limit error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to check member limit',
    });
  }
};

/**
 * Generic middleware factory to check any limit type
 */
export const checkLimit = (type: 'runs' | 'workflows' | 'members') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.workspaceId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const check = await billingService.checkLimit(req.user.workspaceId, type);

      if (!check.allowed) {
        return res.status(403).json({
          error: 'PlanLimitReached',
          message: check.reason || `${type} limit reached`,
          action: 'upgrade',
          limitType: type,
        });
      }

      next();
    } catch (error) {
      console.error(`Check ${type} limit error:`, error);
      res.status(500).json({
        error: 'ServerError',
        message: `Failed to check ${type} limit`,
      });
    }
  };
};

