/**
 * Theme Detail Page
 * View theme details and configuration
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeftIcon,
  PaintBrushIcon,
  CheckCircleIcon,
  SparklesIcon,
  PencilIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Theme {
  _id: string;
  name: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  thumbnail: string;
  isActive: boolean;
  config: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background?: string;
      text?: string;
    };
    fonts?: {
      heading?: string;
      body?: string;
    };
    layout?: {
      maxWidth?: number;
      sidebar?: boolean;
      headerStyle?: string;
      footerStyle?: string;
    };
    features?: {
      heroSlider?: boolean;
      portfolioGrid?: boolean;
      blogList?: boolean;
      contactForm?: boolean;
    };
  };
  templates?: Array<{
    id: string;
    name: string;
    type: string;
    component: string;
    screenshot?: string;
    description: string;
  }>;
  meta?: {
    createdAt?: string;
    updatedAt?: string;
  };
}

export default function ThemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  const fetchTheme = useCallback(async () => {
    if (!params?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/themes/${params?.id}`);
      const data = await response.json();

      if (data.success) {
        setTheme(data.data);
      } else {
        router.push('/admin/themes');
      }
    } catch (error) {
      console.error('Error fetching theme:', error);
      router.push('/admin/themes');
    } finally {
      setLoading(false);
    }
  }, [params?.id, router]);

  useEffect(() => {
    if (params?.id) {
      fetchTheme();
    }
  }, [params?.id, fetchTheme]);

  const activateTheme = async () => {
    if (!theme) return;

    try {
      setActivating(true);
      const response = await fetch('/api/admin/themes/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: theme.slug }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error activating theme:', error);
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        </div>);
  }

  if (!theme) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-slate-500">Tema bulunamadı</p>
        </div>);
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{theme.name}</h1>
            <p className="text-lg text-slate-600 font-medium mt-1">
              v{theme.version} • {theme.author}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {theme.isActive ? (
              <div className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30">
                <CheckCircleIcon className="w-6 h-6 mr-3" />
                AKTİF TEMA
              </div>
            ) : (
              <button
                onClick={activateTheme}
                disabled={activating}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                {activating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>AKTİFLEŞTİRİLİYOR...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6" />
                    <span>TEMAYI AKTİFLEŞTİR</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thumbnail */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="relative h-80 bg-slate-100">
                {theme.thumbnail ? (
                  <Image
                    src={theme.thumbnail}
                    alt={theme.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PaintBrushIcon className="w-32 h-32 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-200/60">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">AÇIKLAMA</h2>
                <p className="text-base text-slate-700 leading-relaxed">{theme.description}</p>
              </div>
            </div>

            {/* Templates */}
            {theme.templates && theme.templates.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">ŞABLONLAR</h2>
                    <p className="text-sm text-slate-500">Tema şablonları</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {theme.templates.map((template) => (
                    <div
                      key={template.id}
                      className="border-2 border-slate-200/60 rounded-xl p-4 hover:border-indigo-300 transition-colors"
                    >
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{template.name}</h3>
                      <p className="text-base text-slate-600 mb-4">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-medium">
                          {template.type}
                        </span>
                        {template.screenshot && (
                          <PhotoIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuration Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Cog6ToothIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">YAPILANDIRMA</h2>
                  <p className="text-sm text-slate-500">Tema ayarları</p>
                </div>
              </div>

              {/* Colors */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">RENKLER</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">ANA RENK</label>
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 border-2 border-slate-200 rounded-xl"
                        style={{ backgroundColor: theme.config.colors.primary }}
                      />
                      <span className="text-sm font-mono text-slate-900 font-bold">
                        {theme.config.colors.primary}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">İKİNCİL RENK</label>
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 border-2 border-slate-200 rounded-xl"
                        style={{ backgroundColor: theme.config.colors.secondary }}
                      />
                      <span className="text-sm font-mono text-slate-900 font-bold">
                        {theme.config.colors.secondary}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">VURGU RENGİ</label>
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 border-2 border-slate-200 rounded-xl"
                        style={{ backgroundColor: theme.config.colors.accent }}
                      />
                      <span className="text-sm font-mono text-slate-900 font-bold">
                        {theme.config.colors.accent}
                      </span>
                    </div>
                  </div>
                  {theme.config.colors.background && (
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">ARKAPLAN</label>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-12 h-12 border-2 border-slate-200 rounded-xl"
                          style={{ backgroundColor: theme.config.colors.background }}
                        />
                        <span className="text-sm font-mono text-slate-900 font-bold">
                          {theme.config.colors.background}
                        </span>
                      </div>
                    </div>
                  )}
                  {theme.config.colors.text && (
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">METİN</label>
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-12 h-12 border-2 border-slate-200 rounded-xl"
                          style={{ backgroundColor: theme.config.colors.text }}
                        />
                        <span className="text-sm font-mono text-slate-900 font-bold">
                          {theme.config.colors.text}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fonts */}
              {theme.config.fonts && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">FONTLAR</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {theme.config.fonts.heading && (
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">BAŞLIK FONTU</label>
                        <p className="text-base font-bold text-slate-900">
                          {theme.config.fonts.heading}
                        </p>
                      </div>
                    )}
                    {theme.config.fonts.body && (
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">İÇERİK FONTU</label>
                        <p className="text-base text-slate-700">{theme.config.fonts.body}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Layout */}
              {theme.config.layout && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">DÜZEN</h3>
                  <div className="space-y-3">
                    {theme.config.layout.maxWidth && (
                      <div className="flex justify-between text-base border-b border-slate-200 pb-2">
                        <span className="text-slate-600 font-medium">MAKSİMUM GENİŞLİK</span>
                        <span className="font-bold text-slate-900">{theme.config.layout.maxWidth}px</span>
                      </div>
                    )}
                    {theme.config.layout.sidebar !== undefined && (
                      <div className="flex justify-between text-base border-b border-slate-200 pb-2">
                        <span className="text-slate-600 font-medium">YAN MENÜ</span>
                        <span className="font-bold text-slate-900">
                          {theme.config.layout.sidebar ? 'EVET' : 'HAYIR'}
                        </span>
                      </div>
                    )}
                    {theme.config.layout.headerStyle && (
                      <div className="flex justify-between text-base border-b border-slate-200 pb-2">
                        <span className="text-slate-600 font-medium">BAŞLIK STİLİ</span>
                        <span className="font-bold text-slate-900 capitalize">
                          {theme.config.layout.headerStyle}
                        </span>
                      </div>
                    )}
                    {theme.config.layout.footerStyle && (
                      <div className="flex justify-between text-base border-b border-slate-200 pb-2">
                        <span className="text-slate-600 font-medium">ALT BİLGİ STİLİ</span>
                        <span className="font-bold text-slate-900 capitalize">
                          {theme.config.layout.footerStyle}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Features */}
              {theme.config.features && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">ÖZELLİKLER</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {theme.config.features.heroSlider !== undefined && (
                      <div className="flex items-center space-x-3 border-2 border-indigo-200 bg-indigo-50 px-4 py-3 rounded-xl">
                        <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                        <span className="text-base font-bold text-slate-900">Hero Slider</span>
                      </div>
                    )}
                    {theme.config.features.portfolioGrid !== undefined && (
                      <div className="flex items-center space-x-3 border-2 border-indigo-200 bg-indigo-50 px-4 py-3 rounded-xl">
                        <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                        <span className="text-base font-bold text-slate-900">Portfolio Grid</span>
                      </div>
                    )}
                    {theme.config.features.blogList !== undefined && (
                      <div className="flex items-center space-x-3 border-2 border-indigo-200 bg-indigo-50 px-4 py-3 rounded-xl">
                        <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                        <span className="text-base font-bold text-slate-900">Blog Listesi</span>
                      </div>
                    )}
                    {theme.config.features.contactForm !== undefined && (
                      <div className="flex items-center space-x-3 border-2 border-indigo-200 bg-indigo-50 px-4 py-3 rounded-xl">
                        <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                        <span className="text-base font-bold text-slate-900">İletişim Formu</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">HIZLI İŞLEMLER</h2>
                  <p className="text-sm text-slate-500">Tema işlemleri</p>
                </div>
              </div>
              <div className="space-y-3">
                <Link
                  href={`/admin/themes/${theme._id}/edit`}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white rounded-xl font-bold text-lg transition-all"
                >
                  <PencilIcon className="w-6 h-6" />
                  <span>TEMAYI DÜZENLE</span>
                </Link>
                <Link
                  href={`/admin/themes/${theme._id}/customize`}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-lg transition-all"
                >
                  <Cog6ToothIcon className="w-6 h-6" />
                  <span>ÖZELLEŞTİR</span>
                </Link>
              </div>
            </div>

            {/* Meta Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">BİLGİLER</h2>
                  <p className="text-sm text-slate-500">Tema bilgileri</p>
                </div>
              </div>
              <div className="space-y-3 text-base">
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-600 font-medium">Slug:</span>
                  <span className="font-mono text-slate-900 font-bold">{theme.slug}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-600 font-medium">SÜRÜM:</span>
                  <span className="text-slate-900 font-bold">{theme.version}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-600 font-medium">YAZAR:</span>
                  <span className="text-slate-900 font-bold">{theme.author}</span>
                </div>
                {theme.meta?.createdAt && (
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span className="text-slate-600 font-medium">OLUŞTURULMA:</span>
                    <span className="text-slate-900 font-bold">
                      {new Date(theme.meta.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
                {theme.meta?.updatedAt && (
                  <div className="flex justify-between pb-3">
                    <span className="text-slate-600 font-medium">GÜNCELLENME:</span>
                    <span className="text-slate-900 font-bold">
                      {new Date(theme.meta.updatedAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>);
}
