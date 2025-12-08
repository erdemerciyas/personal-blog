import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongoose';
import News from '@/models/News';
import { ApiResponse, BulkActionRequest, BulkActionResponse } from '@/types/news';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/news/bulk-action:
 *   post:
 *     tags:
 *       - News
 *     summary: Perform bulk actions on news articles
 *     description: Publish, unpublish, or delete multiple news articles at once
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               action:
 *                 type: string
 *                 enum: [publish, unpublish, delete]
 *     responses:
 *       200:
 *         description: Bulk action completed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate input
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'IDs array is required and must not be empty',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (!body.action || !['publish', 'unpublish', 'delete'].includes(body.action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Action must be one of: publish, unpublish, delete',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const request_data: BulkActionRequest = body;
    let updated = 0;
    let failed = 0;
    const errors: Array<{ id: string; error: string }> = [];

    // Process each article
    for (const id of request_data.ids) {
      try {
        const news = await News.findById(id);

        if (!news) {
          failed++;
          errors.push({ id, error: 'Article not found' });
          continue;
        }

        switch (request_data.action) {
          case 'publish':
            news.status = 'published';
            if (!news.publishedAt) {
              news.publishedAt = new Date();
            }
            break;

          case 'unpublish':
            news.status = 'draft';
            break;

          case 'delete':
            await News.findByIdAndDelete(id);
            updated++;
            continue;
        }

        await news.save();
        updated++;
      } catch (err) {
        failed++;
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ id, error: errorMessage });
      }
    }

    logger.info('Bulk action completed', 'NEWS_API', {
      action: request_data.action,
      userId: (session.user as any).id,
      updated,
      failed,
    });

    const response: ApiResponse<BulkActionResponse> = {
      success: true,
      data: {
        success: failed === 0,
        updated,
        failed,
        errors: errors.length > 0 ? errors : undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error performing bulk action', 'NEWS_API', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform bulk action',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
