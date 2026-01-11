'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  TagIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  order?: number;
  isActive?: boolean;
  createdAt: string;
}

export default function AdminProductCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadCategories();
  }, [status, router]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/product-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.items || []);
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/product-categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(category => category._id !== categoryId));
      } else {
        alert('Kategori silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Kategori silinirken hata:', error);
      alert('Kategori silinirken hata oluştu');
    }
  };

  const openModal = (category?: ProductCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setSaving(true);
    try {
      if (editingCategory) {
        // Update
        const response = await fetch(`/api/admin/product-categories/${editingCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updated = await response.json();
          setCategories(categories.map(c => c._id === updated._id ? { ...c, ...updated } : c));
          closeModal();
        } else {
          alert('Kategori güncellenemedi');
        }
      } else {
        // Create
        const response = await fetch('/api/admin/product-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const created = await response.json();
          setCategories([...categories, created]);
          closeModal();
        } else {
          alert('Kategori oluşturulamadı');
        }
      }
    } catch (error) {
      console.error('Kategori kaydedilirken hata:', error);
      alert('Kategori kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter(category => {
    return category.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Ürün kategorileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ürün Kategorileri</h1>
          <p className="text-slate-500 mt-1">Ürün kategorilerinizi yönetin</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Kategori Ekle
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kategori ara..."
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category._id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                <TagIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(category)}
                  className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <PencilIcon className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
              {category.description || 'Açıklama yok'}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                {category.productCount || 0} ürün
              </span>
              <span className="text-xs text-slate-400">
                /{category.slug}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
          <TagIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Ürün kategorisi bulunamadı</h3>
          <p className="text-slate-500">
            {searchQuery
              ? 'Aramanızı değiştirmeyi deneyin'
              : 'Ürünlerinizi düzenlemek için ilk kategorinizi oluşturun'
            }
          </p>
        </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="örn. Elektronik"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Kategori açıklaması..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : (editingCategory ? 'Güncelle' : 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
