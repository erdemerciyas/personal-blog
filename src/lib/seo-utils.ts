/**
 * Merkezi SEO yardımcı modülü
 * Tüm hreflang, canonical ve OG metadata üretimi buradan yapılır.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.fixral.com'
).replace(/\/$/, '');

/**
 * Verilen TR ve ES yolları için alternates (hreflang + canonical) bloğu üretir.
 * Next.js Metadata API formatında döner.
 */
export function generateAlternates(trPath: string, esPath: string) {
  return {
    canonical: `${SITE_URL}${trPath}`,
    languages: {
      'tr-TR': `${SITE_URL}${trPath}`,
      'es-ES': `${SITE_URL}${esPath}`,
      'x-default': `${SITE_URL}${trPath}`,
    },
  };
}

/**
 * Dile göre doğru alternates bloğu döndürür.
 * Sayfa bileşenlerinde params.lang'e göre canonical belirlenmesinde kullanılır.
 */
export function generateAlternatesForLang(
  lang: string,
  trPath: string,
  esPath: string
) {
  const canonical = lang === 'es' ? `${SITE_URL}${esPath}` : `${SITE_URL}${trPath}`;
  return {
    canonical,
    languages: {
      'tr-TR': `${SITE_URL}${trPath}`,
      'es-ES': `${SITE_URL}${esPath}`,
      'x-default': `${SITE_URL}${trPath}`,
    },
  };
}

/**
 * Standart OG image dizisi döndürür.
 * Sayfaya özel resim yoksa /og-image.jpg fallback kullanılır.
 */
export function generateOgImages(imageUrl?: string, alt?: string) {
  return [
    {
      url: imageUrl || `${SITE_URL}/og-image.jpg`,
      width: 1200,
      height: 630,
      alt: alt || 'Fixral',
    },
  ];
}

/**
 * İçerik slug'ı için TR-ES URL çiftini döndürür.
 * Blog yazıları: haberler/noticias
 */
export function getBlogAlternates(slug: string) {
  return generateAlternates(`/tr/haberler/${slug}`, `/es/noticias/${slug}`);
}

/**
 * Portfolio slug'ı için TR-ES URL çiftini döndürür.
 */
export function getPortfolioAlternates(slug: string) {
  return generateAlternates(`/tr/portfolio/${slug}`, `/es/portfolio/${slug}`);
}

/**
 * Ürün slug'ı için TR-ES URL çiftini döndürür.
 */
export function getProductAlternates(slug: string) {
  return generateAlternates(`/tr/products/${slug}`, `/es/products/${slug}`);
}
