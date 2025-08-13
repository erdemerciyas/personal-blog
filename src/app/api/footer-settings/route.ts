import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongoose';
import FooterSettings from '../../../models/FooterSettings';

// GET: Footer ayarlarını getir (public)
export async function GET() {
  try {
    await connectDB();
    const settings = await FooterSettings.getSingleton();
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Footer settings fetch error:', error);
    
    // Hata durumunda varsayılan ayarları döndür
    const defaultSettings = {
      mainDescription: 'Mühendislik ve teknoloji alanında yenilikçi çözümler sunarak projelerinizi hayata geçiriyoruz.',
      contactInfo: {
        email: 'extremeecu34@gmail.com',
        phone: '+90 (500) 123 45 67',
        address: 'Teknoloji Vadisi, Ankara, Türkiye'
      },
      quickLinks: [
        { title: 'Anasayfa', url: '/', isExternal: false },
        { title: 'Hizmetler', url: '/services', isExternal: false },
        { title: 'Projeler', url: '/portfolio', isExternal: false },
        { title: 'İletişim', url: '/contact', isExternal: false }
      ],
      socialLinks: {
        linkedin: '',
        twitter: '',
        instagram: '',
        facebook: '',
        github: '',
        youtube: ''
      },
      copyrightInfo: {
        companyName: 'Extreme Ecu',
        year: new Date().getFullYear(),
        additionalText: 'Tüm Hakları Saklıdır.'
      },
      developerInfo: {
        name: 'Extreme Ecu',
        website: 'https://extremeecu.com',
        companyName: 'Extreme Ecu'
      },
      visibility: {
        showQuickLinks: true,
        showSocialLinks: true,
        showContactInfo: true,
        showDeveloperInfo: true
      },
      theme: {
        backgroundColor: 'bg-slate-800',
        textColor: 'text-slate-300',
        accentColor: 'text-brand-primary-400'
      }
    };
    
    return NextResponse.json(defaultSettings, { status: 200 });
  }
} 