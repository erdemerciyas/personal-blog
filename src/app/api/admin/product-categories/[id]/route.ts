import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ProductCategory from '@/models/ProductCategory';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';
import slugify from 'slugify';

export const PUT = withSecurity(SecurityConfigs.admin)(async (req: NextRequest, ...args: unknown[]) => {
  const { params } = (args[0] as { params: { id: string } });
  await connectDB();
  try {
    const body = await req.json();
    const update: Record<string, unknown> = {
      name: body.name,
      description: body.description,
      order: body.order,
      isActive: body.isActive,
    };
    if (typeof body.name === 'string' && body.name.trim()) {
      update.slug = slugify(body.name, { lower: true, strict: true });
    }
    const updated = await ProductCategory.findByIdAndUpdate(params.id, update, { new: true });
    if (!updated) return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error && (error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'Bu isim/slug ile kategori zaten var' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Kategori güncellenemedi' }, { status: 500 });
  }
});

export const DELETE = withSecurity(SecurityConfigs.admin)(async (_req: NextRequest, ...args: unknown[]) => {
  const { params } = (args[0] as { params: { id: string } });
  await connectDB();
  await ProductCategory.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
});


