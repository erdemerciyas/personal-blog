import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Settings from '../../../../models/Settings';
import SiteSettings from '../../../../models/SiteSettings';

// POST /api/settings/sync - Settings ve SiteSettings arasında senkronizasyon
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 401 }
      );
    }

    await connectDB();

    // Settings verisini al
    const settings = await Settings.findOne({ isActive: true });
    
    if (!settings) {
      return NextResponse.json(
        { error: 'Ayarlar bulunamadı' },
        { status: 404 }
      );
    }

    console.log('Settings verisi:', {
      logo: settings.logo,
      siteName: settings.siteName,
      siteDescription: settings.siteDescription
    });

    // SiteSettings'i güncelle
    const siteSettingsUpdate = {
      logo: {
        url: settings.logo || '',
        alt: 'Site Logo',
        width: 200,
        height: 60
      },
      siteName: settings.siteName || '',
      description: settings.siteDescription || '',
      seo: {
        metaTitle: settings.siteTitle || '',
        metaDescription: settings.siteDescription || '',
        keywords: settings.siteKeywords ? settings.siteKeywords.split(',').map((k: string) => k.trim()) : []
      },
      socialMedia: {
        twitter: settings.twitterHandle || '',
        linkedin: '',
        github: '',
        instagram: ''
      }
    };

    console.log('SiteSettings güncellemesi:', siteSettingsUpdate);

    const updatedSiteSettings = await SiteSettings.updateSiteSettings(siteSettingsUpdate);

    console.log('Güncellenen SiteSettings:', {
      logo: updatedSiteSettings.logo,
      siteName: updatedSiteSettings.siteName
    });

    return NextResponse.json({
      message: 'Veriler başarıyla senkronize edildi',
      settings: {
        logo: settings.logo,
        siteName: settings.siteName
      },
      siteSettings: {
        logo: updatedSiteSettings.logo,
        siteName: updatedSiteSettings.siteName
      }
    });

  } catch (error) {
    console.error('Senkronizasyon hatası:', error);
    return NextResponse.json(
      { error: 'Senkronizasyon sırasında hata oluştu' },
      { status: 500 }
    );
  }
} 