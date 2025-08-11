import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';
import slugify from 'slugify';

export const GET = withSecurity(SecurityConfigs.admin)(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  await connectDB();
  const product = await Product.findById(params.id);
  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
  return NextResponse.json(product);
});

export const PUT = withSecurity(SecurityConfigs.admin)(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await connectDB();
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
  const updated = await Product.findByIdAndUpdate(params.id, body, { new: true });
  if (!updated) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
  return NextResponse.json(updated);
});

export const DELETE = withSecurity(SecurityConfigs.admin)(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  await connectDB();
  await Product.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
});


