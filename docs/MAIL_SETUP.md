# 📧 Mail Sistemi Kurulum Rehberi

## 🚨 Sorun Özeti

İletişim formları ve proje başvuru formları mail göndermiyor. Bunun sebebi **Gmail SMTP konfigürasyonunun** eksik olmasıdır.

## 🔧 Çözüm Adımları

### 1. Gmail App Password Oluşturma

#### Adım 1.1: 2-Factor Authentication Aktif Etme
1. [Gmail Security Settings](https://myaccount.google.com/security) sayfasına gidin
2. "2-Step Verification" bölümünü bulun
3. 2-Factor Authentication'ı aktif edin (SMS, Authenticator App, vb.)

#### Adım 1.2: App Password Oluşturma
1. 2FA aktif olduktan sonra [App Passwords](https://myaccount.google.com/apppasswords) sayfasına gidin
2. "Select app" dropdown'ından **"Other (Custom name)"** seçin
3. İsim olarak **"Personal Blog SMTP"** yazın
4. **"Generate"** butonuna tıklayın
5. Oluşturulan **16 karakterlik şifreyi** kopyalayın (örn: `abcd efgh ijkl mnop`)

### 2. Environment Variables Ekleme

#### Geliştirme Ortamı (.env.local)
```env
# Gmail SMTP Configuration
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

#### Production Ortamı (Vercel)
1. [Vercel Dashboard](https://vercel.com/dashboard) → Projeniz → Settings → Environment Variables
2. Aşağıdaki değişkenleri ekleyin:

| Name | Value | Environment |
|------|-------|-------------|
| `GMAIL_USER` | your-gmail@gmail.com | Production |
| `GMAIL_APP_PASSWORD` | abcdefghijklmnop | Production |

### 3. Mail Sistemi Test Etme

#### Lokal Test
```bash
# Mail sistem testini çalıştır
npm run test:mail
```

Bu script:
- ✅ Environment variables kontrolü
- ✅ Gmail SMTP bağlantı testi
- ✅ Test mail gönderimi
- ✅ Detaylı hata raporlama

#### Manuel Test
1. Uygulamayı başlatın: `npm run dev`
2. İletişim formunu doldurun: `http://localhost:3000/contact`
3. Mail gönderimi test edin

### 4. Admin Panel Mail Durumu

Admin panelinde mail sistem durumunu kontrol edebilirsiniz:
- **URL**: `/admin/monitoring` 
- **Widget**: Mail System Status
- **Özellikler**:
  - ✅ Real-time durum kontrolü
  - ✅ SMTP bağlantı testi
  - ✅ Hata detayları
  - ✅ Son kontrol zamanı

## 🔍 Sorun Giderme

### Hata: "Invalid login"
**Sebep**: App password yanlış veya 2FA aktif değil
**Çözüm**:
- 2-Factor Authentication kontrol edin
- Yeni App Password oluşturun
- Environment variables'ları güncelleyin

### Hata: "SMTP connection timeout"
**Sebep**: Network/firewall sorunu
**Çözüm**:
- İnternet bağlantınızı kontrol edin
- Firewall ayarlarını kontrol edin
- VPN kullanıyorsanız kapatmayı deneyin

### Hata: "Authentication failed"
**Sebep**: Gmail hesabı güvenlik ayarları
**Çözüm**:
- Gmail hesabının aktif olduğunu kontrol edin
- "Less secure app access" kapalı olmalı (App Password kullanırken)
- Gmail hesabında şüpheli aktivite uyarısı var mı kontrol edin

### Mail Gönderiliyor Ama Ulaşmıyor
**Sebep**: Spam filtresi
**Çözüm**:
- Spam klasörünü kontrol edin
- Gmail'de "Filters and Blocked Addresses" ayarlarını kontrol edin
- Test mailini kendinize göndererek kontrol edin

## 📊 Mail Sistem Monitoring

### API Endpoints
- **Mail Status**: `GET /api/admin/mail-status`
- **Test Mail**: `POST /api/contact` (form submission)

### Log Kontrolü
```bash
# Geliştirme ortamında console logları kontrol edin
npm run dev

# Production'da Vercel logs kontrol edin
vercel logs
```

### Performans Metrikleri
- Mail gönderim süresi: ~2-5 saniye
- SMTP bağlantı süresi: ~1-3 saniye
- Rate limit: 3 mail/saat (contact form)

## 🚀 Production Deployment

### Vercel Environment Variables
```bash
# Vercel CLI ile ekleme
vercel env add GMAIL_USER
vercel env add GMAIL_APP_PASSWORD

# Sonra redeploy
vercel --prod
```

### Deployment Checklist
- [ ] Gmail App Password oluşturuldu
- [ ] Environment variables eklendi (dev + prod)
- [ ] Mail test scripti çalıştırıldı
- [ ] İletişim formu test edildi
- [ ] Admin panel mail durumu kontrol edildi
- [ ] Production deployment yapıldı
- [ ] Production'da mail testi yapıldı

## 🔒 Güvenlik Notları

### App Password Güvenliği
- ✅ App Password'u kimseyle paylaşmayın
- ✅ Environment variables'da saklanmalı
- ✅ Version control'e (Git) eklenmemeli
- ✅ Düzenli olarak yenilenmeli (6 ayda bir)

### SMTP Güvenlik
- ✅ TLS/SSL şifrelemesi aktif
- ✅ Gmail SMTP güvenli (OAuth 2.0 destekli)
- ✅ Rate limiting aktif
- ✅ Input validation yapılıyor

## 📞 Destek

### Hızlı Yardım
1. **Test Script Çalıştır**: `npm run test:mail`
2. **Admin Panel Kontrol**: `/admin/monitoring`
3. **Logs Kontrol**: Console/Vercel logs
4. **Gmail Settings**: [Security Settings](https://myaccount.google.com/security)

### Yaygın Problemler
| Problem | Çözüm | Süre |
|---------|-------|------|
| Environment variables eksik | .env.local dosyasına ekle | 2 dk |
| App password yanlış | Yeni oluştur | 5 dk |
| 2FA aktif değil | Gmail'de aktif et | 3 dk |
| SMTP bağlantı hatası | Network/firewall kontrol | 10 dk |
| Mail spam'e düşüyor | Spam ayarları kontrol | 5 dk |

---

**✅ Bu rehberi takip ettikten sonra mail sisteminiz tam olarak çalışacaktır!**
