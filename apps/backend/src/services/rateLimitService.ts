import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { AuthRequest } from '../middleware/authMiddleware';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Rate Limit Service
 * Provides Redis-based rate limiting per workspace/plan
 */
class RateLimitService {
  private client: Redis | null = null;
  private isConnected = false;
  private inMemoryStore = new Map<string, { count: number; resetAt: number }>();

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    try {
      this.client = new Redis(REDIS_URL, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('connect', () => {
        console.log('✅ Redis rate limiter connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis rate limiter error:', err);
        this.isConnected = false;
      });

      await this.client.ping();
    } catch (error) {
      console.error('Failed to connect to Redis for rate limiting, using in-memory store:', error);
      this.client = null;
    }
  }

  /**
   * Get rate limit config for plan
   */
  private getPlanLimits(planSlug: string): { requests: number; window: number } {
    const limits: Record<string, { requests: number; window: number }> = {
      free: { requests: 100, window: 60 * 1000 }, // 100 req/min
      pro: { requests: 1000, window: 60 * 1000 }, // 1000 req/min
      business: { requests: 10000, window: 60 * 1000 }, // 10000 req/min
    };

    return limits[planSlug] || limits.free;
  }

  /**
   * Create rate limit middleware
   */
  createMiddleware(type: string = 'default') {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      await this.connect();

      try {
        // Get identifier (workspace ID if available, otherwise IP)
        const identifier = req.user?.workspaceId || req.ip || 'anonymous';
        const key = `ratelimit:${type}:${identifier}`;

        // Get plan limits (would need to fetch from database in real implementation)
        const planSlug = 'free'; // Default, should fetch from workspace
        const limits = this.getPlanLimits(planSlug);

        let count: number;
        let ttl: number;

        if (this.client && this.isConnected) {
          // Use Redis
          const current = await this.client.incr(key);
          
          if (current === 1) {
            // First request, set expiry
            await this.client.pexpire(key, limits.window);
            ttl = limits.window;
          } else {
            ttl = await this.client.pttl(key);
          }

          count = current;
        } else {
          // Fallback to in-memory
          const now = Date.now();
          const record = this.inMemoryStore.get(key);

          if (!record || now > record.resetAt) {
            this.inMemoryStore.set(key, {
              count: 1,
              resetAt: now + limits.window,
            });
            count = 1;
            ttl = limits.window;
          } else {
            record.count++;
            count = record.count;
            ttl = record.resetAt - now;
          }
        }

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', limits.requests.toString());
        res.setHeader('X-RateLimit-Remaining', Math.max(0, limits.requests - count).toString());
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl).toISOString());

        // Check if limit exceeded
        if (count > limits.requests) {
          res.status(429).json({
            error: 'TooManyRequests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil(ttl / 1000),
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Rate limit error:', error);
        // On error, allow request (fail open)
        next();
      }
    };
  }

  /**
   * Check rate limit for a specific key
   */
  async checkLimit(key: string, limit: number, windowMs: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    await this.connect();

    const redisKey = `ratelimit:custom:${key}`;
    let count: number;
    let ttl: number;

    if (this.client && this.isConnected) {
      count = await this.client.incr(redisKey);
      if (count === 1) {
        await this.client.pexpire(redisKey, windowMs);
        ttl = windowMs;
      } else {
        ttl = await this.client.pttl(redisKey);
      }
    } else {
      // In-memory fallback
      const now = Date.now();
      const record = this.inMemoryStore.get(redisKey);
      if (!record || now > record.resetAt) {
        this.inMemoryStore.set(redisKey, {
          count: 1,
          resetAt: now + windowMs,
        });
        count = 1;
        ttl = windowMs;
      } else {
        record.count++;
        count = record.count;
        ttl = record.resetAt - now;
      }
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: new Date(Date.now() + ttl),
    };
  }
}

export const rateLimitService = new RateLimitService();
export default rateLimitService;

