import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import News from '@/models/News';
import { ApiResponse } from '@/types/news';
import { logger } from '@/core/lib/logger';

/**
 * @swagger
 * /api/news/slug/{slug}:
 *   get:
 *     tags:
 *       - News
 *     summary: Get news article by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News article retrieved
 *       404:
 *         description: News article not found
 *       500:
 *         description: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const news = await News.findOne({ slug: params.slug })
      .populate('relatedPortfolioIds', 'title slug coverImage')
      .populate('relatedNewsIds', 'slug translations featuredImage');

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          error: 'News article not found',
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Check if user has permission to view draft articles
    const session = await getServerSession();
    if (news.status === 'draft' && !session) {
      return NextResponse.json(
        {
          success: false,
          error: 'News article not found',
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const response: ApiResponse<any> = {
      success: true,
      data: news,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching news article by slug', 'NEWS_API', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news article',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
