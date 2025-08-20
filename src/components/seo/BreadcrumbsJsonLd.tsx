'use client';

import React from 'react';

type Crumb = {
  name: string;
  item: string; // absolute or relative URL
};

interface Props {
  items: Crumb[];
}

export default function BreadcrumbsJsonLd({ items }: Props) {
  // Use provided items as-is to avoid SSR/CSR mismatch
  const normalized = items;

  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: normalized.map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: c.name,
      item: c.item,
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
