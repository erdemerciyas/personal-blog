import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import PageSetting from '../../../../models/PageSetting';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    await connectDB();
    
    let pages = await PageSetting.find().sort({ order: 1 });
    
    // If no page settings exist, create default pages
    if (pages.length === 0) {
      const defaultPages = [
        {
          pageId: 'home',
          title: 'Ana Sayfa',
          path: '/',
          description: 'Mühendislik ve 3D tarama hizmetlerimizi keşfedin',
          isActive: true,
          showInNavigation: true,
          order: 0
        },
        {
          pageId: 'about',
          title: 'Hakkımda',
          path: '/about',
          description: 'Deneyimim ve uzmanlık alanlarım hakkında bilgi alın',
          isActive: true,
          showInNavigation: true,
          order: 1
        },
        {
          pageId: 'services',
          title: 'Hizmetler',
          path: '/services',
          description: 'Sunduğum profesyonel hizmetleri inceleyin',
          isActive: true,
          showInNavigation: true,
          order: 2
        },
        {
          pageId: 'portfolio',
          title: 'Portfolio',
          path: '/portfolio',
          description: 'Tamamladığım projeleri ve çalışmalarımı görün',
          isActive: true,
          showInNavigation: true,
          order: 3
        },
        {
          pageId: 'contact',
          title: 'İletişim',
          path: '/contact',
          description: 'Benimle iletişime geçin ve projelerinizi konuşalım',
          isActive: true,
          showInNavigation: true,
          order: 4
        }
      ];

      pages = await PageSetting.insertMany(defaultPages);
    }

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Page settings fetch error:', error);
    return NextResponse.json(
      { message: 'Sayfa ayarları yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { pageId, ...updates } = await request.json();

    await connectDB();

    const page = await PageSetting.findOneAndUpdate(
      { pageId },
      updates,
      { new: true, upsert: true }
    );

    return NextResponse.json(page);
  } catch (error) {
    console.error('Page settings update error:', error);
    return NextResponse.json(
      { message: 'Sayfa ayarları güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const pages = await request.json();

    await connectDB();

    // Update all pages with new order
    const updatePromises = pages.map((page: any) =>
      PageSetting.findOneAndUpdate(
        { pageId: page.pageId },
        { order: page.order },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Sayfa sıralaması güncellendi' });
  } catch (error) {
    console.error('Page order update error:', error);
    return NextResponse.json(
      { message: 'Sayfa sıralaması güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}