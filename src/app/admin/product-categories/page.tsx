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
  parent?: string | null;
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
      setFormData({ name: category.name, description: category.description || '', parent: category.parent || null } as any);
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', parent: null } as any);
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
          const data = await response.json();
          alert(data.details || data.error || 'Kategori oluşturulamadı');
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

      {/* Categories Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-6">Kategori Adı</div>
          <div className="col-span-2">Slug</div>
          <div className="col-span-2 text-center">Ürün Sayısı</div>
          <div className="col-span-2 text-right">İşlemler</div>
        </div>

        {/* Tree List */}
        {categories.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
              <TagIcon className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Henüz kategori yok</h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">Kategoriler oluşturarak ürünlerinizi düzenlemeye başlayın.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {(() => {
              // Prepare Tree Data
              const roots = categories.filter(c => !c.parent);
              const byParent: Record<string, ProductCategory[]> = {};
              categories.forEach(c => {
                if (c.parent) {
                  if (!byParent[c.parent]) byParent[c.parent] = [];
                  byParent[c.parent].push(c);
                }
              });

              // Recursive Render
              const renderRow = (category: ProductCategory, depth = 0) => {
                const children = byParent[category._id] || [];
                const hasChildren = children.length > 0;
                const isExpanded = true; // Default expanded for better visibility, can add state later if needed

                return (
                  <div key={category._id}>
                    <div className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors ${depth === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      {/* Name Column */}
                      <div className="col-span-6 flex items-center">
                        <div style={{ width: depth * 24 }} className="shrink-0" /> {/* Inderntation */}

                        {hasChildren ? (
                          <span className="text-slate-400 mr-2 w-4 flex justify-center">
                            {/* Can add collapse toggle here later */}
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          </span>
                        ) : (
                          <span className="w-6 mr-2" />
                        )}

                        <div className="flex flex-col">
                          <span className={`text-sm ${depth === 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {category.name}
                          </span>
                          {category.description && <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">{category.description}</span>}
                        </div>
                      </div>

                      {/* Slug Column */}
                      <div className="col-span-2 text-sm text-slate-500 font-mono text-xs">
                        {category.slug}
                      </div>

                      {/* Count Column */}
                      <div className="col-span-2 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {category.productCount || 0}
                        </span>
                      </div>

                      {/* Actions Column */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {depth === 0 && (
                          <button
                            onClick={() => {
                              setEditingCategory(null);
                              setFormData({ name: '', description: '', parent: category._id } as any);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Alt Kategori Ekle"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openModal(category)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Render Children */}
                    {hasChildren && (
                      <div className="relative">
                        {/* Tree connector line */}
                        <div className="absolute left-[27px] top-0 bottom-4 w-px bg-slate-200" style={{ left: `${(depth * 24) + 27}px` }} />
                        {children.map(child => renderRow(child, depth + 1))}
                      </div>
                    )}
                  </div>
                );
              };

              return roots.map(root => renderRow(root));
            })()}
          </div>
        )}
      </div>

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
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Kategori açıklaması..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Üst Kategori (Opsiyonel)
                </label>
                <select
                  value={(formData as any).parent || ''}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value || null } as any)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">-- Ana Kategori --</option>
                  {(() => {
                    const roots = categories.filter(c => !c.parent);
                    const byParent: Record<string, ProductCategory[]> = {};
                    categories.forEach(c => {
                      if (c.parent) {
                        if (!byParent[c.parent]) byParent[c.parent] = [];
                        byParent[c.parent].push(c);
                      }
                    });

                    const renderOptions = (cats: ProductCategory[], depth: number): React.ReactNode[] => {
                      return cats.flatMap(c => {
                        // Prevent selecting itself or its own children (to avoid cycles) when editing
                        // Simple cycle check: just checking self for now as per minimal requirement
                        if (editingCategory && c._id === editingCategory._id) return [];

                        return [
                          <option key={c._id} value={c._id}>
                            {Array(depth).fill('\u00A0\u00A0\u00A0').join('')}{depth > 0 ? '↳ ' : ''}{c.name}
                          </option>,
                          ...renderOptions(byParent[c._id] || [], depth + 1)
                        ];
                      });
                    };

                    return renderOptions(roots, 0);
                  })()}
                </select>
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
