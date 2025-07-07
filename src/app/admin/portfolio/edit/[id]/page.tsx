'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../components/admin/AdminLayout';
import ImageUpload from '../../../../../components/ImageUpload';
import RichTextEditor from '../../../../../components/RichTextEditor';
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

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  categoryId: string;
  client: string;
  completionDate: string;
  technologies: string[];
  coverImage: string;
  images: string[];
  featured: boolean;
  order: number;
}

// Random placeholder images for fallback
const RANDOM_IMAGES = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop&crop=center'
];

export default function EditPortfolioItem({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<PortfolioItem>({
    _id: '',
    title: '',
    description: '',
    categoryId: '',
    client: '',
    completionDate: '',
    technologies: [''],
    coverImage: '',
    images: [''],
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
      
      setFormData({
        ...data,
        completionDate: formattedDate,
        technologies: [...data.technologies, ''],
        images: [...data.images, ''],
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

  const getRandomImage = () => {
    return RANDOM_IMAGES[Math.floor(Math.random() * RANDOM_IMAGES.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Prepare cleaned data
      const cleanedData = {
        ...formData,
        technologies: formData.technologies.filter(tech => tech.trim() !== ''),
        images: formData.images.filter(img => img.trim() !== ''),
        // Use random image if no cover image is provided
        coverImage: formData.coverImage || getRandomImage(),
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

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    
    if (index === newImages.length - 1 && value.trim() !== '') {
      newImages.push('');
    }
    
    setFormData(prev => ({
      ...prev,
      images: newImages,
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

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    if (newImages.length === 0) {
      newImages.push('');
    }
    setFormData(prev => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleCoverImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, coverImage: url }));
  };

  const handleCoverImageRemove = () => {
    setFormData(prev => ({ ...prev, coverImage: '' }));
  };

  // Drag & Drop functions for image reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...formData.images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove the dragged item
    newImages.splice(draggedIndex, 1);
    
    // Insert at the new position
    newImages.splice(dropIndex, 0, draggedImage);
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            <p className="text-slate-600">Portfolio yükleniyor...</p>
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
                  Kategori *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Kategori seçiniz</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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

          {/* Cover Image */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <PhotoIcon className="w-5 h-5 text-teal-600" />
              <span>Kapak Görseli</span>
            </h3>
            
            <ImageUpload
              onImageUpload={handleCoverImageUpload}
              onImageRemove={handleCoverImageRemove}
              currentImage={formData.coverImage}
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

                    {/* Project Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <PhotoIcon className="w-5 h-5 text-teal-600" />
                <span>Proje Görselleri</span>
              </h3>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))}
                className="flex items-center space-x-2 bg-teal-50 text-teal-600 px-3 py-2 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Görsel Ekle</span>
              </button>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                <strong>💡 İpucu:</strong> Görselleri sürükleyip bırakarak slider sırasını değiştirebilirsiniz.
              </p>
            </div>
            
            <div className="space-y-4">
              {formData.images.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">
                  Henüz proje görseli eklenmedi. Yukarıdaki butonu kullanarak görsel ekleyebilirsiniz.
                </p>
              ) : (
                formData.images.map((image, index) => (
                  <div 
                    key={index}
                    draggable={image.trim() !== ''}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`border border-slate-200 rounded-xl p-4 transition-all ${
                      draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-sm'
                    } ${image.trim() !== '' ? 'cursor-move' : ''}`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      {/* Drag Handle */}
                      {image.trim() !== '' && (
                        <div className="flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-600">
                          <Bars3Icon className="w-4 h-4" />
                        </div>
                      )}
                      
                      {/* Image Preview */}
                      {image.trim() !== '' && (
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={image} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Label and Position */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-slate-700">
                            Görsel {index + 1}
                          </label>
                          {image.trim() !== '' && (
                            <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-md">
                              Sıra: {index + 1}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <ImageUpload
                      value={image}
                      onChange={(url) => {
                        if (Array.isArray(url)) {
                          // Çoklu seçim durumunda tüm URL'leri ekle
                          const newImages = [...formData.images];
                          newImages.splice(index, 1, ...url);
                          // Boş stringleri temizle ve son boş string ekle
                          const cleanedImages = newImages.filter(img => img.trim() !== '');
                          cleanedImages.push('');
                          setFormData(prev => ({ ...prev, images: cleanedImages }));
                        } else {
                          handleImageChange(index, url);
                        }
                      }}
                      onRemove={() => handleImageChange(index, '')}
                      label=""
                      className="w-full"
                      showUrlInput={true}
                      pageContext="portfolio"
                      allowMultipleSelect={true}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <TagIcon className="w-5 h-5 text-teal-600" />
              <span>Ek Ayarlar</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sıralama
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="0"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span>Öne çıkan proje</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Güncelleniyor...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Değişiklikleri Kaydet</span>
                </>
              )}
            </button>
            
            <Link
              href="/admin/portfolio"
              className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Geri Dön</span>
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 