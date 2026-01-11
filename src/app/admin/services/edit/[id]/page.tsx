'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ImageUpload from '../../../../../components/ImageUpload';
import UniversalEditor from '../../../../../components/ui/UniversalEditor';
import HTMLContent from '../../../../../components/HTMLContent';
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

interface Service {
  _id: string;
  title: string;
  description: string;
  image: string;
  features?: string[];
}

export default function EditServicePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [features, setFeatures] = useState<string[]>(['']);
  const [serviceImage, setServiceImage] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${params.id}`);
        if (!response.ok) {
          throw new Error('Servis yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        setService(data);
        setServiceImage(data.image || '');
        setServiceTitle(data.title || '');
        setServiceDescription(data.description || '');
        setFeatures(data.features && data.features.length > 0 ? data.features : ['']);
      } catch {
        setError('Servis bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [params.id]);

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

    const formData = new FormData(e.currentTarget);
    const filteredFeatures = features.filter(feature => feature.trim() !== '');
    const data = {
      title: formData.get('title'),
      description: serviceDescription,
      image: serviceImage || '',
      features: filteredFeatures
    };

    try {
      const response = await fetch(`/api/services/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Servis güncellenirken bir hata oluştu');
      }

      const result = await response.json();

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Servis güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!session?.user || !service) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Service</h1>
          <p className="text-slate-500 mt-1">Edit {service.title}</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-3">
          <CheckIcon className="w-5 h-5" />
          <span>Servis başarıyla güncellendi!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Temel Bilgiler</h3>
              <p className="text-sm text-slate-500">Servis temel bilgilerini güncelleyin</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                Servis Başlığı *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={service.title}
                onChange={(e) => setServiceTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Servis başlığı giriniz"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Servis Açıklaması *
              </label>
              <UniversalEditor
                value={serviceDescription}
                onChange={setServiceDescription}
                placeholder="Servis hakkında detaylı açıklama yazınız"
                minHeight="200px"
              />
            </div>
          </div>
        </div>

        {/* Service Image */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <PhotoIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Servis Görseli</h3>
              <p className="text-sm text-slate-500">Servis görselini güncelleyin</p>
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
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <ListBulletIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Servis Özellikleri</h3>
                <p className="text-sm text-slate-500">Servis özelliklerini yönetin</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl hover:bg-indigo-100 transition-colors font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Özellik Ekle</span>
            </button>
          </div>

          <div className="space-y-3">
            {features.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">
                Henüz özellik eklenmedi. Yukarıdaki butonu kullanarak özellik ekleyebilirsiniz.
              </p>
            ) : (
              features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
        </div>

        {/* Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Önizleme</h3>
              <p className="text-sm text-slate-500">Servis önizlemesi</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">{serviceTitle || 'Servis Başlığı'}</h4>
                <div className="text-slate-600 text-sm mb-4">
                  {serviceDescription ? (
                    <HTMLContent content={serviceDescription} truncate={150} />
                  ) : (
                    <p>Servis açıklaması buraya gelecek...</p>
                  )}
                </div>

                {features.filter(f => f.trim()).length > 0 && (
                  <div>
                    <h5 className="font-medium text-slate-800 mb-2">Özellikler:</h5>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {features.filter(f => f.trim()).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <div className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative">
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
                      <PhotoIcon className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">Görsel yüklenmemiş</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between pt-6">
          <Link
            href="/admin/services"
            className="flex items-center space-x-2 px-6 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Geri Dön</span>
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-8 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Güncelleniyor...</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-5 h-5" />
                <span>Servisi Güncelle</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
