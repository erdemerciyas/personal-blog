import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { authOptions } from '../../../lib/auth';
import connectDB from '../../../lib/mongoose';
import Message from '../../../models/Message';
import nodemailer from 'nodemailer';

// GET /api/messages - Mesajları getir (Admin only)
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
    
    // Mesajları en yeniden eskiye doğru sırala
    const messages = await Message.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Mesajlar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Mesajlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Yeni mesaj oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, subject, message, projectType, budget, urgency } = body;

    // Validasyon
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Ad, email, konu ve mesaj alanları zorunludur' },
        { status: 400 }
      );
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz' },
        { status: 400 }
      );
    }

    await connectDB();

    // Yeni mesaj oluştur
    const newMessage = await Message.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      company: company?.trim() || '',
      subject: subject.trim(),
      message: message.trim(),
      projectType: projectType || 'other',
      budget: budget || 'not-specified',
      urgency: urgency || 'medium',
      status: 'new',
      isRead: false,
    });

    // Mail gönderimi
    try {
      // Gmail SMTP transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      // Proje türü çevirisi
      const projectTypeMap = {
        '3d-design': '3D Tasarım',
        'reverse-engineering': 'Tersine Mühendislik', 
        '3d-printing': '3D Baskı',
        'cad-design': 'CAD Tasarım',
        'consulting': 'Danışmanlık',
        'other': 'Diğer'
      };

      // Bütçe çevirisi
      const budgetMap = {
        'under-5k': '5.000 TL altı',
        '5k-15k': '5.000 - 15.000 TL',
        '15k-50k': '15.000 - 50.000 TL', 
        '50k-100k': '50.000 - 100.000 TL',
        'above-100k': '100.000 TL üzeri',
        'not-specified': 'Belirtilmedi'
      };

      // Aciliyet çevirisi
      const urgencyMap = {
        'low': 'Düşük',
        'medium': 'Orta', 
        'high': 'Yüksek',
        'urgent': 'Acil'
      };

      // Size gönderilecek email (yeni proje talebi bildirimi)
      const notificationMailOptions = {
        from: process.env.GMAIL_USER,
        to: 'erdem.erciyas@gmail.com',
        subject: `🚀 Yeni Proje Talebi: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
            <div style="background: linear-gradient(135deg, #0f766e, #0891b2); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 24px; text-align: center;">
                🚀 Yeni Proje Talebi
              </h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
              <h2 style="color: #1e293b; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                İletişim Bilgileri
              </h2>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                  <strong style="color: #374151;">👤 Ad Soyad:</strong>
                  <p style="color: #6b7280; margin: 5px 0;">${name}</p>
                </div>
                <div>
                  <strong style="color: #374151;">📧 Email:</strong>
                  <p style="color: #6b7280; margin: 5px 0;">${email}</p>
                </div>
                ${phone ? `
                <div>
                  <strong style="color: #374151;">📞 Telefon:</strong>
                  <p style="color: #6b7280; margin: 5px 0;">${phone}</p>
                </div>
                ` : ''}
                ${company ? `
                <div>
                  <strong style="color: #374151;">🏢 Şirket:</strong>
                  <p style="color: #6b7280; margin: 5px 0;">${company}</p>
                </div>
                ` : ''}
              </div>
              
              <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                Proje Detayları
              </h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">📋 Konu:</strong>
                <p style="color: #6b7280; margin: 5px 0; font-size: 16px; font-weight: 600;">${subject}</p>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                  <strong style="color: #374151;">🔧 Proje Türü:</strong>
                  <p style="color: #6b7280; margin: 5px 0;">${projectTypeMap[projectType] || 'Diğer'}</p>
                </div>
                <div>
                  <strong style="color: #374151;">💰 Bütçe:</strong>
                  <p style="color: #6b7280; margin: 5px 0;">${budgetMap[budget] || 'Belirtilmedi'}</p>
                </div>
                <div>
                  <strong style="color: #374151;">⚡ Aciliyet:</strong>
                  <p style="color: #6b7280; margin: 5px 0; font-weight: 600;">${urgencyMap[urgency] || 'Orta'}</p>
                </div>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">💬 Proje Açıklaması:</strong>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 8px; border-left: 4px solid #0891b2;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #6b7280; font-size: 14px;">
                <strong>📅 Talep Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
              Bu proje talebi www.fixral.com sitesinden gönderilmiştir.
            </div>
          </div>
        `,
      };

      // Gönderene otomatik yanıt
      const autoReplyMailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: `✅ Proje Talebinizi Aldık - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
            <div style="background: linear-gradient(135deg, #0f766e, #0891b2); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 24px; text-align: center;">
                ✅ Proje Talebiniz Alındı
              </h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">
                Merhaba <strong>${name}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>"${subject}"</strong> konulu proje talebiniz tarafımıza başarıyla ulaştı. 
                Proje detaylarınızı inceleyelim ve size en kısa sürede geri dönüş yapalım.
              </p>
              
              <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 18px;">
                  🎯 Proje Detaylarınız:
                </h3>
                <ul style="color: #047857; margin: 10px 0; padding-left: 20px;">
                  <li><strong>Proje Türü:</strong> ${projectTypeMap[projectType] || 'Diğer'}</li>
                  <li><strong>Bütçe Aralığı:</strong> ${budgetMap[budget] || 'Belirtilmedi'}</li>
                  <li><strong>Öncelik Seviyesi:</strong> ${urgencyMap[urgency] || 'Orta'}</li>
                </ul>
              </div>
              
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 18px;">
                  ⏰ Sonraki Adımlar:
                </h3>
                <ul style="color: #1e40af; margin: 10px 0; padding-left: 20px;">
                  <li>24 saat içinde ilk değerlendirme</li>
                  <li>Detaylı proje analizi ve öneriler</li>
                  <li>Kişiselleştirilmiş çözüm planı sunumu</li>
                  <li>Fiyat teklifimiz ve zaman çizelgesi</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://fixral.com/portfolio" 
                   style="background: linear-gradient(135deg, #0f766e, #0891b2); color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px;">
                  🎨 Portfolyomuzu İnceleyin
                </a>
                <a href="https://fixral.com/services" 
                   style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  🔧 Hizmetlerimizi Keşfedin
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-bottom: 0;">
                Saygılarımızla,<br>
                <strong>FIXRAL Ekibi</strong><br>
                📧 info@fixral.com<br>
                🌐 www.fixral.com
              </p>
            </div>
          </div>
        `,
      };

      // Her iki emaili de gönder
      await Promise.all([
        transporter.sendMail(notificationMailOptions),
        transporter.sendMail(autoReplyMailOptions)
      ]);

      console.log('Proje talebi email bildirimleri başarıyla gönderildi');
    } catch (emailError) {
      console.error('Email gönderimi sırasında hata:', emailError);
      // Email hatası olsa bile database kaydı başarılı olduğu için devam et
    }

    return NextResponse.json({
      message: 'Proje talebiniz başarıyla gönderildi! 24 saat içinde geri dönüş yapacağız. Ayrıca size bir onay emaili gönderdik.',
      data: newMessage
    }, { status: 201 });
  } catch (error) {
    console.error('Mesaj gönderilirken hata:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 