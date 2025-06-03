import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import SiteSettings from '@/models/SiteSettings';

// GET: Site ayarlarını getir
export async function GET() {
  try {
    await connectDB();
    
    const settings = await SiteSettings.getSiteSettings();
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Site ayarları getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Site ayarları getirilemedi' },
      { status: 500 }
    );
  }
}

// PUT: Site ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const updateData = await request.json();
    
    // Güvenlik kontrolü - sadece belirlenen alanları güncelle
    const allowedFields = [
      'logo',
      'siteName', 
      'slogan',
      'description',
      'colors',
      'socialMedia',
      'seo',
      'contact',
      'security',
      'pageSettings'
    ];
    
    const filteredData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }
    
    const settings = await SiteSettings.updateSiteSettings(filteredData);
    
    return NextResponse.json(
      { 
        message: 'Site ayarları başarıyla güncellendi',
        settings 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Site ayarları güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Site ayarları güncellenemedi' },
      { status: 500 }
    );
  }
}

// POST: Logo yükle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const { action, ...data } = await request.json();
    
    if (action === 'uploadLogo') {
      await connectDB();
      
      const { logoUrl, alt, width, height } = data;
      
      if (!logoUrl) {
        return NextResponse.json(
          { error: 'Logo URL gerekli' },
          { status: 400 }
        );
      }
      
      const settings = await SiteSettings.updateSiteSettings({
        logo: {
          url: logoUrl,
          alt: alt || 'Site Logo',
          width: width || 200,
          height: height || 60
        }
      });
      
      return NextResponse.json(
        { 
          message: 'Logo başarıyla güncellendi',
          logo: settings.logo
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { error: 'Geçersiz işlem' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Logo yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Logo yüklenemedi' },
      { status: 500 }
    );
  }
} 