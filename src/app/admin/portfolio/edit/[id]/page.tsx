'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../components/admin/AdminLayout';
import RichTextEditor from '../../../../../components/RichTextEditor';
import PortfolioImageGallery from '../../../../../components/PortfolioImageGallery';
import { 
  PencilIcon,
  FolderOpenIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  StarIcon,
  HashtagIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PlusIcon,
  ArrowLeftIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Category, PortfolioItem } from '../../../../../types/portfolio';

export default function EditPortfolioItem({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<PortfolioItem>({
    _id: '',
    title: '',
    description: '',
    categoryIds: [], // Çoklu kategori desteği
    client: '',
    completionDate: '',
    technologies: [''],
    coverImage: '',
    images: [],
    featured: false,
    order: 0,
  });

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Kategoriler getirilemedi');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Kategoriler yüklenirken bir hata oluştu');
      console.error(err);
    }
  };

  const fetchPortfolioItem = useCallback(async () => {
    try {
      const response = await fetch(`/api/portfolio/${params.id}`);
      if (!response.ok) throw new Error('Portfolyo öğesi getirilemedi');
      const data = await response.json();
      
      // Tarihi YYYY-MM-DD formatına çevir
      const date = new Date(data.completionDate);
      const formattedDate = date.toISOString().split('T')[0];
      
      // Çoklu kategori desteği - mevcut veriyi uygun formata çevir
      let categoryIds: string[] = [];
      if (data.categoryIds && data.categoryIds.length > 0) {
        categoryIds = data.categoryIds;
      } else if (data.categoryId) {
        categoryIds = [data.categoryId];
      }
      
      setFormData({
        ...data,
        categoryIds: categoryIds,
        completionDate: formattedDate,
        technologies: [...data.technologies, ''],
        images: data.images || [],
      });
    } catch (err) {
      setError('Portfolyo öğesi yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCategories();
      fetchPortfolioItem();
    } else if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router, fetchPortfolioItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validate that at least one category is selected
      if (!formData.categoryIds || formData.categoryIds.length === 0) {
        throw new Error('En az bir kategori seçmelisiniz');
      }

      // Validate that at least one image is uploaded
      if (!formData.images || formData.images.length === 0) {
        throw new Error('En az bir proje görseli yüklemelisiniz');
      }

      // Validate that cover image is set
      if (!formData.coverImage) {
        throw new Error('Kapak görseli seçmelisiniz');
      }

      // Prepare cleaned data
      const cleanedData = {
        ...formData,
        technologies: formData.technologies.filter(tech => tech.trim() !== ''),
        images: formData.images.filter(img => img.trim() !== ''),
      };

      const response = await fetch(`/api/portfolio/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/portfolio');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Çoklu kategori seçimi için yardımcı fonksiyonlar
  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds?.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...(prev.categoryIds || []), categoryId]
    }));
  };

  const handleTechnologyChange = (index: number, value: string) => {
    const newTechnologies = [...formData.technologies];
    newTechnologies[index] = value;
    
    if (index === newTechnologies.length - 1 && value.trim() !== '') {
      newTechnologies.push('');
    }
    
    setFormData(prev => ({
      ...prev,
      technologies: newTechnologies,
    }));
  };

  const removeTechnology = (index: number) => {
    const newTechnologies = formData.technologies.filter((_, i) => i !== index);
    if (newTechnologies.length === 0) {
      newTechnologies.push('');
    }
    setFormData(prev => ({
      ...prev,
      technologies: newTechnologies,
    }));
  };

  // Portfolio Image Gallery handlers
  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleCoverImageChange = (coverImage: string) => {
    setFormData(prev => ({ ...prev, coverImage }));
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-slate-600">Portfolio yükleniyor...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!session?.user || !formData._id) {
    return null;
  }

  return (
    <AdminLayout 
      title="Portfolio Düzenle"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Portfolio', href: '/admin/portfolio' },
        { label: 'Düzenle' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Info */}
        <div className="mb-6">
          <p className="text-slate-600">{formData.title} projesini düzenleyin</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center space-x-3">
            <CheckIcon className="w-5 h-5" />
            <span>Portfolio başarıyla güncellendi! Yönlendiriliyorsunuz...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5 text-teal-600" />
              <span>Temel Bilgiler</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Proje Başlığı *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Proje başlığı giriniz"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Müşteri/Şirket *
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Müşteri veya şirket adı"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tamamlanma Tarihi *
                </label>
                <input
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Proje Açıklaması *
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                  placeholder="Proje hakkında detaylı açıklama yazınız"
                  maxLength={5000}
                  required
                />
              </div>
            </div>
          </div>

          {/* Categories Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <TagIcon className="w-5 h-5 text-teal-600" />
              <span>Kategoriler *</span>
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-3">
                Projeniz için uygun kategorileri seçin. Birden fazla kategori seçebilirsiniz.
              </p>
              
              {/* Selected Categories Display */}
              {formData.categoryIds && formData.categoryIds.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Seçili Kategoriler ({formData.categoryIds.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.categoryIds.map(categoryId => {
                      const category = categories.find(cat => cat._id === categoryId);
                      return category ? (
                        <span
                          key={categoryId}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                        >
                          {category.name}
                          <button
                            type="button"
                            onClick={() => handleCategoryToggle(categoryId)}
                            className="ml-2 hover:text-teal-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Category Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className={`relative rounded-lg border-2 transition-all cursor-pointer ${
                    formData.categoryIds?.includes(category._id)
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  onClick={() => handleCategoryToggle(category._id)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded border-2 transition-all ${
                          formData.categoryIds?.includes(category._id)
                            ? 'border-teal-500 bg-teal-500'
                            : 'border-slate-300'
                        }`}>
                          {formData.categoryIds?.includes(category._id) && (
                            <CheckIcon className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className={`font-medium ${
                          formData.categoryIds?.includes(category._id)
                            ? 'text-teal-800'
                            : 'text-slate-700'
                        }`}>
                          {category.name}
                        </span>
                      </div>
                    </div>
                    {category.description && (
                      <p className={`mt-2 text-sm ${
                        formData.categoryIds?.includes(category._id)
                          ? 'text-teal-600'
                          : 'text-slate-500'
                      }`}>
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {categories.length === 0 && (
              <div className="text-center py-8">
                <TagIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">
                  Henüz kategori bulunmuyor. Önce kategori oluşturun.
                </p>
                <Link 
                  href="/admin/portfolio?tab=categories"
                  className="inline-flex items-center mt-3 text-teal-600 hover:text-teal-700"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Kategori Oluştur
                </Link>
              </div>
            )}
          </div>

          {/* Project Images Gallery */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <PhotoIcon className="w-5 h-5 text-teal-600" />
              <span>Proje Görselleri *</span>
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                Projeniz için görselleri toplu olarak yükleyin ve kapak görseli seçin. 
                Mevcut görselleri düzenleyebilir, yenilerini ekleyebilirsiniz.
              </p>
            </div>

            <PortfolioImageGallery
              images={formData.images || []}
              coverImage={formData.coverImage}
              onImagesChange={handleImagesChange}
              onCoverImageChange={handleCoverImageChange}
              disabled={submitting}
              pageContext="portfolio"
            />
          </div>

          {/* Technologies */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <HashtagIcon className="w-5 h-5 text-teal-600" />
                <span>Teknolojiler</span>
              </h3>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, technologies: [...prev.technologies, ''] }))}
                className="flex items-center space-x-2 bg-teal-50 text-teal-600 px-3 py-2 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Teknoloji Ekle</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.technologies.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">
                  Henüz teknoloji eklenmedi. Yukarıdaki butonu kullanarak teknoloji ekleyebilirsiniz.
                </p>
              ) : (
                formData.technologies.map((tech, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={tech}
                      onChange={(e) => handleTechnologyChange(index, e.target.value)}
                      className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Teknoloji adı (örn: 3D Tarama, CAD Tasarım)"
                    />
                    <button
                      type="button"
                      onClick={() => removeTechnology(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Additional Options */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <StarIcon className="w-5 h-5 text-teal-600" />
              <span>Ek Seçenekler</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Öne Çıkan Proje</span>
                </label>
                <p className="text-sm text-slate-500 mt-1 ml-7">
                  Ana sayfada öne çıkan projeler bölümünde gösterilir
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sıralama
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Düşük sayılar önce gösterilir
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between pt-6">
            <Link
              href="/admin/portfolio"
              className="flex items-center space-x-2 px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Geri Dön</span>
            </Link>
            
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <div className="flex flex-col items-center space-y-4">
                    <p className="text-white">Güncelleniyor...</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Güncelle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 