import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import PageSetting from '@/models/PageSetting';

/**
 * GET /api/admin/pages - List all page settings for admin
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const pages = await PageSetting.find()
      .sort({ order: 1 })
      .select('_id pageId title path description icon isExternal isActive showInNavigation order createdAt updatedAt');

    // Filter out internal pages that shouldn't be managed
    const filteredPages = pages.filter((p: { pageId: string }) => p.pageId !== 'product-detail');

    return NextResponse.json(filteredPages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pages - Create a new page setting
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    await connectDB();
    
    const page = new PageSetting({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await page.save();

    return NextResponse.json(
      { success: true, data: page },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create page' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pages - Update page order
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const pages = await req.json();
    await connectDB();

    // Update all pages with new order
    const updatePromises = pages.map((page: { pageId: string; order: number }) =>
      PageSetting.findOneAndUpdate(
        { pageId: page.pageId },
        { order: page.order },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true, message: 'Page order updated' });
  } catch (error) {
    console.error('Error updating page order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update page order' },
      { status: 500 }
    );
  }
}
