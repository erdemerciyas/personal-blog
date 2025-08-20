'use client';

import React from 'react';

type ServiceItem = {
  name: string;
  url: string; // absolute or relative
  description?: string;
  image?: string; // absolute or relative
};

interface Props {
  items: ServiceItem[];
  baseUrl?: string;
}

export default function ServicesListJsonLd({ items, baseUrl = '' }: Props) {
  const origin =
    baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  const toAbs = (v?: string) => {
    if (!v) return v;
    if (v.startsWith('http')) return v;
    if (!origin) return v;
    return `${origin}${v.startsWith('/') ? '' : '/'}${v}`;
  };

  const elements = items.map((s, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    url: toAbs(s.url),
    item: {
      '@type': 'Service',
      name: s.name,
      description: s.description,
      image: toAbs(s.image),
      url: toAbs(s.url),
    },
  }));

  const json = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: elements,
  } as const;

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
