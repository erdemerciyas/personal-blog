'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../components/admin/AdminLayout';
import UniversalEditor from '../../../../../components/ui/UniversalEditor';
import PortfolioImageGallery from '../../../../../components/PortfolioImageGallery';
import { 
  PencilIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  StarIcon,
  HashtagIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PlusIcon,
  ArrowLeftIcon,
  CubeIcon,
  CloudArrowUpIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Category, PortfolioItem } from '../../../../../types/portfolio';

import slugify from 'slugify';

type EditForm = Omit<PortfolioItem, 'categoryIds' | 'categoryId' | 'category'> & {
  categoryIds: string[];
  models3D?: Array<{
    url: string;
    name: string;
    format: string;
    size: number;
    downloadable: boolean;
    publicId: string;
    uploadedAt: string;
  }>;
};

export default function EditPortfolioItem({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slugLocked, setSlugLocked] = useState(true);
  const [uploadingModel, setUploadingModel] = useState(false);

  const [formData, setFormData] = useState<EditForm>({
    _id: '',
    title: '',
    slug: '',
    description: '',
    categoryIds: [], // Çoklu kategori desteği (string id listesi)
    client: '',
    completionDate: '',
    technologies: [''],
    coverImage: '',
    images: [],
    // 3D Model desteği
    models3D: [],
    featured: false,
    order: 0,
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => {
      const newSlug = slugLocked ? slugify(newTitle, { lower: true, strict: true }) : prev.slug;
      return { ...prev, title: newTitle, slug: newSlug };
    });
  };


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
        categoryIds = data.categoryIds as unknown as string[];
      } else if (data.categoryId) {
        categoryIds = [data.categoryId as unknown as string];
      }
      
      setFormData({
        ...data,
        categoryIds: categoryIds,
        completionDate: formattedDate,
        technologies: [...data.technologies, ''],
        images: data.images || [],
        models3D: data.models3D || [],
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
        ? prev.categoryIds.filter((id) => id !== categoryId)
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

  // 3D Model yönetimi fonksiyonları
  const handle3DModelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya formatı kontrolü
    const allowedFormats = ['stl', 'obj', 'gltf', 'glb'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      setError('Desteklenmeyen dosya formatı. Sadece STL, OBJ, GLTF, GLB dosyaları kabul edilir.');
      return;
    }

    // Dosya boyutu kontrolü (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Dosya boyutu 50MB\'dan büyük olamaz');
      return;
    }

    setUploadingModel(true);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/3dmodels/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Yükleme başarısız');
      }

      const result = await response.json();
      
      // Form data'ya yeni modeli ekle
      setFormData(prev => ({
        ...prev,
        models3D: [...(prev.models3D || []), {
          _id: new Date().getTime().toString(), // Geçici ID
          url: result.data.url,
          name: result.data.name,
          format: result.data.format,
          size: result.data.size,
          downloadable: false, // Varsayılan olarak indirilebilir değil
          publicId: result.data.publicId,
          uploadedAt: new Date().toISOString(),
        }]
      }));

      // Input'u temizle
      event.target.value = '';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Yükleme sırasında bir hata oluştu';
      setError(msg);
    } finally {
      setUploadingModel(false);
    }
  };

  const remove3DModel = async (index: number) => {
    const model = formData.models3D?.[index];
    if (!model) return;
    
    if (!confirm(`"${model.name}" modelini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      // Cloudinary'den sil
      const response = await fetch(`/api/3dmodels/delete?publicId=${encodeURIComponent(model.publicId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız oldu');
      }

      // Form data'dan kaldır
      setFormData(prev => ({
        ...prev,
        models3D: prev.models3D?.filter((_, i) => i !== index) || []
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Silme sırasında bir hata oluştu';
      setError(msg);
    }
  };

  const toggle3DModelDownloadable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      models3D: prev.models3D?.map((model, i) => 
        i === index ? { ...model, downloadable: !model.downloadable } : model
      ) || []
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <div className="bg-brand-primary-50 border border-brand-primary-200 text-brand-primary-900 p-4 rounded-xl flex items-center space-x-3">
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
              <DocumentTextIcon className="w-5 h-5 text-brand-primary-700" />
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
                  onChange={handleTitleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                  placeholder="Proje başlığı giriniz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL Slug (SEO)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className={`w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent ${slugLocked ? 'bg-slate-100' : ''}`}
                    placeholder="url-uyumlu-metin"
                    required
                    readOnly={slugLocked}
                  />
                  <button
                    type="button"
                    onClick={() => setSlugLocked(!slugLocked)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-brand-primary-700"
                  >
                    {slugLocked ? <PencilIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Müşteri/Şirket *
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
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
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Proje Açıklaması *
                </label>
                <UniversalEditor
                  value={formData.description}
                  onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                  placeholder="Proje hakkında detaylı açıklama yazınız"
                  minHeight="200px"
                />
              </div>
            </div>
          </div>

          {/* Categories Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <TagIcon className="w-5 h-5 text-brand-primary-700" />
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
                    {formData.categoryIds.map((categoryId) => {
                      const category = categories.find(cat => cat._id === categoryId);
                      return category ? (
                        <span
                          key={categoryId}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-primary-100 text-brand-primary-900"
                        >
                          {category.name}
                          <button
                            type="button"
                            onClick={() => handleCategoryToggle(categoryId)}
                            className="ml-2 hover:text-brand-primary-700"
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
                      ? 'border-brand-primary-600 bg-brand-primary-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  onClick={() => handleCategoryToggle(category._id)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded border-2 transition-all ${
                          formData.categoryIds?.includes(category._id)
                            ? 'border-brand-primary-600 bg-brand-primary-600'
                            : 'border-slate-300'
                        }`}>
                          {formData.categoryIds?.includes(category._id) && (
                            <CheckIcon className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className={`font-medium ${
                          formData.categoryIds?.includes(category._id)
                            ? 'text-brand-primary-900'
                            : 'text-slate-700'
                        }`}>
                          {category.name}
                        </span>
                      </div>
                    </div>
                    {category.description && (
                      <p className={`mt-2 text-sm ${
                        formData.categoryIds?.includes(category._id)
                          ? 'text-brand-primary-700'
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
                  className="inline-flex items-center mt-3 text-brand-primary-700 hover:text-brand-primary-800"
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
              <PhotoIcon className="w-5 h-5 text-brand-primary-700" />
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

          {/* 3D Models Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <CubeIcon className="w-5 h-5 text-blue-600" />
                <span>3D Modeller</span>
              </h3>
              
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept=".stl,.obj,.gltf,.glb"
                  onChange={handle3DModelUpload}
                  className="hidden"
                  id="model-upload-edit"
                  disabled={uploadingModel || submitting}
                />
                <label
                  htmlFor="model-upload-edit"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    uploadingModel || submitting
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {uploadingModel ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-4 h-4" />
                      <span>Model Yükle</span>
                    </>
                  )}
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                3D model dosyalarınızı yükleyin. Desteklenen formatlar: STL, OBJ, GLTF, GLB (Maksimum 50MB)
              </p>
            </div>

            {/* 3D Models List */}
            {formData.models3D && formData.models3D.length > 0 ? (
              <div className="space-y-3">
                {formData.models3D.map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center">
                        <CubeIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{model.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <span className="uppercase font-medium">{model.format}</span>
                          <span>•</span>
                          <span>{formatFileSize(model.size)}</span>
                          {model.downloadable && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 font-medium">İndirilebilir</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => toggle3DModelDownloadable(index)}
                        className={`p-2 rounded-lg transition-colors ${
                          model.downloadable
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={model.downloadable ? 'İndirmeyi kapat' : 'İndirmeye aç'}
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => remove3DModel(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Modeli sil"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                <CubeIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 mb-2">Henüz 3D model yüklenmemiş</p>
                <p className="text-sm text-slate-400">
                  Yukarıdaki "Model Yükle" butonunu kullanarak 3D model ekleyebilirsiniz
                </p>
              </div>
            )}

            {/* 3D Model Info */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CubeIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">3D Model Bilgileri:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• GLTF/GLB formatları canlı önizleme destekler</li>
                    <li>• STL/OBJ formatları sadece indirilebilir</li>
                    <li>• İndirme izni model bazında ayarlanabilir</li>
                    <li>• Maksimum dosya boyutu: 50MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <HashtagIcon className="w-5 h-5 text-brand-primary-700" />
                <span>Teknolojiler</span>
              </h3>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, technologies: [...prev.technologies, ''] }))}
                className="flex items-center space-x-2 bg-brand-primary-50 text-brand-primary-700 px-3 py-2 rounded-lg hover:bg-brand-primary-100 transition-colors"
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
                      className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
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
              <StarIcon className="w-5 h-5 text-brand-primary-700" />
              <span>Ek Seçenekler</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-brand-primary-700 border-slate-300 rounded focus:ring-brand-primary-600"
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
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
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
              className="flex items-center space-x-2 bg-brand-primary-700 text-white px-8 py-3 rounded-xl hover:bg-brand-primary-800 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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