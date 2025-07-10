'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader } from '../../../../../components/ui';
import AdminLayout from '../../../../../components/admin/AdminLayout';
import ImageUpload from '../../../../../components/ImageUpload';
import RichTextEditor from '../../../../../components/RichTextEditor';
import HTMLContent from '../../../../../components/HTMLContent';
import { 
  WrenchScrewdriverIcon,
  PencilIcon,
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
      image: serviceImage || undefined,
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
        throw new Error('Servis güncellenirken bir hata oluştu');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/services');
      }, 1500);
    } catch {
      setError('Servis güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader size="xl" color="primary">
              Servis yükleniyor...
            </Loader>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!session?.user || !service) {
    return null;
  }

  return (
    <AdminLayout 
      title="Servis Düzenle"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Servisler', href: '/admin/services' },
        { label: 'Düzenle' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Info */}
        <div className="mb-6">
          <p className="text-slate-600">{service.title} servisini düzenleyin</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center space-x-3">
            <CheckIcon className="w-5 h-5" />
            <span>Servis başarıyla güncellendi! Yönlendiriliyorsunuz...</span>
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
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Servis Başlığı *
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={service.title}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Servis başlığı giriniz"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Servis Açıklaması *
                </label>
                <RichTextEditor
                  value={serviceDescription}
                  onChange={setServiceDescription}
                  placeholder="Servis hakkında detaylı açıklama yazınız"
                  required
                  maxLength={5000}
                />
              </div>
            </div>
          </div>

          {/* Service Image */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <PhotoIcon className="w-5 h-5 text-teal-600" />
              <span>Servis Görseli</span>
            </h3>
            
            <ImageUpload
              onImageUpload={(url) => setServiceImage(Array.isArray(url) ? url[0] : url)}
              onImageRemove={() => setServiceImage('')}
              currentImage={serviceImage}
            />
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <ListBulletIcon className="w-5 h-5 text-teal-600" />
                <span>Servis Özellikleri</span>
              </h3>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center space-x-2 bg-teal-50 text-teal-600 px-3 py-2 rounded-lg hover:bg-teal-100 transition-colors"
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
                      className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Özellik açıklaması"
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <WrenchScrewdriverIcon className="w-5 h-5 text-teal-600" />
              <span>Önizleme</span>
            </h3>
            
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">{serviceTitle || service.title}</h4>
                  <div className="text-slate-600 text-sm mb-4">
                    <HTMLContent 
                      content={serviceDescription || service.description}
                      truncate={200}
                    />
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
                  <div className="w-full h-40 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                    {serviceImage ? (
                      <Image
                        src={serviceImage}
                        alt="Service preview"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="text-center">
                        <PhotoIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Görsel yüklenmemiş</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader size="md" color="white">
                    Güncelleniyor...
                  </Loader>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Değişiklikleri Kaydet</span>
                </>
              )}
            </button>
            
            <Link
              href="/admin/services"
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