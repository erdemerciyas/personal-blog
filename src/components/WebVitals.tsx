'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

/**
 * Web Vitals Tracking Component
 * 
 * Core Web Vitals metrikleri:
 * - CLS (Cumulative Layout Shift): Görsel kararlılık
 * - INP (Interaction to Next Paint): Etkileşim gecikmesi (FID'nin yerini aldı)
 * - FCP (First Contentful Paint): İlk içerik boyama
 * - LCP (Largest Contentful Paint): En büyük içerik boyama
 * - TTFB (Time to First Byte): İlk byte'a kadar geçen süre
 */
export default function WebVitals() {
  useEffect(() => {
    // Metrik gönderme fonksiyonu
    const sendToAnalytics = (metric: Metric) => {
      // Google Analytics'e gönder (eğer varsa)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_label: metric.id,
          non_interaction: true,
        });
      }

      // Console'a log (development modunda)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
        });
      }

      // API endpoint'e gönder (opsiyonel)
      if (process.env.NEXT_PUBLIC_ENABLE_VITALS_API === 'true') {
        fetch('/api/monitoring/web-vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
            navigationType: metric.navigationType,
          }),
        }).catch((error) => {
          console.warn('Failed to send web vitals:', error);
        });
      }
    };

    // Web Vitals'ı dinle
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }, []);

  return null; // Bu component görsel bir şey render etmez
}
