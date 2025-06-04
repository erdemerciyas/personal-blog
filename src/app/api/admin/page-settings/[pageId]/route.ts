import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import PageSettings from '@/models/PageSettings';

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
      { new: true }
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