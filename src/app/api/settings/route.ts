import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/mongoose';
import Settings from '../../../models/Settings';
import SiteSettings from '../../../models/SiteSettings';

// GET /api/settings - Site ayarlarını getir
export async function GET() {
  try {
    await connectDB();
    
    // Aktif olan ilk settings kaydını getir (tek kayıt olması bekleniyor)
    let settings = await Settings.findOne({ isActive: true });
    
    // Eğer hiç kayıt yoksa default kayıt oluştur
    if (!settings) {
      settings = await Settings.create({
        siteName: 'Erciyas Engineering',
        siteTitle: 'Erciyas Engineering - 3D Tasarım ve Mühendislik Çözümleri',
        siteDescription: 'Profesyonel 3D tasarım, tersine mühendislik, 3D baskı ve mühendislik çözümleri ile projelerinizi hayata geçiriyoruz.',
        siteKeywords: '3D tasarım, tersine mühendislik, 3D baskı, CAD tasarım, mühendislik, Ankara',
        siteUrl: 'https://erciyas-engineering.com',
        logo: '/images/logo.png',
        favicon: '/favicon.ico',
        ogImage: '/images/og-image.jpg',
        twitterHandle: '@erciyaseng',
        googleAnalyticsId: '',
        googleTagManagerId: '',
        adminSettings: {
          defaultLanguage: 'tr',
          timezone: 'Europe/Istanbul',
          dateFormat: 'DD/MM/YYYY',
          enableNotifications: true,
        },
        maintenanceMode: false,
        allowRegistration: false,
        maxUploadSize: 10,
        isActive: true,
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Site ayarları getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Site ayarları getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Site ayarlarını güncelle
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const body = await request.json();
    await connectDB();

    // Mevcut settings kaydını bul ve güncelle, yoksa oluştur
    const settings = await Settings.findOneAndUpdate(
      { isActive: true },
      {
        ...body,
        updatedAt: new Date(),
      },
      { 
        new: true, 
        upsert: true, // Eğer kayıt yoksa oluştur
        setDefaultsOnInsert: true 
      }
    );

    // SiteSettings'i de senkronize et (Header için)
    if (settings) {
      const siteSettingsUpdate: any = {};
      
      // Logo güncellenmişse SiteSettings'teki logo object'ini güncelle
      if (body.logo !== undefined) {
        siteSettingsUpdate.logo = {
          url: body.logo,
          alt: 'Site Logo',
          width: 200,
          height: 60
        };
      }
      
      // Site adı güncellenmişse
      if (body.siteName !== undefined) {
        siteSettingsUpdate.siteName = body.siteName;
      }
      
      // Açıklama güncellenmişse
      if (body.siteDescription !== undefined) {
        siteSettingsUpdate.description = body.siteDescription;
      }

      // SEO bilgileri güncellenmişse
      if (body.siteTitle || body.siteDescription || body.siteKeywords) {
        siteSettingsUpdate.seo = {
          metaTitle: body.siteTitle || settings.siteTitle,
          metaDescription: body.siteDescription || settings.siteDescription,
          keywords: body.siteKeywords ? body.siteKeywords.split(',').map((k: string) => k.trim()) : []
        };
      }

      // Twitter handle güncellenmişse
      if (body.twitterHandle !== undefined) {
        siteSettingsUpdate.socialMedia = {
          twitter: body.twitterHandle,
          linkedin: '',
          github: '',
          instagram: ''
        };
      }

      // SiteSettings'i güncelle
      if (Object.keys(siteSettingsUpdate).length > 0) {
        await SiteSettings.updateSiteSettings(siteSettingsUpdate);
      }
    }

    return NextResponse.json({
      message: 'Site ayarları başarıyla güncellendi',
      settings
    });
  } catch (error) {
    console.error('Site ayarları güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Site ayarları güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 