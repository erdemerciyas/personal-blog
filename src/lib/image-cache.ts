// Image cache management for better performance
interface CacheEntry {
  url: string;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
}

class ImageCacheManager {
  private cache = new Map<string, CacheEntry>();
  private readonly maxCacheSize = 100;
  private readonly cacheExpiry = 1000 * 60 * 60 * 24; // 24 hours

  // Add image to cache
  addToCache(url: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    // Clean expired entries first
    this.cleanExpiredEntries();
    
    // If cache is full, remove oldest low priority items
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLowPriorityItems();
    }

    this.cache.set(url, {
      url,
      timestamp: Date.now(),
      priority
    });
  }

  // Check if image is in cache and still valid
  isInCache(url: string): boolean {
    const entry = this.cache.get(url);
    if (!entry) return false;
    
    const isExpired = Date.now() - entry.timestamp > this.cacheExpiry;
    if (isExpired) {
      this.cache.delete(url);
      return false;
    }
    
    return true;
  }

  // Preload critical images
  async preloadImages(urls: string[], priority: 'high' | 'medium' | 'low' = 'medium') {
    const preloadPromises = urls.map(url => {
      if (this.isInCache(url)) return Promise.resolve();
      
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          this.addToCache(url, priority);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to preload image: ${url}`);
          resolve(); // Don't reject to avoid breaking the batch
        };
        img.src = url;
      });
    });

    try {
      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.error('Error preloading images:', error);
    }
  }

  // Clean expired entries
  private cleanExpiredEntries() {
    const now = Date.now();
    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheExpiry) {
        this.cache.delete(url);
      }
    }
  }

  // Evict low priority items when cache is full
  private evictLowPriorityItems() {
    const lowPriorityEntries = Array.from(this.cache.entries())
      .filter(([_, entry]) => entry.priority === 'low')
      .sort((a, b) => a[1].timestamp - b[1].timestamp); // Oldest first

    // Remove oldest low priority items
    const itemsToRemove = Math.min(lowPriorityEntries.length, 10);
    for (let i = 0; i < itemsToRemove; i++) {
      this.cache.delete(lowPriorityEntries[i][0]);
    }
  }

  // Get cache stats
  getCacheStats() {
    const stats = {
      size: this.cache.size,
      high: 0,
      medium: 0,
      low: 0
    };

    for (const entry of this.cache.values()) {
      stats[entry.priority]++;
    }

    return stats;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Singleton instance
export const imageCacheManager = new ImageCacheManager();

// Hook for using image cache in components
export function useImageCache() {
  return {
    preloadImages: imageCacheManager.preloadImages.bind(imageCacheManager),
    isInCache: imageCacheManager.isInCache.bind(imageCacheManager),
    addToCache: imageCacheManager.addToCache.bind(imageCacheManager),
    getCacheStats: imageCacheManager.getCacheStats.bind(imageCacheManager),
    clearCache: imageCacheManager.clearCache.bind(imageCacheManager)
  };
}

// Utility function to extract image URLs from portfolio data
export function extractImageUrls(portfolioItems: any[]): string[] {
  return portfolioItems
    .map(item => item.coverImage)
    .filter(Boolean)
    .filter(url => typeof url === 'string');
}

// Preload strategy for different page types
export const PRELOAD_STRATEGIES = {
  homepage: {
    priority: 'high' as const,
    maxImages: 6
  },
  portfolio: {
    priority: 'medium' as const,
    maxImages: 12
  },
  detail: {
    priority: 'high' as const,
    maxImages: 1
  }
} as const;