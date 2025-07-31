import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      hasSession: !!session,
      session: session ? {
        user: {
          id: (session.user as { id?: string })?.id,
          email: session.user?.email,
          role: (session.user as { role?: string })?.role,
        }
      } : null,
      message: 'Session check'
    });
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      hasSession: false,
      session: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Session check failed'
    });
  }
} 