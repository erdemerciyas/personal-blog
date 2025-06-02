# 🔐 Vercel Environment Variables Rehberi

## 📋 **ZORUNLU ENVIRONMENT VARIABLES**

Vercel dashboard'da aşağıdaki environment variables'ları eklemen gerekiyor:

### **🔑 TEMEL AYARLAR**
```
NODE_ENV=production
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here-32-characters-minimum
```

### **💾 DATABASE**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### **☁️ CLOUDINARY (Görsel yönetimi için)**
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### **📧 EMAIL AYARLARI (Opsiyonel)**
```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### **🤖 OPENAI (Opsiyonel)**
```
OPENAI_API_KEY=sk-your-openai-api-key
```

## 🎯 **VERCEL'DE ENVIRONMENT VARIABLES EKLEME**

1. **Vercel Dashboard'da projenizi seçin**
2. **Settings** sekmesine gidin
3. **Environment Variables** tıklayın
4. **Her bir variable'ı tek tek ekleyin:**
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://...`
   - Environment: `Production, Preview, Development` (hepsini seç)

## 🔄 **SONRA YAPILACAKLAR**

1. ✅ Variables eklendikten sonra **Redeploy**
2. ✅ Site URL'ini not alın
3. ✅ `NEXTAUTH_URL`'i gerçek URL ile güncelleyin
4. ✅ Tekrar redeploy

## 🚨 **ÖNEMLİ NOTLAR**

- **NEXTAUTH_SECRET**: En az 32 karakter olmalı
- **MONGODB_URI**: Atlas connection string olmalı
- **NEXTAUTH_URL**: Vercel'den aldığın gerçek URL olmalı

## 🔐 **GÜVENLİK**

- Environment variables'ları asla GitHub'a commit etme
- Production'da güçlü secret'lar kullan
- Database'de IP whitelist ayarla 