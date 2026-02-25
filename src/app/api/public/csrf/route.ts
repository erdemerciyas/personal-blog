import { NextRequest, NextResponse } from 'next/server';
import { CSRFProtection, getCSRFToken } from '@/lib/csrf';

export async function GET(request: NextRequest) {
  const sessionId = CSRFProtection.generateSessionId(request);
  const token = getCSRFToken(sessionId);
  return NextResponse.json({ token }, { headers: { 'Cache-Control': 'no-store' } });
}


