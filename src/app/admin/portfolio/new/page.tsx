'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UniversalEditor from '../../../../components/ui/UniversalEditor';
import PortfolioImageGallery from '../../../../components/PortfolioImageGallery';
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
import { Category } from '../../../../types/portfolio';
import slugify from 'slugify';
import { useToast } from '../../../../components/ui/useToast';
import { useActiveLanguages } from '@/hooks/useActiveLanguages';
import LanguageTabs from '@/components/admin/LanguageTabs';
import { Card, CardHeader, CardTitle, CardBody, Button, Badge, FormSection, Alert } from '@/components/ui';

interface TranslationFields {
  title: string;
  description: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
}

const emptyTranslation = (): TranslationFields => ({
  title: '',
  description: '',
  excerpt: '',
  metaDescription: '',
  keywords: [],
});

export default function NewPortfolioItem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [slugLocked, setSlugLocked] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadingModel, setUploadingModel] = useState(false);

  const { languages, defaultLanguage, loading: langsLoading, error: langsError } = useActiveLanguages();
  const [activeLanguage, setActiveLanguage] = useState<string>('');
  const [translations, setTranslations] = useState<Record<string, TranslationFields>>({});

  useEffect(() => {
    if (languages.length > 0 && Object.keys(translations).length === 0) {
      const initTrans: Record<string, TranslationFields> = {};
      languages.forEach((lang) => {
        initTrans[lang.code] = emptyTranslation();
      });
      setTranslations(initTrans);
      if (!activeLanguage && defaultLanguage) {
        setActiveLanguage(defaultLanguage.code);
      }
    }
  }, [languages, defaultLanguage]);

  const currentTranslation = translations[activeLanguage] || emptyTranslation();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    categoryIds: [] as string[],
    client: '',
    completionDate: '',
    technologies: [''],
    coverImage: '',
    images: [] as string[],
    models3D: [] as Array<{
      url: string;
      name: string;
      format: string;
      size: number;
      downloadable: boolean;
      publicId: string;
      uploadedAt: string;
    }>,
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
      const response = await fetch('/api/public/categories');
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
    setSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      // Use default language translation for validation
      const defLangCodeForValidation = defaultLanguage?.code || activeLanguage;
      const defTransForValidation = translations[defLangCodeForValidation] || emptyTranslation();

      const errs: Record<string, string> = {};
      if (!defTransForValidation.title.trim()) errs.title = 'Proje başlığı zorunludur';
      if (!formData.slug.trim() && !defTransForValidation.title.trim()) errs.slug = 'URL slug zorunludur';
      if (!formData.client.trim()) errs.client = 'Müşteri/Şirket zorunludur';
      if (!formData.completionDate) errs.completionDate = 'Tamamlanma tarihi zorunludur';
      if (!defTransForValidation.description.trim()) errs.description = 'Proje açıklaması zorunludur';
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

      // Sync default language translation to top-level fields
      const defLangCode = defaultLanguage?.code || activeLanguage;
      const defTrans = translations[defLangCode] || emptyTranslation();

      // Filter out empty translations
      const filteredTranslations: Record<string, TranslationFields> = {};
      for (const [code, trans] of Object.entries(translations)) {
        if (trans.title || trans.description) {
          filteredTranslations[code] = trans;
        }
      }

      const cleanedData = {
        ...formData,
        title: defTrans.title || formData.title,
        description: defTrans.description || formData.description,
        translations: filteredTranslations,
        technologies: formData.technologies.filter(tech => tech.trim() !== ''),
        images: formData.images.filter(img => img.trim() !== ''),
      };

      const response = await fetch('/api/public/portfolio', {
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

      showToast({ variant: 'success', title: 'Başarılı', description: 'Portfolyo öğesi oluşturuldu' });
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

      const response = await fetch('/api/public/3dmodels/upload', {
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
      const response = await fetch(`/api/public/3dmodels/delete?publicId=${encodeURIComponent(model.publicId)}`, {
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
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 z-20 bg-surface-secondary/80 backdrop-blur-sm py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/portfolio"
            className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-border"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Yeni Proje</h1>
            <p className="text-sm text-gray-500">Portfolyonuza yeni bir eser ekleyin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/portfolio"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            İptal
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            loading={submitting}
            variant="primary"
            size="lg"
            className="rounded-xl font-semibold"
          >
            {!submitting && <CheckIcon className="w-5 h-5" />}
            {submitting ? 'Kaydediliyor...' : 'Projeyi Yayınla'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" icon={<ExclamationTriangleIcon className="w-5 h-5" />} className="mb-8">
          <span className="font-medium">{error}</span>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Visual Media (40%) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Image Gallery */}
          <Card padding="none" className="rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border-subtle bg-surface-secondary/50 flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PhotoIcon className="w-5 h-5 text-brand-500" />
                Medya Galeri
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {formData.images.length} Görsel
              </Badge>
            </div>
            <CardBody className="p-4">
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
            </CardBody>
          </Card>

          {/* 3D Models */}
          <Card padding="none" className="rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border-subtle bg-surface-secondary/50 flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CubeIcon className="w-5 h-5 text-blue-500" />
                3D Varlıklar
              </CardTitle>
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

            <CardBody className="p-4 space-y-3">
              {formData.models3D.length > 0 ? (
                formData.models3D.map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border-subtle rounded-xl bg-surface-secondary hover:border-gray-300 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-white border border-border rounded-lg flex items-center justify-center shrink-0">
                        <CubeIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={model.name}>{model.name}</p>
                        <p className="text-xs text-gray-500 uppercase">{model.format} • {formatFileSize(model.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => toggle3DModelDownloadable(index)}
                        className={`p-1.5 rounded-lg transition-colors ${model.downloadable ? 'text-success-dark bg-success-light' : 'text-gray-400 hover:bg-white'}`}
                        title={model.downloadable ? 'İndirilebilir' : 'İndirilemez'}
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove3DModel(index)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-border-subtle rounded-xl">
                  <p className="text-sm text-gray-400">Henüz 3D model eklenmemiş</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Content (60%) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Language Tabs */}
          {!langsLoading && (
            <LanguageTabs
              languages={languages}
              activeLanguage={activeLanguage}
              onLanguageChange={setActiveLanguage}
              translations={translations}
              error={langsError}
            />
          )}

          {/* Basic Info - Per Language */}
          <Card className="rounded-2xl space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Proje Başlığı
                {activeLanguage && (
                  <Badge variant="primary" className="ml-2">
                    {languages.find(l => l.code === activeLanguage)?.flag} {languages.find(l => l.code === activeLanguage)?.nativeLabel}
                  </Badge>
                )}
              </label>
              <input
                type="text"
                id="title"
                value={currentTranslation.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setTranslations(prev => ({
                    ...prev,
                    [activeLanguage]: { ...prev[activeLanguage], title: newTitle }
                  }));
                  // Sync slug from default language title
                  if (activeLanguage === defaultLanguage?.code && slugLocked) {
                    setFormData(prev => ({
                      ...prev,
                      title: newTitle,
                      slug: slugify(newTitle, { lower: true, strict: true })
                    }));
                  }
                }}
                className={`w-full px-0 py-2 border-b-2 border-border focus:border-brand-600 bg-transparent text-xl font-bold placeholder-gray-300 focus:outline-none transition-colors ${fieldErrors.title ? 'border-red-400' : ''}`}
                placeholder="Projenize bir isim verin"
              />
              {fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">URL Slug</label>
                <div className={`flex items-center border rounded-lg bg-surface-secondary px-3 py-2 transition-colors ${fieldErrors.slug ? 'border-red-300' : 'border-border focus-within:border-brand-500 focus-within:bg-white'}`}>
                  <span className="text-gray-400 text-sm mr-1">/portfolio/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    readOnly={slugLocked}
                    className="flex-1 bg-transparent border-none text-sm text-gray-700 focus:ring-0 p-0"
                  />
                  <button
                    type="button"
                    onClick={() => setSlugLocked(!slugLocked)}
                    className="ml-2 text-gray-400 hover:text-brand-600 transition-colors"
                  >
                    {slugLocked ? <PencilIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Müşteri</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="Şirket veya Kişi Adı"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
              <UniversalEditor
                key={activeLanguage}
                value={currentTranslation.description}
                onChange={(content) => setTranslations(prev => ({
                  ...prev,
                  [activeLanguage]: { ...prev[activeLanguage], description: content }
                }))}
                placeholder="Projenin hikayesini anlatın..."
                minHeight="300px"
              />
              {fieldErrors.description && <p className="mt-1 text-xs text-red-600">{fieldErrors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kısa Açıklama (Özet)</label>
              <textarea
                rows={2}
                value={currentTranslation.excerpt}
                onChange={(e) => setTranslations(prev => ({
                  ...prev,
                  [activeLanguage]: { ...prev[activeLanguage], excerpt: e.target.value }
                }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-600 placeholder:text-gray-400 resize-y"
                placeholder="Proje için kısa açıklama..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Açıklaması (SEO)</label>
              <textarea
                rows={2}
                maxLength={160}
                value={currentTranslation.metaDescription}
                onChange={(e) => setTranslations(prev => ({
                  ...prev,
                  [activeLanguage]: { ...prev[activeLanguage], metaDescription: e.target.value }
                }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-600 placeholder:text-gray-400 resize-y"
                placeholder="SEO meta açıklaması..."
              />
              <p className="text-xs text-gray-500 mt-1">{currentTranslation.metaDescription.length}/160 karakter</p>
            </div>
          </Card>

          {/* Metadata & Tech */}
          <Card className="rounded-2xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-success" />
                  Kategoriler
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat._id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.categoryIds.includes(cat._id)
                          ? 'bg-success-light border-success/20 text-success-dark'
                          : 'bg-white border-border text-gray-600 hover:border-success/20'
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
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-warning" />
                  Tamamlanma Tarihi
                </h3>
                <input
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Technologies */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                      className="w-32 px-3 py-1.5 bg-surface-secondary border border-border rounded-lg text-sm focus:w-48 focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
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
          </Card>
        </div>
      </div>
    </div>
  );
}
