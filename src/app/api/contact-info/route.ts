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
        email: 'extremeecu34@gmail.com',
        phone: '+90 (532) 123 45 67',
        address: 'Altay Mahallesi Bilgi sk No: 5 Turgutlu Manisa',
        workingHours: 'Pazartesi - Cuma: 09:00 - 18:00',
        socialLinks: {
          linkedin: '',
          twitter: 'https://twitter.com/extremeecu',
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
    // Authentication check with better error handling
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error('Unauthorized access attempt to contact-info PUT');
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 401 }
      );
    }

    // Parse request body with validation
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.email || !body.phone || !body.address) {
      return NextResponse.json(
        { error: 'E-posta, telefon ve adres alanları zorunludur' },
        { status: 400 }
      );
    }

    // Database connection with timeout
    await Promise.race([
      connectDB(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);

    // Helper: normalize URLs (accepts @handles and plain domains)
    const normalizeUrl = (value: unknown, network?: 'twitter' | 'instagram' | 'linkedin' | 'facebook') => {
      if (!value || typeof value !== 'string') return '';
      const v = value.trim();
      if (v.startsWith('@')) {
        const handle = v.slice(1);
        if (network === 'twitter') return `https://twitter.com/${handle}`;
        if (network === 'instagram') return `https://instagram.com/${handle}`;
        if (network === 'linkedin') return `https://linkedin.com/in/${handle}`;
        if (network === 'facebook') return `https://facebook.com/${handle}`;
      }
      if (!/^https?:\/\//i.test(v)) return `https://${v}`;
      return v;
    };

    // Prepare update data
    const updateData = {
      email: body.email,
      phone: body.phone,
      address: body.address,
      workingHours: body.workingHours || 'Pazartesi - Cuma: 09:00 - 18:00',
      socialLinks: {
        linkedin: normalizeUrl(body.socialLinks?.linkedin, 'linkedin'),
        twitter: normalizeUrl(body.socialLinks?.twitter, 'twitter'),
        instagram: normalizeUrl(body.socialLinks?.instagram, 'instagram'),
        facebook: normalizeUrl(body.socialLinks?.facebook, 'facebook'),
      },
      isActive: true,
      updatedAt: new Date(),
    };

    // Try to update existing record first
    let contact = await Contact.findOneAndUpdate(
      { isActive: true },
      updateData,
      { new: true }
    );

    // If no existing record, create new one
    if (!contact) {
      contact = await Contact.create(updateData);
    }

    console.log('Contact info updated successfully:', contact._id);

    return NextResponse.json({
      message: 'İletişim bilgileri başarıyla güncellendi',
      contact
    });

  } catch (error) {
    console.error('Contact info update error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    // Return specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Veritabanı bağlantı zaman aşımı' },
          { status: 504 }
        );
      }
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Veri doğrulama hatası' },
          { status: 400 }
        );
      }
      if (error.message.includes('connection')) {
        return NextResponse.json(
          { error: 'Veritabanı bağlantı hatası' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'İletişim bilgileri güncellenirken bir hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    );
  }
} 