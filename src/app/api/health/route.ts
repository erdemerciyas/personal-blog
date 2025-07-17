import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';

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