
import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongoose';
import FooterSettings from '../../../models/FooterSettings';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: Footer ayarlarını getir (public)
export async function GET() {
  try {
    await connectDB();

    // Admin panelinden yapılandırılan FooterSettings modelini kullan
    const settings = await FooterSettings.getSingleton();

    // Eğer veritabanında henüz ayar yoksa veya getSingleton oluşturamadıysa (ki oluşturur),
    // varsayılanları döndür. Ancak getSingleton her zaman bir değer dönmelidir.

    if (!settings) {
      // Fallback defaults just in case something catastrophic happens
      return NextResponse.json({
        mainDescription: 'Mühendislik ve teknoloji alanında yenilikçi çözümler sunarak projelerinizi hayata geçiriyoruz.',
        contactInfo: {
          email: 'erdem.erciyas@gmail.com',
          phone: '+90 (500) 123 45 67',
          address: 'Teknoloji Vadisi, Ankara, Türkiye'
        },
        quickLinks: [],
        socialLinks: {},
        copyrightInfo: {
          companyName: 'FIXRAL',
          year: new Date().getFullYear(),
          additionalText: 'Tüm Hakları Saklıdır.'
        },
        developerInfo: {
          name: 'Erdem Erciyas',
          website: 'https://www.erdemerciyas.com.tr',
          companyName: 'Erciyas Engineering'
        },
        visibility: {
          showQuickLinks: true,
          showSocialLinks: true,
          showContactInfo: true,
          showDeveloperInfo: true
        }
      }, { status: 200 });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Footer settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}