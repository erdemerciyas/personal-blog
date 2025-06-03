import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import PageSettings from '@/models/PageSettings';

const DEFAULT_PAGES = [
  {
    pageId: 'home',
    title: 'Ana Sayfa',
    path: '/',
    description: 'Site ana sayfası',
    isActive: true,
    showInNavigation: false,
    order: 0,
  },
  {
    pageId: 'portfolio',
    title: 'Portfolio',
    path: '/portfolio',
    description: 'Projeler ve çalışmalar',
    isActive: true,
    showInNavigation: true,
    order: 1,
  },
  {
    pageId: 'services',
    title: 'Hizmetlerimiz',
    path: '/services',
    description: 'Sunduğumuz hizmetler',
    isActive: true,
    showInNavigation: true,
    order: 2,
  },
  {
    pageId: 'about',
    title: 'Hakkımızda',
    path: '/about',
    description: 'Şirket hakkında bilgiler',
    isActive: true,
    showInNavigation: true,
    order: 3,
  },
  {
    pageId: 'contact',
    title: 'İletişim',
    path: '/contact',
    description: 'İletişim bilgileri ve form',
    isActive: true,
    showInNavigation: true,
    order: 4,
  },
];

// GET - Tüm sayfa ayarlarını getir
export async function GET() {
  try {
    await connectDB();
    
    let pageSettings = await PageSettings.find().sort({ order: 1 });
    
    // Eğer hiç sayfa ayarı yoksa, varsayılan sayfaları oluştur
    if (pageSettings.length === 0) {
      await PageSettings.insertMany(DEFAULT_PAGES);
      pageSettings = await PageSettings.find().sort({ order: 1 });
    }
    
    return NextResponse.json(pageSettings);
  } catch (error) {
    console.error('Page settings fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch page settings' 
    }, { status: 500 });
  }
}

// POST - Sayfa ayarlarını güncelle
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { pageId, ...updateData } = await request.json();
    
    if (!pageId) {
      return NextResponse.json({ 
        error: 'pageId gereklidir' 
      }, { status: 400 });
    }
    
    const updatedPage = await PageSettings.findOneAndUpdate(
      { pageId },
      { ...updateData, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Page settings update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update page settings' 
    }, { status: 500 });
  }
}

// PUT - Toplu sayfa ayarları güncelleme
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const pages = await request.json();
    
    if (!Array.isArray(pages)) {
      return NextResponse.json({ 
        error: 'Geçersiz veri formatı' 
      }, { status: 400 });
    }
    
    const updatePromises = pages.map(page => 
      PageSettings.findOneAndUpdate(
        { pageId: page.pageId },
        { ...page, updatedAt: new Date() },
        { new: true, upsert: true }
      )
    );
    
    const updatedPages = await Promise.all(updatePromises);
    
    return NextResponse.json(updatedPages);
  } catch (error) {
    console.error('Bulk page settings update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update page settings' 
    }, { status: 500 });
  }
} 