import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';
import connectDB from '@/lib/mongoose';
import ProductReview from '@/models/ProductReview';
import Product from '@/models/Product';

// GET: list product reviews, default pending
export const GET = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'pending';
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '20');

  const filter: Record<string, unknown> = { status };
  const items = await ProductReview.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // attach minimal product info
  const productIds = Array.from(new Set(items.map(i => String(i.productId))));
  const products = await Product.find({ _id: { $in: productIds } }).select('title').lean();
  const productMap = new Map(products.map(p => [String(p._id), p]));
  const withProduct = items.map(i => ({ ...i, product: productMap.get(String(i.productId)) || null }));

  const total = await ProductReview.countDocuments(filter);
  return NextResponse.json({ items: withProduct, total, page, limit });
});

// PUT: update review status (approve/reject)
export const PUT = withSecurity(SecurityConfigs.admin)(async (req: NextRequest) => {
  await connectDB();
  const { reviewId, status } = await req.json();
  if (!reviewId || !['approved', 'rejected', 'pending'].includes(status))
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });

  const existing = await ProductReview.findById(reviewId);
  if (!existing) return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });

  const prevStatus = existing.status;
  existing.status = status;
  const updated = await existing.save();

  // Recalculate product rating stats if status change affects approvals
  if ((prevStatus !== 'approved' && status === 'approved') || (prevStatus === 'approved' && status !== 'approved')) {
    const approved = await ProductReview.find({ productId: existing.productId, status: 'approved' }).select('rating');
    const ratingCount = approved.length;
    const ratingAverage = ratingCount > 0 ? approved.reduce((s, r) => s + r.rating, 0) / ratingCount : 0;
    await Product.findByIdAndUpdate(existing.productId, { ratingAverage, ratingCount });
  }
  if (!updated) return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });
  return NextResponse.json(updated);
});


