/**
 * Theme Edit Page
 * Edit theme basic information
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PaintBrushIcon,
  ExclamationTriangleIcon
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
}

export default function ThemeEditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    version: '',
    author: '',
    description: '',
    thumbnail: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const fetchTheme = useCallback(async () => {
    if (!params?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/themes/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setTheme(data.data);
        setFormData({
          name: data.data.name,
          slug: data.data.slug,
          version: data.data.version,
          author: data.data.author,
          description: data.data.description,
          thumbnail: data.data.thumbnail || '',
        });
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (value: string) => {
    handleInputChange('name', value);
    if (!theme || formData.slug === theme.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const saveTheme = async () => {
    if (!params?.id) return;

    setError(null);
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/themes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setHasChanges(false);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(data.error || 'Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      setError('Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    if (theme) {
      setFormData({
        name: theme.name,
        slug: theme.slug,
        version: theme.version,
        author: theme.author,
        description: theme.description,
        thumbnail: theme.thumbnail || '',
      });
      setHasChanges(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        </div>);
  }

  if (!session?.user || !theme) {
    return null;
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Temayı Düzenle</h1>
            <p className="text-sm text-slate-500 mt-1">Tema bilgilerini güncelleyin</p>
          </div>

          <div className="flex gap-3">
            {hasChanges && (
              <button
                onClick={resetForm}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                İptal
              </button>
            )}
            <button
              onClick={saveTheme}
              disabled={saving || !hasChanges}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-6 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {saving ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Kaydet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-3">
            <CheckCircleIcon className="w-5 h-5" />
            <span>Tema başarıyla güncellendi!</span>
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
                placeholder="Örn: Fixral Theme"
                required
                disabled={saving}
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
                placeholder="fixral-theme"
                required
                disabled={saving}
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
                disabled={saving}
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
                placeholder="Örn: Fixral"
                required
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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

            {/* Active Status Info */}
            {theme?.isActive && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <PaintBrushIcon className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-900">Aktif Tema</p>
                    <p className="text-sm text-emerald-700 mt-1">
                      Bu tema şu anda aktif olarak kullanılıyor. Değişiklikler site görünümünü etkileyecektir.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-indigo-900 mb-2">İpucu</h3>
              <p className="text-sm text-indigo-800">
                Renkler, fontlar ve diğer özelleştirme seçenekleri için "Özelleştir" sayfasını kullanın.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-start">
          <Link
            href={`/admin/themes/${theme._id}`}
            className="flex items-center space-x-2 px-6 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Tema Detaylarına Dön</span>
          </Link>
        </div>
      </div>);
}
