/**
 * Enhanced Portfolio API Route
 * Demonstrates integration of:
 * - Advanced error handling
 * - Logging system
 * - Caching
 */

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Portfolio from '@/models/Portfolio';
import Category from '@/models/Category';
import { advancedLogger } from '@/lib/advanced-logger';
import { cacheManager, CACHE_KEYS, CACHE_TAGS } from '@/lib/redis-cache';
import { logDetailedError, categorizeError, getRecoveryStrategy } from '@/lib/error-utils';
import { createError, handleApiError } from '@/lib/errorHandler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/portfolio
 * Get all portfolio items with caching
 */
export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    // Log request
    advancedLogger.logWithContext(
      'info',
      'Portfolio GET request',
      'PORTFOLIO_API',
      { url: request.url },
      undefined,
      requestId
    );

    // Check cache first
    const cached = cacheManager.get(CACHE_KEYS.PORTFOLIO);
    if (cached) {
      advancedLogger.logWithContext(
        'debug',
        'Portfolio data from cache',
        'PORTFOLIO_API',
        { cacheHit: true },
        undefined,
        requestId
      );

      return NextResponse.json(cached);
    }

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const categorySlugs = searchParams.get('categories')?.split(',');

    // Build query
    const query: Record<string, unknown> = {};

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.categoryIds = category._id;
      }
    } else if (categorySlugs && categorySlugs.length > 0) {
      const categories = await Category.find({ slug: { $in: categorySlugs } });
      const categoryIds = categories.map(c => c._id);
      query.categoryIds = { $in: categoryIds };
    }

    // Fetch portfolio items
    const portfolioItems = await Portfolio.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Cache the result
    cacheManager.set(CACHE_KEYS.PORTFOLIO, portfolioItems, {
      ttl: 3600,
      tags: [CACHE_TAGS.PORTFOLIO],
    });

    // Log success
    const duration = Date.now() - startTime;
    advancedLogger.logPerformance(
      'portfolio_fetch',
      duration,
      'success',
      { itemCount: portfolioItems.length }
    );

    return NextResponse.json(portfolioItems);
  } catch (error) {
    const duration = Date.now() - startTime;
    const category = categorizeError(error);

    // Log detailed error
    logDetailedError(error as Error, {
      requestId,
      endpoint: '/api/portfolio',
      method: 'GET',
    });

    // Log performance failure
    advancedLogger.logPerformance(
      'portfolio_fetch',
      duration,
      'failure',
      { error: (error as Error).message }
    );

    // Get recovery strategy
    const strategy = getRecoveryStrategy(category);
    if (strategy.notify) {
      advancedLogger.logAnalytics('portfolio_error', undefined, {
        category,
        requestId,
      });
    }

    // Handle error
    return handleApiError(error as Error, request);
  }
}

/**
 * POST /api/portfolio
 * Create new portfolio item (admin only)
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      throw createError.forbidden('Admin access required');
    }

    advancedLogger.logWithContext(
      'info',
      'Portfolio POST request',
      'PORTFOLIO_API',
      { userId: session.user.id },
      undefined,
      requestId,
      session.user.id
    );

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.slug || !body.description) {
      throw createError.validation('Missing required fields', {
        required: ['title', 'slug', 'description'],
      });
    }

    // Create portfolio item
    const portfolio = new Portfolio(body);
    await portfolio.save();

    // Invalidate cache
    cacheManager.invalidateByTag(CACHE_TAGS.PORTFOLIO);

    // Log success
    const duration = Date.now() - startTime;
    advancedLogger.logPerformance(
      'portfolio_create',
      duration,
      'success',
      { portfolioId: portfolio._id }
    );

    advancedLogger.logAnalytics(
      'portfolio_created',
      session.user.id,
      { portfolioId: portfolio._id, title: portfolio.title }
    );

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    // Category would be used for error recovery strategy
    categorizeError(error);

    // Log detailed error
    logDetailedError(error as Error, {
      requestId,
      endpoint: '/api/portfolio',
      method: 'POST',
    });

    // Log performance failure
    advancedLogger.logPerformance(
      'portfolio_create',
      duration,
      'failure',
      { error: (error as Error).message }
    );

    // Handle error
    return handleApiError(error as Error, request);
  }
}

export const runtime = 'nodejs';
