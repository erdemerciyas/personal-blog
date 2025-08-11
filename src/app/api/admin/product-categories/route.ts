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
  const items = await ProductCategory.find(filter).sort({ order: 1, name: 1 });
  return NextResponse.json({ items });
});

export const POST = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Kategori adı gerekli' }, { status: 400 });
    const slug = slugify(body.name, { lower: true, strict: true });
    const created = await ProductCategory.create({
      name: body.name,
      slug,
      description: body.description,
      order: typeof body.order === 'number' ? body.order : 0,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : true,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error && (error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'Bu isim/slug ile kategori zaten var' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Kategori oluşturulamadı' }, { status: 500 });
  }
});


