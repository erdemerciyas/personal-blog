import { NextResponse } from 'next/server';
import connectDB, { hasValidMongoUri } from '@/lib/mongoose';
import ProductCategory from '@/models/ProductCategory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!hasValidMongoUri()) {
      return NextResponse.json({ items: [] }, { headers: { 'Cache-Control': 'public, s-maxage=60' } });
    }
    await connectDB();
    const items = await ProductCategory.find({ isActive: true }).sort({ order: 1, name: 1 }).select('name slug').lean();
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
  } catch (error) {
    console.error('Product categories API error:', error);
    return NextResponse.json(
      { items: [], error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60' } }
    );
  }
}


