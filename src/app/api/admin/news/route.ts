import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import News from '@/models/News';
import connectDB from '@/lib/mongoose';

/**
 * GET /api/admin/news - List all news articles for admin
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const news = await News.find()
      .sort({ createdAt: -1 })
      .sort({ createdAt: -1 });

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/news - Create a new news article
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();

    const news = new News({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await news.save();

    return NextResponse.json(
      { success: true, data: news },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create news' },
      { status: 500 }
    );
  }
}
