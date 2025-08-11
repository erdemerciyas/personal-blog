import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  await connectDB();
  const product = await Product.findOne({ slug: params.slug, isActive: true })
    .populate('categoryIds', 'name slug');
  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
  return NextResponse.json(product);
}


