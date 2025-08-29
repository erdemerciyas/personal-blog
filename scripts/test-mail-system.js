#!/usr/bin/env node

/**
 * Mail System Test Script
 * Tests Gmail SMTP configuration and mail sending functionality
 */

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function testMailSystem() {
  log(colors.cyan, '\n🔧 Mail Sistem Testi Başlıyor...\n');

  // 1. Environment Variables Kontrolü
  log(colors.blue, '1️⃣ Environment Variables Kontrolü');
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser) {
    log(colors.red, '❌ GMAIL_USER environment variable tanımlı değil');
    log(colors.yellow, '💡 Çözüm: .env.local dosyasına GMAIL_USER=your-gmail@gmail.com ekleyin');
    return false;
  } else {
    log(colors.green, '✅ GMAIL_USER:', gmailUser);
  }

  if (!gmailPassword) {
    log(colors.red, '❌ GMAIL_APP_PASSWORD environment variable tanımlı değil');
    log(colors.yellow, '💡 Çözüm: Gmail App Password oluşturup .env.local dosyasına ekleyin');
    log(colors.yellow, '   📚 Rehber: https://support.google.com/accounts/answer/185833');
    return false;
  } else {
    log(colors.green, '✅ GMAIL_APP_PASSWORD: ***' + gmailPassword.slice(-4));
  }

  // 2. SMTP Bağlantı Testi
  log(colors.blue, '\n2️⃣ Gmail SMTP Bağlantı Testi');
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    // Bağlantıyı test et
    await transporter.verify();
    log(colors.green, '✅ Gmail SMTP bağlantısı başarılı');
  } catch (error) {
    log(colors.red, '❌ Gmail SMTP bağlantı hatası:', error.message);
    
    if (error.message.includes('Invalid login')) {
      log(colors.yellow, '💡 Çözüm önerileri:');
      log(colors.yellow, '   • Gmail hesabında 2-Factor Authentication aktif mi?');
      log(colors.yellow, '   • App Password doğru mu?');
      log(colors.yellow, '   • Gmail hesabı aktif mi?');
    }
    
    return false;
  }

  // 3. Test Mail Gönderimi
  log(colors.blue, '\n3️⃣ Test Mail Gönderimi');
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    const testMailOptions = {
      from: gmailUser,
      to: gmailUser, // Kendine mail gönder
      subject: '✅ Mail Sistemi Test - Başarılı!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0f766e, #0891b2); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; text-align: center;">
              🎉 Mail Sistemi Çalışıyor!
            </h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Tebrikler! Mail sisteminiz başarıyla çalışıyor.
            </p>
            
            <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #065f46; margin: 0 0 10px 0;">Test Detayları:</h3>
              <ul style="color: #047857; margin: 0; padding-left: 20px;">
                <li>Gmail SMTP: ✅ Aktif</li>
                <li>Nodemailer: ✅ Çalışıyor</li>
                <li>Mail Gönderimi: ✅ Başarılı</li>
                <li>Test Tarihi: ${new Date().toLocaleString('tr-TR')}</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              Bu mail otomatik test scripti tarafından gönderilmiştir.<br>
              <strong>FIXRAL Mail System Test</strong>
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(testMailOptions);
    log(colors.green, '✅ Test maili başarıyla gönderildi!');
    log(colors.green, '📧 Message ID:', info.messageId);
    log(colors.cyan, '📬 Gmail hesabınızı kontrol edin.');
    
  } catch (error) {
    log(colors.red, '❌ Test mail gönderim hatası:', error.message);
    return false;
  }

  // 4. Sonuç
  log(colors.green, '\n🎉 TÜM TESTLER BAŞARILI!');
  log(colors.cyan, '💡 Artık iletişim formları mail gönderebilir.');
  
  return true;
}

// Script çalıştırma
if (require.main === module) {
  testMailSystem()
    .then((success) => {
      if (success) {
        log(colors.green, '\n✅ Mail sistemi hazır!');
        process.exit(0);
      } else {
        log(colors.red, '\n❌ Mail sistemi konfigürasyonu gerekli!');
        process.exit(1);
      }
    })
    .catch((error) => {
      log(colors.red, '\n💥 Beklenmeyen hata:', error.message);
      process.exit(1);
    });
}

module.exports = { testMailSystem };
