import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, validatePasswordStrength, generateResetToken, generateVerificationToken } from '../utils/password';
import { generateTokenPair, verifyAccessToken, TokenPayload, generateAccessToken } from '../utils/jwt';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  workspaceName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Register new user + create default workspace + membership
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Validate email format
    if (!this.isValidEmail(input.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(input.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Get free plan
    const freePlan = await prisma.plan.findUnique({
      where: { slug: 'free' },
    });

    if (!freePlan) {
      throw new Error('Free plan not found. Please run database seed.');
    }

    // Create user + workspace + membership in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash,
          name: input.name,
          isVerified: false, // Will be true after email verification
        },
      });

      // Generate unique workspace slug
      const slug = this.generateWorkspaceSlug(input.workspaceName || `${input.name}'s Workspace`);

      // Create workspace
      const workspace = await tx.workspace.create({
        data: {
          name: input.workspaceName || `${input.name}'s Workspace`,
          slug,
          ownerId: user.id,
          planId: freePlan.id,
        },
      });

      // Create membership (owner)
      await tx.membership.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'owner',
          acceptedAt: new Date(),
        },
      });

      return { user, workspace };
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: result.user.id,
      email: result.user.email,
      workspaceId: result.workspace.id,
      role: result.user.role,
    });

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId: result.user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name,
        slug: result.workspace.slug,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Login existing user
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Get user's default workspace (most recent membership)
    const membership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        acceptedAt: { not: null },
      },
      include: { workspace: true },
      orderBy: { acceptedAt: 'desc' },
    });

    if (!membership) {
      throw new Error('No workspace found. Please contact support.');
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      workspaceId: membership.workspaceId,
      role: user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      workspace: {
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Find refresh token in database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    // Check if expired
    if (tokenRecord.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });
      throw new Error('Refresh token expired');
    }

    // Get user's workspace
    const membership = await prisma.membership.findFirst({
      where: {
        userId: tokenRecord.userId,
        acceptedAt: { not: null },
      },
      orderBy: { acceptedAt: 'desc' },
    });

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: tokenRecord.user.id,
      email: tokenRecord.user.email,
      workspaceId: membership?.workspaceId,
      role: tokenRecord.user.role,
    });

    return { accessToken };
  }

  /**
   * Logout - revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Logout from all devices - revoke all refresh tokens
   */
  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    // In a real implementation, you'd store verification tokens in DB
    // For now, this is a placeholder
    throw new Error('Email verification not yet implemented');
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ token: string }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      // Still return success but don't send email
      return { token: '' };
    }

    // Generate reset token
    const resetToken = generateResetToken();

    // In a real implementation:
    // 1. Store token in database with expiry (1 hour)
    // 2. Send email with reset link
    // For now, return token (in production, send via email only)

    return { token: resetToken };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // In a real implementation:
    // 1. Verify token exists and not expired
    // 2. Get user from token
    // 3. Hash new password
    // 4. Update user password
    // 5. Delete token
    // 6. Revoke all refresh tokens (force re-login)

    throw new Error('Password reset not yet implemented');
  }

  /**
   * Verify JWT token and return payload
   */
  verifyToken(token: string): TokenPayload {
    return verifyAccessToken(token);
  }

  /**
   * Helper: Generate unique workspace slug
   */
  private generateWorkspaceSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
    
    const random = crypto.randomBytes(3).toString('hex');
    return `${base}-${random}`;
  }

  /**
   * Helper: Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const authService = new AuthService();

