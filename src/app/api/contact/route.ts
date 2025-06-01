import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // E-posta göndermek için transporter oluştur
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "erdem.erciyas@gmail.com", // Gmail adresiniz
        pass: process.env.GMAIL_APP_PASSWORD // Gmail uygulama şifresi
      }
    });

    // E-posta içeriğini hazırla
    const mailOptions = {
      from: "erdem.erciyas@gmail.com",
      to: "erdem.erciyas@gmail.com",
      subject: `Yeni İletişim Formu: ${subject}`,
      html: `
        <h3>Yeni İletişim Formu Mesajı</h3>
        <p><strong>Gönderen:</strong> ${name}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Konu:</strong> ${subject}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${message}</p>
      `
    };

    // E-postayı gönder
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'E-posta başarıyla gönderildi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('E-posta gönderimi sırasında hata:', error);
    return NextResponse.json(
      { message: 'E-posta gönderimi başarısız oldu' },
      { status: 500 }
    );
  }
} 