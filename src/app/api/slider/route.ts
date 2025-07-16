import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/mongoose';
import Slider from '../../../models/Slider';

// GET /api/slider - Slider'ları getir
export async function GET() {
  try {
    await connectDB();
    
    // Aktif slider'ları order'a göre sırala
    const sliders = await Slider.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json(sliders);
  } catch (error) {
    console.error('Sliderlar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Sliderlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/slider - Yeni slider oluştur (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      subtitle, 
      description, 
      buttonText, 
      buttonLink, 
      badge, 
      imageType, 
      imageUrl, 
      aiPrompt, 
      aiProvider,
      order,
      duration 
    } = body;

    // Validation
    if (!title || !subtitle || !description || !imageUrl) {
      return NextResponse.json(
        { error: 'Başlık, alt başlık, açıklama ve resim alanları zorunludur' },
        { status: 400 }
      );
    }

    await connectDB();

    // Eğer order belirtilmemişse, en son sıraya ekle
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null) {
      const lastSlider = await Slider.findOne().sort({ order: -1 });
      finalOrder = lastSlider ? lastSlider.order + 1 : 0;
    }

    // Yeni slider oluştur
    const newSlider = await Slider.create({
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      buttonText: buttonText?.trim() || 'Daha Fazla',
      buttonLink: buttonLink?.trim() || '/contact',
      badge: badge?.trim() || 'Yenilik',
      imageType: imageType || 'url',
      imageUrl: imageUrl.trim(),
      aiPrompt: aiPrompt?.trim() || '',
      aiProvider: aiProvider || 'unsplash',
      order: finalOrder,
      duration: duration || 5000,
      isActive: true,
      createdBy: session.user.email || 'admin',
      updatedBy: session.user.email || 'admin',
    });

    return NextResponse.json({
      message: 'Slider başarıyla oluşturuldu',
      data: newSlider
    }, { status: 201 });
  } catch (error) {
    console.error('Slider oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Slider oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 