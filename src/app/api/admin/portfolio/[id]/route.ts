import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Portfolio from '@/models/Portfolio';

/**
 * GET /api/admin/portfolio/[id] - Get single portfolio item
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

    const portfolio = await Portfolio.findById(params.id);

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: portfolio });
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio item' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/portfolio/[id] - Update portfolio item
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
    const portfolio = await Portfolio.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: portfolio });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update portfolio item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/portfolio/[id] - Delete portfolio item
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

    const portfolio = await Portfolio.findByIdAndDelete(params.id);

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: 'Portfolio item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: portfolio });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete portfolio item' },
      { status: 500 }
    );
  }
}
