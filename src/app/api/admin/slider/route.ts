import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongoose';
import Slider from '../../../../models/Slider';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/slider - Tüm slider'ları getir (Admin only)
export const GET = withSecurity(SecurityConfigs.admin)(async () => {
  try {
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
});

// POST /api/admin/slider - Yeni slider oluştur (Admin only)
export const POST = withSecurity(SecurityConfigs.admin)(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions); // only to capture email

    await connectDB();
    const body = await request.json();
    
    // Yeni slider'ın order'ını belirle (en büyük order + 1)
    const maxOrder = await Slider.findOne({}).sort({ order: -1 }).select('order');
    const nextOrder = maxOrder ? maxOrder.order + 1 : 0;
    
    // Slider verilerini hazırla
    const sliderData = {
      title: (body.title || '').trim(),
      subtitle: body.subtitle?.trim() || '',
      description: body.description?.trim() || '',
      buttonText: body.buttonText || 'Daha Fazla',
      buttonLink: body.buttonLink || '/contact',
      badge: body.badge || 'Yenilik',
      imageType: body.imageType || (body.imageUrl ? 'url' : 'upload'),
      imageUrl: body.imageUrl?.trim() || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      order: nextOrder,
      duration: body.duration || 5000,
      createdBy: session?.user?.email,
      updatedBy: session?.user?.email,
    };

    // Yeni slider'ı oluştur
    if (!sliderData.title) {
      return NextResponse.json({ error: 'Başlık alanı zorunludur' }, { status: 400 });
    }

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
});