import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ProductCategory from '@/models/ProductCategory';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';
import slugify from 'slugify';

export const GET = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const filter: Record<string, unknown> = q ? { $or: [{ name: new RegExp(q, 'i') }, { slug: new RegExp(q, 'i') }] } : {};

  const categories = await ProductCategory.find(filter).sort({ order: 1, name: 1 }).lean();

  // Aggregate product counts
  // We need to dynamically import Product to avoid circular dependency issues if any, 
  // though here it's fine. 
  // We need to count how many products reference each category.
  // Since Product has categoryIds array, we unwind and group.

  // Note: We need to ensure Product model is registered. 
  // It is imported at top level usually, but let's make sure.
  const { default: Product } = await import('@/models/Product');

  const counts = await Product.aggregate([
    { $match: { isActive: true } }, // Only count active products
    { $unwind: '$categoryIds' },
    { $group: { _id: '$categoryIds', count: { $sum: 1 } } }
  ]);

  const countMap = new Map<string, number>();
  counts.forEach((c: any) => {
    if (c._id) countMap.set(String(c._id), c.count);
  });

  // Attach counts (Direct counts)
  // If we want recursive (cumulative) counts, we need to build the tree.
  // For the grid view, direct count is usually safer to start with.
  // But for a hierarchical view, users might expect parent to show sum.
  // Let's implement strict direct count first as strictly implied by data. 
  // If user meant "tree", they'd see 0 on parents and non-0 on leaves.

  const items = categories.map((cat: any) => ({
    ...cat,
    productCount: countMap.get(String(cat._id)) || 0
  }));

  return NextResponse.json({ items });
});

export const POST = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Kategori adı gerekli' }, { status: 400 });
    const slug = slugify(body.name, { lower: true, strict: true });
    const payload: any = {
      name: body.name,
      slug,
      description: body.description,
      order: typeof body.order === 'number' ? body.order : 0,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : true,
    };

    if (body.parent) {
      payload.parent = body.parent;
    }

    const created = await ProductCategory.create(payload);
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error && (error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'Bu isim/slug ile kategori zaten var' }, { status: 409 });
    }
    console.error('Create Category Error:', error);
    return NextResponse.json({ error: 'Kategori oluşturulamadı', details: (error as Error).message }, { status: 500 });
  }
});


