import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import connectDB from '@/lib/mongoose';
import Settings from '@/models/Settings';
import SiteSettings, { type ISiteSettings } from '@/models/SiteSettings';

// GET Method — reads from SiteSettings (single source of truth, same model admin panel writes to)
export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 GET /api/public/settings called');
  }
  try {
    await connectDB();

    const siteSettings = await SiteSettings.getSiteSettings();

    // Map to a public-friendly response shape
    const response = {
      siteName: siteSettings.siteName || '',
      logoText: siteSettings.logoText || '',
      slogan: siteSettings.slogan || '',
      description: siteSettings.description || '',
      logo: siteSettings.logo || null,
      favicon: siteSettings.favicon || '/favicon.ico',
      siteUrl: siteSettings.siteUrl || '',
      language: siteSettings.language || 'tr',
      timezone: siteSettings.timezone || 'Europe/Istanbul',
      socialMedia: siteSettings.socialMedia || {},
      maintenanceMode: siteSettings.maintenanceMode || false,
      allowRegistration: siteSettings.allowRegistration || false,
      enableComments: siteSettings.enableComments || false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: 'Site ayarları getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT Method
export const PUT = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
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
export const POST = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📬 POST /api/settings called');
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
          linkedin: '',
          github: '',
          instagram: ''
        };
      }

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