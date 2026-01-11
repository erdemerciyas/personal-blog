'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PencilIcon,
  DocumentTextIcon,
  PhotoIcon,
  CubeIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

export default function AdminEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'news' | 'page' | 'portfolio' | 'service' | 'product'>('news');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    setLoading(false);
  }, [status, router]);

  const contentTypes = [
    { type: 'news', name: 'News Article', icon: DocumentTextIcon, color: 'from-indigo-500 to-violet-600', href: '/admin/news/create' },
    { type: 'page', name: 'Page', icon: DocumentTextIcon, color: 'from-emerald-500 to-teal-600', href: '/admin/pages' },
    { type: 'portfolio', name: 'Portfolio Item', icon: PhotoIcon, color: 'from-amber-500 to-orange-600', href: '/admin/portfolio/new' },
    { type: 'service', name: 'Service', icon: CubeIcon, color: 'from-rose-500 to-pink-600', href: '/admin/services/new' },
    { type: 'product', name: 'Product', icon: ShoppingBagIcon, color: 'from-cyan-500 to-blue-600', href: '/admin/products/new' },
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Content Editor</h1>
        <p className="text-slate-500 mt-1">Choose the type of content you want to create</p>
      </div>

      {/* Content Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentTypes.map((contentType) => (
          <button
            key={contentType.type}
            onClick={() => router.push(contentType.href)}
            className={`group bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
              selectedType === contentType.type
                ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2'
                : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <div className="p-6">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${contentType.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <contentType.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {contentType.name}
              </h3>
              <p className="text-sm text-slate-600">
                Create a new {contentType.name.toLowerCase()}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/news/create"
            className="flex items-center p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <DocumentTextIcon className="w-5 h-5 text-indigo-600 mr-3" />
            <span className="text-sm font-medium text-slate-900">Create News</span>
          </Link>
          <Link
            href="/admin/portfolio/new"
            className="flex items-center p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <PhotoIcon className="w-5 h-5 text-amber-600 mr-3" />
            <span className="text-sm font-medium text-slate-900">Add Portfolio</span>
          </Link>
          <Link
            href="/admin/services/new"
            className="flex items-center p-4 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <CubeIcon className="w-5 h-5 text-rose-600 mr-3" />
            <span className="text-sm font-medium text-slate-900">Add Service</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center p-4 rounded-xl bg-cyan-50 hover:bg-cyan-100 transition-colors"
          >
            <ShoppingBagIcon className="w-5 h-5 text-cyan-600 mr-3" />
            <span className="text-sm font-medium text-slate-900">Add Product</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
