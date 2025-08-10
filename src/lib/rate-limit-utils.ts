/**
 * Rate Limit Utilities
 * Development ve debugging için yardımcı fonksiyonlar
 */

import { getRateLimitStatus } from './rate-limit';

// Rate limit cache'ini temizle (sadece development)
export function clearRateLimitCache(): void {
  if (process.env.NODE_ENV !== 'development') {
    // Rate limit cache can only be cleared in development mode
    return;
  }

  // Cache'i temizlemek için global değişkene erişim gerekiyor
  // Bu fonksiyon browser console'dan çağrılabilir
  if (typeof window !== 'undefined') {
    (window as any).__clearRateLimit = () => {
      // Client-side'da localStorage'daki cache'i temizle
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('rate_limit_')) {
          localStorage.removeItem(key);
        }
      });
      // Rate limit cache cleared
      window.location.reload();
    };
    
    // Rate limit cache clear function available
  }
}

// IP'nin rate limit durumunu kontrol et
export function checkRateLimitStatus(ip: string): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const status = getRateLimitStatus(ip);
  void status; // silence unused var in production
}

// Development modunda rate limit'i bypass et
export function bypassRateLimit(): boolean {
  return process.env.NODE_ENV === 'development' && 
         process.env.BYPASS_RATE_LIMIT === 'true';
}