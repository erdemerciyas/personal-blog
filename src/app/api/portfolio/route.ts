import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/mongoose';
import Portfolio from '../../../models/Portfolio';
import Category from '../../../models/Category';

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     tags:
 *       - Portfolio
 *     summary: Get all portfolio items
 *     description: Retrieve all portfolio items with optional category filtering
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by single category slug
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Filter by multiple category slugs (comma-separated)
 *     responses:
 *       200:
 *         description: Successfully retrieved portfolio items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Portfolio'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags:
 *       - Portfolio
 *     summary: Create new portfolio item
 *     description: Create a new portfolio item (requires authentication)
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: Portfolio item title
 *               slug:
 *                 type: string
 *                 description: URL-friendly slug
 *               description:
 *                 type: string
 *                 description: Portfolio item description
 *               content:
 *                 type: string
 *                 description: Detailed content
 *               categoryId:
 *                 type: string
 *                 description: Single category ID (legacy)
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Multiple category IDs
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Technologies used
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     alt:
 *                       type: string
 *                     caption:
 *                       type: string
 *               featured:
 *                 type: boolean
 *                 description: Featured item flag
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *     responses:
 *       201:
 *         description: Portfolio item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Portfolio'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// GET - Tüm portfolyo öğelerini getir (çok dilli alanlar dahil)
export async function GET(request: Request) {
  try {
    await connectDB();
    
    // URL'den query parameter'larını al
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const categorySlugs = searchParams.get('categories'); // Çoklu kategori desteği
    const featured = searchParams.get('featured'); // Featured projeler
    const random = searchParams.get('random'); // Random sıralama
    const limit = searchParams.get('limit'); // Limit
    
    let query: Record<string, any> = {};
    
    // Featured projeler filtresi
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Çoklu kategori filtreleme
    if (categorySlugs) {
      const slugArray = categorySlugs.split(',').map(slug => slug.trim());
      const categories = await Category.find({ slug: { $in: slugArray } });
      if (categories.length > 0) {
        const categoryIds = categories.map(cat => cat._id);
        query.$or = [
          { categoryId: { $in: categoryIds } },
          { categoryIds: { $in: categoryIds } }
        ];
      } 
    }
    // Tekli kategori filtreleme (geriye uyumluluk)
    else if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.$or = [
          { categoryId: category._id },
          { categoryIds: category._id }
        ];
      }
    }
    
    let portfolioQuery = Portfolio.find(query)
      .populate('categoryId', 'name slug') // Eski tekli kategori alanı
      .populate('categoryIds', 'name slug'); // Yeni çoklu kategori alanı
    
    // Sıralama: Random ise rastgele, değilse tarih ve order'a göre
    if (random === 'true') {
      // MongoDB'de rastgele sıralama için $sample kullan
      const portfolios = await Portfolio.aggregate([
        { $match: query },
        { $sample: { size: limit ? parseInt(limit) : 1000 } }, // Limit varsa o kadar, yoksa 1000
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'categoryId'
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryIds',
            foreignField: '_id',
            as: 'categoryIds'
          }
        },
        {
          $addFields: {
            categoryId: { $arrayElemAt: ['$categoryId', 0] },
          }
        }
      ]);
      
      const response = NextResponse.json(portfolios);
      
      // Random projeler için cache'i tamamen devre dışı bırak
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
    } else {
      // Normal sıralama - MongoDB aggregate ile kesin sıralama
      const portfolios = await Portfolio.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'categoryId'
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryIds',
            foreignField: '_id',
            as: 'categoryIds'
          }
        },
        {
          $addFields: {
            categoryId: { $arrayElemAt: ['$categoryId', 0] },
          }
        },
        // Kesin sıralama: önce createdAt'e göre azalan, sonra _id'ye göre azalan
        { $sort: { createdAt: -1, _id: -1 } },
        ...(limit ? [{ $limit: parseInt(limit) }] : [])
      ]);
      
      const response = NextResponse.json(portfolios);
      
      // Cache kontrolü - development'da cache'i devre dışı bırak
      if (process.env.NODE_ENV === 'development') {
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
      }
      
      return response;
    }
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
    
    // createdAt ve updatedAt'i açıkça ayarla
    const portfolioData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const portfolio = new Portfolio(portfolioData);
    await portfolio.save();
    
    return NextResponse.json(portfolio, { status: 201 });
    
  } catch (error) {
    console.error('Portfolio creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create portfolio' 
    }, { status: 500 });
  }
} 