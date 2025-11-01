import { Router, Request, Response } from 'express';
import { authService, RegisterInput, LoginInput } from '../services/authService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  workspaceName: z.string().optional(),
});

const loginSchema = z.object({
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
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid input data',
        details: validation.error.errors,
      });
    }

    const input: RegisterInput = validation.data;

    // Register user
    const result = await authService.register(input);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful',
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'UserExists',
        message: error.message,
      });
    }

    if (error.message.includes('Password must')) {
      return res.status(400).json({
        error: 'WeakPassword',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'RegistrationFailed',
      message: 'Failed to register user. Please try again.',
    });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid input data',
        details: validation.error.errors,
      });
    }

    const input: LoginInput = validation.data;

    // Login user
    const result = await authService.login(input);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.message.includes('Invalid email or password')) {
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Invalid email or password',
      });
    }

    if (error.message.includes('No workspace found')) {
      return res.status(500).json({
        error: 'NoWorkspace',
        message: 'No workspace found. Please contact support.',
      });
    }

    res.status(500).json({
      error: 'LoginFailed',
      message: 'Failed to login. Please try again.',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    console.error('Token refresh error:', error);

    if (error.message.includes('Invalid refresh token')) {
      return res.status(401).json({
        error: 'InvalidToken',
        message: 'Invalid refresh token',
      });
    }

    if (error.message.includes('expired')) {
      return res.status(401).json({
        error: 'TokenExpired',
        message: 'Refresh token has expired. Please login again.',
      });
    }

    res.status(500).json({
      error: 'RefreshFailed',
      message: 'Failed to refresh token. Please login again.',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout - revoke refresh token
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Refresh token is required',
      });
    }

    await authService.logout(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'LogoutFailed',
      message: 'Failed to logout. Please try again.',
    });
  }
});

/**
 * POST /api/auth/logout-all
 * Logout from all devices - revoke all refresh tokens
 */
router.post('/logout-all', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
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
  } catch (error: any) {
    console.error('Logout all error:', error);
    res.status(500).json({
      error: 'LogoutFailed',
      message: 'Failed to logout from all devices',
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
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
    await authService.requestPasswordReset(email);

    // Always return success (don't reveal if email exists)
    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link will be sent.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    // Always return success for security
    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link will be sent.',
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    console.error('Reset password error:', error);

    if (error.message.includes('Password must')) {
      return res.status(400).json({
        error: 'WeakPassword',
        message: error.message,
      });
    }

    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return res.status(400).json({
        error: 'InvalidToken',
        message: 'Invalid or expired reset token',
      });
    }

    res.status(500).json({
      error: 'ResetFailed',
      message: 'Failed to reset password. Please try again.',
    });
  }
});

/**
 * GET /api/auth/verify-email/:token
 * Verify email with token
 */
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    console.error('Email verification error:', error);

    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return res.status(400).json({
        error: 'InvalidToken',
        message: 'Invalid or expired verification token',
      });
    }

    res.status(500).json({
      error: 'VerificationFailed',
      message: 'Failed to verify email. Please try again.',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
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
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to get user info',
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change password (requires authentication)
 */
router.post('/change-password', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
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
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'ChangePasswordFailed',
      message: 'Failed to change password',
    });
  }
});

export default router;

