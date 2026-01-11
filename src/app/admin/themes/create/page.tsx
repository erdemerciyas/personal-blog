/**
 * Theme Creation Page
 * Create a new theme
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PaintBrushIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface FormData {
  name: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  thumbnail: string;
}

export default function ThemeCreatePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    version: '1.0.0',
    author: '',
    description: '',
    thumbnail: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (value: string) => {
    handleInputChange('name', value);
    handleInputChange('slug', generateSlug(value));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Tema adı gereklidir');
      return false;
    }
    if (!formData.slug.trim()) {
      setError('Slug gereklidir');
      return false;
    }
    if (!formData.version.trim()) {
      setError('Sürüm gereklidir');
      return false;
    }
    if (!formData.author.trim()) {
      setError('Yazar gereklidir');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Açıklama gereklidir');
      return false;
    }
    return true;
  };

  const createTheme = async () => {
    setError(null);
    if (!validateForm()) {
      return;
    }

    try {
      setCreating(true);

      const themeData = {
        ...formData,
        isActive: false,
        config: {
          colors: {
            primary: '#0066ff',
            secondary: '#8b5cf6',
            accent: '#a855f7',
            background: '#ffffff',
            text: '#1e293b',
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter',
          },
          layout: {
            maxWidth: 1280,
            sidebar: false,
            headerStyle: 'fixed',
            footerStyle: 'simple',
          },
          features: {
            heroSlider: true,
            portfolioGrid: true,
            blogList: true,
            contactForm: true,
          },
        },
        templates: [],
      };

      const response = await fetch('/api/admin/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/admin/themes/${data.data._id}`);
        }, 1500);
      } else {
        setError(data.error || 'Oluşturma başarısız');
      }
    } catch (error) {
      console.error('Error creating theme:', error);
      setError('Oluşturma başarısız');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      version: '1.0.0',
      author: '',
      description: '',
      thumbnail: '',
    });
  };

  if (status === 'loading') {
    return (
              <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        </div>
          );
  }

  if (!session?.user) {
    return null;
  }

  return (
          <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Yeni Tema Oluştur</h1>
            <p className="text-sm text-slate-500 mt-1">Yeni bir tema oluşturun ve yapılandırın</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
            >
              Sıfırla
            </button>
            <button
              onClick={createTheme}
              disabled={creating}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-6 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {creating ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Temayı Oluştur</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-3">
            <CheckCircleIcon className="w-5 h-5" />
            <span>Tema başarıyla oluşturuldu! Yönlendiriliyorsunuz...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Tema Adı *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Örn: Modern Blue Theme"
                required
                disabled={creating}
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                placeholder="modern-blue-theme"
                required
                disabled={creating}
              />
              <p className="mt-1 text-sm text-slate-500">
                URL'de kullanılacak benzersiz tanımlayıcı
              </p>
            </div>

            {/* Version */}
            <div>
              <label htmlFor="version" className="block text-sm font-medium text-slate-700 mb-2">
                Sürüm *
              </label>
              <input
                type="text"
                id="version"
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="1.0.0"
                required
                disabled={creating}
              />
              <p className="mt-1 text-sm text-slate-500">
                Semantik versiyonlama (Örn: 1.0.0)
              </p>
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-slate-700 mb-2">
                Yazar *
              </label>
              <input
                type="text"
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Örn: John Doe"
                required
                disabled={creating}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Açıklama *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                placeholder="Tema hakkında kısa bir açıklama..."
                required
                disabled={creating}
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-slate-700 mb-2">
                Küçük Resim URL
              </label>
              <input
                type="url"
                id="thumbnail"
                value={formData.thumbnail}
                onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="https://example.com/thumbnail.png"
                disabled={creating}
              />
              <p className="mt-1 text-sm text-slate-500">
                Tema önizleme görseli URL'si (isteğe bağlı)
              </p>

              {formData.thumbnail && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Önizleme
                  </label>
                  <div className="relative h-48 bg-slate-100 rounded-xl overflow-hidden">
                    <img
                      src={formData.thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-indigo-900 mb-2">Bilgi</h3>
              <p className="text-sm text-indigo-800 mb-3">
                Tema oluşturulduktan sonra şu işlemleri yapabilirsiniz:
              </p>
              <ul className="text-sm text-indigo-800 list-disc list-inside space-y-1">
                <li>Renkleri, fontları ve düzeni "Kişiselleştir" sayfasından özelleştirin</li>
                <li>Temayı aktif hale getirerek site görünümünü değiştirin</li>
                <li>Şablonlar ekleyerek sayfa türlerini tanımlayın</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Default Configuration Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <PaintBrushIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Varsayılan Yapılandırma</h3>
              <p className="text-sm text-slate-700 mb-4">
                Yeni tema aşağıdaki varsayılan yapılandırmayla oluşturulacaktır:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-900">Renkler:</span>
                  <ul className="mt-2 space-y-1 text-slate-600">
                    <li>• Primary: #0066ff</li>
                    <li>• Secondary: #8b5cf6</li>
                    <li>• Accent: #a855f7</li>
                    <li>• Background: #ffffff</li>
                    <li>• Text: #1e293b</li>
                  </ul>
                </div>
                <div>
                  <span className="font-medium text-slate-900">Düzen:</span>
                  <ul className="mt-2 space-y-1 text-slate-600">
                    <li>• Max Width: 1280px</li>
                    <li>• Sidebar: Kapalı</li>
                    <li>• Header: Fixed</li>
                    <li>• Footer: Simple</li>
                  </ul>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Bu değerleri oluşturduktan sonra "Kişiselleştir" sayfasından değiştirebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
      );
}
