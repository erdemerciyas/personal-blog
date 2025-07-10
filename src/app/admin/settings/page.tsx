'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AdminLayout from '../../../components/admin/AdminLayout';
import { CheckIcon, ShieldCheckIcon, CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface Settings {
  _id?: string;
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  twitterHandle: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUploadSize: number;
  isActive: boolean;
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Logo upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<Settings>({
    siteName: '',
    siteTitle: '',
    siteDescription: '',
    siteKeywords: '',
    siteUrl: '',
    logo: '',
    favicon: '',
    twitterHandle: '',
    maintenanceMode: false,
    allowRegistration: false,
    maxUploadSize: 10,
    isActive: true,
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/admin/dashboard');
      return;
    }

    loadSettings();
  }, [status, session, router]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Settings load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' });
      } else {
        throw new Error('Ayarlar kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  // Logo upload functions
  const handleLogoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Dosya türü kontrolü
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Geçersiz dosya türü. PNG, JPG, WebP veya SVG dosyası seçin.' });
        return;
      }

      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Dosya boyutu 5MB\'dan büyük olamaz.' });
        return;
      }

      setLogoFile(file);
      
      // Önizleme oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setUploadingLogo(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await fetch('/api/admin/logo-upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          logo: data.logoUrl
        }));
        setLogoFile(null);
        setLogoPreview(null);
        setMessage({ type: 'success', text: 'Logo başarıyla yüklendi!' });
      } else {
        throw new Error('Logo yükleme başarısız');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      setMessage({ type: 'error', text: 'Logo yüklenirken hata oluştu.' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const clearLogoPreview = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            <p className="text-slate-600">Ayarlar yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AdminLayout 
      title="Sistem Ayarları"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Sistem Ayarları' }
      ]}
    >
      <div className="space-y-6">
        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Basic Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Temel Site Ayarları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Site Adı
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Site adınız"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Site URL
              </label>
              <input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="https://example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Site Başlığı (SEO)
              </label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="SEO için site başlığı"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Site Açıklaması
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                rows={4}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Site açıklamanız..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                SEO Anahtar Kelimeleri
              </label>
              <input
                type="text"
                value={settings.siteKeywords}
                onChange={(e) => handleInputChange('siteKeywords', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="mühendislik, 3d tarama, teknoloji (virgülle ayırın)"
              />
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Logo ve Görsel Ayarları</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Sol Sütun: Logo Yükleme */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Logo Yükleme</h3>
              
              {/* Mevcut Logo Görüntüleme */}
              <div className="bg-slate-50 rounded-xl p-6 border-2 border-dashed border-slate-200">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Mevcut Logo</h4>
                <div className="flex items-center justify-center h-24 bg-white rounded-lg border">
                  {settings.logo ? (
                    <Image 
                      src={settings.logo} 
                      alt="Mevcut Logo" 
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="flex flex-col items-center space-y-2 text-slate-400">
                      <PhotoIcon className="w-8 h-8" />
                      <span className="text-sm">Henüz logo yüklenmedi</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Logo Upload Alanı */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-700">Yeni Logo Yükle</h4>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-teal-400 hover:bg-teal-50/50 transition-colors cursor-pointer"
                >
                  <CloudArrowUpIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Dosya seçmek için tıklayın
                  </p>
                  <p className="text-xs text-slate-500">
                    PNG, JPG, WebP, SVG • Max 5MB
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileSelect}
                  className="hidden"
                />

                {/* Dosya Önizleme */}
                {logoPreview && (
                  <div className="bg-slate-50 rounded-xl p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-slate-700">Önizleme</h5>
                      <button
                        onClick={clearLogoPreview}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Image 
                        src={logoPreview} 
                        alt="Logo Önizleme" 
                        width={64}
                        height={64}
                        style={{ objectFit: 'contain' }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{logoFile?.name}</p>
                        <p className="text-xs text-slate-500">
                          {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="w-full mt-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {uploadingLogo ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          <span>Yükleniyor...</span>
                        </>
                      ) : (
                        <>
                          <CloudArrowUpIcon className="w-4 h-4" />
                          <span>Logo Yükle</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Manuel URL Girişi */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Logo URL (manuel)
                </label>
                <input
                  type="url"
                  value={settings.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            {/* Sağ Sütun: Diğer Ayarlar */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Diğer Ayarlar</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Favicon URL
                </label>
                <input
                  type="url"
                  value={settings.favicon}
                  onChange={(e) => handleInputChange('favicon', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="/favicon.ico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Twitter Handle
                </label>
                <input
                  type="text"
                  value={settings.twitterHandle}
                  onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="@username"
                />
              </div>

              {/* Marka Önizleme */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-200">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Marka Önizleme</h4>
                <div className="flex items-center space-x-4">
                  {settings.logo && (
                    <Image 
                      src={settings.logo} 
                      alt="Logo" 
                      width={48}
                      height={48}
                      style={{ objectFit: 'contain' }}
                    />
                  )}
                  <div>
                    <h6 className="font-semibold text-slate-800">
                      {settings.siteName || 'Site Adınız'}
                    </h6>
                    <p className="text-sm text-slate-600">
                      {settings.siteDescription || 'Site açıklamanız'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Sistem Ayarları</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="maintenance" className="text-sm font-medium text-slate-700">
                  Bakım Modu
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="registration"
                  checked={settings.allowRegistration}
                  onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                  className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="registration" className="text-sm font-medium text-slate-700">
                  Kullanıcı Kaydına İzin Ver
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maksimum Upload Boyutu (MB)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.maxUploadSize}
                onChange={(e) => handleInputChange('maxUploadSize', parseInt(e.target.value))}
                className="w-full md:w-1/3 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {settings.maintenanceMode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="w-6 h-6 text-yellow-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800">Bakım Modu Aktif</h3>
                    <p className="text-yellow-700 text-sm">Site ziyaretçiler için erişilebilir değil. Sadece admin kullanıcılar erişebilir.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Ayarları Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
} 