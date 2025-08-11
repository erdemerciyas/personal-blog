import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import connectDB from '../../../../../lib/mongoose';
import PageSettings from '../../../../../models/PageSettings';

// GET - Belirli bir sayfanın ayarlarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    await connectDB();
    
    const { pageId } = params;
    
    const pageSettings = await PageSettings.findOne({ pageId });

    if (!pageSettings) {
      // Sayfa ayarı bulunamazsa, varsayılan değerleri döndür
      return NextResponse.json({
        title: pageId.charAt(0).toUpperCase() + pageId.slice(1), // 'portfolio' -> 'Portfolio'
        description: '',
        isActive: true,
        showInNavigation: pageId !== 'product-detail'
      });
    }

    return NextResponse.json(pageSettings);
  } catch (error) {
    console.error('Page settings getirme hatası:', error);
    // Graceful fallback: return minimal defaults so UI keeps working
    const { pageId } = params;
    return NextResponse.json({
      title: pageId.charAt(0).toUpperCase() + pageId.slice(1),
      description: '',
      buttonText: '',
      buttonLink: ''
    });
  }
}

// PUT - Belirli bir sayfanın ayarlarını güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { pageId } = params;
    const updateData = await request.json();
    
    const updatedPage = await PageSettings.findOneAndUpdate(
      { pageId },
      { ...updateData, updatedAt: new Date() },
      { new: true, upsert: true } // upsert: true - eğer sayfa yoksa oluşturur
    );

    if (!updatedPage) {
      return NextResponse.json(
        { error: 'Sayfa bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Sayfa ayarları başarıyla güncellendi',
        page: updatedPage 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Page settings güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Sayfa ayarları güncellenemedi' },
      { status: 500 }
    );
  }
}