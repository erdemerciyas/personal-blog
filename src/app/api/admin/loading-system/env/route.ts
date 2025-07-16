import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await request.json();
    
    // Update .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add NEXT_PUBLIC_SHOW_SKELETON
    const skeletonRegex = /^NEXT_PUBLIC_SHOW_SKELETON=.*$/m;
    const newSkeletonLine = `NEXT_PUBLIC_SHOW_SKELETON=${enabled}`;

    if (skeletonRegex.test(envContent)) {
      envContent = envContent.replace(skeletonRegex, newSkeletonLine);
    } else {
      envContent += `\n# Loading System\n${newSkeletonLine}\n`;
    }

    fs.writeFileSync(envPath, envContent);

    // Note: process.env update requires server restart for full effect

    return NextResponse.json({ 
      success: true, 
      message: 'Environment variable updated successfully',
      note: 'Development server restart recommended for full effect'
    });
  } catch (error) {
    console.error('Environment update error:', error);
    return NextResponse.json(
      { error: 'Failed to update environment variable' },
      { status: 500 }
    );
  }
}