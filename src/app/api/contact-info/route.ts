import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/mongoose';
import Contact from '../../../models/Contact';

// GET /api/contact-info - İletişim bilgilerini getir
export async function GET() {
  try {
    await connectDB();
    
    // Aktif olan ilk contact kaydını getir (tek kayıt olması bekleniyor)
    let contact = await Contact.findOne({ isActive: true });
    
    // Eğer hiç kayıt yoksa default kayıt oluştur
    if (!contact) {
      contact = await Contact.create({
        email: 'erdem.erciyas@example.com',
        phone: '+90 (500) 123 45 67',
        address: 'Teknoloji Vadisi, No: 42, Cyberpark, Ankara, Türkiye',
        workingHours: 'Pazartesi - Cuma: 09:00 - 18:00',
        socialLinks: {
          linkedin: '',
          twitter: '',
          instagram: '',
          facebook: '',
        },
        isActive: true,
      });
    }
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error('İletişim bilgileri getirilirken hata:', error);
    return NextResponse.json(
      { error: 'İletişim bilgileri getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT /api/contact-info - İletişim bilgilerini güncelle
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    const body = await request.json();
    await connectDB();

    // Mevcut contact kaydını bul ve güncelle, yoksa oluştur
    const contact = await Contact.findOneAndUpdate(
      { isActive: true },
      {
        ...body,
        updatedAt: new Date(),
      },
      { 
        new: true, 
        upsert: true, // Eğer kayıt yoksa oluştur
        setDefaultsOnInsert: true 
      }
    );

    return NextResponse.json({
      message: 'İletişim bilgileri başarıyla güncellendi',
      contact
    });
  } catch (error) {
    console.error('İletişim bilgileri güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'İletişim bilgileri güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 