import connectDB from './mongoose';
import News from '@/models/News';
import Portfolio from '@/models/Portfolio';
import { logger } from '@/core/lib/logger';

/**
 * Relationship Service
 * Manages bidirectional relationships between news articles and other content
 */

/**
 * Link news article to portfolio items
 */
export async function linkNewsToPortfolio(
  newsId: string,
  portfolioIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    // Update news article
    const news = await News.findById(newsId);
    if (!news) {
      return { success: false, error: 'News article not found' };
    }

    news.relatedPortfolioIds = portfolioIds;
    await news.save();

    logger.info('News linked to portfolio items', 'RELATIONSHIP_SERVICE', {
      newsId,
      portfolioCount: portfolioIds.length,
    });

    return { success: true };
  } catch (error) {
    logger.error('Error linking news to portfolio', 'RELATIONSHIP_SERVICE', { error });
    return { success: false, error: 'Failed to link news to portfolio' };
  }
}

/**
 * Link news articles to each other
 */
export async function linkNewsToNews(
  newsId: string,
  relatedNewsIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    // Update news article
    const news = await News.findById(newsId);
    if (!news) {
      return { success: false, error: 'News article not found' };
    }

    news.relatedNewsIds = relatedNewsIds;
    await news.save();

    logger.info('News linked to other news articles', 'RELATIONSHIP_SERVICE', {
      newsId,
      relatedCount: relatedNewsIds.length,
    });

    return { success: true };
  } catch (error) {
    logger.error('Error linking news to news', 'RELATIONSHIP_SERVICE', { error });
    return { success: false, error: 'Failed to link news to news' };
  }
}

/**
 * Remove news article and clean up relationships
 */
export async function removeNewsAndCleanupRelationships(
  newsId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    // Find the news article
    const news = await News.findById(newsId);
    if (!news) {
      return { success: false, error: 'News article not found' };
    }

    // Remove from related news articles
    if (news.relatedNewsIds && news.relatedNewsIds.length > 0) {
      await News.updateMany(
        { _id: { $in: news.relatedNewsIds } },
        { $pull: { relatedNewsIds: newsId } }
      );
    }

    // Delete the news article
    await News.findByIdAndDelete(newsId);

    logger.info('News article deleted and relationships cleaned up', 'RELATIONSHIP_SERVICE', {
      newsId,
    });

    return { success: true };
  } catch (error) {
    logger.error('Error removing news and cleaning relationships', 'RELATIONSHIP_SERVICE', {
      error,
    });
    return { success: false, error: 'Failed to remove news article' };
  }
}

/**
 * Get related content for a news article
 */
export async function getRelatedContent(newsId: string) {
  try {
    await connectDB();

    const news = await News.findById(newsId)
      .populate('relatedPortfolioIds', 'title slug coverImage')
      .populate('relatedNewsIds', 'slug translations featuredImage');

    if (!news) {
      return { success: false, error: 'News article not found' };
    }

    return {
      success: true,
      data: {
        portfolioItems: news.relatedPortfolioIds || [],
        relatedNews: news.relatedNewsIds || [],
      },
    };
  } catch (error) {
    logger.error('Error getting related content', 'RELATIONSHIP_SERVICE', { error });
    return { success: false, error: 'Failed to get related content' };
  }
}

/**
 * Validate relationships exist
 */
export async function validateRelationships(
  portfolioIds: string[],
  newsIds: string[]
): Promise<{ valid: boolean; invalidIds: string[] }> {
  try {
    await connectDB();

    const invalidIds: string[] = [];

    // Check portfolio items
    if (portfolioIds && portfolioIds.length > 0) {
      const portfolios = await Portfolio.find({ _id: { $in: portfolioIds } }).select('_id');
      const validPortfolioIds = portfolios.map((p) => p._id.toString());

      for (const id of portfolioIds) {
        if (!validPortfolioIds.includes(id)) {
          invalidIds.push(id);
        }
      }
    }

    // Check news articles
    if (newsIds && newsIds.length > 0) {
      const newsArticles = await News.find({ _id: { $in: newsIds } }).select('_id');
      const validNewsIds = newsArticles.map((n) => n._id.toString());

      for (const id of newsIds) {
        if (!validNewsIds.includes(id)) {
          invalidIds.push(id);
        }
      }
    }

    return {
      valid: invalidIds.length === 0,
      invalidIds,
    };
  } catch (error) {
    logger.error('Error validating relationships', 'RELATIONSHIP_SERVICE', { error });
    return { valid: false, invalidIds: [...portfolioIds, ...newsIds] };
  }
}

/**
 * Get suggested related articles based on tags
 */
export async function getSuggestedRelatedArticles(
  newsId: string,
  limit: number = 5
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    await connectDB();

    const news = await News.findById(newsId);
    if (!news) {
      return { success: false, error: 'News article not found' };
    }

    // Find articles with similar tags
    const relatedArticles = await News.find({
      _id: { $ne: newsId },
      status: 'published',
      tags: { $in: news.tags },
    })
      .select('slug translations featuredImage tags')
      .limit(limit)
      .lean();

    return {
      success: true,
      data: relatedArticles,
    };
  } catch (error) {
    logger.error('Error getting suggested related articles', 'RELATIONSHIP_SERVICE', { error });
    return { success: false, error: 'Failed to get suggested articles' };
  }
}
