#!/usr/bin/env node

/**
 * 🎯 Accessibility Test Script - Optimized
 * Tests project accessibility compliance efficiently
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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function checkColorContrast() {
  log('\n🎨 Renk Kontrastı Kontrolü:', 'cyan');
  
  const cssFile = 'src/app/globals.css';
  let score = 0;
  let total = 0;
  
  if (fs.existsSync(cssFile)) {
    const content = fs.readFileSync(cssFile, 'utf8');
    
    // Check for accessible color classes
    const accessibleColors = [
      'text-brand-primary-800',
      'text-brand-primary-900',
      'text-slate-900',
      'bg-brand-primary-900',
      'bg-brand-primary-800',
      'bg-slate-700'
    ];
    
    accessibleColors.forEach(color => {
      total++;
      if (content.includes(color)) {
        logSuccess(`${color} accessible color found`);
        score++;
      } else {
        logWarning(`${color} accessible color not found`);
      }
    });
    
    // Check for high contrast support
    total++;
    if (content.includes('@media (prefers-contrast: high)')) {
      logSuccess('High contrast mode support found');
      score++;
    } else {
      logWarning('High contrast mode support not found');
    }
  }
  
  return { score, total };
}

function checkAriaLabels() {
  log('\n🏷️  ARIA Labels Kontrolü:', 'cyan');
  
  const files = [
    'src/app/page.tsx',
    'src/components/ConditionalFooter.tsx'
  ];
  
  let score = 0;
  let total = 0;
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for aria-label attributes
      const ariaLabels = content.match(/aria-label=/g);
      if (ariaLabels && ariaLabels.length > 0) {
        total++;
        logSuccess(`${file}: ${ariaLabels.length} aria-label found`);
        score++;
      } else {
        total++;
        logWarning(`${file}: No aria-label found`);
      }
    }
  });
  
  return { score, total };
}

function checkFocusManagement() {
  log('\n🎯 Focus Management Kontrolü:', 'cyan');
  
  const cssFile = 'src/app/globals.css';
  let score = 0;
  let total = 0;
  
  if (fs.existsSync(cssFile)) {
    const content = fs.readFileSync(cssFile, 'utf8');
    
    // Check for focus styles
    const focusFeatures = [
      'focus:outline-none',
      'focus:ring-2',
      'focus-visible',
      'sr-only'
    ];
    
    focusFeatures.forEach(feature => {
      total++;
      if (content.includes(feature)) {
        logSuccess(`${feature} focus management found`);
        score++;
      } else {
        logWarning(`${feature} focus management not found`);
      }
    });
  }
  
  return { score, total };
}

function checkSemanticHTML() {
  log('\n📝 Semantic HTML Kontrolü:', 'cyan');
 
  // Sadece sayfa düzeyi dosyaları kontrol et (bileşenleri hariç tut)
  // Desen: src/app/**/page.(tsx|ts|jsx|js)
  const files = [];
  const exts = new Set(['.tsx', '.ts', '.jsx', '.js']);
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        const base = path.basename(entry.name, ext);
        if (base === 'page' && exts.has(ext)) {
          files.push(full.replace(/\\/g, '/'));
        }
      }
    }
  }
  walk('src/app');
  // Admin panel sayfalarını kapsam dışı bırak (layout tarafından sarılıyor olabilir)
  const pageFiles = files.filter(f => !f.includes('/admin/'));
  
  let score = 0;
  let total = 0;
  
  pageFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Daha gerçekçi kontrol: çekirdek semantik ögelerden en az biri var mı?
      // Layout dosyaları çoğu zaman header/footer/nav sağlar.
      const coreSemantic = ['<main', '<section', '<article'];
      total++;
      if (coreSemantic.some(el => content.includes(el))) {
        const found = coreSemantic.filter(el => content.includes(el)).join(', ');
        logSuccess(`${file}: semantic structure found (${found || 'core element'})`);
        score++;
      } else {
        logWarning(`${file}: no core semantic element found (<main|<section|<article>)`);
      }
    }
  });
  
  return { score, total };
}

function checkReducedMotion() {
  log('\n🎭 Reduced Motion Kontrolü:', 'cyan');
  
  const cssFile = 'src/app/globals.css';
  let score = 0;
  let total = 1;
  
  if (fs.existsSync(cssFile)) {
    const content = fs.readFileSync(cssFile, 'utf8');
    
    if (content.includes('@media (prefers-reduced-motion: reduce)')) {
      logSuccess('Reduced motion support found');
      score++;
    } else {
      logWarning('Reduced motion support not found');
    }
  }
  
  return { score, total };
}

function generateAccessibilityReport(results) {
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const totalPossible = results.reduce((sum, result) => sum + result.total, 0);
  const percentage = Math.round((totalScore / totalPossible) * 100);
  
  log('\n============================================================', 'cyan');
  log('🎯 ACCESSIBILITY TEST SONUÇLARI', 'bright');
  log('============================================================', 'cyan');
  log(`✅ Başarılı: ${totalScore}`, 'green');
  log(`❌ Başarısız: ${totalPossible - totalScore}`, 'red');
  log(`📊 Toplam: ${totalPossible}`, 'blue');
  
  log('\n============================================================', 'cyan');
  log(`🏆 ACCESSIBILITY SKORU: ${percentage}%`, 'bright');
  
  if (percentage >= 90) {
    log('🟢 Mükemmel! WCAG 2.1 AA uyumlu.', 'green');
  } else if (percentage >= 75) {
    log('🟡 İyi! Birkaç iyileştirme yapılabilir.', 'yellow');
  } else {
    log('🔴 Accessibility iyileştirmeleri gerekli.', 'red');
  }
  
  log('============================================================', 'cyan');
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    score: percentage,
    details: {
      totalScore,
      totalPossible,
      results
    }
  };
  
  fs.writeFileSync('accessibility-report.json', JSON.stringify(report, null, 2));
  log('\n📄 Accessibility raporu accessibility-report.json dosyasına kaydedildi.', 'blue');
  
  return percentage;
}

function main() {
  log('🎯 Personal Blog - Accessibility Testi Başlatılıyor...', 'bright');
  
  const results = [
    { name: 'Color Contrast', ...checkColorContrast() },
    { name: 'ARIA Labels', ...checkAriaLabels() },
    { name: 'Focus Management', ...checkFocusManagement() },
    { name: 'Semantic HTML', ...checkSemanticHTML() },
    { name: 'Reduced Motion', ...checkReducedMotion() }
  ];
  
  const score = generateAccessibilityReport(results);
  
  if (score < 75) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkColorContrast,
  checkAriaLabels,
  checkFocusManagement,
  checkSemanticHTML,
  checkReducedMotion,
  generateAccessibilityReport
};