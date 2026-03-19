'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import BreadcrumbsJsonLd from './BreadcrumbsJsonLd';
import { SITE_URL } from '@/lib/seo-utils';

function prettify(segment: string) {
  let label = segment.replace(/-/g, ' ');
  if (label === 'portfolio') label = 'Portfolyo';
  if (label === 'services') label = 'Hizmetler';
  if (label === 'about') label = 'Hakkımda';
  if (label === 'contact') label = 'İletişim';
  if (label === 'products') label = 'Ürünler';
  if (label === 'admin') label = 'Yönetim Paneli';
  if (label === 'haberler') label = 'Haberler';
  if (label === 'noticias') label = 'Noticias';
  return label
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function GlobalBreadcrumbsJsonLd() {
  const pathname = usePathname() ?? '';

  // Admin sayfalarında ve kök yolda breadcrumb gerekmez
  if (pathname === '/' || pathname.startsWith('/admin')) return null;

  const segments = pathname.split('/').filter(Boolean);
  const items = [{ name: 'Anasayfa', item: `${SITE_URL}/` }];
  let current = '';

  for (const s of segments) {
    current += `/${s}`;
    items.push({ name: prettify(s), item: `${SITE_URL}${current}` });
  }

  return <BreadcrumbsJsonLd items={items} />;
}
