import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import FooterSettings from '../../../../models/FooterSettings';
import { getServerSession } from 'next-auth/next';

// GET: Footer ayarlarını getir
export async function GET() {
  try {
    await connectDB();
    const settings = await FooterSettings.getSingleton();
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Footer settings fetch error:', error);
    return NextResponse.json(
      { message: 'Footer ayarları alınamadı' },
      { status: 500 }
    );
  }
}

// PUT: Footer ayarlarını güncelle  
export async function PUT(request: Request) {
  try {
    // Sadece admin kullanıcılar güncelleyebilir
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { message: 'Yetki gerekli' },
        { status: 401 }
      );
    }

    await connectDB();
    const updateData = await request.json();
    
    // Mevcut ayarları bul veya oluştur
    let settings = await FooterSettings.findOne();
    if (!settings) {
      settings = new FooterSettings(updateData);
    } else {
      // Nested objeleri doğru şekilde güncelle
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key] === 'object' && updateData[key] !== null && !Array.isArray(updateData[key])) {
          settings[key] = { ...settings[key], ...updateData[key] };
        } else {
          settings[key] = updateData[key];
        }
      });
    }
    
    await settings.save();
    
    return NextResponse.json(
      { 
        message: 'Footer ayarları başarıyla güncellendi',
        settings 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Footer settings update error:', error);
    return NextResponse.json(
      { message: 'Footer ayarları güncellenemedi' },
      { status: 500 }
    );
  }
}

// POST: Footer ayarlarını sıfırla (varsayılan değerlere döndür)
export async function POST() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { message: 'Yetki gerekli' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Mevcut ayarları sil ve yenilerini oluştur
    await FooterSettings.deleteMany({});
    const newSettings = await FooterSettings.create({});
    
    return NextResponse.json(
      { 
        message: 'Footer ayarları varsayılan değerlere sıfırlandı',
        settings: newSettings 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Footer settings reset error:', error);
    return NextResponse.json(
      { message: 'Footer ayarları sıfırlanamadı' },
      { status: 500 }
    );
  }
} 