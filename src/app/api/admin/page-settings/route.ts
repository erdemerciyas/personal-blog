import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import PageSetting from '../../../../models/PageSetting';

export async function GET() {
  try {
    // Allow public access for navigation data (no auth check for public navigation)
    // const url = new URL(request.url); // Reserved for future query parameter handling
    await connectDB();

    let pages = await PageSetting.find().sort({ order: 1 });

    // Varsayılan sayfalar
    const defaultPages = [
      { pageId: 'home', title: 'Ana Sayfa', path: '/', description: 'Mühendislik ve 3D tarama hizmetlerimizi keşfedin', icon: 'HomeIcon', isExternal: false, isActive: true, showInNavigation: true, order: 0 },
      { pageId: 'services', title: 'Hizmetler', path: '/services', description: 'Sunduğum profesyonel hizmetleri inceleyin', icon: 'WrenchScrewdriverIcon', isExternal: false, isActive: true, showInNavigation: true, order: 2 },
      { pageId: 'portfolio', title: 'Portfolio', path: '/portfolio', description: 'Tamamladığım projeleri ve çalışmalarımı görün', icon: 'FolderOpenIcon', isExternal: false, isActive: true, showInNavigation: true, order: 3 },
      { pageId: 'videos', title: 'Videolar', path: '/videos', description: 'YouTube kanalımızdaki videoları izleyin', icon: 'FilmIcon', isExternal: false, isActive: true, showInNavigation: true, order: 4 },
      { pageId: 'contact', title: 'İletişim', path: '/contact', description: 'Benimle iletişime geçin ve projelerinizi konuşalım', icon: 'PhoneIcon', isExternal: false, isActive: true, showInNavigation: true, order: 5 },
      { pageId: 'products', title: 'Ürünler', path: '/products', description: 'Sıfır ve ikinci el ürünlerimizi keşfedin', icon: 'FolderOpenIcon', isExternal: false, isActive: true, showInNavigation: true, order: 6 },
    ];

    // Kayıt yoksa seed et; varsa eksikleri upsert et
    if (pages.length === 0) {
      pages = await PageSetting.insertMany(defaultPages);
    } else {
      const existingById = new Map<string, unknown>(pages.map((p: { pageId: string }) => [p.pageId, p]));
      const upserts: Promise<unknown>[] = [];
      for (const def of defaultPages) {
        if (!existingById.has(def.pageId)) {
          upserts.push(PageSetting.findOneAndUpdate({ pageId: def.pageId }, def, { new: true, upsert: true }));
        }
      }
      if (upserts.length) await Promise.all(upserts);
      pages = await PageSetting.find().sort({ order: 1 });
    }

    // Admin listesinde gösterilmeyecek dahili sayfalar
    pages = pages.filter((p: { pageId: string }) => p.pageId !== 'product-detail');

    const response = NextResponse.json(pages);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Page settings fetch error:', error);
    const fallbackPages = [
      { pageId: 'home', title: 'Ana Sayfa', path: '/', description: 'Mühendislik ve 3D tarama hizmetlerimizi keşfedin', icon: 'HomeIcon', isExternal: false, isActive: true, showInNavigation: true, order: 0 },
      { pageId: 'services', title: 'Hizmetler', path: '/services', description: 'Sunduğum profesyonel hizmetleri inceleyin', icon: 'WrenchScrewdriverIcon', isExternal: false, isActive: true, showInNavigation: true, order: 2 },
      { pageId: 'portfolio', title: 'Portfolio', path: '/portfolio', description: 'Tamamladığım projeleri ve çalışmalarımı görün', icon: 'FolderOpenIcon', isExternal: false, isActive: true, showInNavigation: true, order: 3 },
      { pageId: 'videos', title: 'Videolar', path: '/videos', description: 'YouTube kanalımızdaki videoları izleyin', icon: 'FilmIcon', isExternal: false, isActive: true, showInNavigation: true, order: 4 },
      { pageId: 'contact', title: 'İletişim', path: '/contact', description: 'Benimle iletişime geçin ve projelerinizi konuşalım', icon: 'PhoneIcon', isExternal: false, isActive: true, showInNavigation: true, order: 5 },
      { pageId: 'products', title: 'Ürünler', path: '/products', description: 'Sıfır ve ikinci el ürünlerimizi keşfedin', icon: 'FolderOpenIcon', isExternal: false, isActive: true, showInNavigation: true, order: 6 },
      { pageId: 'product-detail', title: 'Ürün Detayı', path: '/products/[slug]', description: 'Ürün detay sayfası ayarları', icon: 'FolderOpenIcon', isExternal: false, isActive: true, showInNavigation: false, order: 7 },
    ];
    const resp = NextResponse.json(fallbackPages, { status: 200 });
    resp.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    resp.headers.set('Pragma', 'no-cache');
    resp.headers.set('Expires', '0');
    resp.headers.set('Surrogate-Control', 'no-store');
    return resp;
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
    const updatePromises = pages.map((page: { pageId: string; order: number }) =>
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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { pageId } = await request.json();
    if (!pageId) {
      return NextResponse.json({ message: 'pageId gereklidir' }, { status: 400 });
    }

    await connectDB();
    await PageSetting.deleteOne({ pageId });

    return NextResponse.json({ message: 'Sayfa silindi' });
  } catch (error) {
    console.error('Page delete error:', error);
    return NextResponse.json(
      { message: 'Sayfa silinirken hata oluştu' },
      { status: 500 }
    );
  }
}