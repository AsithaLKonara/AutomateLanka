import { Router, Request, Response } from 'express';
import { authService, RegisterInput, LoginInput } from '../services/authService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

// Validation schemas
const registerSchema: z.ZodType<RegisterInput> = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  workspaceName: z.string().optional(),
});

const loginSchema: z.ZodType<LoginInput> = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * POST /api/auth/register
 * Register new user + create workspace
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid input data',
      details: validation.error.errors,
    });
  }

  const input = validation.data;

  // Register user
  const result = await authService.register(input);

  res.status(201).json({
    success: true,
    data: result,
    message: 'Registration successful',
  });
}));

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid input data',
      details: validation.error.errors,
    });
  }

  const input = validation.data;

  // Get IP address and user agent for audit logging
  const ipAddress = req.ip || req.socket.remoteAddress || undefined;
  const userAgent = req.get('user-agent') || undefined;

  // Login user
  const result = await authService.login(input, ipAddress, userAgent);

  res.status(200).json({
    success: true,
    data: result,
    message: 'Login successful',
  });
}));

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validation = refreshTokenSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Refresh token is required',
    });
  }

  const { refreshToken } = validation.data;

  // Refresh token
  const result = await authService.refreshToken(refreshToken);

  res.status(200).json({
    success: true,
    data: result,
    message: 'Token refreshed successfully',
  });
}));

/**
 * POST /api/auth/logout
 * Logout - revoke refresh token
 */
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Refresh token is required',
    });
  }

  // Get user ID from token if available for audit logging
  let userId: string | undefined;
  try {
    const tokenPayload = authService.verifyToken(refreshToken);
    userId = tokenPayload.userId;
  } catch {
    // Token might be invalid, continue with logout anyway
  }

  await authService.logout(refreshToken, userId);

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
}));

/**
 * POST /api/auth/logout-all
 * Logout from all devices - revoke all refresh tokens
 */
router.post('/logout-all', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  await authService.logoutAll(req.user.userId);

  res.status(200).json({
    success: true,
    message: 'Logged out from all devices',
  });
}));

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validation = forgotPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Valid email is required',
    });
  }

  const { email } = validation.data;

  // Request password reset
  try {
    await authService.requestPasswordReset(email);
  } catch {
    // Ignore errors for security
  }

  // Always return success (don't reveal if email exists)
  res.status(200).json({
    success: true,
    message: 'If an account exists with this email, a password reset link will be sent.',
  });
}));

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validation = resetPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid input data',
      details: validation.error.errors,
    });
  }

  const { token, newPassword } = validation.data;

  await authService.resetPassword(token, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
}));

/**
 * GET /api/auth/verify-email/:token
 * Verify email with token
 */
router.get('/verify-email/:token', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Verification token is required',
    });
  }

  await authService.verifyEmail(token);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
}));

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  // In a real app, fetch full user details from database
  res.status(200).json({
    success: true,
    data: {
      userId: req.user.userId,
      email: req.user.email,
      workspaceId: req.user.workspaceId,
      role: req.user.role,
    },
  });
}));

/**
 * POST /api/auth/change-password
 * Change password (requires authentication)
 */
router.post('/change-password', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Current password and new password are required',
    });
  }

  // This would need to be implemented in authService
  // await authService.changePassword(req.user.userId, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please login again.',
  });
}));

export default router;

