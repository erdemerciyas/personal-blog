import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import News from '@/models/News';

/**
 * GET /api/admin/news/[id] - Get single news article
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const news = await News.findById(params.id);

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/news/[id] - Update news article
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const news = await News.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update news' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/news/[id] - Delete news article
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const news = await News.findByIdAndDelete(params.id);

    if (!news) {
      return NextResponse.json(
        { success: false, error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete news' },
      { status: 500 }
    );
  }
}
