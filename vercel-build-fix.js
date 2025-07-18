#!/usr/bin/env node

/**
 * Vercel Build Fix Script
 * Vercel deployment için optimize edilmiş build script
 */

console.log('🔧 Vercel build başlatılıyor...');

// Vercel environment variables ayarla
process.env.NODE_ENV = 'production';
process.env.VERCEL = '1';
process.env.SKIP_ENV_VALIDATION = 'true';
process.env.CI = 'true';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Environment variables kontrolü
const requiredEnvs = ['NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
const recommendedEnvs = ['MONGODB_URI', 'CLOUDINARY_CLOUD_NAME'];

const missingRequired = requiredEnvs.filter(env => !process.env[env]);
const missingRecommended = recommendedEnvs.filter(env => !process.env[env]);

if (missingRequired.length > 0) {
  console.warn('⚠️ Eksik gerekli environment variables:', missingRequired.join(', '));
  console.warn('⚠️ Build devam ediyor ama runtime hatalar olabilir...');
}

if (missingRecommended.length > 0) {
  console.log('ℹ️ Eksik önerilen environment variables:', missingRecommended.join(', '));
  console.log('ℹ️ Bazı özellikler çalışmayabilir...');
}

// Memory ve performance optimizasyonları
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Next.js build
console.log('🚀 Next.js build başlatılıyor...');
console.log('📦 Node.js version:', process.version);
console.log('💾 Memory limit: 4GB');

try {
  const { execSync } = require('child_process');
  
  // Build komutu
  execSync('next build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production',
      VERCEL: '1',
      SKIP_ENV_VALIDATION: 'true',
      CI: 'true',
      NEXT_TELEMETRY_DISABLED: '1'
    },
    maxBuffer: 1024 * 1024 * 10 // 10MB buffer
  });
  
  console.log('✅ Build başarılı!');
  console.log('📊 Build istatistikleri kontrol ediliyor...');
  
  // Build sonrası kontroller
  const fs = require('fs');
  const path = require('path');
  
  const buildDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(buildDir)) {
    console.log('✅ .next klasörü oluşturuldu');
    
    const staticDir = path.join(buildDir, 'static');
    if (fs.existsSync(staticDir)) {
      console.log('✅ Static dosyalar hazır');
    }
    
    const serverDir = path.join(buildDir, 'server');
    if (fs.existsSync(serverDir)) {
      console.log('✅ Server dosyları hazır');
    }
  }
  
} catch (error) {
  console.error('❌ Build hatası:', error.message);
  
  // Detaylı hata bilgisi
  if (error.stdout) {
    console.error('📤 STDOUT:', error.stdout.toString());
  }
  if (error.stderr) {
    console.error('📥 STDERR:', error.stderr.toString());
  }
  
  process.exit(1);
}

console.log('🎉 Vercel build tamamlandı!');