import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Portfolio from '@/models/Portfolio';
import Category from '@/models/Category'; // Kategori bilgilerini populate etmek için

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB();

    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug gerekli' }, { status: 400 });
    }

    const portfolioItem = await Portfolio.findOne({ slug }).populate('categoryIds');

    if (!portfolioItem) {
      return NextResponse.json({ error: 'Portfolyo öğesi bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(portfolioItem);
  } catch (error) {
    console.error('Slug ile portfolyo öğesi getirilirken hata:', error);
    return NextResponse.json({ error: 'Dahili Sunucu Hatası' }, { status: 500 });
  }
}
