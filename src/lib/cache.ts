/**
 * Caching utility for improved performance
 * Provides in-memory caching with TTL support
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };
    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    const isExpired = (now - item.timestamp) > item.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    const isExpired = (now - item.timestamp) > item.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Get cache stats
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Clean expired items
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of Array.from(this.cache.entries())) {
      const isExpired = (now - item.timestamp) > item.ttl;
      if (isExpired) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Singleton cache instance
export const cache = new MemoryCache();

// Cache wrapper for functions
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    
    // Try to get from cache first
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    cache.set(key, result, ttl);
    
    return result;
  }) as T;
}

// Predefined cache keys
export const CacheKeys = {
  // Site settings
  SITE_SETTINGS: 'site-settings',
  PAGE_SETTINGS: 'page-settings',
  
  // Content
  SERVICES: 'services',
  PORTFOLIO: 'portfolio',
  SLIDER: 'slider',
  CATEGORIES: 'categories',
  
  // User data
  USER_PROFILE: (userId: string) => `user-profile-${userId}`,
  USER_LIST: 'user-list',
  
  // Media
  MEDIA_LIST: 'media-list',
  
  // API responses
  API_RESPONSE: (endpoint: string, params?: string) => 
    `api-${endpoint}${params ? `-${params}` : ''}`,
};

// Cache durations
export const CacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 30 * 60 * 1000,      // 30 minutes
  HOUR: 60 * 60 * 1000,      // 1 hour
  DAY: 24 * 60 * 60 * 1000,  // 24 hours
};

// Auto cleanup every 10 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    const cleaned = cache.cleanup();
    // Cache cleanup completed
  }, 10 * 60 * 1000);
}

// Cache helpers for common operations
export const cacheHelpers = {
  // Invalidate related caches
  invalidatePattern: (pattern: string) => {
    const { keys } = cache.stats();
    keys.forEach(key => {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    });
  },

  // Invalidate all user-related caches
  invalidateUserCaches: (userId?: string) => {
    if (userId) {
      cache.delete(CacheKeys.USER_PROFILE(userId));
    }
    cache.delete(CacheKeys.USER_LIST);
  },

  // Invalidate all content caches
  invalidateContentCaches: () => {
    cache.delete(CacheKeys.SERVICES);
    cache.delete(CacheKeys.PORTFOLIO);
    cache.delete(CacheKeys.SLIDER);
    cache.delete(CacheKeys.CATEGORIES);
  },

  // Invalidate all settings caches
  invalidateSettingsCaches: () => {
    cache.delete(CacheKeys.SITE_SETTINGS);
    cache.delete(CacheKeys.PAGE_SETTINGS);
  }
}; 