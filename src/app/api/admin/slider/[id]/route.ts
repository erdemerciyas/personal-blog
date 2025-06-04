import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import connectDB from '../../../../../lib/mongoose';
import Slider from '../../../../../models/Slider';
import { ObjectId } from 'mongodb';

// GET /api/admin/slider/[id] - Tek slider getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Geçersiz slider ID' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const slider = await Slider.findById(id);
    if (!slider) {
      return NextResponse.json(
        { error: 'Slider bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(slider);
  } catch (error) {
    console.error('Slider getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Slider getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/slider/[id] - Slider güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Geçersiz slider ID' },
        { status: 400 }
      );
    }

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
      duration,
      isActive 
    } = body;

    // Validation
    if (!title || !subtitle || !description || !imageUrl) {
      return NextResponse.json(
        { error: 'Başlık, alt başlık, açıklama ve resim alanları zorunludur' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const updateData = {
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
      order: order || 0,
      duration: duration || 5000,
      isActive: isActive !== undefined ? isActive : true,
      updatedBy: session.user.email || 'admin',
    };

    const slider = await Slider.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!slider) {
      return NextResponse.json(
        { error: 'Slider bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Slider başarıyla güncellendi',
      data: slider
    });
  } catch (error) {
    console.error('Slider güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Slider güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/slider/[id] - Slider sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Geçersiz slider ID' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const slider = await Slider.findByIdAndDelete(id);
    if (!slider) {
      return NextResponse.json(
        { error: 'Slider bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Slider başarıyla silindi'
    });
  } catch (error) {
    console.error('Slider silinirken hata:', error);
    return NextResponse.json(
      { error: 'Slider silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 