'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const pathname = usePathname();
  const safePath = pathname ?? '';

  let breadcrumbs: BreadcrumbItem[] = [];

  if (items) {
    breadcrumbs = items;
  } else {
    const pathSegments = safePath.split('/').filter(segment => segment !== '');
    let currentPath = '';

    // Add Home breadcrumb
    breadcrumbs.push({ label: 'Anasayfa', href: '/' });

    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;

      // Basic title mapping (can be expanded for more complex cases)
      let label = segment.replace(/-/g, ' ');
      if (label === 'portfolio') label = 'Portfolyo';
      if (label === 'services') label = 'Hizmetler';
      if (label === 'about') label = 'Hakkımda';
      if (label === 'contact') label = 'İletişim';
      if (label === 'products') label = 'Ürünler';
      if (label === 'admin') label = 'Yönetim Paneli';

      breadcrumbs.push({ label: capitalizeFirstLetter(label), href: currentPath });
    });
  }

  // Helper function to capitalize the first letter of each word
  function capitalizeFirstLetter(str: string) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // Don't show breadcrumbs on the home page or admin pages
  if (safePath === '/' || safePath.startsWith('/admin')) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="relative mt-0 mb-6 rounded-2xl border border-slate-200 bg-white/80 shadow-sm supports-[backdrop-filter]:bg-white/60 backdrop-blur px-4 py-3 text-sm text-slate-600"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center">
              {index === 0 ? (
                <Link
                  href={crumb.href}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <HomeIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Anasayfa</span>
                </Link>
              ) : null}
              {index > 0 ? (
                <ChevronRightIcon className="h-4 w-4 mx-2 text-slate-300" aria-hidden="true" />
              ) : null}
              {index > 0 && !isLast ? (
                <Link
                  href={crumb.href}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : null}
              {isLast && index > 0 ? (
                <span className="font-medium text-slate-900">{crumb.label}</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;