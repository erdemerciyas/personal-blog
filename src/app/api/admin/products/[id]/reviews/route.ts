import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';
import connectDB from '@/lib/mongoose';
import ProductReview from '@/models/ProductReview';

function getProductIdFromPath(pathname: string): string | null {
  // Expecting: /api/admin/products/{id}/reviews
  const parts = pathname.split('/').filter(Boolean);
  const idx = parts.indexOf('products');
  if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  return null;
}

export const GET = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const id = getProductIdFromPath(req.nextUrl.pathname);
  if (!id) return NextResponse.json({ error: 'Product id missing' }, { status: 400 });
  const items = await ProductReview.find({ productId: id }).sort({ createdAt: -1 });
  return NextResponse.json({ items });
});

export const PUT = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const { reviewId, status } = await req.json();
  const updated = await ProductReview.findByIdAndUpdate(reviewId, { status }, { new: true });
  return NextResponse.json(updated);
});


