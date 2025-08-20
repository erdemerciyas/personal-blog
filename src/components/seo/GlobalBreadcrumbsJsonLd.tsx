'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import BreadcrumbsJsonLd from './BreadcrumbsJsonLd';
import { config } from '../../lib/config';

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
  if (pathname === '/' || pathname.startsWith('/admin')) return null;

  const segments = pathname.split('/').filter(Boolean);
  const base = (config.app.url || '').replace(/\/$/, '');
  const items = [{ name: 'Anasayfa', item: `${base}/` }];
  let current = '';

  for (const s of segments) {
    current += `/${s}`;
    items.push({ name: prettify(s), item: `${base}${current}` });
  }

  return <BreadcrumbsJsonLd items={items} />;
}
