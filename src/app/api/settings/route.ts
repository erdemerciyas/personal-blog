import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import connectDB from '../../../lib/mongoose';
import Settings from '../../../models/Settings';
import SiteSettings, { type ISiteSettings } from '../../../models/SiteSettings';

// GET Method
export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 GET /api/settings called');
  }
  try {
    await connectDB();
    
    let settings = await Settings.findOne({ isActive: true });
    
    if (!settings) {
      settings = await Settings.create({
        siteName: 'Extreme Ecu',
        siteTitle: 'Extreme Ecu - Modern Mühendislik ve Performans Çözümleri',
        siteDescription: 'Profesyonel ECU tuning, performans optimizasyonu ve mühendislik çözümleri ile araçlarınızı güçlendiriyoruz.',
        siteKeywords: 'ECU tuning, performans, mühendislik, otomotiv, chip tuning',
        siteUrl: 'https://extremeecu.com',
        logo: '',
        favicon: '/favicon.ico',
        ogImage: '/images/og-image.jpg',
        twitterHandle: '@extremeecu',
        googleAnalyticsId: '',
        googleTagManagerId: '',
        googleSiteVerification: '',
        facebookPixelId: '',
        hotjarId: '',
        customHeadScripts: '',
        customBodyStartScripts: '',
        customBodyEndScripts: '',
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
export const PUT = withSecurity(SecurityConfigs.adminWithScripts)(async (request: NextRequest) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔥 PUT /api/settings called');
  }
  
  try {
    // Authorization enforced by withSecurity(SecurityConfigs.admin)

    const body = await request.json();
    if (process.env.NODE_ENV === 'development') console.log('📝 Body keys:', Object.keys(body));
    
    await connectDB();
    if (process.env.NODE_ENV === 'development') console.log('🔗 Database connected');

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

    if (process.env.NODE_ENV === 'development') console.log('✅ Settings updated:', !!settings);

    // SiteSettings sync
    if (settings) {
      const siteSettingsUpdate: Partial<ISiteSettings> = {};
      
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
          linkedin: settings.socialMedia?.linkedin ?? '',
          github: settings.socialMedia?.github ?? '',
          instagram: settings.socialMedia?.instagram ?? ''
        };
      }

      // Analytics sync - her zaman güncelle
      siteSettingsUpdate.analytics = {
        googleAnalyticsId: body.googleAnalyticsId || settings.googleAnalyticsId || '',
        googleTagManagerId: body.googleTagManagerId || settings.googleTagManagerId || '',
        googleSiteVerification: body.googleSiteVerification || settings.googleSiteVerification || '',
        facebookPixelId: body.facebookPixelId || settings.facebookPixelId || '',
        hotjarId: body.hotjarId || settings.hotjarId || '',
        customScripts: {
          head: body.customHeadScripts || settings.customHeadScripts || '',
          bodyStart: body.customBodyStartScripts || settings.customBodyStartScripts || '',
          bodyEnd: body.customBodyEndScripts || settings.customBodyEndScripts || ''
        }
      };

      if (Object.keys(siteSettingsUpdate).length > 0) {
        await SiteSettings.updateSiteSettings(siteSettingsUpdate);
        if (process.env.NODE_ENV === 'development') console.log('✅ SiteSettings synced');
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
});

// POST Method
export const POST = withSecurity(SecurityConfigs.adminWithScripts)(async (request: NextRequest) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📬 POST /api/settings called');
  }
  
  try {
    // Authorization enforced by withSecurity(SecurityConfigs.admin)

    const body = await request.json();
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Body keys:', Object.keys(body));
      console.log('📝 Custom scripts in body:', {
        customHeadScripts: body.customHeadScripts,
        customBodyStartScripts: body.customBodyStartScripts,
        customBodyEndScripts: body.customBodyEndScripts
      });
    }
    
    await connectDB();
    if (process.env.NODE_ENV === 'development') console.log('🔗 Database connected');

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

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Settings updated:', !!settings);
      console.log('✅ Saved custom scripts:', {
        customHeadScripts: settings?.customHeadScripts,
        customBodyStartScripts: settings?.customBodyStartScripts,
        customBodyEndScripts: settings?.customBodyEndScripts
      });
    }

    // SiteSettings sync
    if (settings) {
      const siteSettingsUpdate: Partial<ISiteSettings> = {};
      
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

      // Analytics sync - her zaman güncelle
      siteSettingsUpdate.analytics = {
        googleAnalyticsId: body.googleAnalyticsId || settings.googleAnalyticsId || '',
        googleTagManagerId: body.googleTagManagerId || settings.googleTagManagerId || '',
        googleSiteVerification: body.googleSiteVerification || settings.googleSiteVerification || '',
        facebookPixelId: body.facebookPixelId || settings.facebookPixelId || '',
        hotjarId: body.hotjarId || settings.hotjarId || '',
        customScripts: {
          head: body.customHeadScripts || settings.customHeadScripts || '',
          bodyStart: body.customBodyStartScripts || settings.customBodyStartScripts || '',
          bodyEnd: body.customBodyEndScripts || settings.customBodyEndScripts || ''
        }
      };

      if (Object.keys(siteSettingsUpdate).length > 0) {
        await SiteSettings.updateSiteSettings(siteSettingsUpdate);
        if (process.env.NODE_ENV === 'development') console.log('✅ SiteSettings synced');
      }
    }

    return NextResponse.json({
      message: 'Site ayarları başarıyla güncellendi',
      settings
    });
    
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json(
      { error: 'Site ayarları güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
});