import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';
import connectDB from '@/lib/mongoose';
import ProductReview from '@/models/ProductReview';

export const GET = withSecurity(SecurityConfigs.admin)(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  await connectDB();
  const items = await ProductReview.find({ productId: params.id }).sort({ createdAt: -1 });
  return NextResponse.json({ items });
});

export const PUT = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const { reviewId, status } = await req.json();
  const updated = await ProductReview.findByIdAndUpdate(reviewId, { status }, { new: true });
  return NextResponse.json(updated);
});


