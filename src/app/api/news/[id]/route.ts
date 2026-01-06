import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import News from '@/models/News';
import { ApiResponse, UpdateNewsInput } from '@/types/news';
import { logger } from '@/core/lib/logger';
import { validateNewsUpdateInput } from '@/lib/validation';

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     tags:
 *       - News
 *     summary: Get news article by ID
 *     parameters:
 *       - in: path
 *         name: id
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const news = await News.findById(params.id);

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
    logger.error('Error fetching news article', 'NEWS_API', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news article',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     tags:
 *       - News
 *     summary: Update news article
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: News article updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: News article not found
 *       500:
 *         description: Server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    await connectDB();

    const news = await News.findById(params.id);

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          error: 'News article not found',
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = validateNewsUpdateInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Update fields
    const updateData: UpdateNewsInput = body;

    if (updateData.translations) {
      news.translations = { ...news.translations, ...updateData.translations };
    }

    if (updateData.featuredImage) {
      news.featuredImage = { ...news.featuredImage, ...updateData.featuredImage };
    }

    if (updateData.status !== undefined) {
      news.status = updateData.status;
    }

    if (updateData.tags !== undefined) {
      news.tags = updateData.tags;
    }

    if (updateData.relatedPortfolioIds !== undefined) {
      news.relatedPortfolioIds = updateData.relatedPortfolioIds;
    }

    if (updateData.relatedNewsIds !== undefined) {
      news.relatedNewsIds = updateData.relatedNewsIds;
    }

    await news.save();

    // Revalidate cache for updated news
    const { revalidateNewsDetail, revalidateNewsListing, revalidateNewsCarousel } = await import('@/lib/news-cache-service');
    await revalidateNewsDetail(news.slug);
    await revalidateNewsListing();
    await revalidateNewsCarousel();

    logger.info('News article updated', 'NEWS_API', {
      newsId: news._id,
      userId: (session.user as any).id,
    });

    const response: ApiResponse<any> = {
      success: true,
      data: news,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error updating news article', 'NEWS_API', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update news article',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     tags:
 *       - News
 *     summary: Delete news article
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: News article deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: News article not found
 *       500:
 *         description: Server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    await connectDB();

    const news = await News.findByIdAndDelete(params.id);

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          error: 'News article not found',
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    logger.info('News article deleted', 'NEWS_API', {
      newsId: news._id,
      userId: (session.user as any).id,
    });

    const response: ApiResponse<null> = {
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error deleting news article', 'NEWS_API', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete news article',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
