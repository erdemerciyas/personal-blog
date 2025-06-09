import connectDB from '../../../lib/mongoose';
import Message from '../../../models/Message';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validasyon
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Tüm alanlar zorunludur.' },
        { status: 400 }
      );
    }

    // Database'e bağlan
    await connectDB();

    // Mesajı database'e kaydet
    const newMessage = new Message({
      name,
      email,
      subject,
      message,
      createdAt: new Date()
    });

    await newMessage.save();

    // Email gönderimi
    try {
      // Gmail SMTP transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      // Size gönderilecek email (yeni mesaj bildirimi)
      const notificationMailOptions = {
        from: process.env.GMAIL_USER,
        to: 'erdem.erciyas@gmail.com',
        subject: `🔔 Yeni İletişim Mesajı: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
            <div style="background: linear-gradient(135deg, #0f766e, #0891b2); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 24px; text-align: center;">
                📧 Yeni İletişim Mesajı
              </h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
              <h2 style="color: #1e293b; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                Mesaj Detayları
              </h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">👤 Gönderen:</strong>
                <span style="color: #6b7280;">${name}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">📧 Email:</strong>
                <span style="color: #6b7280;">${email}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">📋 Konu:</strong>
                <span style="color: #6b7280;">${subject}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">💬 Mesaj:</strong>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 8px; border-left: 4px solid #0891b2;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #6b7280; font-size: 14px;">
                <strong>📅 Gönderim Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
              Bu mesaj www.erdemerciyas.com.tr sitesinden gönderilmiştir.
            </div>
          </div>
        `,
      };

      // Gönderene otomatik yanıt
      const autoReplyMailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: `✅ Mesajınızı Aldık - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
            <div style="background: linear-gradient(135deg, #0f766e, #0891b2); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 24px; text-align: center;">
                ✅ Mesajınız Tarafımıza Ulaştı
              </h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">
                Merhaba <strong>${name}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>"${subject}"</strong> konulu mesajınızı başarıyla aldık. Uzman ekibimiz en kısa sürede size geri dönüş yapacaktır.
              </p>
              
              <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 18px;">
                  🎯 Ne Beklemelisiniz?
                </h3>
                <ul style="color: #047857; margin: 0; padding-left: 20px;">
                  <li>24 saat içinde ilk yanıt</li>
                  <li>Detaylı proje analizi ve öneriler</li>
                  <li>Kişiselleştirilmiş çözüm planı</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.erdemerciyas.com.tr" 
                   style="background: linear-gradient(135deg, #0f766e, #0891b2); color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  🌐 Web Sitemizi Ziyaret Edin
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-bottom: 0;">
                Saygılarımızla,<br>
                <strong>Erdem Erciyas</strong><br>
                📧 erdem.erciyas@gmail.com<br>
                🌐 www.erdemerciyas.com.tr
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

      console.log('Email notifications sent successfully');
    } catch (emailError) {
      console.error('Email gönderimi sırasında hata:', emailError);
      // Email hatası olsa bile database kaydı başarılı olduğu için devam et
    }

    return NextResponse.json(
      { 
        message: 'Mesajınız başarıyla gönderildi! 24 saat içinde geri dönüş yapacağız. Ayrıca size bir onay emaili gönderdik.',
        success: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mesaj gönderimi sırasında hata:', error);
    return NextResponse.json(
      { message: 'Mesaj gönderimi başarısız oldu. Lütfen tekrar deneyin.', success: false },
      { status: 500 }
    );
  }
} 