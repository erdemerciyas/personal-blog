import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';
import slugify from 'slugify';

export const GET = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const condition = searchParams.get('condition'); // new|used
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') as 'created'|'priceAsc'|'priceDesc'|null;
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '20');

  const filter: Record<string, unknown> = q ? { $text: { $search: q } } : {};
  if (condition) (filter as Record<string, unknown>).condition = condition;
  if (category) (filter as Record<string, unknown>).categoryIds = category;

  const sortSpec = !sort || sort === 'created' ? { createdAt: -1 } : (sort === 'priceAsc' ? { price: 1 } : { price: -1 });
  const items = await Product.find(filter).sort(sortSpec).skip((page - 1) * limit).limit(limit);
  const total = await Product.countDocuments(filter);
  return NextResponse.json({ items, total, page, limit });
});

export const POST = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const body = await req.json();
  if (!body.title || !body.coverImage || !body.description)
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });

  // Normalize arrays
  body.images = Array.isArray(body.images) ? body.images : [];
  body.attachments = Array.isArray(body.attachments) ? body.attachments : [];
  body.categoryIds = Array.isArray(body.categoryIds) ? body.categoryIds : [];
  body.colors = Array.isArray(body.colors) ? body.colors : [];
  body.sizes = Array.isArray(body.sizes) ? body.sizes : [];
  body.attributes = Array.isArray(body.attributes) ? body.attributes : [];

  // Ensure slug exists for validation. Model also guards in pre-validate
  if (!body.slug && body.title) {
    body.slug = slugify(body.title, { lower: true, strict: true });
  }
  const product = await Product.create(body);
  return NextResponse.json({ product }, { status: 201 });
});


