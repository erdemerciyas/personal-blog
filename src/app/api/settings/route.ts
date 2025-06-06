import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/mongoose';
import Settings from '../../../models/Settings';
import SiteSettings from '../../../models/SiteSettings';

// GET Method
export async function GET() {
  console.log('🔍 GET /api/settings called');
  try {
    await connectDB();
    
    let settings = await Settings.findOne({ isActive: true });
    
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
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: 'Site ayarları getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT Method
export async function PUT(request: NextRequest) {
  console.log('🔥 PUT /api/settings called - WORKING!');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('👤 Session check:', !!session?.user, session?.user?.role);
    
    if (!session?.user) {
      console.log('❌ No session');
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      console.log('❌ Not admin:', session.user.role);
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('📝 Body keys:', Object.keys(body));
    
    await connectDB();
    console.log('🔗 Database connected');

    const settings = await Settings.findOneAndUpdate(
      { isActive: true },
      {
        ...body,
        updatedAt: new Date(),
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true 
      }
    );

    console.log('✅ Settings updated:', !!settings);

    // SiteSettings sync
    if (settings) {
      const siteSettingsUpdate: any = {};
      
      if (body.logo !== undefined) {
        siteSettingsUpdate.logo = {
          url: body.logo,
          alt: 'Site Logo',
          width: 200,
          height: 60
        };
      }
      
      if (body.siteName !== undefined) {
        siteSettingsUpdate.siteName = body.siteName;
      }
      
      if (body.siteDescription !== undefined) {
        siteSettingsUpdate.description = body.siteDescription;
      }

      if (body.siteTitle || body.siteDescription || body.siteKeywords) {
        siteSettingsUpdate.seo = {
          metaTitle: body.siteTitle || settings.siteTitle,
          metaDescription: body.siteDescription || settings.siteDescription,
          keywords: body.siteKeywords ? body.siteKeywords.split(',').map((k: string) => k.trim()) : []
        };
      }

      if (body.twitterHandle !== undefined) {
        siteSettingsUpdate.socialMedia = {
          twitter: body.twitterHandle,
          linkedin: '',
          github: '',
          instagram: ''
        };
      }

      if (Object.keys(siteSettingsUpdate).length > 0) {
        await SiteSettings.updateSiteSettings(siteSettingsUpdate);
        console.log('✅ SiteSettings synced');
      }
    }

    return NextResponse.json({
      message: 'Site ayarları başarıyla güncellendi',
      settings
    });
    
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json(
      { error: 'Site ayarları güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST Method
export async function POST(request: NextRequest) {
  console.log('📬 POST /api/settings called');
  return NextResponse.json(
    { error: 'POST method not supported. Use PUT.' },
    { status: 405 }
  );
} 