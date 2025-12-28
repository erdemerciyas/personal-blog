/**
 * Client-side cache manager for better performance
 * Uses unified cache from main cache module
 */

import { cache, CacheKeys, CacheTTL } from './cache';

// Re-export the main cache as cacheManager for backward compatibility
export const cacheManager = cache;

// Cache keys - extend main CacheKeys with specific ones
export const CACHE_KEYS = {
  ...CacheKeys,
  SLIDER_ITEMS: 'slider_items',
  PORTFOLIO_ITEMS: 'portfolio_items',
  SERVICES: 'services',
  SITE_SETTINGS: 'site_settings',
  CATEGORIES: 'categories',
  MESSAGES: 'messages',
} as const;

// Export TTL constants
export const CACHE_TTL = CacheTTL;