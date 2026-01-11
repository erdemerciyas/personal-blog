import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Portfolio from '@/models/Portfolio';
import connectDB from '@/lib/mongoose';

/**
 * GET /api/admin/portfolio - List all portfolio items for admin
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

    const portfolioItems = await Portfolio.find()
      .sort({ createdAt: -1 })
      .sort({ createdAt: -1 });

    return NextResponse.json(portfolioItems);
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio items' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/portfolio - Create a new portfolio item
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

    const portfolio = new Portfolio({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await portfolio.save();

    return NextResponse.json(
      { success: true, data: portfolio },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create portfolio item' },
      { status: 500 }
    );
  }
}
