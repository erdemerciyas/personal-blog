
import { NextRequest, NextResponse } from 'next/server';
import connectDB, { hasValidMongoUri } from '@/lib/mongoose';
import Product from '@/models/Product';
import ProductCategory from '@/models/ProductCategory';
import { appConfig } from '@/core/lib/config';

export const dynamic = 'force-dynamic';

// Helper to recursively find all descendant category IDs
async function getAllCategoryIds(ids: string[]): Promise<string[]> {
  const children = await ProductCategory.find({ parent: { $in: ids }, isActive: true }).select('_id');
  if (children.length === 0) return ids;

  const childIds = children.map(c => String(c._id));
  const descendants = await getAllCategoryIds(childIds);
  // Returns unique IDs
  return Array.from(new Set([...ids, ...descendants]));
}

export async function GET(req: NextRequest) {
  try {
    if (!hasValidMongoUri()) {
      return NextResponse.json({ items: [], total: 0, page: 1, limit: 0 });
    }
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const ids = searchParams.get('ids');
    const condition = searchParams.get('condition');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') as 'priceAsc' | 'priceDesc' | null;
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '12');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const ratingMin = searchParams.get('ratingMin');
    const inStock = searchParams.get('inStock');
    const freeShipping = searchParams.get('freeShipping');

    // If explicit ids provided, return those products directly
    if (ids) {
      const list = ids.split(',').filter(Boolean);
      const items = await Product.find({ _id: { $in: list } }).select('-attachments');
      return NextResponse.json({ items, total: items.length, page: 1, limit: items.length || 1 });
    }

    const filter: Record<string, unknown> = { isActive: true };
    if (q) {
      // Logic: Split terms and require ALL of them to be present in Title OR Description
      const terms = q.trim().split(/\s+/).filter(Boolean);

      if (terms.length > 0) {
        // Create regex that requires all terms (lookaheads)
        const regexStr = terms.map(t => {
          const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return `(?=.*${escaped})`;
        }).join('');

        const regex = new RegExp(regexStr, 'i');

        (filter as Record<string, unknown>).$or = [
          { title: { $regex: regex } },
          { description: { $regex: regex } }
        ];
      }
    }
    if (condition) (filter as Record<string, unknown>).condition = condition;

    // UPDATED: Recursive Category Logic
    if (category) {
      const rootIds = category.split(',').filter(Boolean);
      // Fetch all descendants
      const allIds = await getAllCategoryIds(rootIds);
      (filter as Record<string, unknown>).categoryIds = { $in: allIds };
    }

    if (priceMin || priceMax) {
      (filter as Record<string, unknown>).price = {
        ...(priceMin ? { $gte: Number(priceMin) } : {}),
        ...(priceMax ? { $lte: Number(priceMax) } : {})
      };
    }
    if (ratingMin) {
      (filter as Record<string, unknown>).ratingAverage = { $gte: Number(ratingMin) };
    }
    if (inStock === 'true') {
      (filter as Record<string, unknown>).stock = { $gt: 0 };
    }
    if (freeShipping === 'true') {
      const threshold = Number((appConfig as { freeShippingThreshold?: number })?.freeShippingThreshold ?? 1500);
      (filter as Record<string, unknown>).price = {
        ...(filter as Record<string, unknown>).price as Record<string, unknown> || {},
        $gte: threshold
      };
    }
    // Optional: allow slug-based filtering via ?categorySlug
    const categorySlug = searchParams.get('categorySlug');
    if (categorySlug) {
      const cat = await ProductCategory.findOne({ slug: categorySlug }).select('_id');
      if (cat?._id) {
        const allIds = await getAllCategoryIds([String(cat._id)]);
        (filter as Record<string, unknown>).categoryIds = { $in: allIds };
      }
    }

    const sortSpec: Record<string, 1 | -1> = {};
    // Extended sort options
    switch (sort as string) {
      case 'priceAsc':
        sortSpec.price = 1;
        break;
      case 'priceDesc':
        sortSpec.price = -1;
        break;
      case 'dateAsc':
        sortSpec.createdAt = 1;
        break;
      case 'dateDesc':
      default:
        sortSpec.createdAt = -1;
        break;
    }

    // Projection to reduce payload size
    const projection = '-attachments';
    const items = await Product.find(filter, projection).sort(sortSpec).skip((page - 1) * limit).limit(limit).lean({ getters: true });
    const total = await Product.countDocuments(filter);
    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { items: [], total: 0, page: 1, limit: 0, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
