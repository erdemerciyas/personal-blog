import React from 'react';

export type ProductRating = {
  ratingValue: number;
  reviewCount?: number;
};

export type Offer = {
  price: number;
  priceCurrency: string;
  availability?: 'https://schema.org/InStock' | 'https://schema.org/OutOfStock' | 'https://schema.org/PreOrder' | string;
  url: string;
};

interface ProductJsonLdProps {
  name: string;
  description?: string;
  url: string; // absolute URL to product page
  images?: string[]; // absolute or relative; will be normalized with base
  brand?: string;
  sku?: string;
  gtin?: string;
  condition?: 'new' | 'used' | string;
  aggregateRating?: ProductRating;
  offers?: Offer;
  baseUrl?: string; // used to normalize relative image URLs
}

export default function ProductJsonLd(props: ProductJsonLdProps) {
  const {
    name,
    description,
    url,
    images = [],
    brand,
    sku,
    gtin,
    condition,
    aggregateRating,
    offers,
    baseUrl = ''
  } = props;

  const toAbs = (u: string) => {
    if (!u) return u;
    if (u.startsWith('http')) return u;
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    if (!base) return u; // fallback: leave as-is
    return `${base}${u.startsWith('/') ? '' : '/'}${u}`;
  };

  const normalizedImages = images.map(toAbs).filter(Boolean);

  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    url,
  };

  if (description) json.description = description;
  if (normalizedImages.length > 0) json.image = normalizedImages;
  if (brand) json.brand = { '@type': 'Brand', name: brand };
  if (sku) json.sku = sku;
  if (gtin) json.gtin = gtin;
  if (condition) {
    json.itemCondition = condition === 'new' ? 'https://schema.org/NewCondition' : condition === 'used' ? 'https://schema.org/UsedCondition' : condition;
  }
  if (aggregateRating && typeof aggregateRating.ratingValue === 'number') {
    json.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount ?? undefined,
    };
  }
  if (offers && typeof offers.price === 'number' && offers.priceCurrency) {
    json.offers = {
      '@type': 'Offer',
      price: offers.price,
      priceCurrency: offers.priceCurrency,
      availability: offers.availability || 'https://schema.org/InStock',
      url: offers.url,
    };
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
