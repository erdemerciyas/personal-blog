'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminLayoutNew } from '@/components/admin/layout';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminTextarea,
  AdminSpinner,
  AdminAlert,
  AdminEmptyState
} from '@/components/admin/ui';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TagIcon,
  ClockIcon,
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
  const [success, setSuccess] = useState('');
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
    setSuccess('');

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Bir hata oluştu');
      }

      await fetchCategories();
      setFormData({ name: '', slug: '', description: '' });
      setSuccess('Kategori başarıyla eklendi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Kategori silinemedi');
      
      await fetchCategories();
      setSuccess('Kategori başarıyla silindi!');
      setTimeout(() => setSuccess(''), 3000);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Bir hata oluştu');
      }

      await fetchCategories();
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '' });
      setSuccess('Kategori başarıyla güncellendi!');
      setTimeout(() => setSuccess(''), 3000);
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

  if (status === 'loading' || loading) {
    return (
      <AdminLayoutNew
        title="Kategori Yönetimi"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Kategoriler' }
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <AdminSpinner size="lg" />
        </div>
      </AdminLayoutNew>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AdminLayoutNew 
      title="Kategori Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Kategoriler' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Info */}
        <div>
          <p className="text-slate-600 dark:text-slate-400">Portfolyo kategorilerini yönetin</p>
          <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
            <span>Toplam: {categories.length} kategori</span>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <AdminAlert variant="success" onClose={() => setSuccess('')}>
            {success}
          </AdminAlert>
        )}

        {error && (
          <AdminAlert variant="error" onClose={() => setError('')}>
            {error}
          </AdminAlert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminCard padding="md" className="bg-gradient-to-r from-brand-primary-700 to-blue-600 text-white border-0">
            <div className="flex items-center space-x-3">
              <TagIcon className="w-6 h-6" />
              <span className="font-semibold">Kategori Yönetimi</span>
            </div>
          </AdminCard>
          
          <Link href="/admin/portfolio">
            <AdminCard padding="md" hover className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 cursor-pointer">
              <div className="flex items-center space-x-3">
                <FolderOpenIcon className="w-6 h-6" />
                <span className="font-semibold">Portfolio Yönetimi</span>
              </div>
            </AdminCard>
          </Link>
          
          <a href="/" target="_blank" rel="noopener noreferrer">
            <AdminCard padding="md" hover className="bg-gradient-to-r from-brand-primary-700 to-brand-primary-800 text-white border-0 cursor-pointer">
              <div className="flex items-center space-x-3">
                <EyeIcon className="w-6 h-6" />
                <span className="font-semibold">Site Görüntüle</span>
              </div>
            </AdminCard>
          </a>
        </div>

        {/* Category Form */}
        <AdminCard title={editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'} padding="md">
          <form onSubmit={editingCategory ? handleEdit : handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput
                label="Kategori Adı"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Kategori adı"
                required
              />
              
              <AdminInput
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="kategori-slug"
                required
              />
            </div>
            
            <AdminTextarea
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Kategori açıklaması (opsiyonel)"
            />
            
            <div className="flex items-center space-x-3">
              <AdminButton
                type="submit"
                variant="primary"
                disabled={loading}
                icon={editingCategory ? CheckIcon : PlusIcon}
              >
                {editingCategory ? 'Güncelle' : 'Ekle'}
              </AdminButton>
              
              {editingCategory && (
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={cancelEdit}
                  icon={XMarkIcon}
                >
                  İptal
                </AdminButton>
              )}
            </div>
          </form>
        </AdminCard>

        {/* Categories List */}
        <AdminCard title="Kategoriler" padding="none">
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {categories.length === 0 ? (
              <AdminEmptyState
                icon={<TagIcon className="w-12 h-12" />}
                title="Henüz kategori eklenmemiş"
                description="İlk kategorinizi eklemek için yukarıdaki formu kullanın"
              />
            ) : (
              categories.map((category) => (
                <div key={category._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {category.name}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 mb-2">
                        <span className="font-medium">Slug:</span> {category.slug}
                      </p>
                      {category.description && (
                        <p className="text-slate-600 dark:text-slate-300 mb-3">
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>Kategori</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-brand-primary-700 dark:hover:text-brand-primary-400 hover:bg-brand-primary-50 dark:hover:bg-brand-primary-900/20 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminCard>
      </div>
    </AdminLayoutNew>
  );
}
