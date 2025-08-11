import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import ProductReview from '@/models/ProductReview';
import Product from '@/models/Product';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { CSRFProtection } from '@/lib/csrf';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const items = await ProductReview.find({ productId: params.id, status: 'approved' }).sort({ createdAt: -1 });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const ip = getClientIP(req);
  const rl = rateLimit(ip, 'API_STRICT');
  if (!rl.allowed) return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 });

  // CSRF basic protection for state-changing request
  const csrfCheck = await CSRFProtection.middleware()(req as unknown as import('next/server').NextRequest);
  if (csrfCheck) return csrfCheck as unknown as NextResponse;

  await connectDB();
  const { rating, comment } = await req.json();
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Geçersiz puan' }, { status: 400 });

  const exists = await Product.exists({ _id: params.id, isActive: true });
  if (!exists) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });

  const review = await ProductReview.create({
    productId: params.id as unknown as string,
    userId: (session.user as { id?: string }).id,
    rating,
    comment,
    status: 'pending',
  });

  return NextResponse.json({ review, message: 'Yorum alındı, onay bekliyor' }, { status: 201 });
}


