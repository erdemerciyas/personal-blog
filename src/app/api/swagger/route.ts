import { NextResponse } from 'next/server';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerConfig } from '@/lib/swagger-config';

/**
 * @swagger
 * /api/swagger:
 *   get:
 *     tags:
 *       - Documentation
 *     summary: Get OpenAPI/Swagger specification
 *     description: Returns the OpenAPI specification for the API
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

export async function GET() {
  try {
    const specs = swaggerJsdoc(swaggerConfig);
    
    return NextResponse.json(specs, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (_error) {
    return NextResponse.json(
      {
        error: {
          message: 'Failed to generate Swagger specification',
          code: 'SWAGGER_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
