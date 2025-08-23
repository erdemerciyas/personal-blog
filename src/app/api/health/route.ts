import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - System
 *     summary: System health check
 *     description: Returns the health status of the application and database connection
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *             example:
 *               status: "healthy"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *               platform: "vercel"
 *               region: "iad1"
 *               database: "connected"
 *       500:
 *         description: System is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HealthCheck'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       description: Error message
 *             example:
 *               status: "unhealthy"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *               platform: "local"
 *               region: "unknown"
 *               database: "disconnected"
 *               error: "Database connection failed"
 */

export async function GET() {
  try {
    // Database bağlantısını test et
    await connectDB();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      platform: process.env.VERCEL ? 'vercel' : 'local',
      region: process.env.VERCEL_REGION || 'unknown',
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      platform: process.env.VERCEL ? 'vercel' : 'local',
      region: process.env.VERCEL_REGION || 'unknown',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Vercel için edge runtime kullanmıyoruz - MongoDB ile uyumsuz
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';