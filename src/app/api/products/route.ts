import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';
import ProductCategory from '@/models/ProductCategory';
import { appConfig } from '@/lib/config';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const ids = searchParams.get('ids');
  const condition = searchParams.get('condition');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') as 'priceAsc'|'priceDesc'|null;
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
  if (q) (filter as Record<string, unknown>).$text = { $search: q };
  if (condition) (filter as Record<string, unknown>).condition = condition;
  if (category) {
    const catIds = category.split(',').filter(Boolean);
    if (catIds.length > 1) (filter as Record<string, unknown>).categoryIds = { $in: catIds };
    else (filter as Record<string, unknown>).categoryIds = catIds[0];
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
    if (cat?._id) (filter as Record<string, unknown>).categoryIds = String(cat._id);
  }

  const sortSpec: Record<string, 1 | -1> = !sort
    ? { createdAt: -1 }
    : (sort === 'priceAsc' ? { price: 1 } : { price: -1 });
  // Projection to reduce payload size
  const projection = '-attachments';
  const items = await Product.find(filter, projection).sort(sortSpec).skip((page - 1) * limit).limit(limit).lean({ getters: true });
  const total = await Product.countDocuments(filter);
  return NextResponse.json({ items, total, page, limit });
}


