export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import ContentSettings from '../../../../models/ContentSettings';

// GET: İçerik ayarlarını getir
export async function GET() {
  try {
    await connectDB();
    
    const settings = await ContentSettings.getContentSettings();
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Content ayarları getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Content ayarları getirilemedi' },
      { status: 500 }
    );
  }
}

// PUT: İçerik ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const updateData = await request.json();
    const settings = await ContentSettings.updateContentSettings(updateData);
    
    return NextResponse.json(
      { 
        message: 'İçerik ayarları başarıyla güncellendi',
        settings 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Content ayarları güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Content ayarları güncellenemedi' },
      { status: 500 }
    );
  }
}