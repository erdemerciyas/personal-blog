// Console hatalarını debug etmek için script
// Bu script'i browser console'da çalıştırarak hataları tespit edebilirsiniz

console.log('🔍 Console Hata Debug Başlatılıyor...');

// 1. CSP Hatalarını Kontrol Et
const checkCSPErrors = () => {
  console.log('📋 CSP Kontrol Ediliyor...');
  
  // Vercel live feedback script'ini test et
  const testScript = document.createElement('script');
  testScript.src = 'https://vercel.live/_next-live/feedback/feedback.js';
  testScript.onload = () => console.log('✅ Vercel feedback script yüklendi');
  testScript.onerror = (e) => console.error('❌ Vercel feedback script hatası:', e);
  document.head.appendChild(testScript);
};

// 2. API Endpoint'lerini Test Et
const testAPIEndpoints = async () => {
  console.log('🔌 API Endpoint'leri Test Ediliyor...');
  
  const endpoints = [
    '/api/health',
    '/api/admin/dashboard-stats',
    '/api/settings',
    '/api/portfolio',
    '/api/messages'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        console.log(`✅ ${endpoint}: OK (${response.status})`);
      } else {
        console.error(`❌ ${endpoint}: Error (${response.status})`);
      }
    } catch (error) {
      console.error(`❌ ${endpoint}: Network Error`, error);
    }
  }
};

// 3. JavaScript Hatalarını Yakala
const setupErrorHandlers = () => {
  console.log('🎯 Error Handler'lar Kuruluyor...');
  
  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('🚨 JavaScript Hatası:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });
  
  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);
  });
  
  // CSP violation handler
  document.addEventListener('securitypolicyviolation', (event) => {
    console.error('🚨 CSP Violation:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy
    });
  });
};

// 4. Network Hatalarını Kontrol Et
const checkNetworkErrors = () => {
  console.log('🌐 Network Hataları Kontrol Ediliyor...');
  
  // Fetch interceptor
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      if (!response.ok) {
        console.warn(`⚠️ Fetch Warning: ${args[0]} returned ${response.status}`);
      }
      return response;
    } catch (error) {
      console.error(`❌ Fetch Error: ${args[0]}`, error);
      throw error;
    }
  };
};

// 5. Console Hatalarını Topla
const collectConsoleErrors = () => {
  console.log('📊 Console Hataları Toplanıyor...');
  
  const errors = [];
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    errors.push({ type: 'error', args, timestamp: new Date() });
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    errors.push({ type: 'warn', args, timestamp: new Date() });
    originalWarn.apply(console, args);
  };
  
  // 10 saniye sonra hataları raporla
  setTimeout(() => {
    console.log('📋 Toplanan Hatalar:', errors);
  }, 10000);
};

// Tüm kontrolleri başlat
const runAllChecks = () => {
  setupErrorHandlers();
  checkNetworkErrors();
  collectConsoleErrors();
  
  setTimeout(() => {
    checkCSPErrors();
    testAPIEndpoints();
  }, 1000);
};

// Export for manual execution
if (typeof window !== 'undefined') {
  window.debugConsoleErrors = runAllChecks;
  console.log('🎯 Debug hazır! window.debugConsoleErrors() çalıştırın');
} else {
  runAllChecks();
}