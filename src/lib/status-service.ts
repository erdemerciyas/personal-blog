import connectDB from './mongoose';
import News from '@/models/News';
import { logger } from '@/core/lib/logger';

/**
 * Status Service
 * Manages news article status (draft/published) and access control
 */

/**
 * Publish a news article
 */
export async function publishNews(newsId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    const news = await News.findById(newsId);
    if (!news) {
      return { success: false, error: 'News article not found' };
    }

    news.status = 'published';
    news.publishedAt = new Date();
    await news.save();

    logger.info('News article published', 'STATUS_SERVICE', { newsId });

    return { success: true };
  } catch (error) {
    logger.error('Error publishing news article', 'STATUS_SERVICE', { error });
    return { success: false, error: 'Failed to publish news article' };
  }
}

/**
 * Unpublish a news article
 */
export async function unpublishNews(newsId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    const news = await News.findById(newsId);
    if (!news) {
      return { success: false, error: 'News article not found' };
    }

    news.status = 'draft';
    await news.save();

    logger.info('News article unpublished', 'STATUS_SERVICE', { newsId });

    return { success: true };
  } catch (error) {
    logger.error('Error unpublishing news article', 'STATUS_SERVICE', { error });
    return { success: false, error: 'Failed to unpublish news article' };
  }
}

/**
 * Check if a news article is accessible to a user
 */
export async function isNewsAccessible(
  newsId: string,
  isAuthenticated: boolean = false
): Promise<boolean> {
  try {
    await connectDB();

    const news = await News.findById(newsId).select('status');
    if (!news) {
      return false;
    }

    // Published articles are always accessible
    if (news.status === 'published') {
      return true;
    }

    // Draft articles are only accessible to authenticated users
    if (news.status === 'draft' && isAuthenticated) {
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error checking news accessibility', 'STATUS_SERVICE', { error });
    return false;
  }
}

/**
 * Get news article with access control
 */
export async function getNewsWithAccessControl(
  newsId: string,
  isAuthenticated: boolean = false
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connectDB();

    const news = await News.findById(newsId);
    if (!news) {
      return { success: false, error: 'News article not found' };
    }

    // Check access
    const isAccessible = await isNewsAccessible(newsId, isAuthenticated);
    if (!isAccessible) {
      return { success: false, error: 'Access denied' };
    }

    return { success: true, data: news };
  } catch (error) {
    logger.error('Error getting news with access control', 'STATUS_SERVICE', { error });
    return { success: false, error: 'Failed to get news article' };
  }
}

/**
 * Get news statistics
 */
export async function getNewsStatistics(): Promise<{
  total: number;
  published: number;
  draft: number;
  recentlyPublished: number;
}> {
  try {
    await connectDB();

    const total = await News.countDocuments();
    const published = await News.countDocuments({ status: 'published' });
    const draft = await News.countDocuments({ status: 'draft' });

    // Recently published (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentlyPublished = await News.countDocuments({
      status: 'published',
      publishedAt: { $gte: sevenDaysAgo },
    });

    return {
      total,
      published,
      draft,
      recentlyPublished,
    };
  } catch (error) {
    logger.error('Error getting news statistics', 'STATUS_SERVICE', { error });
    return {
      total: 0,
      published: 0,
      draft: 0,
      recentlyPublished: 0,
    };
  }
}

/**
 * Get publication timeline
 */
export async function getPublicationTimeline(
  days: number = 30
): Promise<
  Array<{
    date: string;
    count: number;
  }>
> {
  try {
    await connectDB();

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const timeline = await News.aggregate([
      {
        $match: {
          status: 'published',
          publishedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$publishedAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return timeline.map((item: any) => ({
      date: item._id,
      count: item.count,
    }));
  } catch (error) {
    logger.error('Error getting publication timeline', 'STATUS_SERVICE', { error });
    return [];
  }
}

/**
 * Validate status transition
 */
export function isValidStatusTransition(
  _currentStatus: 'draft' | 'published',
  _newStatus: 'draft' | 'published'
): boolean {
  // All transitions are valid
  return true;
}

/**
 * Get status badge color
 */
export function getStatusBadgeColor(status: 'draft' | 'published'): string {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get status display text
 */
export function getStatusDisplayText(status: 'draft' | 'published', language: 'tr' | 'es' = 'tr'): string {
  if (language === 'tr') {
    switch (status) {
      case 'published':
        return 'Yayınlandı';
      case 'draft':
        return 'Taslak';
      default:
        return 'Bilinmiyor';
    }
  } else {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Borrador';
      default:
        return 'Desconocido';
    }
  }
}
