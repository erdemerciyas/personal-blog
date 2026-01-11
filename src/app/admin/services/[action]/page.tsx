'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { IService } from '@/models/Service';
import {
  DocumentTextIcon,
  PhotoIcon,
  ListBulletIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ServiceFormPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const isEditing = params?.action === 'edit';

  const [formData, setFormData] = useState<Partial<IService>>({
    title: '',
    description: '',
    features: [''],
    image: '',
    icon: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (isEditing && params?.id) {
      const fetchService = async () => {
        try {
          const response = await fetch(`/api/services/${params.id}`);
          if (!response.ok) {
            throw new Error('Servis yüklenirken bir hata oluştu');
          }
          const data = await response.json();
          setFormData(data);
        } catch {
          setError('Servis bulunamadı');
        } finally {
          setLoading(false);
        }
      };

      fetchService();
    }
  }, [isEditing, params?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isEditing ? `/api/services/${params?.id}` : '/api/services';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Servis kaydedilirken bir hata oluştu');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/services');
      }, 1500);
    } catch {
      setError('Servis güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...(formData.features || []), ''],
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        </div>);
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
        {/* Header Info */}
        <div>
          <p className="text-slate-600">
            {isEditing ? 'Servis bilgilerini güncelleyin' : 'Yeni servis ekleyin'}
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-3">
            <CheckIcon className="w-5 h-5" />
            <span>Servis başarıyla kaydedildi! Yönlendiriliyorsunuz...</span>
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
                <p className="text-sm text-slate-500">Servis temel bilgilerini girin</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                  Başlık *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Servis başlığı giriniz"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                  Açıklama *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Servis hakkında detaylı açıklama yazınız"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Görsel URL</h3>
                <p className="text-sm text-slate-500">Servis görsel URL'sini girin</p>
              </div>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-2">
                Görsel URL *
              </label>
              <input
                type="url"
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="https://example.com/image.jpg"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Icon */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <ListBulletIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">İkon SVG</h3>
                <p className="text-sm text-slate-500">Servis ikon SVG kodunu girin</p>
              </div>
            </div>

            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-slate-700 mb-2">
                İkon SVG *
              </label>
              <textarea
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono text-sm"
                placeholder="<svg>...</svg>"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <ListBulletIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Özellikler</h3>
                  <p className="text-sm text-slate-500">Servis özelliklerini ekleyin</p>
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
              {formData.features?.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Özellik açıklaması"
                    required
                    disabled={loading}
                  />
                  {formData.features!.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
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
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-8 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>);
}
