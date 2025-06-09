'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '../../../../components/ImageUpload';
import { 
  ArrowLeftIcon,
  CubeTransparentIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  PhotoIcon,
  DocumentTextIcon,
  CheckIcon,
  TrashIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

export default function NewServicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [features, setFeatures] = useState<string[]>(['']);
  const [serviceImage, setServiceImage] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');

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
          description: formData.get('description'),
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

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-slate-300">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/services"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <CubeTransparentIcon className="w-6 h-6 text-white" />
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Yeni Servis Ekle</h1>
                <p className="text-sm text-slate-300">Yeni hizmet oluşturun</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{session.user.name}</p>
                  <p className="text-xs text-slate-400">{session.user.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 text-sm font-medium border border-red-500/30"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                  <PlusIcon className="w-8 h-8 text-teal-400" />
                  <span>Yeni Servis Ekle</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  Sunduğunuz yeni hizmeti sisteme ekleyin.
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-3">
                <WrenchScrewdriverIcon className="w-8 h-8 text-teal-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6">
            <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/30 text-green-300 p-6 rounded-2xl flex items-center space-x-3">
              <CheckIcon className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-semibold">Servis başarıyla eklendi!</p>
                <p className="text-sm text-green-200">Servis listesine yönlendiriliyorsunuz...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-300 p-4 rounded-2xl">
              {error}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Title Field */}
            <div className="space-y-3">
              <label htmlFor="title" className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                <DocumentTextIcon className="w-5 h-5 text-teal-400" />
                <span>Servis Başlığı</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="Örn: Web Tasarım Hizmeti"
              />
              <p className="text-xs text-slate-400">Hizmetinizin ana başlığını girin</p>
            </div>

            {/* Description Field */}
            <div className="space-y-3">
              <label htmlFor="description" className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                <DocumentTextIcon className="w-5 h-5 text-teal-400" />
                <span>Servis Açıklaması</span>
                <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Hizmetinizin detaylı açıklamasını yazın..."
              />
              <p className="text-xs text-slate-400">Hizmetinizi detaylı bir şekilde açıklayın</p>
            </div>

            {/* Image Field */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                <PhotoIcon className="w-5 h-5 text-teal-400" />
                <span>Servis Görseli</span>
                <span className="text-slate-400 text-xs font-normal">(İsteğe bağlı)</span>
              </label>
              
              <ImageUpload
                value={serviceImage}
                onChange={setServiceImage}
                onRemove={() => setServiceImage('')}
                label="Servis Görseli"
                className="w-full"
                showAIGeneration={true}
                showUrlInput={true}
                projectTitle={serviceTitle}
              />
              
              <p className="text-xs text-slate-400">Boş bırakılırsa servis başlığına uygun otomatik görsel atanır</p>
            </div>

            {/* Features Field */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                <ListBulletIcon className="w-5 h-5 text-teal-400" />
                <span>Öne Çıkan Özellikler</span>
                <span className="text-slate-400 text-xs font-normal">(En az 1 özellik)</span>
              </label>
              
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder={`Özellik ${index + 1}`}
                      />
                    </div>
                    {features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 border border-red-500/30"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addFeature}
                  className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-xl transition-all duration-200 text-slate-300 hover:text-white font-medium flex items-center justify-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Yeni Özellik Ekle</span>
                </button>
              </div>
              
              <p className="text-xs text-slate-400">Hizmetinizin öne çıkan özelliklerini madde madde ekleyin</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
              <Link
                href="/admin/services"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl transition-all duration-200 font-medium border border-white/20"
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={loading || success}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  loading || success
                    ? 'bg-teal-600/50 cursor-not-allowed text-teal-200'
                    : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                    <span>Ekleniyor...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Başarılı!</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5" />
                    <span>Servis Ekle</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 