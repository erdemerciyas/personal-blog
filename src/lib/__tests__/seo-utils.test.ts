import {
  SITE_URL,
  generateAlternates,
  generateAlternatesForLang,
  generateOgImages,
  getBlogAlternates,
  getPortfolioAlternates,
  getProductAlternates,
} from '../seo-utils';

describe('SITE_URL', () => {
  it('does not end with a trailing slash', () => {
    expect(SITE_URL).not.toMatch(/\/$/);
  });

  it('is a valid https URL', () => {
    expect(SITE_URL).toMatch(/^https:\/\//);
  });
});

describe('generateAlternates', () => {
  const result = generateAlternates('/tr/haberler', '/es/noticias');

  it('sets canonical to the TR path', () => {
    expect(result.canonical).toBe(`${SITE_URL}/tr/haberler`);
  });

  it('includes tr-TR language', () => {
    expect(result.languages['tr-TR']).toBe(`${SITE_URL}/tr/haberler`);
  });

  it('includes es-ES language', () => {
    expect(result.languages['es-ES']).toBe(`${SITE_URL}/es/noticias`);
  });

  it('sets x-default to TR path', () => {
    expect(result.languages['x-default']).toBe(`${SITE_URL}/tr/haberler`);
  });
});

describe('generateAlternatesForLang', () => {
  it('uses TR canonical when lang is tr', () => {
    const result = generateAlternatesForLang('tr', '/tr/services', '/es/services');
    expect(result.canonical).toBe(`${SITE_URL}/tr/services`);
  });

  it('uses ES canonical when lang is es', () => {
    const result = generateAlternatesForLang('es', '/tr/services', '/es/services');
    expect(result.canonical).toBe(`${SITE_URL}/es/services`);
  });

  it('still includes both language entries regardless of lang', () => {
    const result = generateAlternatesForLang('es', '/tr/services', '/es/services');
    expect(result.languages['tr-TR']).toBeDefined();
    expect(result.languages['es-ES']).toBeDefined();
  });
});

describe('generateOgImages', () => {
  it('returns fallback og-image when no URL provided', () => {
    const images = generateOgImages();
    expect(images[0].url).toBe(`${SITE_URL}/og-image.jpg`);
  });

  it('uses provided image URL', () => {
    const images = generateOgImages('https://example.com/img.jpg', 'Test');
    expect(images[0].url).toBe('https://example.com/img.jpg');
    expect(images[0].alt).toBe('Test');
  });

  it('returns 1200x630 dimensions', () => {
    const images = generateOgImages();
    expect(images[0].width).toBe(1200);
    expect(images[0].height).toBe(630);
  });
});

describe('slug-based alternate helpers', () => {
  it('getBlogAlternates builds haberler/noticias URLs', () => {
    const result = getBlogAlternates('test-slug');
    expect(result.languages['tr-TR']).toContain('/tr/haberler/test-slug');
    expect(result.languages['es-ES']).toContain('/es/noticias/test-slug');
  });

  it('getPortfolioAlternates builds symmetric portfolio URLs', () => {
    const result = getPortfolioAlternates('my-project');
    expect(result.languages['tr-TR']).toContain('/tr/portfolio/my-project');
    expect(result.languages['es-ES']).toContain('/es/portfolio/my-project');
  });

  it('getProductAlternates builds symmetric product URLs', () => {
    const result = getProductAlternates('product-x');
    expect(result.languages['tr-TR']).toContain('/tr/products/product-x');
    expect(result.languages['es-ES']).toContain('/es/products/product-x');
  });
});
