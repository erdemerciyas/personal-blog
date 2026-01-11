'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UniversalEditor from '../../../../../components/ui/UniversalEditor';
import PortfolioImageGallery from '../../../../../components/PortfolioImageGallery';
import {
  TagIcon,
  CheckIcon,
  XMarkIcon,
  HashtagIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  ArrowLeftIcon,
  PencilIcon,
  CubeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Category, PortfolioItem } from '../../../../../types/portfolio';
import slugify from 'slugify';
import { useToast } from '../../../../../components/ui/useToast';

type EditForm = Omit<PortfolioItem, 'categoryIds' | 'categoryId' | 'category'> & {
  categoryIds: string[];
  models3D: Array<{
    url: string;
    name: string;
    format: string;
    size: number;
    downloadable: boolean;
    publicId: string;
    uploadedAt: string;
  }>;
  images: string[];
  projectUrl: string;
  githubUrl: string;
};

export default function EditPortfolioItem({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [slugLocked, setSlugLocked] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadingModel, setUploadingModel] = useState(false);

  const [formData, setFormData] = useState<EditForm>({
    _id: '',
    title: '',
    slug: '',
    description: '',
    categoryIds: [],
    client: '',
    completionDate: '',
    technologies: [''],
    coverImage: '',
    images: [],
    models3D: [],
    featured: false,
    order: 0,
    projectUrl: '',
    githubUrl: '',
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
    }
  };

  const fetchPortfolioItem = useCallback(async () => {
    try {
      const response = await fetch(`/api/portfolio/${params.id}`);
      if (!response.ok) throw new Error('Portfolyo öğesi getirilemedi');
      const data = await response.json();

      const date = new Date(data.completionDate);
      const formattedDate = date.toISOString().split('T')[0];

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
        technologies: data.technologies.length > 0 ? [...data.technologies] : [''],
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
    setFieldErrors({});

    try {
      const errs: Record<string, string> = {};
      if (!formData.title.trim()) errs.title = 'Proje başlığı zorunludur';
      if (!formData.slug.trim()) errs.slug = 'URL slug zorunludur';
      if (!formData.client.trim()) errs.client = 'Müşteri/Şirket zorunludur';
      if (!formData.completionDate) errs.completionDate = 'Tamamlanma tarihi zorunludur';
      if (!formData.description.trim()) errs.description = 'Proje açıklaması zorunludur';
      if (formData.categoryIds.length === 0) errs.categoryIds = 'En az bir kategori seçmelisiniz';
      if (formData.images.length === 0) errs.images = 'En az bir proje görseli yüklemelisiniz';
      if (!formData.coverImage) errs.coverImage = 'Kapak görseli seçmelisiniz';

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        const firstErr = Object.values(errs)[0];
        setError(firstErr);
        showToast({ variant: 'danger', title: 'Form hatası', description: firstErr });
        return;
      }

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

      showToast({ variant: 'success', title: 'Başarılı', description: 'Portfolyo öğesi güncellendi' });
      router.push('/admin/portfolio');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(msg);
      showToast({ variant: 'danger', title: 'İşlem başarısız', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
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

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleCoverImageChange = (coverImage: string) => {
    setFormData(prev => ({ ...prev, coverImage }));
  };

  const handle3DModelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedFormats = ['stl', 'obj', 'gltf', 'glb'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      setError('Desteklenmeyen dosya formatı. Sadece STL, OBJ, GLTF, GLB dosyaları kabul edilir.');
      return;
    }

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

      setFormData(prev => ({
        ...prev,
        models3D: [...prev.models3D, {
          url: result.data.url,
          name: result.data.name,
          format: result.data.format,
          size: result.data.size,
          downloadable: false,
          publicId: result.data.publicId,
          uploadedAt: new Date().toISOString(),
          _id: result.data.publicId, // Frontend state requires _id, will be overwritten by DB on save if needed
        }]
      }));

      showToast({ variant: 'success', title: 'Başarılı', description: '3D model başarıyla yüklendi' });
      event.target.value = '';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Yükleme sırasında bir hata oluştu';
      setError(msg);
      showToast({ variant: 'danger', title: 'Yükleme hatası', description: msg });
    } finally {
      setUploadingModel(false);
    }
  };

  const remove3DModel = async (index: number) => {
    const model = formData.models3D[index];
    if (!confirm(`"${model.name}" modelini silmek istediğinizden emin misiniz?`)) return;

    try {
      const response = await fetch(`/api/3dmodels/delete?publicId=${encodeURIComponent(model.publicId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Silme işlemi başarısız oldu');

      setFormData(prev => ({
        ...prev,
        models3D: prev.models3D.filter((_, i) => i !== index)
      }));

      showToast({ variant: 'success', title: 'Başarılı', description: '3D model silindi' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Silme sırasında bir hata oluştu';
      setError(msg);
      showToast({ variant: 'danger', title: 'Silme hatası', description: msg });
    }
  };

  const toggle3DModelDownloadable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      models3D: prev.models3D.map((model, i) =>
        i === index ? { ...model, downloadable: !model.downloadable } : model
      )
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Portfolyo Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/portfolio"
            className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200"
          >
            <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projeyi Düzenle</h1>
            <p className="text-sm text-slate-500">{formData.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/portfolio"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            İptal
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Güncelleniyor...
              </>
            ) : (
              <>
                <CheckIcon className="w-5 h-5 mr-2" />
                Değişiklikleri Kaydet
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Visual Media (40%) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <PhotoIcon className="w-5 h-5 text-indigo-500" />
                Medya Galeri
              </h2>
              <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                {formData.images.length} Görsel
              </span>
            </div>
            <div className="p-4">
              <PortfolioImageGallery
                images={formData.images}
                coverImage={formData.coverImage}
                onImagesChange={handleImagesChange}
                onCoverImageChange={handleCoverImageChange}
                disabled={submitting}
                pageContext="portfolio"
              />
              {fieldErrors.images && <p className="mt-2 text-xs text-red-600 font-medium">{fieldErrors.images}</p>}
              {fieldErrors.coverImage && <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.coverImage}</p>}
            </div>
          </div>

          {/* 3D Models */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <CubeIcon className="w-5 h-5 text-blue-500" />
                3D Varlıklar
              </h2>
              <label className={`cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors ${uploadingModel ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  accept=".stl,.obj,.gltf,.glb"
                  onChange={handle3DModelUpload}
                  className="hidden"
                  disabled={uploadingModel || submitting}
                />
                {uploadingModel ? 'Yükleniyor...' : '+ Model Ekle'}
              </label>
            </div>

            <div className="p-4 space-y-3">
              {formData.models3D && formData.models3D.length > 0 ? (
                formData.models3D.map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50 hover:border-slate-300 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                        <CubeIcon className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate" title={model.name}>{model.name}</p>
                        <p className="text-xs text-slate-500 uppercase">{model.format} • {formatFileSize(model.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => toggle3DModelDownloadable(index)}
                        className={`p-1.5 rounded-lg transition-colors ${model.downloadable ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:bg-white'}`}
                        title={model.downloadable ? 'İndirilebilir' : 'İndirilemez'}
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove3DModel(index)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-sm text-slate-400">Henüz 3D model eklenmemiş</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Content (60%) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">Proje Başlığı</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={handleTitleChange}
                className={`w-full px-0 py-2 border-b-2 border-slate-200 focus:border-indigo-600 bg-transparent text-xl font-bold placeholder-slate-300 focus:outline-none transition-colors ${fieldErrors.title ? 'border-red-400' : ''}`}
                placeholder="Projenize bir isim verin"
              />
              {fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">URL Slug</label>
                <div className={`flex items-center border rounded-lg bg-slate-50 px-3 py-2 transition-colors ${fieldErrors.slug ? 'border-red-300' : 'border-slate-200 focus-within:border-indigo-500 focus-within:bg-white'}`}>
                  <span className="text-slate-400 text-sm mr-1">/portfolio/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    readOnly={slugLocked}
                    className="flex-1 bg-transparent border-none text-sm text-slate-700 focus:ring-0 p-0"
                  />
                  <button
                    type="button"
                    onClick={() => setSlugLocked(!slugLocked)}
                    className="ml-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {slugLocked ? <PencilIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Müşteri</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Şirket veya Kişi Adı"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
              <UniversalEditor
                value={formData.description}
                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                placeholder="Projenin hikayesini anlatın..."
                minHeight="300px"
              />
              {fieldErrors.description && <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>}
            </div>
          </div>

          {/* Metadata & Tech */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-emerald-500" />
                  Kategoriler
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat._id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.categoryIds.includes(cat._id)
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'
                        }`}
                    >
                      {cat.name}
                      {formData.categoryIds.includes(cat._id) && <CheckIcon className="w-3 h-3 inline-block ml-1" />}
                    </button>
                  ))}
                </div>
                {fieldErrors.categoryIds && <p className="mt-2 text-xs text-red-600">{fieldErrors.categoryIds}</p>}
              </div>

              {/* Date */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-amber-500" />
                  Tamamlanma Tarihi
                </h3>
                <input
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Technologies */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HashtagIcon className="w-4 h-4 text-violet-500" />
                Teknolojiler
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((tech, index) => (
                  <div key={index} className="relative group">
                    <input
                      type="text"
                      value={tech}
                      onChange={(e) => handleTechnologyChange(index, e.target.value)}
                      placeholder="+ Ekle"
                      className="w-32 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:w-48 focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                    {tech && (
                      <button
                        type="button"
                        onClick={() => removeTechnology(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
