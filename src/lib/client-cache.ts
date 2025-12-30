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
  // Create a stable cache key - only use URL, ignore signal and headers
  // Signal and headers shouldn't affect cache validity
  const cacheKey = `fetch:${url}`;
  
  // Check cache first
  const cached = clientCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API - remove signal from options to avoid cache key issues
  const fetchOptions = { ...options };
  delete (fetchOptions as any).signal;
  
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Cache the result
  clientCache.set(cacheKey, data, ttl);
  
  return data;
}