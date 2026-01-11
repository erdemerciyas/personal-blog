import nodemailer from 'nodemailer';

interface SendOrderEmailProps {
  to: string;
  subject: string;
  order: any;
  isAdmin?: boolean;
  isStatusUpdate?: boolean;
  adminNote?: string;
}

export async function sendOrderEmail({ to, subject, order, isAdmin = false, isStatusUpdate = false, adminNote }: SendOrderEmailProps) {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  const productUrl = `${process.env.NEXTAUTH_URL}/products/${order.productSlug}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('tr-TR');
  const orderId = order._id.toString().slice(-6).toUpperCase();

  // Format options string
  const optionsHtml = order.selectedOptions && order.selectedOptions.length > 0
    ? order.selectedOptions.map((opt: any) => `<span style="display:inline-block; background:#f0f0f0; padding:2px 6px; border-radius:4px; margin-right:5px; font-size:12px;">${opt.group}: ${opt.option}</span>`).join('')
    : '';

  let headerMessage = '';
  if (isStatusUpdate) {
    headerMessage = `Siparişinizin durumu <strong>${order.status.toUpperCase()}</strong> olarak güncellendi.`;
  } else {
    headerMessage = isAdmin
      ? `Müşteri <strong>${order.customerName}</strong> yeni bir sipariş oluşturdu.`
      : `Sayın <strong>${order.customerName}</strong>, siparişiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.`;
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
      <!-- Header -->
      <div style="background-color: #4f46e5; padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Fixral 3D</h1>
        <p style="color: #e0e7ff; margin: 5px 0 0; font-size: 14px;">${subject}</p>
      </div>

      <!-- Main Content -->
      <div style="padding: 30px 25px;">
        <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          ${headerMessage}
        </p>

        ${adminNote ? `
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
          <h3 style="margin: 0 0 5px; color: #92400e; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Yönetici Notu</h3>
          <p style="margin: 0; color: #b45309; font-style: italic;">"${adminNote}"</p>
        </div>` : ''}

        <!-- Order Card -->
        <div style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px;">
          <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">Sipariş Özeti</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <!-- Product -->
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">Ürün</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 14px; text-align: right;">
                <a href="${productUrl}" style="color: #4f46e5; text-decoration: none;">${order.productName}</a>
              </td>
            </tr>
            
            ${optionsHtml ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Seçenekler</td>
              <td style="padding: 8px 0; text-align: right;">${optionsHtml}</td>
            </tr>` : ''}

            <!-- Identifier info -->
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Sipariş No</td>
              <td style="padding: 8px 0; color: #0f172a; font-family: monospace; font-size: 14px; text-align: right;">#${orderId}</td>
            </tr>
                        <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Tarih</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: right;">${orderDate}</td>
            </tr>

            <!-- Divider -->
            <tr><td colspan="2" style="padding: 10px 0;"><div style="height: 1px; background-color: #e2e8f0;"></div></td></tr>

            <!-- Pricing Details -->
            <tr>
              <td style="padding: 5px 0; color: #64748b; font-size: 14px;">Birim Fiyat</td>
              <td style="padding: 5px 0; color: #334155; font-size: 14px; text-align: right;">${order.price ? order.price.toLocaleString('tr-TR') : 0} TL</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #64748b; font-size: 14px;">Adet</td>
              <td style="padding: 5px 0; color: #334155; font-size: 14px; text-align: right;">x ${order.quantity || 1}</td>
            </tr>
            
            <!-- Total -->
            <tr>
              <td style="padding-top: 15px; font-weight: 700; color: #0f172a; font-size: 16px;">Toplam Tutar</td>
              <td style="padding-top: 15px; font-weight: 800; color: #4f46e5; font-size: 18px; text-align: right;">
                ${(order.price * (order.quantity || 1)).toLocaleString('tr-TR')} TL
              </td>
            </tr>
          </table>
        </div>

        <!-- Customer Info -->
        <div style="margin-top: 25px;">
            <h4 style="margin: 0 0 10px; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Teslimat Bilgileri</h4>
            <div style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 15px; color: #334155; font-size: 14px; line-height: 1.6;">
                <strong>${order.customerName}</strong><br>
                ${order.customerAddress}<br>
                <span style="color: #64748b;">${order.customerPhone}</span>
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="${productUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Ürünü Görüntüle</a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
        <p style="margin: 0;">&copy; Fixral 3D - Tüm Hakları Saklıdır.</p>
        <p style="margin: 5px 0 0;">Bu e-posta otomatik olarak oluşturulmuştur.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Fixral 3D" <${user}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
