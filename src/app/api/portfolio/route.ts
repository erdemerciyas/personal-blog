import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Portfolio from '@/models/Portfolio';
import Category from '@/models/Category';

// GET - Tüm portfolyo öğelerini getir
export async function GET(request: Request) {
  try {
    await connectDB();
    
    // URL'den category query parameter'ını al
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    
    let query = {};
    
    // Eğer kategori filtresi varsa, önce kategori ID'sini bul
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query = { categoryId: category._id };
      } else {
        // Geçersiz kategori slug'ı durumunda boş array döndür
        return NextResponse.json([]);
      }
    }
    
    const portfolios = await Portfolio.find(query)
      .sort({ createdAt: -1 });
    
    // Kategorileri ayrıca al ve manuel olarak birleştir
    const categories = await Category.find();
    const categoryMap = categories.reduce((map, cat) => {
      map[cat._id.toString()] = cat;
      return map;
    }, {} as Record<string, typeof categories[0]>);
    
    // Portfolio'lara category bilgisini ekle
    const portfoliosWithCategory = portfolios.map(portfolio => {
      const portfolioObj = portfolio.toObject();
      portfolioObj.category = categoryMap[portfolioObj.categoryId?.toString()];
      return portfolioObj;
    });
    
    return NextResponse.json(portfoliosWithCategory);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch portfolios' 
    }, { status: 500 });
  }
}

// POST - Yeni portfolyo öğesi ekle
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const data: Record<string, unknown> = await request.json();
    
    const portfolio = new Portfolio(data);
    await portfolio.save();
    
    return NextResponse.json(portfolio, { status: 201 });
    
  } catch (error) {
    console.error('Portfolio creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create portfolio' 
    }, { status: 500 });
  }
} 