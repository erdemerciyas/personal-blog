#!/usr/bin/env node

/**
 * 🎨 Site Renkleri Güncelleme Script'i
 * 
 * Bu script veritabanındaki site renklerini yeni brand primary rengine günceller
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// SiteSettings Schema
const SiteSettingsSchema = new mongoose.Schema({
  logo: {
    url: { type: String, default: '' },
    alt: { type: String, default: 'Site Logo' },
    width: { type: Number, default: 200 },
    height: { type: Number, default: 60 }
  },
  siteName: { type: String, default: '' },
  slogan: { type: String, default: '' },
  description: { type: String, default: '' },
  colors: {
    primary: { type: String, default: '#003450' },
    secondary: { type: String, default: '#075985' },
    accent: { type: String, default: '#0369a1' }
  },
  socialMedia: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    keywords: { type: [String], default: [] }
  },
  contact: {
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

async function updateSiteColors() {
  try {
    log('🎨 Site Renkleri Güncelleme Script\'i Başlatılıyor...', 'bright');
    
    // MongoDB bağlantısı
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      logError('MONGODB_URI environment variable bulunamadı!');
      process.exit(1);
    }
    
    logInfo('MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(mongoUri);
    logSuccess('MongoDB bağlantısı başarılı');
    
    // Model oluştur
    const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
    
    // Mevcut ayarları bul
    logInfo('Mevcut site ayarları kontrol ediliyor...');
    let settings = await SiteSettings.findOne({ isActive: true });
    
    if (!settings) {
      logInfo('Site ayarları bulunamadı, yeni kayıt oluşturuluyor...');
      settings = new SiteSettings({
        siteName: 'Extreme',
        colors: {
          primary: '#B91C1C',   // brand red
          secondary: '#111827', // near-black
          accent: '#EF4444'     // lighter red accent
        },
        isActive: true
      });
    } else {
      logInfo('Mevcut site ayarları bulundu, renkler güncelleniyor...');
      
      // Eski renkleri göster
      log(`\\n📋 Eski Renkler:`, 'yellow');
      log(`   Primary: ${settings.colors?.primary || 'Tanımlı değil'}`, 'yellow');
      log(`   Secondary: ${settings.colors?.secondary || 'Tanımlı değil'}`, 'yellow');
      log(`   Accent: ${settings.colors?.accent || 'Tanımlı değil'}`, 'yellow');
      
      // Yeni renkleri uygula (Extreme brand)
      settings.colors = {
        primary: '#B91C1C',   // brand red
        secondary: '#111827', // near-black
        accent: '#EF4444'     // accent red
      };
    }
    
    // Kaydet
    await settings.save();
    
    // Yeni renkleri göster
    log(`\\n🎨 Yeni Renkler:`, 'green');
    log(`   Primary: ${settings.colors.primary}`, 'green');
    log(`   Secondary: ${settings.colors.secondary}`, 'green');
    log(`   Accent: ${settings.colors.accent}`, 'green');
    
    logSuccess('Site renkleri başarıyla güncellendi!');
    
    // Doğrulama
    const updatedSettings = await SiteSettings.findOne({ isActive: true });
    if (updatedSettings.colors.primary === '#B91C1C') {
      logSuccess('Doğrulama başarılı - Renkler veritabanında güncellendi');
    } else {
      logError('Doğrulama başarısız - Renkler güncellenemedi');
    }
    
  } catch (error) {
    logError(`Hata oluştu: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logInfo('MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
if (require.main === module) {
  updateSiteColors();
}

module.exports = { updateSiteColors };