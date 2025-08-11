import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';
import slugify from 'slugify';

function getProductIdFromPath(pathname: string): string | null {
  // Expecting: /api/admin/products/{id}
  const parts = pathname.split('/').filter(Boolean);
  const idx = parts.indexOf('products');
  if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  return null;
}

export const GET = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const id = getProductIdFromPath(req.nextUrl.pathname);
  if (!id) return NextResponse.json({ error: 'Product id missing' }, { status: 400 });
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
  return NextResponse.json(product);
});

export const PUT = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const id = getProductIdFromPath(req.nextUrl.pathname);
  if (!id) return NextResponse.json({ error: 'Product id missing' }, { status: 400 });
  const body = await req.json();
  // Normalize arrays
  if (body.images && !Array.isArray(body.images)) body.images = [];
  if (body.attachments && !Array.isArray(body.attachments)) body.attachments = [];
  if (body.categoryIds && !Array.isArray(body.categoryIds)) body.categoryIds = [];
  if (body.colors && !Array.isArray(body.colors)) body.colors = [];
  if (body.sizes && !Array.isArray(body.sizes)) body.sizes = [];
  if (body.attributes && !Array.isArray(body.attributes)) body.attributes = [];

  if (typeof body.title === 'string' && body.title.trim()) {
    body.slug = slugify(body.title, { lower: true, strict: true });
  }
  const updated = await Product.findByIdAndUpdate(id, body, { new: true });
  if (!updated) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
  return NextResponse.json(updated);
});

export const DELETE = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const id = getProductIdFromPath(req.nextUrl.pathname);
  if (!id) return NextResponse.json({ error: 'Product id missing' }, { status: 400 });
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
});


