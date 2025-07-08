import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongoose';
import User from '../../../../models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email adresi gerekli' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      // Güvenlik için gerçek durumu açıklama
      return NextResponse.json(
        { message: 'Eğer bu email sistemde kayıtlı ise, şifre sıfırlama bağlantısı gönderildi.' },
        { status: 200 }
      );
    }

    // Reset token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 saat

    // Kullanıcıya reset token'ı kaydet
    await User.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpiry
    });

    // Email gönderme konfigürasyonu
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email içeriği
    const resetUrl = `${process.env.NEXTAUTH_URL}/admin/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Şifre Sıfırlama Talebi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f766e;">Şifre Sıfırlama Talebi</h2>
          <p>Merhaba,</p>
          <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki bağlantıya tıklayarak yeni şifrenizi oluşturabilirsiniz:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Şifremi Sıfırla
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Bu bağlantı 1 saat süreyle geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu emaili görmezden gelebilirsiniz.
          </p>
          <p style="color: #666; font-size: 14px;">
            Bağlantı çalışmıyorsa, aşağıdaki URL'yi tarayıcınıza kopyalayıp yapıştırabilirsiniz:<br>
            ${resetUrl}
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
          </p>
        </div>
      `
    };

    // Email gönder
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Şifre sıfırlama talebinde bir hata oluştu' },
      { status: 500 }
    );
  }
} 