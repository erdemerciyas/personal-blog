#!/usr/bin/env node

/**
 * Debug Mail System - Detaylı Gmail SMTP testi
 */

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function debugMailSystem() {
  log(colors.cyan, '\n🔧 Gmail SMTP Debug Testi\n');

  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  log(colors.blue, '📋 Konfigürasyon:');
  log(colors.white, '   Gmail User:', gmailUser);
  log(colors.white, '   Password Length:', gmailPassword?.length || 0);
  log(colors.white, '   Password Preview:', gmailPassword ? `${gmailPassword.substring(0, 4)}***${gmailPassword.slice(-4)}` : 'YOK');

  // Farklı SMTP ayarları ile test
  const configs = [
    {
      name: 'Gmail SMTP (587 - TLS)',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    },
    {
      name: 'Gmail SMTP (465 - SSL)',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    },
    {
      name: 'Gmail Service (Nodemailer)',
      config: {
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        }
      }
    }
  ];

  for (const testConfig of configs) {
    log(colors.yellow, `\n🧪 Testing: ${testConfig.name}`);
    
    try {
      const transporter = nodemailer.createTransport(testConfig.config);
      
      // Bağlantı testi
      const verified = await transporter.verify();
      if (verified) {
        log(colors.green, '✅ SMTP Bağlantı Başarılı!');
        
        // Test maili gönder
        try {
          const info = await transporter.sendMail({
            from: gmailUser,
            to: gmailUser,
            subject: '🎉 Test Mail Başarılı - ' + new Date().toLocaleTimeString(),
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #0369a1;">🎉 Mail Sistemi Çalışıyor!</h2>
                <p>Bu test maili <strong>${testConfig.name}</strong> konfigürasyonu ile gönderildi.</p>
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <h3>Test Detayları:</h3>
                  <ul>
                    <li>Gmail: ${gmailUser}</li>
                    <li>Konfigürasyon: ${testConfig.name}</li>
                    <li>Tarih: ${new Date().toLocaleString('tr-TR')}</li>
                  </ul>
                </div>
                <p style="color: #6b7280;">FIXRAL Mail System Debug Test</p>
              </div>
            `
          });
          
          log(colors.green, '✅ Test Maili Gönderildi!');
          log(colors.green, '📧 Message ID:', info.messageId);
          log(colors.cyan, '📬 Gmail hesabınızı kontrol edin!');
          
          return true; // Başarılı, diğer testleri atlayabiliriz
          
        } catch (sendError) {
          log(colors.red, '❌ Mail Gönderim Hatası:', sendError.message);
        }
      }
    } catch (error) {
      log(colors.red, '❌ SMTP Hatası:', error.message);
      
      // Detaylı hata analizi
      if (error.message.includes('Invalid login')) {
        log(colors.yellow, '💡 App Password problemi olabilir');
      }
      if (error.message.includes('timeout')) {
        log(colors.yellow, '💡 Network/Firewall problemi olabilir');
      }
      if (error.message.includes('ENOTFOUND')) {
        log(colors.yellow, '💡 DNS/İnternet bağlantısı problemi olabilir');
      }
    }
  }

  return false;
}

// Script çalıştırma
if (require.main === module) {
  debugMailSystem()
    .then((success) => {
      if (success) {
        log(colors.green, '\n🎉 Mail sistemi başarıyla çalışıyor!');
        process.exit(0);
      } else {
        log(colors.red, '\n❌ Tüm SMTP testleri başarısız!');
        log(colors.yellow, '\n💡 Çözüm önerileri:');
        log(colors.yellow, '   1. Yeni Gmail App Password oluşturun');
        log(colors.yellow, '   2. 2-Factor Authentication kontrol edin');
        log(colors.yellow, '   3. Gmail güvenlik ayarlarını kontrol edin');
        log(colors.yellow, '   4. VPN varsa kapatmayı deneyin');
        process.exit(1);
      }
    })
    .catch((error) => {
      log(colors.red, '\n💥 Beklenmeyen hata:', error.message);
      process.exit(1);
    });
}
