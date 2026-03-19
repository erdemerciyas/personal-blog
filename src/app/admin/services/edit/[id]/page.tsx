'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ImageUpload from '../../../../../components/ImageUpload';
import UniversalEditor from '../../../../../components/ui/UniversalEditor';
import HTMLContent from '../../../../../components/HTMLContent';
import LanguageTabs from '../../../../../components/admin/LanguageTabs';
import { useActiveLanguages } from '../../../../../hooks/useActiveLanguages';
import { Card, Button, Badge, Alert, PageHeader } from '@/components/ui';
import {
  WrenchScrewdriverIcon,
  PhotoIcon,
  DocumentTextIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  ListBulletIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface TranslationFields {
  title: string;
  description: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
}

interface Service {
  _id: string;
  title: string;
  description: string;
  image: string;
  features?: string[];
  translations?: Record<string, Partial<TranslationFields>>;
}

export default function EditServicePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [features, setFeatures] = useState<string[]>(['']);
  const [serviceImage, setServiceImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Multilingual
  const { languages, defaultLanguage, loading: langsLoading, error: langsError } = useActiveLanguages();
  const [activeLanguage, setActiveLanguage] = useState('');
  const [translations, setTranslations] = useState<Record<string, TranslationFields>>({});
  const translationsInitialized = useRef(false);

  // Set default active language
  useEffect(() => {
    if (defaultLanguage && !activeLanguage) {
      setActiveLanguage(defaultLanguage.code);
    }
  }, [defaultLanguage, activeLanguage]);

  // Initialize translations when service and languages are loaded
  useEffect(() => {
    if (!service?._id || languages.length === 0 || translationsInitialized.current) return;

    const initTranslations: Record<string, TranslationFields> = {};
    const existingTranslations = service.translations || {};

    for (const lang of languages) {
      const existing = existingTranslations[lang.code];
      if (existing) {
        initTranslations[lang.code] = {
          title: existing.title || '',
          description: existing.description || '',
          excerpt: existing.excerpt || '',
          metaDescription: existing.metaDescription || '',
          keywords: existing.keywords || [],
        };
      } else if (lang.isDefault) {
        // Pre-fill default language from top-level fields
        initTranslations[lang.code] = {
          title: service.title || '',
          description: service.description || '',
          excerpt: '',
          metaDescription: '',
          keywords: [],
        };
      } else {
        initTranslations[lang.code] = {
          title: '',
          description: '',
          excerpt: '',
          metaDescription: '',
          keywords: [],
        };
      }
    }

    setTranslations(initTranslations);
    translationsInitialized.current = true;
  }, [service, languages]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/public/services/${params.id}`);
        if (!response.ok) {
          throw new Error('Servis yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        setService(data);
        setServiceImage(data.image || '');
        setFeatures(data.features && data.features.length > 0 ? data.features : ['']);
      } catch {
        setError('Servis bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [params.id]);

  const currentTranslation = translations[activeLanguage] || {
    title: '', description: '', excerpt: '', metaDescription: '', keywords: [],
  };

  const updateTranslation = (field: keyof TranslationFields, value: string | string[]) => {
    setTranslations(prev => ({
      ...prev,
      [activeLanguage]: {
        ...prev[activeLanguage],
        [field]: value,
      },
    }));
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    // Validate default language title
    const defLang = defaultLanguage?.code || activeLanguage;
    const defTrans = translations[defLang];
    if (!defTrans?.title?.trim()) {
      setError('Varsayılan dilde başlık zorunludur');
      setSaving(false);
      return;
    }

    const filteredFeatures = features.filter(feature => feature.trim() !== '');

    const data = {
      title: defTrans.title,
      description: defTrans.description || '',
      image: serviceImage || '',
      features: filteredFeatures,
      translations,
    };

    try {
      const response = await fetch(`/api/public/services/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Servis güncellenirken bir hata oluştu');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Servis güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading || langsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-brand-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!session?.user || !service) {
    return null;
  }

  // For preview, use default language
  const defCode = defaultLanguage?.code || activeLanguage;
  const previewTitle = translations[defCode]?.title || 'Servis Başlığı';
  const previewDesc = translations[defCode]?.description || '';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Edit Service"
        description={`Edit ${service.title}`}
      />

      {/* Success/Error Messages */}
      {success && (
        <Alert variant="success" icon={<CheckIcon className="w-5 h-5" />}>
          Servis başarıyla güncellendi!
        </Alert>
      )}

      {error && (
        <Alert variant="danger" icon={<ExclamationTriangleIcon className="w-5 h-5" />}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

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

        {/* Basic Information */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Temel Bilgiler</h3>
              <p className="text-sm text-gray-500">
                Servis temel bilgilerini güncelleyin
                {activeLanguage && (
                  <Badge variant="primary" className="ml-2">
                    {languages.find(l => l.code === activeLanguage)?.flag} {activeLanguage.toUpperCase()}
                  </Badge>
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Servis Başlığı *
              </label>
              <input
                type="text"
                id="title"
                value={currentTranslation.title}
                onChange={(e) => updateTranslation('title', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="Servis başlığı giriniz"
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Servis Açıklaması *
              </label>
              <UniversalEditor
                key={activeLanguage}
                value={currentTranslation.description}
                onChange={(val) => updateTranslation('description', val)}
                placeholder="Servis hakkında detaylı açıklama yazınız"
                minHeight="200px"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kısa Açıklama (Excerpt)
              </label>
              <textarea
                value={currentTranslation.excerpt}
                onChange={(e) => updateTranslation('excerpt', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="Kısa açıklama giriniz"
                rows={2}
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Açıklama (SEO)
              </label>
              <textarea
                value={currentTranslation.metaDescription}
                onChange={(e) => updateTranslation('metaDescription', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="SEO meta açıklaması"
                rows={2}
                disabled={saving}
              />
            </div>
          </div>
        </Card>

        {/* Service Image */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <PhotoIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Servis Görseli</h3>
              <p className="text-sm text-gray-500">Servis görselini güncelleyin</p>
            </div>
          </div>

          <ImageUpload
            label="Hizmet Görseli"
            value={serviceImage}
            onChange={(url) => {
              const imageUrl = Array.isArray(url) ? url[0] : url;
              setServiceImage(imageUrl);
            }}
            pageContext="services"
            showUrlInput={true}
            disabled={saving}
          />
        </Card>

        {/* Features */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-orange-600 flex items-center justify-center">
                <ListBulletIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Servis Özellikleri</h3>
                <p className="text-sm text-gray-500">Servis özelliklerini yönetin</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={addFeature}
              className="text-brand-700 bg-brand-50 hover:bg-brand-100"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Özellik Ekle</span>
            </Button>
          </div>

          <div className="space-y-3">
            {features.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                Henüz özellik eklenmedi. Yukarıdaki butonu kullanarak özellik ekleyebilirsiniz.
              </p>
            ) : (
              features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="Özellik açıklaması"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Preview */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-teal-600 flex items-center justify-center">
              <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Önizleme</h3>
              <p className="text-sm text-gray-500">Servis önizlemesi</p>
            </div>
          </div>

          <div className="bg-surface-secondary rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{previewTitle}</h4>
                <div className="text-gray-600 text-sm mb-4">
                  {previewDesc ? (
                    <HTMLContent content={previewDesc} truncate={150} />
                  ) : (
                    <p>Servis açıklaması buraya gelecek...</p>
                  )}
                </div>

                {features.filter(f => f.trim()).length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Özellikler:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {features.filter(f => f.trim()).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <div className="w-full h-32 bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                  {serviceImage ? (
                    <Image
                      src={serviceImage}
                      alt="Service preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Görsel yüklenmemiş</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between pt-6">
          <Link
            href="/admin/services"
            className="flex items-center space-x-2 px-6 py-3 border border-border rounded-xl text-gray-700 hover:bg-surface-secondary transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Geri Dön</span>
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            className="px-8 font-semibold"
          >
            {!saving && <CheckIcon className="w-5 h-5" />}
            <span>{saving ? 'Güncelleniyor...' : 'Servisi Güncelle'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
