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

// POST /api/admin/slider - Yeni slider oluştur (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const body = await request.json();
    
    // Yeni slider'ın order'ını belirle (en büyük order + 1)
    const maxOrder = await Slider.findOne({}).sort({ order: -1 }).select('order');
    const nextOrder = maxOrder ? maxOrder.order + 1 : 0;
    
    // Slider verilerini hazırla
    const sliderData = {
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      buttonText: body.buttonText || 'Daha Fazla',
      buttonLink: body.buttonLink || '/contact',
      badge: body.badge || 'Yenilik',
      imageType: body.imageType || 'upload',
      imageUrl: body.imageUrl,
      isActive: body.isActive !== undefined ? body.isActive : true,
      order: nextOrder,
      duration: body.duration || 5000,
      createdBy: session.user.email || 'admin',
      updatedBy: session.user.email || 'admin',
    };

    // Yeni slider'ı oluştur
    const slider = new Slider(sliderData);
    await slider.save();
    
    return NextResponse.json(slider, { status: 201 });
  } catch (error) {
    console.error('Slider oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Slider oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}