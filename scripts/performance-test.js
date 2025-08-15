#!/usr/bin/env node

/**
 * 🚀 Performance Test Script - Optimized
 * Tests site performance metrics efficiently
 */

const fs = require('fs');
const path = require('path');

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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function runPerformanceTest() {
  try {
    log('🚀 Performance Test Başlatılıyor...', 'bright');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: [],
      score: 0,
      recommendations: []
    };

    // 1. CSS Optimizasyonları Kontrolü
    logInfo('CSS optimizasyonları kontrol ediliyor...');
    const cssFile = path.join(process.cwd(), 'src/app/globals.css');
    
    if (fs.existsSync(cssFile)) {
      const cssContent = fs.readFileSync(cssFile, 'utf8');
      
      // Transform utilities kontrolü
      const hasTransformUtilities = cssContent.includes('transform-gpu');
      const hasWillChange = cssContent.includes('will-change');
      const hasBackfaceVisibility = cssContent.includes('backface-visibility');
      
      if (hasTransformUtilities && hasWillChange && hasBackfaceVisibility) {
        logSuccess('CSS transform optimizasyonları mevcut');
        results.tests.push({ name: 'CSS Transform Optimizations', status: 'pass', score: 15 });
      } else {
        logWarning('CSS transform optimizasyonları eksik');
        results.tests.push({ name: 'CSS Transform Optimizations', status: 'warning', score: 8 });
        results.recommendations.push('CSS transform utilities ekleyin');
      }
      
      // Animation optimizasyonları
      const hasReducedMotion = cssContent.includes('@media (prefers-reduced-motion');
      if (hasReducedMotion) {
        logSuccess('Reduced motion desteği mevcut');
        results.tests.push({ name: 'Reduced Motion Support', status: 'pass', score: 10 });
      } else {
        logWarning('Reduced motion desteği eksik');
        results.tests.push({ name: 'Reduced Motion Support', status: 'fail', score: 0 });
        results.recommendations.push('Reduced motion media query ekleyin');
      }
      
      // Brand colors kontrolü
      const hasBrandColors = cssContent.includes('--brand-primary');
      if (hasBrandColors) {
        logSuccess('Brand color system mevcut');
        results.tests.push({ name: 'Brand Color System', status: 'pass', score: 10 });
      } else {
        logWarning('Brand color system eksik');
        results.tests.push({ name: 'Brand Color System', status: 'fail', score: 0 });
        results.recommendations.push('CSS custom properties ile brand color system ekleyin');
      }
    }

    // 2. Component Optimizasyonları
    logInfo('Component optimizasyonları kontrol ediliyor...');
    
    // Skeleton loader kontrolü
    const skeletonFile = path.join(process.cwd(), 'src/components/ContentSkeleton.tsx');
    if (fs.existsSync(skeletonFile)) {
      logSuccess('Skeleton loader component mevcut');
      results.tests.push({ name: 'Skeleton Loading', status: 'pass', score: 15 });
    } else {
      logWarning('Skeleton loader component eksik');
      results.tests.push({ name: 'Skeleton Loading', status: 'fail', score: 0 });
      results.recommendations.push('Skeleton loading component ekleyin');
    }
    
    // HOC kontrolü
    const hocFile = path.join(process.cwd(), 'src/components/withSkeleton.tsx');
    if (fs.existsSync(hocFile)) {
      logSuccess('HOC pattern mevcut');
      results.tests.push({ name: 'HOC Pattern', status: 'pass', score: 10 });
    } else {
      logWarning('HOC pattern eksik');
      results.tests.push({ name: 'HOC Pattern', status: 'fail', score: 0 });
      results.recommendations.push('Higher-Order Component pattern ekleyin');
    }

    // 3. Image Optimizasyonları
    logInfo('Image optimizasyonları kontrol ediliyor...');
    
    const pageFile = path.join(process.cwd(), 'src/app/page.tsx');
    if (fs.existsSync(pageFile)) {
      const pageContent = fs.readFileSync(pageFile, 'utf8');
      
      // Next.js Image component kullanımı
      const usesNextImage = pageContent.includes('from \'next/image\'');
      if (usesNextImage) {
        logSuccess('Next.js Image component kullanılıyor');
        results.tests.push({ name: 'Next.js Image Optimization', status: 'pass', score: 15 });
      } else {
        logWarning('Next.js Image component kullanılmıyor');
        results.tests.push({ name: 'Next.js Image Optimization', status: 'fail', score: 0 });
        results.recommendations.push('Next.js Image component kullanın');
      }
      
      // Priority loading
      const hasPriorityLoading = pageContent.includes('priority');
      if (hasPriorityLoading) {
        logSuccess('Priority image loading mevcut');
        results.tests.push({ name: 'Priority Image Loading', status: 'pass', score: 10 });
      } else {
        logWarning('Priority image loading eksik');
        results.tests.push({ name: 'Priority Image Loading', status: 'warning', score: 5 });
        results.recommendations.push('Kritik görsellere priority prop ekleyin');
      }
    }

    // 4. Bundle Analizi
    logInfo('Bundle optimizasyonları kontrol ediliyor...');
    
    const packageFile = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageFile)) {
      const packageContent = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
      
      // Dynamic imports kontrolü
      let hasDynamicImports = false;
      if (pageFile && fs.existsSync(pageFile)) {
        const pageContent = fs.readFileSync(pageFile, 'utf8');
        hasDynamicImports = pageContent.includes('dynamic(');
      }

      // Eğer page.tsx içinde bulunamadıysa tüm src dizininde ara (hızlı tarama)
      if (!hasDynamicImports) {
        const srcDir = path.join(process.cwd(), 'src');
        const stack = [srcDir];
        while (stack.length && !hasDynamicImports) {
          const dir = stack.pop();
          if (!dir || !fs.existsSync(dir)) continue;
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              // node_modules ve .next klasörlerini atla (her ihtimale karşı)
              if (!/node_modules|\.next/.test(full)) stack.push(full);
            } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
              try {
                const content = fs.readFileSync(full, 'utf8');
                if (content.includes('dynamic(')) { hasDynamicImports = true; break; }
              } catch (_) { /* ignore */ }
            }
          }
        }
      }

      if (hasDynamicImports) {
        logSuccess('Dynamic imports kullanılıyor');
        results.tests.push({ name: 'Dynamic Imports', status: 'pass', score: 15 });
      } else {
        logWarning('Dynamic imports kullanılmıyor');
        results.tests.push({ name: 'Dynamic Imports', status: 'warning', score: 8 });
        results.recommendations.push('Büyük componentler için dynamic import kullanın');
      }
    }

    // 5. Accessibility Skoru
    logInfo('Accessibility skoru kontrol ediliyor...');
    
    const accessibilityFile = path.join(process.cwd(), 'accessibility-report.json');
    if (fs.existsSync(accessibilityFile)) {
      try {
        const accessibilityData = JSON.parse(fs.readFileSync(accessibilityFile, 'utf8'));
        const accessibilityScore = accessibilityData.score || 0;
        
        if (accessibilityScore >= 90) {
          logSuccess(`Accessibility skoru: ${accessibilityScore}%`);
          results.tests.push({ name: 'Accessibility Score', status: 'pass', score: 20 });
        } else if (accessibilityScore >= 75) {
          logWarning(`Accessibility skoru: ${accessibilityScore}%`);
          results.tests.push({ name: 'Accessibility Score', status: 'warning', score: 15 });
        } else {
          logError(`Accessibility skoru: ${accessibilityScore}%`);
          results.tests.push({ name: 'Accessibility Score', status: 'fail', score: 5 });
          results.recommendations.push('Accessibility iyileştirmeleri yapın');
        }
      } catch (error) {
        logWarning('Accessibility raporu okunamadı');
        results.tests.push({ name: 'Accessibility Score', status: 'warning', score: 10 });
      }
    } else {
      logWarning('Accessibility raporu bulunamadı');
      results.tests.push({ name: 'Accessibility Score', status: 'warning', score: 10 });
      results.recommendations.push('Accessibility test çalıştırın');
    }

    // Toplam skor hesapla
    results.score = results.tests.reduce((total, test) => total + test.score, 0);
    const maxScore = results.tests.length * 15; // Ortalama max skor
    const percentage = Math.round((results.score / maxScore) * 100);

    // Sonuçları göster
    log('\\n============================================================', 'cyan');
    log('🚀 PERFORMANCE TEST SONUÇLARI', 'bright');
    log('============================================================', 'cyan');
    
    results.tests.forEach(test => {
      const icon = test.status === 'pass' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
      log(`${icon} ${test.name}: ${test.score} puan`);
    });
    
    log('\\n============================================================', 'cyan');
    log(`🏆 TOPLAM SKOR: ${results.score}/${maxScore} (${percentage}%)`, 'bright');
    
    if (percentage >= 90) {
      log('🟢 Mükemmel! Performans optimizasyonları harika.', 'green');
    } else if (percentage >= 75) {
      log('🟡 İyi! Birkaç iyileştirme yapılabilir.', 'yellow');
    } else {
      log('🔴 Performans iyileştirmeleri gerekli.', 'red');
    }
    
    log('============================================================', 'cyan');
    
    // Öneriler
    if (results.recommendations.length > 0) {
      log('\\n📋 ÖNERİLER:', 'yellow');
      results.recommendations.forEach((rec, index) => {
        log(`${index + 1}. ${rec}`, 'yellow');
      });
    }

    // Raporu kaydet
    fs.writeFileSync('performance-report.json', JSON.stringify(results, null, 2));
    logInfo('Performance raporu performance-report.json dosyasına kaydedildi.');
    
  } catch (error) {
    logError(`Hata oluştu: ${error.message}`);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  runPerformanceTest();
}

module.exports = { runPerformanceTest };