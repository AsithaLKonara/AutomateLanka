import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Cache Service
 * Provides Redis-based caching for frequently accessed data
 */
class CacheService {
  private client: Redis | null = null;
  private isConnected = false;

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
        console.log('✅ Redis cache connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis cache error:', err);
        this.isConnected = false;
      });

      // Test connection
      await this.client.ping();
    } catch (error) {
      console.error('Failed to connect to Redis cache:', error);
      // Continue without cache in case of failure
      this.client = null;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttlSeconds, serialized);
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      await this.client.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Cache user session
   */
  async cacheUserSession(userId: string, sessionData: any, ttlSeconds: number = 1800): Promise<boolean> {
    return this.set(`user:session:${userId}`, sessionData, ttlSeconds);
  }

  /**
   * Get user session
   */
  async getUserSession<T>(userId: string): Promise<T | null> {
    return this.get<T>(`user:session:${userId}`);
  }

  /**
   * Cache workspace data
   */
  async cacheWorkspace(workspaceId: string, workspaceData: any, ttlSeconds: number = 3600): Promise<boolean> {
    return this.set(`workspace:${workspaceId}`, workspaceData, ttlSeconds);
  }

  /**
   * Get workspace from cache
   */
  async getWorkspace<T>(workspaceId: string): Promise<T | null> {
    return this.get<T>(`workspace:${workspaceId}`);
  }

  /**
   * Invalidate workspace cache
   */
  async invalidateWorkspace(workspaceId: string): Promise<boolean> {
    return this.delete(`workspace:${workspaceId}`);
  }

  /**
   * Cache workflow metadata
   */
  async cacheWorkflow(workflowId: string, workflowData: any, ttlSeconds: number = 1800): Promise<boolean> {
    return this.set(`workflow:${workflowId}`, workflowData, ttlSeconds);
  }

  /**
   * Get workflow from cache
   */
  async getWorkflow<T>(workflowId: string): Promise<T | null> {
    return this.get<T>(`workflow:${workflowId}`);
  }

  /**
   * Invalidate workflow cache
   */
  async invalidateWorkflow(workflowId: string): Promise<boolean> {
    return this.delete(`workflow:${workflowId}`);
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Auto-connect on import
cacheService.connect().catch(console.error);

export default cacheService;

