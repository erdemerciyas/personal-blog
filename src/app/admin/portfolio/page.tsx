'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AdminLayoutNew } from '@/components/admin/layout';
import { 
  AdminButton,
  AdminInput,
  AdminTabs,
  AdminSpinner,
  AdminAlert,
  AdminEmptyState
} from '@/components/admin/ui';
import HTMLContent from '../../../components/HTMLContent';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TagIcon,
  ClockIcon,
  StarIcon,
  FolderOpenIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  category?: Category;
  categoryId?: string;
  client: string;
  completionDate: string;
  technologies: string[];
  coverImage: string;
  images: string[];
  featured: boolean;
  order: number;
}

export default function PortfolioManagement() {
  const { status } = useSession(); // session is used indirectly for auth
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'projects' | 'categories'>('projects');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // URL parametresini kontrol et
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab === 'categories') {
        setActiveTab('categories');
      }
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchPortfolioItems();
      fetchCategories();
    }
  }, [status, router]);

  const fetchPortfolioItems = async () => {
    try {
      const response = await fetch('/api/portfolio');
      if (!response.ok) throw new Error('Portfolyo öğeleri getirilemedi');
      const data = await response.json();
      setPortfolioItems(data);
    } catch (err) {
      setError('Portfolyo öğeleri yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Kategoriler getirilemedi');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Kategoriler yüklenirken hata:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName,
          description: newCategoryDescription
        })
      });

      if (!response.ok) throw new Error('Kategori oluşturulamadı');
      
      await fetchCategories();
      setNewCategoryName('');
      setNewCategoryDescription('');
    } catch (err) {
      setError('Kategori oluşturulurken hata oluştu');
      console.error(err);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const response = await fetch(`/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCategory.name,
          description: editingCategory.description
        })
      });

      if (!response.ok) throw new Error('Kategori güncellenemedi');
      
      await fetchCategories();
      setEditingCategory(null);
    } catch (err) {
      setError('Kategori güncellenirken hata oluştu');
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Kategori silinemedi');
      
      await fetchCategories();
    } catch (err) {
      setError('Kategori silinirken hata oluştu');
      console.error(err);
    }
  };

  const handleTabChange = (tab: 'projects' | 'categories') => {
    setActiveTab(tab);
    const newUrl = tab === 'categories' ? '/admin/portfolio?tab=categories' : '/admin/portfolio';
    
    // URL'yi güncelle ama sayfayı yeniden yükleme
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', newUrl);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu portfolyo öğesini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Silme işlemi başarısız oldu');
      
      setPortfolioItems(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      setError('Silme işlemi sırasında bir hata oluştu');
      console.error(err);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayoutNew
        title="Portfolyo Yönetimi"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Portfolyo' }
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

  const tabs = [
    {
      id: 'projects',
      label: 'Projeler',
      icon: FolderOpenIcon,
      content: null
    },
    {
      id: 'categories',
      label: 'Kategoriler',
      icon: TagIcon,
      content: null
    }
  ];

  return (
    <AdminLayoutNew 
      title="Portfolyo Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Portfolyo' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Tab Navigation */}
        <AdminTabs
          tabs={tabs}
          defaultTab={activeTab}
          onChange={(tabId: string) => handleTabChange(tabId as 'projects' | 'categories')}
        />

        {/* Error Message */}
        {error && (
          <AdminAlert variant="error" onClose={() => setError('')}>
            {error}
          </AdminAlert>
        )}

        {/* Tab Content */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-slate-600 dark:text-slate-400">Projelerinizi düzenleyin ve yönetin</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
                  <span>Toplam: {portfolioItems.length} proje</span>
                  <span>•</span>
                  <span>Öne çıkan: {portfolioItems.filter(item => item.featured).length}</span>
                </div>
              </div>
              <Link href="/admin/portfolio/new">
                <AdminButton variant="primary" icon={PlusIcon}>
                  Yeni Proje
                </AdminButton>
              </Link>
            </div>

        {/* Portfolio Items */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Projeler</h3>
          </div>
          
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {portfolioItems.length === 0 ? (
              <AdminEmptyState
                icon={<FolderOpenIcon className="w-12 h-12" />}
                title="Henüz proje eklenmemiş"
                description="İlk projenizi eklemek için 'Yeni Proje' butonuna tıklayın"
              />
            ) : (
              portfolioItems.map((item) => (
                <div key={item._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Image */}
                    <div className="flex-shrink-0 w-full sm:w-20">
                      <div className="w-full sm:w-20 h-20 relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-700">
                        {item.coverImage ? (
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-slate-400 dark:text-slate-500 text-xs">Görsel Yok</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1 w-full">
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                            <span>{item.title}</span>
                            {item.featured && (
                              <StarIcon className="w-5 h-5 text-yellow-500" />
                            )}
                          </h4>
                          <div className="text-slate-600 dark:text-slate-300 mb-3">
                            <HTMLContent 
                              content={item.description}
                              truncate={150}
                              className="line-clamp-2"
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>{new Date(item.completionDate).toLocaleDateString('tr-TR')}</span>
                            </div>
                            {item.category && (
                              <div className="flex items-center space-x-1">
                                <TagIcon className="w-4 h-4" />
                                <span>{item.category.name}</span>
                              </div>
                            )}
                            <span>Müşteri: {item.client}</span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/portfolio/${item._id}`}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Görüntüle"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/portfolio/edit/${item._id}`}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-brand-primary-700 dark:hover:text-brand-primary-400 hover:bg-brand-primary-50 dark:hover:bg-brand-primary-900/20 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Add New Category */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Yeni Kategori Ekle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminInput
                  label="Kategori Adı"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Kategori adını girin"
                  required
                />
                <AdminInput
                  label="Açıklama (İsteğe bağlı)"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Kategori açıklaması"
                />
              </div>
              <div className="mt-4">
                <AdminButton
                  variant="primary"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim()}
                  icon={PlusIcon}
                >
                  Kategori Ekle
                </AdminButton>
              </div>
            </div>

            {/* Categories List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Kategoriler</h3>
              </div>
              
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <AdminSpinner size="md" />
                </div>
              ) : categories.length === 0 ? (
                <AdminEmptyState
                  icon={<TagIcon className="w-12 h-12" />}
                  title="Henüz kategori eklenmemiş"
                  description="İlk kategorinizi yukarıdaki formdan ekleyebilirsiniz"
                />
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {categories.map((category) => (
                    <div key={category._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      {editingCategory?._id === category._id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AdminInput
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({
                                ...editingCategory,
                                name: e.target.value
                              })}
                              placeholder="Kategori adı"
                            />
                            <AdminInput
                              value={editingCategory.description || ''}
                              onChange={(e) => setEditingCategory({
                                ...editingCategory,
                                description: e.target.value
                              })}
                              placeholder="Açıklama"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <AdminButton
                              variant="primary"
                              onClick={handleUpdateCategory}
                              icon={CheckIcon}
                              size="sm"
                            >
                              Kaydet
                            </AdminButton>
                            <AdminButton
                              variant="secondary"
                              onClick={() => setEditingCategory(null)}
                              icon={XMarkIcon}
                              size="sm"
                            >
                              İptal
                            </AdminButton>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{category.name}</h4>
                            {category.description && (
                              <p className="text-slate-600 dark:text-slate-300 mt-1">{category.description}</p>
                            )}
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                              Slug: {category.slug}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="p-2 text-slate-600 dark:text-slate-400 hover:text-brand-primary-700 dark:hover:text-brand-primary-400 hover:bg-brand-primary-50 dark:hover:bg-brand-primary-900/20 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayoutNew>
  );
}