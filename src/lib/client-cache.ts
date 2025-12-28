/**
 * Client-side cache for API responses
 * Helps reduce API calls and improve performance
 * Uses unified cache from main cache module
 */

import { cache, CacheTTL } from './cache';

// Re-export the main cache as clientCache for backward compatibility
export const clientCache = cache;

// Helper function for cached fetch
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  ttl: number = CacheTTL.MEDIUM // Default to 5 minutes
): Promise<T> {
  const cacheKey = `fetch:${url}:${JSON.stringify(options || {})}`;
  
  // Check cache first
  const cached = clientCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Cache the result
  clientCache.set(cacheKey, data, ttl);
  
  return data;
}