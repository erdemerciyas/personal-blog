'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components';
import Link from 'next/link';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function TestUploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/admin/login');
    return null;
  }

  if (session?.user?.role !== 'admin') {
    router.push('/');
    return null;
  }

  const handleImageUpload = (url: string) => {
    setUploadedImages(prev => [...prev, url]);
  };

  const handleImageRemove = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <PhotoIcon className="w-6 h-6 text-white" />
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Upload Test</h1>
                <p className="text-sm text-slate-300">Local resim upload testi</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Resim Upload Test</h2>
          
          {/* Upload Section */}
          <div className="mb-8">
            <ImageUpload
              value={undefined}
              onChange={handleImageUpload}
              label="Test Resmi Yükle"
              className="w-full"
            />
          </div>

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Yüklenen Resimler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="space-y-2">
                    <ImageUpload
                      value={imageUrl}
                      onChange={(newUrl) => {
                        const newImages = [...uploadedImages];
                        newImages[index] = newUrl;
                        setUploadedImages(newImages);
                      }}
                      onRemove={() => handleImageRemove(index)}
                      label={`Resim ${index + 1}`}
                    />
                    <p className="text-xs text-slate-400 truncate">
                      URL: {imageUrl}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl">
            <h4 className="text-teal-300 font-semibold mb-2">Test Bilgileri</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Resimler /public/uploads/ klasörüne kaydedilir</li>
              <li>• Maksimum dosya boyutu: 10MB</li>
              <li>• Desteklenen formatlar: JPEG, PNG, GIF, WebP</li>
              <li>• Dosyalar otomatik olarak yeniden adlandırılır</li>
              <li>• Upload edilen resimlerin URL'i: /uploads/dosyaadi.uzanti</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
} 