import nodemailer from 'nodemailer';

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log(`Attempting to send email to: ${to} with subject: "${subject}"`);
    const info = await transporter.sendMail({
      from: `"Fixral 3D" <${user}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error('Error sending email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return false;
  }
}

interface SendOrderEmailProps {
  to: string;
  subject: string;
  order: any;
  isAdmin?: boolean;
  isStatusUpdate?: boolean;
  adminNote?: string;
}

export async function sendOrderEmail({ to, subject, order, isAdmin = false, isStatusUpdate = false, adminNote }: SendOrderEmailProps) {
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
            <!-- Product Loop -->
            ${order.items && order.items.length > 0 ? order.items.map((item: any) => {
    const itemUrl = `${process.env.NEXTAUTH_URL}/products/${item.productSlug || order.productSlug}`;
    return `
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%; vertical-align: top;">
                  <div style="color: #0f172a; font-weight: 600;">${item.productName || order.productName || 'Ürün'}</div>
                  ${item.selectedOptions && item.selectedOptions.length > 0 ?
        `<div style="margin-top:4px;">` +
        item.selectedOptions.map((opt: any) => `<span style="display:inline-block; background:#f0f0f0; padding:2px 6px; border-radius:4px; margin-right:5px; font-size:10px;">${opt.group}: ${opt.option}</span>`).join('') +
        `</div>`
        : ''}
                </td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: right; vertical-align: top;">
                  <div style="font-weight: 600;">${item.price?.toLocaleString('tr-TR')} TL</div>
                  <div style="color: #64748b; font-size: 12px;">x ${item.quantity}</div>
                </td>
              </tr>
              <tr><td colspan="2" style="padding: 5px 0;"><div style="height: 1px; background-color: #f1f5f9;"></div></td></tr>
              `;
  }).join('') : `
            <!-- Legacy Single Product Fallback -->
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
            `}

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
            
            <!-- Total -->
            <tr>
              <td style="padding-top: 15px; font-weight: 700; color: #0f172a; font-size: 16px;">Toplam Tutar</td>
              <td style="padding-top: 15px; font-weight: 800; color: #4f46e5; font-size: 18px; text-align: right;">
                ${(order.totalPrice || (order.price * (order.quantity || 1))).toLocaleString('tr-TR')} TL
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

  return sendEmail({
    to,
    subject,
    html: htmlContent
  });
}

interface SendMessageEmailProps {
  to: string;
  subject: string;
  messageData: {
    senderName: string;
    messageContent: string;
    productName?: string;
    productId?: string;
    orderId?: string;
    createdAt?: Date;
    adminReply?: string;
    conversationHistory?: { sender: string; message: string; date: Date }[];
  };
  isAdminNotification?: boolean;
}

export async function sendMessageEmail({ to, subject, messageData, isAdminNotification = false }: SendMessageEmailProps) {
  const date = new Date(messageData.createdAt || new Date()).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Determine header and specific content styling
  let headerTitle = '';
  let headerSubtitle = '';

  if (isAdminNotification) {
    headerTitle = 'Yeni Mesaj';
    headerSubtitle = `${messageData.senderName} tarafından yeni bir mesaj gönderildi.`;
  } else if (messageData.adminReply) {
    headerTitle = 'Mesajınız Yanıtlandı';
    headerSubtitle = 'Sorunuza yönetici tarafından yanıt verildi.';
  } else {
    headerTitle = 'Mesajınız Alındı';
    headerSubtitle = 'Mesajınızı aldık, en kısa sürede size geri dönüş yapacağız.';
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
      <!-- Header -->
      <div style="background-color: #4f46e5; padding: 30px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Fixral 3D</h1>
        <p style="color: #e0e7ff; margin: 5px 0 0; font-size: 14px;">${headerTitle}</p>
      </div>

      <!-- Main Content -->
      <div style="padding: 30px 25px;">
        <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
          ${headerSubtitle}
        </p>

        <!-- Message Card -->
        <div style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 25px;">
          
          ${messageData.orderId ? `
          <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
             <span style="display:block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">İlgili Sipariş</span>
             <a href="${process.env.NEXTAUTH_URL}/account" style="color: #4f46e5; font-weight: 600; text-decoration: none;">#${messageData.orderId.toString().slice(-6).toUpperCase()}</a>
          </div>` : ''}

          ${messageData.productName ? `
          <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
             <span style="display:block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">İlgili Ürün</span>
             ${messageData.productId ?
        `<a href="${process.env.NEXTAUTH_URL}/products/${messageData.productId}" style="color: #4f46e5; font-weight: 600; text-decoration: none;">${messageData.productName}</a>` :
        `<div style="color: #0f172a; font-weight: 600;">${messageData.productName}</div>`
      }
          </div>` : ''}

          <!-- Conversation History -->
          ${messageData.conversationHistory && messageData.conversationHistory.length > 0 ? `
             <div style="margin-bottom: 20px;">
                <span style="display:block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">Geçmiş Yazışmalar</span>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${messageData.conversationHistory.map(msg => `
                        <div style="display: flex; flex-direction: column; align-items: ${msg.sender === 'admin' ? 'flex-end' : 'flex-start'};">
                            <span style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
                                ${msg.sender === 'admin' ? 'Yönetici' : 'Siz'} • ${new Date(msg.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div style="
                                max-width: 85%;
                                padding: 10px 14px;
                                border-radius: 12px;
                                font-size: 14px;
                                line-height: 1.5;
                                ${msg.sender === 'admin'
          ? 'background-color: #e0e7ff; color: #3730a3; border-top-right-radius: 4px;'
          : 'background-color: #ffffff; border: 1px solid #e2e8f0; color: #334155; border-top-left-radius: 4px;'}
                            ">
                                ${msg.message}
                            </div>
                        </div>
                    `).join('')}
                </div>
             </div>
          ` : `
          <!-- Single Message Fallback (Original) -->
          <div style="margin-bottom: 15px;">
             <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">${isAdminNotification ? 'Kullanıcı Mesajı' : 'Mesajınız'}</span>
             <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 5px; color: #334155; line-height: 1.5; font-style: italic;">
               "${messageData.messageContent}"
             </div>
          </div>
          `}

          <!-- Admin Reply Section (if distinct and not in history) -->
          ${messageData.adminReply && (!messageData.conversationHistory || messageData.conversationHistory.length === 0) ? `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #cbd5e1;">
             <span style="font-size: 12px; font-weight: 700; color: #4f46e5; text-transform: uppercase;">Yönetici Yanıtı</span>
             <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #4f46e5; margin-top: 5px; color: #1e3a8a; line-height: 1.5;">
               ${messageData.adminReply}
             </div>
          </div>
          ` : ''}

          <div style="margin-top: 15px; text-align: right;">
            <span style="font-size: 11px; color: #94a3b8;">${date}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${isAdminNotification ? `${process.env.NEXTAUTH_URL}/admin/messages` : `${process.env.NEXTAUTH_URL}/account`}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            ${isAdminNotification ? 'Yönetici Paneline Git' : 'Hesabıma Git'}
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
        <p style="margin: 0;">&copy; Fixral 3D - Tüm Hakları Saklıdır.</p>
        <p style="margin: 5px 0 0;">Bu e-posta otomatik olarak oluşturulmuştur.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    html: htmlContent
  });
}
