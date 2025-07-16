#!/usr/bin/env node

/**
 * Vercel Build Fix Script
 * Vercel deployment için optimize edilmiş build script
 */

console.log('🔧 Vercel build başlatılıyor...');

// Environment variables kontrolü
const requiredEnvs = ['NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'MONGODB_URI'];
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

if (missingEnvs.length > 0) {
  console.warn('⚠️ Eksik environment variables:', missingEnvs.join(', '));
  console.warn('⚠️ Build devam ediyor ama runtime hatalar olabilir...');
}

// Next.js build
console.log('🚀 Next.js build başlatılıyor...');
try {
  require('child_process').execSync('next build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production',
      SKIP_ENV_VALIDATION: 'true'
    }
  });
  console.log('✅ Build başarılı!');
} catch (error) {
  console.error('❌ Build hatası:', error.message);
  process.exit(1);
}

console.log('🎉 Vercel build tamamlandı!');