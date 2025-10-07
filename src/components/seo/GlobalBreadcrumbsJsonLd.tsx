'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import BreadcrumbsJsonLd from './BreadcrumbsJsonLd';

function prettify(segment: string) {
  let label = segment.replace(/-/g, ' ');
  if (label === 'portfolio') label = 'Portfolyo';
  if (label === 'services') label = 'Hizmetler';
  if (label === 'about') label = 'Hakkımda';
  if (label === 'contact') label = 'İletişim';
  if (label === 'products') label = 'Ürünler';
  if (label === 'admin') label = 'Yönetim Paneli';
  return label
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function GlobalBreadcrumbsJsonLd() {
  const pathname = usePathname() ?? '';
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Client-side'da window.location.origin kullan
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Hydration tamamlanana kadar render etme
  if (!baseUrl || pathname === '/' || pathname.startsWith('/admin')) return null;

  const segments = pathname.split('/').filter(Boolean);
  const items = [{ name: 'Anasayfa', item: `${baseUrl}/` }];
  let current = '';

  for (const s of segments) {
    current += `/${s}`;
    items.push({ name: prettify(s), item: `${baseUrl}${current}` });
  }

  return <BreadcrumbsJsonLd items={items} />;
}
