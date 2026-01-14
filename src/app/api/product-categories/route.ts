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
    const categories = await ProductCategory.find({ isActive: true }).sort({ order: 1, name: 1 }).select('name slug parent').lean();

    // Aggregate product counts
    const { default: Product } = await import('@/models/Product');
    const counts = await Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$categoryIds' },
      { $group: { _id: '$categoryIds', count: { $sum: 1 } } }
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((c: any) => {
      if (c._id) countMap.set(String(c._id), c.count);
    });

    // Compute Recursive Counts
    // helper to get direct count
    const getDirect = (id: string) => countMap.get(String(id)) || 0;

    // We need to build a map of parent -> children to traverse
    const childrenMap: Record<string, any[]> = {};
    categories.forEach((c: any) => {
      if (c.parent) {
        const pid = String(c.parent);
        if (!childrenMap[pid]) childrenMap[pid] = [];
        childrenMap[pid].push(c);
      }
    });

    // Recursive function to get total count (memoization could be added if needed, but depth is small)
    const getTotalCount = (cat: any): number => {
      let total = getDirect(cat._id);
      const children = childrenMap[String(cat._id)] || [];
      for (const child of children) {
        total += getTotalCount(child);
      }
      return total;
    };

    const items = categories.map((cat: any) => ({
      ...cat,
      productCount: getTotalCount(cat)
    }));

    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error('Product categories API error:', error);
    return NextResponse.json(
      { items: [], error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60' } }
    );
  }
}


