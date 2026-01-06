import { revalidatePath, revalidateTag } from 'next/cache';
import { logger } from '@/core/lib/logger';

/**
 * News Cache Service
 * Manages ISR revalidation and cache invalidation for news articles
 */

/**
 * Revalidate news carousel on homepage
 */
export async function revalidateNewsCarousel(): Promise<void> {
  try {
    // Revalidate homepage
    revalidatePath('/', 'layout');
    revalidatePath('/tr', 'page');
    revalidatePath('/es', 'page');

    // Revalidate tag-based cache
    revalidateTag('news-carousel');
    revalidateTag('news-list');

    logger.info('News carousel revalidated', 'CACHE_SERVICE');
  } catch (error) {
    logger.error('Error revalidating news carousel', 'CACHE_SERVICE', { error });
  }
}

/**
 * Revalidate news detail page
 */
export async function revalidateNewsDetail(slug: string): Promise<void> {
  try {
    // Revalidate both language versions
    revalidatePath(`/tr/haberler/${slug}`, 'page');
    revalidatePath(`/es/noticias/${slug}`, 'page');

    // Revalidate tag-based cache
    revalidateTag(`news-${slug}`);

    logger.info('News detail page revalidated', 'CACHE_SERVICE', { slug });
  } catch (error) {
    logger.error('Error revalidating news detail', 'CACHE_SERVICE', { error });
  }
}

/**
 * Revalidate news listing pages
 */
export async function revalidateNewsListing(): Promise<void> {
  try {
    // Revalidate both language versions
    revalidatePath('/tr/haberler', 'page');
    revalidatePath('/es/noticias', 'page');

    // Revalidate tag-based cache
    revalidateTag('news-list');

    logger.info('News listing pages revalidated', 'CACHE_SERVICE');
  } catch (error) {
    logger.error('Error revalidating news listing', 'CACHE_SERVICE', { error });
  }
}

/**
 * Revalidate sitemap
 */
export async function revalidateSitemap(): Promise<void> {
  try {
    revalidatePath('/api/sitemap', 'page');
    revalidateTag('sitemap');

    logger.info('Sitemap revalidated', 'CACHE_SERVICE');
  } catch (error) {
    logger.error('Error revalidating sitemap', 'CACHE_SERVICE', { error });
  }
}

/**
 * Revalidate all news-related pages
 */
export async function revalidateAllNews(): Promise<void> {
  try {
    // Revalidate all news pages
    await revalidateNewsCarousel();
    await revalidateNewsListing();
    await revalidateSitemap();

    logger.info('All news pages revalidated', 'CACHE_SERVICE');
  } catch (error) {
    logger.error('Error revalidating all news pages', 'CACHE_SERVICE', { error });
  }
}

/**
 * Get cache headers for news detail pages
 */
export function getNewsCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    'CDN-Cache-Control': 'max-age=3600',
  };
}

/**
 * Get cache headers for news listing pages
 */
export function getNewsListCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
    'CDN-Cache-Control': 'max-age=1800',
  };
}

/**
 * Get cache headers for news carousel
 */
export function getNewsCarouselCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=3600',
    'CDN-Cache-Control': 'max-age=60',
  };
}

/**
 * Cache configuration for different news endpoints
 */
export const NEWS_CACHE_CONFIG = {
  // Detail pages: 1 hour cache, 1 day stale-while-revalidate
  detail: {
    revalidate: 3600,
    tags: ['news-detail'],
  },
  // Listing pages: 30 minutes cache, 1 day stale-while-revalidate
  listing: {
    revalidate: 1800,
    tags: ['news-list'],
  },
  // Carousel: 1 minute cache, 1 hour stale-while-revalidate
  carousel: {
    revalidate: 60,
    tags: ['news-carousel'],
  },
  // Sitemap: 1 hour cache
  sitemap: {
    revalidate: 3600,
    tags: ['sitemap'],
  },
};
