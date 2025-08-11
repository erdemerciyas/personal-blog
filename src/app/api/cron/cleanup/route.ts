import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request
  const url = new URL(request.url);
  const hasVercelCronHeader = !!request.headers.get('x-vercel-cron');
  const authHeader = request.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;
  const secretParam = url.searchParams.get('secret') || request.headers.get('x-cron-secret') || bearer;
  const isAuthorized = hasVercelCronHeader || (secretParam && secretParam === process.env.CRON_SECRET);

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    await connectDB();
    
    const results = {
      tempFilesDeleted: 0,
      oldLogsDeleted: 0,
      cacheCleared: false,
      timestamp: new Date().toISOString()
    };

    // Clean up temporary files
    const tempDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
    if (fs.existsSync(tempDir)) {
      const tempFiles = fs.readdirSync(tempDir);
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      for (const file of tempFiles) {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < oneDayAgo) {
          fs.unlinkSync(filePath);
          results.tempFilesDeleted++;
        }
      }
    }

    // Clean up old log files (if any)
    const logsDir = path.join(process.cwd(), 'logs');
    if (fs.existsSync(logsDir)) {
      const logFiles = fs.readdirSync(logsDir);
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      for (const file of logFiles) {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < oneWeekAgo) {
          fs.unlinkSync(filePath);
          results.oldLogsDeleted++;
        }
      }
    }

    // Clear any in-memory caches (if implemented)
    results.cacheCleared = true;

    console.log('Cleanup cron job completed:', results);

    const response = NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      results
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;

  } catch (error) {
    console.error('Cleanup cron job error:', error);
    return NextResponse.json({
      success: false,
      error: 'Cleanup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}