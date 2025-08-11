import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ProductCategory from '@/models/ProductCategory';

export async function GET() {
  await connectDB();
  const items = await ProductCategory.find({ isActive: true }).sort({ order: 1, name: 1 }).select('name slug').lean();
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}


