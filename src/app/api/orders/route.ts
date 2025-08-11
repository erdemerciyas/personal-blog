import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ip = getClientIP(request as unknown as import('next/server').NextRequest);

  const rl = rateLimit(ip, 'CONTACT');
  if (!rl.allowed) {
    return NextResponse.json({ message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' }, { status: 429, headers: { 'Retry-After': Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } });
  }

  try {
    const body = await request.json();
    const {
      productId,
      productSlug,
      productTitle,
      productPrice,
      productCurrency,
      quantity,
      name,
      email,
      phone,
      address,
      note,
    } = body || {};

    if (!productId || !productSlug || !productTitle || !name || !address) {
      return NextResponse.json({ message: 'Zorunlu alanlar eksik.' }, { status: 400 });
    }
    if ((!email || String(email).trim() === '') && (!phone || String(phone).trim() === '')) {
      return NextResponse.json({ message: 'E-posta veya telefon bilgisinden en az biri zorunludur.' }, { status: 400 });
    }

    const total = typeof productPrice === 'number' ? quantity * productPrice : undefined;

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const toOwner = {
        from: process.env.GMAIL_USER,
        to: 'erdem.erciyas@gmail.com',
        subject: `🛒 Yeni Sipariş: ${productTitle} (${quantity} adet)`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin:0 auto; padding:20px; background:#f8fafc; border-radius:12px;">
            <div style="background:linear-gradient(135deg,#0f766e,#0891b2); padding:24px; border-radius:12px; color:white;">
              <h1 style="margin:0; font-size:22px;">Yeni Sipariş</h1>
            </div>
            <div style="background:white; padding:24px; border-radius:12px; margin-top:12px;">
              <h2 style="margin-top:0; font-size:18px;">Ürün</h2>
              <p style="margin:6px 0; font-weight:600;">${productTitle}</p>
              ${typeof productPrice === 'number' ? `<p style="margin:6px 0;">Birim Fiyat: <strong>${productPrice} ${productCurrency || ''}</strong></p>` : ''}
              <p style="margin:6px 0;">Adet: <strong>${quantity}</strong></p>
              ${typeof total === 'number' ? `<p style="margin:6px 0;">Toplam: <strong>${total} ${productCurrency || ''}</strong></p>` : ''}
              <p style="margin:6px 0;">Bağlantı: <a href="${process.env.NEXTAUTH_URL || ''}/products/${productSlug}">${process.env.NEXTAUTH_URL || ''}/products/${productSlug}</a></p>
              <hr style="margin:16px 0; border:none; border-top:1px solid #e2e8f0;" />
              <h2 style="font-size:18px;">Alıcı</h2>
              <p style="margin:6px 0;">Ad Soyad: <strong>${name}</strong></p>
              <p style="margin:6px 0;">E-posta: <strong>${email}</strong></p>
              <p style="margin:6px 0;">Telefon: <strong>${phone}</strong></p>
              <p style="margin:6px 0;">Adres:</p>
              <div style="background:#f1f5f9; padding:12px; border-radius:8px; white-space:pre-wrap;">${address}</div>
              ${note ? `<p style="margin:12px 0 6px 0;">Not:</p><div style="background:#f1f5f9; padding:12px; border-radius:8px; white-space:pre-wrap;">${note}</div>` : ''}
            </div>
          </div>
        `,
      };

      const toBuyer = email ? {
        from: process.env.GMAIL_USER,
        to: email,
        subject: `✅ Sipariş Onayı - ${productTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 640px; margin:0 auto; padding:20px; background:#f8fafc; border-radius:12px;">
            <div style="background:linear-gradient(135deg,#0f766e,#0891b2); padding:24px; border-radius:12px; color:white; text-align:center;">
              <h1 style="margin:0; font-size:22px;">Siparişiniz Alındı</h1>
            </div>
            <div style="background:white; padding:24px; border-radius:12px; margin-top:12px;">
              <p>Merhaba <strong>${name}</strong>,</p>
              <p><strong>${productTitle}</strong> için verdiğiniz siparişi aldık. En kısa sürede sizinle iletişime geçeceğiz.</p>
              ${typeof total === 'number' ? `<p>Toplam Tutar: <strong>${total} ${productCurrency || ''}</strong></p>` : ''}
              <p>Ürün sayfası: <a href="${process.env.NEXTAUTH_URL || ''}/products/${productSlug}">${process.env.NEXTAUTH_URL || ''}/products/${productSlug}</a></p>
              <p style="color:#64748b; font-size:12px;">Bu e-posta otomatik olarak gönderilmiştir.</p>
            </div>
          </div>
        `,
      } : null;

      if (toBuyer) {
        await Promise.all([
          transporter.sendMail(toOwner),
          transporter.sendMail(toBuyer),
        ]);
      } else {
        await transporter.sendMail(toOwner);
      }
    } catch (emailError) {
      // Devam et, ancak loglanabilir
      console.error('Order email error:', emailError);
    }

    return NextResponse.json({ message: 'Sipariş onaylandı' }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Bir hata oluştu' }, { status: 500 });
  }
}


