import { useState, useEffect, useCallback } from 'react';
import { cacheManager, CACHE_KEYS } from '../lib/cache-manager';

interface UseApiOptions {
  cacheKey?: string;
  cacheTTL?: number;
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  url: string, 
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    immediate = true,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (cacheKey) {
        const cachedData = cacheManager.get<T>(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          onSuccess?.(cachedData);
          return;
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        // Don't throw error for 404s on public APIs, just return empty data
        if (response.status === 404 && !url.includes('/admin/')) {
          setData([] as T);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      if (cacheKey) {
        cacheManager.set(cacheKey, result, cacheTTL);
      }

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      // Don't log 404 errors for public APIs to console
      if (!error.message.includes('404') || url.includes('/admin/')) {
        console.warn(`API Error for ${url}:`, error.message);
      }
      
      setError(error);
      onError?.(error);
      
      // Set empty data for failed requests to prevent UI issues
      setData([] as T);
    } finally {
      setLoading(false);
    }
  }, [url, cacheKey, cacheTTL, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Specialized hooks for common API calls
export function useSliderItems() {
  return useApi('/api/slider', {
    cacheKey: CACHE_KEYS.SLIDER_ITEMS,
    cacheTTL: 10 * 60 * 1000 // 10 minutes for slider
  });
}

export function usePortfolioItems(limit?: number) {
  const url = limit ? `/api/portfolio?limit=${limit}` : '/api/portfolio';
  return useApi(url, {
    cacheKey: limit ? `${CACHE_KEYS.PORTFOLIO_ITEMS}_${limit}` : CACHE_KEYS.PORTFOLIO_ITEMS,
    cacheTTL: 5 * 60 * 1000 // 5 minutes
  });
}

export function useServices() {
  return useApi('/api/services', {
    cacheKey: CACHE_KEYS.SERVICES,
    cacheTTL: 10 * 60 * 1000 // 10 minutes
  });
}

export function useSiteSettings() {
  return useApi('/api/admin/site-settings', {
    cacheKey: CACHE_KEYS.SITE_SETTINGS,
    cacheTTL: 15 * 60 * 1000 // 15 minutes
  });
}