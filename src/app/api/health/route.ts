import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
// connectDB from '@/lib/mongoose';  // Commenting out unused import
// Video from '@/models/Video';  // Commenting out unused import

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
    // Check MongoDB connection
    const dbConnection = await mongoose.connection.readyState;
    
    // Check YouTube API health if configured
    const youtubeHealth = await checkYouTubeAPIHealth();
    
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      mongodb: dbConnection === 1 ? 'connected' : 'disconnected',
      youtube: youtubeHealth.status,
      youtubeMessage: youtubeHealth.message,
      version: process.env.npm_package_version || 'unknown'
    };
    
    return NextResponse.json(healthData);
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

async function checkYouTubeAPIHealth() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  
  if (!apiKey || !channelId) {
    return { status: 'not configured', message: 'YouTube API key or channel ID not set' };
  }
  
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${channelId}&part=snippet`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    
    if (!response.ok) {
      return { status: 'unreachable', message: 'YouTube API is not accessible' };
    }
    
    const data = await response.json();
    const videoCount = data.items[0]?.snippet?.title ? 1 : 0;
    
    return { status: 'ok', message: `YouTube API is accessible, ${videoCount} video(s) found` };
  } catch (error) {
    console.error("YouTube health check failed:", error);
    return { status: 'error', message: 'YouTube health check failed' };
  }
}