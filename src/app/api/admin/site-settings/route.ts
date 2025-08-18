import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import SiteSettings from '../../../../models/SiteSettings';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: Site ayarlarını getir
export const GET = withSecurity(SecurityConfigs.admin)(async () => {
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
});

// PUT: Site ayarlarını güncelle
export const PUT = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
  try {
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
      'analytics'
    ];
    
    const filteredData: Record<string, unknown> = {};
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
});

interface SiteSettingsRequest {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  youtube?: string;
}

export const POST = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
  try {
    await connectDB();
    
    const body: SiteSettingsRequest = await request.json();
    
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(body);
    } else {
      Object.assign(settings, body);
    }
    
    await settings.save();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Site settings update error:', error);
    return NextResponse.json({ 
      error: 'Ayarlar güncellenirken bir hata oluştu' 
    }, { status: 500 });
  }
});