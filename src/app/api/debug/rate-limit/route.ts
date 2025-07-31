import { NextRequest, NextResponse } from 'next/server';
import { getClientIP, getRateLimitStatus, RATE_LIMITS } from '../../../../lib/rate-limit';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const clientIP = getClientIP(request);
  const status = getRateLimitStatus(clientIP);
  
  return NextResponse.json({
    ip: clientIP,
    rateLimitStatus: status,
    rateLimits: RATE_LIMITS,
    bypassEnabled: process.env.BYPASS_RATE_LIMIT === 'true',
    environment: process.env.NODE_ENV
  });
}

export async function DELETE(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  // This would clear the rate limit cache
  // Since we're using in-memory storage, we can't directly clear it from here
  // But we can provide instructions
  
  return NextResponse.json({
    message: 'To clear rate limit cache, restart the development server',
    instructions: [
      '1. Stop the dev server (Ctrl+C)',
      '2. Start it again (npm run dev)',
      '3. Or set BYPASS_RATE_LIMIT=true in .env.local'
    ]
  });
}