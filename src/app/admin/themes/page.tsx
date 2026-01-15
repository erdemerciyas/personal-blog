'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PaintBrushIcon,
  PlusIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Theme {
  _id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isActive: boolean;
  preview: string;
  features: string[];
}

export default function AdminThemesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/admin/dashboard');
      return;
    }

    loadThemes();
  }, [status, session, router]);

  const loadThemes = async () => {
    try {
      const response = await fetch('/api/admin/themes');
      if (response.ok) {
        const data = await response.json();
        setThemes(data);
      }
    } catch (error) {
      console.error('Temalar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (themeId: string) => {
    try {
      const response = await fetch(`/api/admin/themes/${themeId}/activate`, {
        method: 'POST',
      });

      if (response.ok) {
        setThemes(themes.map(theme => ({
          ...theme,
          isActive: theme._id === themeId
        })));
      }
    } catch (error) {
      console.error('Tema aktifleştirilirken hata:', error);
    }
  };

  const handleDelete = async (themeId: string) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu temayı silmek istediğinizden emin misiniz?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'Vazgeç'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/admin/themes/${themeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setThemes(themes.filter(theme => theme._id !== themeId));
        toast.success('Tema silindi');
      } else {
        toast.error('Tema silinemedi');
      }
    } catch (error) {
      console.error('Tema silinirken hata:', error);
      toast.error('Hata oluştu');
    }
  };

  const filteredThemes = themes.filter(theme => {
    if (filter === 'active') return theme.isActive;
    if (filter === 'inactive') return !theme.isActive;
    return true;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Temalar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Temalar</h1>
          <p className="text-slate-500 mt-1">Site temalarınızı yönetin</p>
        </div>
        <Link
          href="/admin/themes/create"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Tema Oluştur
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          Tüm Temalar ({themes.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'active'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          Aktif ({themes.filter(t => t.isActive).length})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'inactive'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          Pasif ({themes.filter(t => !t.isActive).length})
        </button>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThemes.map((theme) => (
          <div
            key={theme._id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            {/* Theme Preview */}
            <div className="relative aspect-video bg-gradient-to-br from-indigo-100 to-violet-100">
              {theme.preview ? (
                <img
                  src={theme.preview}
                  alt={theme.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PaintBrushIcon className="w-16 h-16 text-indigo-300" />
                </div>
              )}
              {theme.isActive && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                  Aktif
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <Link
                  href={`/admin/themes/${theme._id}`}
                  className="p-2 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
                  title="Detayları Gör"
                >
                  <EyeIcon className="w-5 h-5 text-slate-700" />
                </Link>
                <Link
                  href={`/admin/themes/${theme._id}/customize`}
                  className="p-2 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
                  title="Özelleştir"
                >
                  <PencilIcon className="w-5 h-5 text-slate-700" />
                </Link>
                <button
                  onClick={() => handleActivate(theme._id)}
                  className={`p-2 rounded-lg transition-colors ${theme.isActive
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-white hover:bg-emerald-50 text-slate-700'
                    }`}
                  title={theme.isActive ? "Yeniden Aktifleştir (Onar)" : "Aktifleştir"}
                >
                  <StarIcon className={`w-5 h-5 ${theme.isActive ? 'fill-emerald-700' : ''}`} />
                </button>
                {!theme.isActive && (
                  <button
                    onClick={() => handleDelete(theme._id)}
                    className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                    title="Sil"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Theme Info */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {theme.name}
                  </h3>
                  <p className="text-sm text-slate-500">v{theme.version} - Geliştirici: {theme.author}</p>
                </div>
                {theme.isActive && (
                  <StarIcon className="w-5 h-5 text-amber-500 fill-amber-500" />
                )}
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {theme.description}
              </p>

              {/* Features */}
              {theme.features && theme.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {theme.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg"
                    >
                      {feature}
                    </span>
                  ))}
                  {theme.features.length > 3 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                      +{theme.features.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-4 border-t border-slate-100">
                <Link
                  href={`/admin/themes/${theme._id}`}
                  className="flex-1 text-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Detaylar
                </Link>
                <button
                  onClick={() => handleActivate(theme._id)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${theme.isActive
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg'
                    }`}
                >
                  {theme.isActive ? 'Yeniden Aktifleştir' : 'Aktifleştir'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredThemes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <PaintBrushIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Tema bulunamadı</h3>
          <p className="text-slate-500 mb-6">
            {filter === 'all'
              ? 'İlk temanızı oluşturarak başlayın'
              : `Mevcut ${filter === 'active' ? 'aktif' : 'pasif'} tema yok`
            }
          </p>
          {filter === 'all' && (
            <Link
              href="/admin/themes/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Tema Oluştur
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
