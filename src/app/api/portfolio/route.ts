import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/mongoose';
import Portfolio from '../../../models/Portfolio';
import Category from '../../../models/Category';

// GET - Tüm portfolyo öğelerini getir (çok dilli alanlar dahil)
export async function GET(request: Request) {
  try {
    await connectDB();
    
    // URL'den category query parameter'larını al
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const categorySlugs = searchParams.get('categories'); // Çoklu kategori desteği
    
    let query = {};
    
    // Çoklu kategori filtreleme
    if (categorySlugs) {
      const slugArray = categorySlugs.split(',').map(slug => slug.trim());
      const categories = await Category.find({ slug: { $in: slugArray } });
      if (categories.length > 0) {
        const categoryIds = categories.map(cat => cat._id);
        query = {
          $or: [
            { categoryId: { $in: categoryIds } },
            { categoryIds: { $in: categoryIds } }
          ]
        };
      } 
    }
    // Tekli kategori filtreleme (geriye uyumluluk)
    else if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query = {
          $or: [
            { categoryId: category._id },
            { categoryIds: category._id }
          ]
        };
      }
    }
    
    const portfolios = await Portfolio.find({ ...query })
      .populate('categoryId', 'name slug') // Eski tekli kategori alanı
      .populate('categoryIds', 'name slug') // Yeni çoklu kategori alanı
      .sort({ order: 1 });

    return NextResponse.json(portfolios);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch portfolios' 
    }, { status: 500 });
  }
}

// POST - Yeni portfolyo öğesi ekle (çok dilli alanları kabul eder)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const data: Record<string, unknown> = await request.json();
    
    // Çoklu kategori desteği için validation
    if (data.categoryIds && Array.isArray(data.categoryIds) && data.categoryIds.length > 0) {
      // Kategorilerin geçerli olduğunu kontrol et
      const categories = await Category.find({ _id: { $in: data.categoryIds } });
      if (categories.length !== data.categoryIds.length) {
        return NextResponse.json({ 
          error: 'Geçersiz kategori ID\'si bulundu' 
        }, { status: 400 });
      }
    } else if (data.categoryId) {
      // Eski tekli kategori desteği (geriye uyumluluk)
      const category = await Category.findById(data.categoryId);
      if (!category) {
        return NextResponse.json({ 
          error: 'Geçersiz kategori ID\'si' 
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ 
        error: 'En az bir kategori seçmelisiniz' 
      }, { status: 400 });
    }
    
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