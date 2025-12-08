import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { generateMetadata, validateMetadata } from '@/lib/ai-service';
import { ApiResponse, AIMetadataGenerationResponse } from '@/types/news';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/ai/generate-metadata:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate metadata using AI
 *     description: Generate SEO-optimized metadata (title, description, keywords, excerpt) from content
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Content to generate metadata from
 *               language:
 *                 type: string
 *                 enum: [tr, es]
 *                 description: Language for metadata generation
 *     responses:
 *       200:
 *         description: Metadata generated successfully
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

    const body = await request.json();

    // Validate input
    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Content is required and must be a string',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (!body.language || !['tr', 'es'].includes(body.language)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Language must be either "tr" or "es"',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (body.content.length < 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content must be at least 100 characters',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (body.content.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content must not exceed 5000 characters',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    logger.info('Generating metadata with AI', 'AI_API', {
      userId: (session.user as any).id,
      language: body.language,
      contentLength: body.content.length,
    });

    // Generate metadata
    const metadata = await generateMetadata({
      content: body.content,
      language: body.language,
    });

    // Validate generated metadata
    const validation = validateMetadata(metadata);
    if (!validation.valid) {
      logger.warn('Generated metadata validation failed', 'AI_API', {
        errors: validation.errors,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Generated metadata validation failed',
          meta: { errors: validation.errors },
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const response: ApiResponse<AIMetadataGenerationResponse> = {
      success: true,
      data: metadata,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error generating metadata', 'AI_API', { error });

    // Check if it's an AI service error
    if (error instanceof Error && error.message.includes('AI service not configured')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service is not configured',
        } as ApiResponse<null>,
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate metadata',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
