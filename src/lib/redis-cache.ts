/**
 * Redis caching layer for improved performance
 * Provides distributed caching with TTL support
 * 
 * Note: This is a fallback implementation using in-memory cache
 * For production, integrate with actual Redis server
 */

import { logger } from './logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
  createdAt: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private maxSize = 1000;
  private cleanupInterval = 5 * 60 * 1000; // 5 minutes
  private isRedisAvailable = false;

  constructor() {
    this.initializeRedis();
    this.startCleanupInterval();
  }

  /**
   * Initialize Redis connection (optional)
   */
  private initializeRedis(): void {
    try {
      // Check if Redis is configured
      if (process.env.REDIS_URL) {
        logger.info('Redis cache configured', 'CACHE');
        this.isRedisAvailable = true;
      } else {
        logger.debug('Using in-memory cache (Redis not configured)', 'CACHE');
      }
    } catch (error) {
      logger.warn('Failed to initialize Redis', 'CACHE', { error: error as Error });
    }
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.delete(key);
      return null;
    }

    logger.debug(`Cache hit: ${key}`, 'CACHE');
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, options?: CacheOptions): void {
    const ttl = options?.ttl || 3600; // Default 1 hour
    const tags = options?.tags || [];

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttl * 1000,
      tags,
      createdAt: Date.now(),
    };

    this.cache.set(key, entry);

    // Update tag index
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    });

    // Maintain cache size
    if (this.cache.size > this.maxSize) {
      this.evictOldest();
    }

    logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`, 'CACHE');
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key) as CacheEntry<unknown> | undefined;

    if (!entry) {
      return false;
    }

    // Remove from tag index
    entry.tags.forEach(tag => {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    });

    this.cache.delete(key);
    logger.debug(`Cache deleted: ${key}`, 'CACHE');
    return true;
  }

  /**
   * Invalidate cache by tag
   */
  invalidateByTag(tag: string): number {
    const keys = this.tagIndex.get(tag);

    if (!keys) {
      return 0;
    }

    let count = 0;
    keys.forEach(key => {
      if (this.delete(key)) {
        count++;
      }
    });

    logger.info(`Cache invalidated by tag: ${tag} (${count} entries)`, 'CACHE');
    return count;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.tagIndex.clear();
    logger.info('Cache cleared', 'CACHE');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    entries: number;
    tags: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: this.cache.size,
      tags: this.tagIndex.size,
    };
  }

  /**
   * Get all keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const entry = this.cache.get(key) as CacheEntry<unknown> | undefined;

    if (!entry) {
      return false;
    }

    if (entry.expiresAt < Date.now()) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    try {
      const value = await fn();
      this.set(key, value, options);
      return value;
    } catch (error) {
      logger.error(`Cache-aside error for key: ${key}`, 'CACHE', undefined, error as Error);
      throw error;
    }
  }

  /**
   * Batch get
   */
  mget<T>(keys: string[]): Map<string, T | null> {
    const result = new Map<string, T | null>();

    keys.forEach(key => {
      result.set(key, this.get<T>(key));
    });

    return result;
  }

  /**
   * Batch set
   */
  mset<T>(entries: Array<[string, T, CacheOptions?]>): void {
    entries.forEach(([key, value, options]) => {
      this.set(key, value, options);
    });
  }

  /**
   * Batch delete
   */
  mdel(keys: string[]): number {
    let count = 0;
    keys.forEach(key => {
      if (this.delete(key)) {
        count++;
      }
    });
    return count;
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let count = 0;

    this.cache.forEach((entry, key) => {
      if (entry.expiresAt < now) {
        this.delete(key);
        count++;
      }
    });

    if (count > 0) {
      logger.debug(`Cache cleanup: removed ${count} expired entries`, 'CACHE');
    }
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.delete(oldestKey);
      logger.debug(`Cache evicted oldest entry: ${oldestKey}`, 'CACHE');
    }
  }
}

export const cacheManager = new CacheManager();

/**
 * Cache decorator for functions
 */
export function Cacheable(options?: CacheOptions) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      const cached = cacheManager.get(cacheKey);

      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cacheManager.set(cacheKey, result, options);
      return result;
    };

    return descriptor;
  };
}

/**
 * Cache key builder
 */
export function buildCacheKey(...parts: (string | number | undefined)[]): string {
  return parts.filter(p => p !== undefined).join(':');
}

/**
 * Common cache keys
 */
export const CACHE_KEYS = {
  PORTFOLIO: 'portfolio',
  PORTFOLIO_ITEM: 'portfolio:item',
  PRODUCTS: 'products',
  PRODUCT_ITEM: 'product:item',
  SERVICES: 'services',
  CATEGORIES: 'categories',
  VIDEOS: 'videos',
  SITE_SETTINGS: 'site:settings',
  PAGE_SETTINGS: 'page:settings',
  USER: 'user',
};

/**
 * Common cache tags
 */
export const CACHE_TAGS = {
  PORTFOLIO: 'portfolio',
  PRODUCTS: 'products',
  SERVICES: 'services',
  CATEGORIES: 'categories',
  VIDEOS: 'videos',
  SETTINGS: 'settings',
  USERS: 'users',
};
