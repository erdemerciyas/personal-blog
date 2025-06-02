import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';

export async function GET() {
  try {
    // Environment Variables Check
    const envCheck = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Missing',
      NODE_ENV: process.env.NODE_ENV || '❌ Missing',
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Set (length: ' + (process.env.MONGODB_URI?.length || 0) + ')' : '❌ Missing'
    };

    // MongoDB Connection Test
    let mongoStatus = '❌ Failed';
    let mongoError = null;
    
    try {
      await connectDB();
      mongoStatus = '✅ Connected';
    } catch (error) {
      mongoError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      mongodb: {
        status: mongoStatus,
        error: mongoError
      },
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        url: process.env.VERCEL_URL || 'unknown'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 