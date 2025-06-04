import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Slider from '../../../../models/Slider';

// GET /api/admin/slider - Tüm slider'ları getir (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    await connectDB();
    
    // Tüm slider'ları order'a göre sırala (aktif/pasif fark etmeksizin)
    const sliders = await Slider.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json(sliders);
  } catch (error) {
    console.error('Admin sliderları getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Sliderlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 