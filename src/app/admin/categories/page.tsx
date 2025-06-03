'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  CubeTransparentIcon,
  TagIcon,
  ClockIcon,
  ArrowLeftIcon,
  HomeIcon,
  FolderOpenIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function Categories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchCategories();
    }
  }, [status, session, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Kategoriler getirilemedi');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Kategoriler yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Bir hata oluştu');
      }

      await fetchCategories();
      setFormData({ name: '', slug: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Kategori silinemedi');
      
      await fetchCategories();
    } catch (err) {
      setError('Kategori silinirken bir hata oluştu');
      console.error(err);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Bir hata oluştu');
      }

      await fetchCategories();
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-slate-300">Kategoriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const quickActions = [
    {
      title: 'Portfolio Yönetimi',
      icon: FolderOpenIcon,
      href: '/admin/portfolio',
      color: 'bg-gradient-to-r from-blue-600 to-blue-700'
    },
    {
      title: 'Dashboard',
      icon: HomeIcon,
      href: '/admin/dashboard',
      color: 'bg-gradient-to-r from-slate-600 to-slate-700'
    },
    {
      title: 'Site Görüntüle',
      icon: EyeIcon,
      href: '/',
      color: 'bg-gradient-to-r from-teal-600 to-teal-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/dashboard"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <CubeTransparentIcon className="w-6 h-6 text-white" />
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Kategori Yönetimi</h1>
                <p className="text-sm text-slate-300">Proje kategorilerini düzenleyin</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{session.user.name}</p>
                  <p className="text-xs text-slate-400">{session.user.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 text-sm font-medium border border-red-500/30"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                  <TagIcon className="w-8 h-8 text-orange-400" />
                  <span>Kategori Yönetimi</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  Proje kategorilerini ekleyin, düzenleyin ve organize edin.
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-2 text-sm text-slate-400">
                <ClockIcon className="w-4 h-4" />
                <span>Toplam {categories.length} kategori</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-300 p-4 rounded-2xl">
              {error}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link 
                key={action.title}
                href={action.href}
                className="group"
              >
                <div className={`${action.color} rounded-2xl p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                  <div className="flex items-center space-x-3">
                    <action.icon className="w-6 h-6" />
                    <span className="font-semibold">{action.title}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Add/Edit Category Form */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              {editingCategory ? (
                <>
                  <PencilIcon className="w-5 h-5 text-blue-400" />
                  <span>Kategori Düzenle</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5 text-teal-400" />
                  <span>Yeni Kategori Ekle</span>
                </>
              )}
            </h3>
            
            <form onSubmit={editingCategory ? handleEdit : handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Kategori Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        name: e.target.value,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, ''),
                      }));
                    }}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Kategori adını girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="kategori-slug"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  placeholder="Kategori hakkında kısa açıklama (isteğe bağlı)"
                />
              </div>

              <div className="flex items-center justify-end space-x-4">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex items-center space-x-2 px-6 py-3 bg-slate-500/20 hover:bg-slate-500/30 text-slate-300 hover:text-white rounded-xl transition-all duration-200"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>İptal</span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>
                    {loading ? 'Kaydediliyor...' : editingCategory ? 'Güncelle' : 'Ekle'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Kategoriler</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <span>{categories.length} kategori bulundu</span>
            </div>
          </div>

          {categories.length === 0 && !loading ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
              <TagIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">Henüz kategori yok</h4>
              <p className="text-slate-400 mb-6">İlk kategorinizi ekleyerek başlayın</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
                        <h4 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                          {category.name}
                        </h4>
                        <span className="text-xs bg-slate-500/20 text-slate-300 px-2 py-1 rounded-lg">
                          /{category.slug}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-slate-300 text-sm leading-relaxed pl-6">
                          {category.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => startEdit(category)}
                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors group/btn"
                      >
                        <PencilIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Düzenle</span>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors group/btn"
                      >
                        <TrashIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-sm font-medium">Sil</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-sm">Kategori Yönetimi Aktif</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <Link href="/admin/dashboard" className="hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <HomeIcon className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/admin/portfolio" className="hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <FolderOpenIcon className="w-4 h-4" />
                <span>Portfolio</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 