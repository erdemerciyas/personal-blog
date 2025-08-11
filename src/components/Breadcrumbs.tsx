'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  const breadcrumbs: BreadcrumbItem[] = [];
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

  // Helper function to capitalize the first letter of each word
  function capitalizeFirstLetter(str: string) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // Don't show breadcrumbs on the home page or admin pages
  if (pathname === '/' || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="bg-gray-100 py-3 px-4 rounded-lg shadow-sm text-sm text-gray-600 mb-6">
      <ol className="flex space-x-2 items-center">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && <span className="text-gray-400 mx-1">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-gray-800">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-blue-600 transition-colors">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;