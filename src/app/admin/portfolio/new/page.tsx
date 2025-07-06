'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../components/admin/AdminLayout';
import ImageUpload from '../../../../components/ImageUpload';
import RichTextEditor from '../../../../components/RichTextEditor';
import { 
  PlusIcon,
  FolderOpenIcon,
  TagIcon,
  ClockIcon,
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
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

// Random placeholder images for fallback
const RANDOM_IMAGES = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop&crop=center'
];

export default function NewPortfolioItem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
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
    projectUrl: '',
    githubUrl: '',
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
      setLoading(true);
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

      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Bir hata oluştu');
      }

      router.push('/admin/portfolio');
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

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            <p className="text-slate-600">Sayfa yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout 
      title="Yeni Portfolio Öğesi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Portfolio', href: '/admin/portfolio' },
        { label: 'Yeni Öğe' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Info */}
        <div className="mb-6">
          <p className="text-slate-600">Yeni portfolio öğesi ekleyin</p>
        </div>

        {/* Error Message */}
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
            
            <div className="space-y-4">
              {formData.images.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">
                  Henüz proje görseli eklenmedi. Yukarıdaki butonu kullanarak görsel ekleyebilirsiniz.
                </p>
              ) : (
                formData.images.map((image, index) => (
                  <div key={index} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-slate-700">
                        Görsel {index + 1}
                      </label>
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
                      label={`Görsel ${index + 1}`}
                      className="w-full"
                      showUrlInput={true}
                      showAIGeneration={true}
                      projectTitle={formData.title}
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
              disabled={submitting}
              className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Ekleniyor...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Proje Ekle</span>
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