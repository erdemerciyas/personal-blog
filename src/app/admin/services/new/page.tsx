'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../components/admin/AdminLayout';
import ImageUpload from '../../../../components/ImageUpload';
import RichTextEditor from '../../../../components/RichTextEditor';
import { 
  PlusIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PhotoIcon,
  ListBulletIcon,
  WrenchScrewdriverIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function NewServicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [features, setFeatures] = useState<string[]>(['']);
  const [serviceImage, setServiceImage] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const filteredFeatures = features.filter(feature => feature.trim() !== '');

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.get('title'),
          description: serviceDescription,
          image: serviceImage || undefined,
          features: filteredFeatures
        }),
      });

      if (!response.ok) {
        throw new Error('Servis eklenirken bir hata oluştu');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/services');
      }, 1500);
    } catch {
      setError('Servis eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
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

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            <p className="text-slate-600">Yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <AdminLayout 
      title="Yeni Servis Ekle"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Servisler', href: '/admin/services' },
        { label: 'Yeni Servis' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Info */}
        <div className="mb-6">
          <p className="text-slate-600">Yeni servis ekleyin</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center space-x-3">
            <CheckIcon className="w-5 h-5" />
            <span>Servis başarıyla eklendi! Yönlendiriliyorsunuz...</span>
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
                  value={serviceTitle}
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
                  <h4 className="font-semibold text-slate-900 mb-2">{serviceTitle || 'Servis Başlığı'}</h4>
                  <p className="text-slate-600 text-sm mb-4">Buraya servis açıklaması gelecek...</p>
                  
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
                      <img
                        src={serviceImage}
                        alt="Service preview"
                        className="w-full h-full object-cover"
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
              disabled={loading}
              className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Ekleniyor...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Servis Ekle</span>
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