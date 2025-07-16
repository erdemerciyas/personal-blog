# 🔑 Vercel Environment Variables Kurulumu

## ⚠️ SORUN: Environment Variables Vercel'de Tanımlanmamış

Vercel deployment sonrası console hataları environment variables bulunamadığı için oluşuyor.

## 🚀 **ÇÖZÜM: Vercel Dashboard'da Environment Variables Ekle**

### **1. Vercel Dashboard'a Git:**
- https://vercel.com/dashboard
- Proje: `erdemerciyas-gqxa2oahk-erdem-erciyas-projects`
- **Settings** → **Environment Variables**

### **2. Bu Değişkenleri Tek Tek Ekle:**

```bash
# NextAuth Configuration
NODE_ENV=production
NEXTAUTH_URL=https://erdemerciyas-gqxa2oahk-erdem-erciyas-projects.vercel.app
NEXTAUTH_SECRET=[your_nextauth_secret_here]

# Database
MONGODB_URI=[your_mongodb_connection_string_here]

# Cloudinary
CLOUDINARY_CLOUD_NAME=[your_cloudinary_cloud_name]
CLOUDINARY_API_KEY=[your_cloudinary_api_key]
CLOUDINARY_API_SECRET=[your_cloudinary_api_secret]

# OpenAI (Opsiyonel)
OPENAI_API_KEY=[your_openai_api_key_here]

# App Settings
APP_NAME=Personal Blog
APP_URL=https://erdemerciyas-gqxa2oahk-erdem-erciyas-projects.vercel.app
RATE_LIMIT_MAX=50
RATE_LIMIT_WINDOW=900000
BYPASS_RATE_LIMIT=false
NEXT_PUBLIC_SHOW_SKELETON=false
```

### **3. Environment Variables Ekleme Adımları:**

1. **Add New** butonuna tıkla
2. **Name** alanına değişken adını yaz (örn: `NODE_ENV`)
3. **Value** alanına değeri yaz (örn: `production`)
4. **Environment** olarak **Production**, **Preview**, **Development** seç
5. **Save** butonuna tıkla
6. Her değişken için tekrarla

### **4. Gerçek Değerler:**

- **NEXTAUTH_SECRET**: Güçlü bir secret key (32+ karakter)
- **MONGODB_URI**: MongoDB Atlas connection string
- **CLOUDINARY_***: Cloudinary hesap bilgileri
- **OPENAI_API_KEY**: OpenAI API key (opsiyonel)

### **5. Environment Variables Eklendikten Sonra:**

1. **Deployments** sekmesine git
2. Son deployment'ın yanındaki **⋯** menüsüne tıkla
3. **Redeploy** seç
4. **Use existing Build Cache** işaretini kaldır
5. **Redeploy** butonuna tıkla

## ✅ **Test Edilmesi Gerekenler:**

Redeploy tamamlandıktan sonra:
- Console hatalarının kaybolması
- `/admin/login` sayfasının çalışması
- Database bağlantısının aktif olması
- API endpoints'lerin response vermesi

## 🔍 **Console Hatalarını Kontrol Et:**

Browser'da F12 → Console:
- Environment variable hataları kaybolmalı
- NextAuth hataları düzelmeli
- MongoDB connection hataları çözülmeli

**🎯 Bu adımları tamamladıktan sonra site tamamen çalışır hale gelecek!**