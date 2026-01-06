import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongoose';
import News from '@/models/News';
import User from '@/models/User';
import slugify from 'slugify';
import { ApiResponse, NewsListResponse, CreateNewsInput, NewsItem } from '@/types/news';
import { logger } from '@/core/lib/logger';
import { validateNewsInput } from '@/lib/validation';

/**
 * @swagger
 * /api/news:
 *   get:
 *     tags:
 *       - News
 *     summary: Get news articles list
 *     description: Retrieve a paginated list of news articles with optional filtering
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News articles retrieved successfully
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '10'));
    const status = searchParams.get('status') as 'draft' | 'published' | null;
    const search = searchParams.get('search');

    // Build query
    const query: any = {};

    // Only show published articles to non-authenticated users
    const session = await getServerSession();
    if (!session) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    // Search in Turkish title and content
    if (search) {
      query.$or = [
        { 'translations.tr.title': { $regex: search, $options: 'i' } },
        { 'translations.es.title': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await News.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Fetch articles
    const articles = (await News.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()) as unknown as NewsItem[];

    const response: ApiResponse<NewsListResponse> = {
      success: true,
      data: {
        items: articles,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching news articles', 'NEWS_API', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news articles',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/news:
 *   post:
 *     tags:
 *       - News
 *     summary: Create a new news article
 *     description: Create a new news article with multilingual content
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               translations:
 *                 type: object
 *               featuredImage:
 *                 type: object
 *               tags:
 *                 type: array
 *     responses:
 *       201:
 *         description: News article created successfully
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
    const validation = validateNewsInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Create news article
    const newsData: CreateNewsInput = body;
    logger.info('Creating news with data', 'NEWS_API', { newsData });

    let authorId: mongoose.Types.ObjectId;
    const sessionUserId = (session.user as any).id;

    if (mongoose.Types.ObjectId.isValid(sessionUserId)) {
      authorId = new mongoose.Types.ObjectId(sessionUserId);
    } else if (session.user.email) {
      // Fallback: try to find user by email
      logger.warn('Session user ID invalid, trying fallback by email', 'NEWS_API', { email: session.user.email });
      const user = await User.findOne({ email: session.user.email });

      if (user) {
        authorId = user._id;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'User not found in database',
          } as ApiResponse<null>,
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user session. Please log out and log in again.',
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Generate slug from title
    const titleForSlug = newsData.translations?.tr?.title || newsData.translations?.es?.title || 'news';
    const slugBase = slugify(titleForSlug, { lower: true, strict: true, replacement: '-' });
    const slug = `${slugBase}-${Date.now()}`;

    const news = new News({
      ...newsData,
      slug,
      author: {
        id: authorId,
        name: session.user.name || session.user.email?.split('@')[0] || 'Admin',
        email: session.user.email,
      },
      // Use status from form if provided, otherwise default to draft
      status: newsData.status || 'draft',
    });

    logger.info('News object before save', 'NEWS_API', {
      status: news.status,
      hasTranslations: !!news.translations,
    });

    await news.save();
    logger.info('News saved successfully', 'NEWS_API', { newsId: news._id });

    // Revalidate cache for new news article
    const { revalidateNewsDetail, revalidateNewsListing, revalidateNewsCarousel } = await import('@/lib/news-cache-service');
    await revalidateNewsDetail(news.slug);
    await revalidateNewsListing();
    await revalidateNewsCarousel();

    logger.info('News article created', 'NEWS_API', {
      newsId: news._id,
      slug: news.slug,
      userId: sessionUserId,
    });

    const response: ApiResponse<any> = {
      success: true,
      data: news,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Error creating news article', 'NEWS_API', {
      error: errorMessage,
      stack: errorStack,
      errorType: error?.constructor?.name,
    });

    // Return more detailed error in development
    const isProduction = process.env.NODE_ENV === 'production';
    const detailedError = isProduction ? 'Failed to create news article' : errorMessage;

    return NextResponse.json(
      {
        success: false,
        error: detailedError,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
