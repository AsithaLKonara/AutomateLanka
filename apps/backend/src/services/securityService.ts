import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Security Service
 * Provides enterprise-grade security features
 */
class SecurityService {
  /**
   * Enhanced security middleware with CSP and HSTS
   */
  securityMiddleware() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    });
  }

  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate API key format
   */
  isValidApiKeyFormat(key: string): boolean {
    // Format: al_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (alphanumeric)
    const apiKeyRegex = /^al_(live|test)_[A-Za-z0-9]{32,}$/;
    return apiKeyRegex.test(key);
  }

  /**
   * Generate secure random string
   */
  generateSecureToken(length: number = 32): string {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Rate limiting configuration per workspace
   */
  getWorkspaceRateLimitConfig(planSlug: string) {
    const limits: Record<string, { requests: number; window: number }> = {
      free: { requests: 100, window: 60 * 1000 }, // 100 req/min
      pro: { requests: 1000, window: 60 * 1000 }, // 1000 req/min
      business: { requests: 10000, window: 60 * 1000 }, // 10000 req/min
    };

    return limits[planSlug] || limits.free;
  }
}

export const securityService = new SecurityService();
export default securityService;

