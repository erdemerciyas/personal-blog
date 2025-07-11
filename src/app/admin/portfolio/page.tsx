'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import UniversalLoader from '../../../components/UniversalLoader';
import AdminLayout from '../../../components/admin/AdminLayout';
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
  const { data: session, status } = useSession();
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
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <UniversalLoader size="xl" color="primary">
              Portfolyo yükleniyor...
            </UniversalLoader>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AdminLayout 
      title="Portfolyo Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Portfolyo Yönetimi' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => handleTabChange('projects')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                activeTab === 'projects'
                  ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FolderOpenIcon className="w-5 h-5" />
                <span>Projeler ({portfolioItems.length})</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('categories')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                activeTab === 'categories'
                  ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <TagIcon className="w-5 h-5" />
                <span>Kategoriler ({categories.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Projelerinizi düzenleyin ve yönetin</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500 mt-2">
                  <span>Toplam: {portfolioItems.length} proje</span>
                  <span>•</span>
                  <span>Öne çıkan: {portfolioItems.filter(item => item.featured).length}</span>
                </div>
              </div>
              <Link
                href="/admin/portfolio/new"
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-sm"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Yeni Proje</span>
              </Link>
            </div>

        {/* Portfolio Items */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Projeler</h3>
          </div>
          
          <div className="divide-y divide-slate-200">
            {portfolioItems.length === 0 ? (
              <div className="p-12 text-center">
                <FolderOpenIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">Henüz proje eklenmemiş</p>
                <p className="text-slate-500 mt-2">İlk projenizi eklemek için "Yeni Proje" butonuna tıklayın</p>
              </div>
            ) : (
              portfolioItems.map((item) => (
                <div key={item._id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded-xl object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-900 mb-2 flex items-center space-x-2">
                            <span>{item.title}</span>
                            {item.featured && (
                              <StarIcon className="w-5 h-5 text-yellow-500" />
                            )}
                          </h4>
                          <div className="text-slate-600 mb-3">
                            <HTMLContent 
                              content={item.description}
                              truncate={150}
                              className="line-clamp-2"
                            />
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
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
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            href={`/portfolio/${item._id}`}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Görüntüle"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/portfolio/edit/${item._id}`}
                            className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Yeni Kategori Ekle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kategori Adı
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Kategori adını girin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Açıklama (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Kategori açıklaması"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Kategori Ekle</span>
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Kategoriler</h3>
              </div>
              
              {categoriesLoading ? (
                <div className="p-12 text-center">
                  <UniversalLoader size="lg" color="secondary">
                    Kategoriler yükleniyor...
                  </UniversalLoader>
                </div>
              ) : categories.length === 0 ? (
                <div className="p-12 text-center">
                  <TagIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg">Henüz kategori eklenmemiş</p>
                  <p className="text-slate-500 mt-2">İlk kategorinizi yukarıdaki formdan ekleyebilirsiniz</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {categories.map((category) => (
                    <div key={category._id} className="p-6 hover:bg-slate-50 transition-colors">
                      {editingCategory?._id === category._id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({
                                ...editingCategory,
                                name: e.target.value
                              })}
                              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              value={editingCategory.description || ''}
                              onChange={(e) => setEditingCategory({
                                ...editingCategory,
                                description: e.target.value
                              })}
                              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Açıklama"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdateCategory}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1"
                            >
                              <CheckIcon className="w-4 h-4" />
                              <span>Kaydet</span>
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1"
                            >
                              <XMarkIcon className="w-4 h-4" />
                              <span>İptal</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900">{category.name}</h4>
                            {category.description && (
                              <p className="text-slate-600 mt-1">{category.description}</p>
                            )}
                            <p className="text-sm text-slate-500 mt-2">
                              Slug: {category.slug}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <TrashIcon className="w-4 h-4" />
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
    </AdminLayout>
  );
} 