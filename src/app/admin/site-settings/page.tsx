'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import { 
  CheckIcon, 
  CubeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface SiteSettings {
  _id?: string;
  siteName: string;
  slogan: string;
  description: string;
  logo: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  socialMedia: {
    linkedin: string;
    twitter: string;
    github: string;
    instagram: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  isActive: boolean;
}

export default function AdminSiteSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '',
    slogan: '',
    description: '',
    logo: {
      url: '',
      alt: 'Site Logo',
      width: 200,
      height: 60
    },
    colors: {
      primary: '#003450',
      secondary: '#075985',
      accent: '#0369a1'
    },
    socialMedia: {
      linkedin: '',
      twitter: '',
      github: '',
      instagram: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    },
    contact: {
      email: '',
      phone: '',
      address: ''
    },
    isActive: true
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
      const response = await fetch('/api/admin/site-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error('Settings load error:', error);
      setMessage({ type: 'error', text: 'Ayarlar yüklenirken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof SiteSettings] as any,
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k);
    setSettings(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Site ayarları başarıyla kaydedildi!' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ayarlar kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Ayarlar kaydedilirken hata oluştu.' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Site Ayarları</h1>
            <p className="text-slate-600 mt-1">Sitenizin genel ayarlarını yönetin</p>
          </div>
          
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 hover:from-brand-primary-700 hover:to-brand-primary-800 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Kaydet</span>
              </>
            )}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Settings Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Sütun: Temel Bilgiler */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Temel Bilgiler</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Site Adı
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                  placeholder="Site adınızı girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Slogan
                </label>
                <input
                  type="text"
                  value={settings.slogan}
                  onChange={(e) => handleInputChange('slogan', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                  placeholder="Site sloganınızı girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                  placeholder="Site açıklamanızı girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={settings.logo.url}
                  onChange={(e) => handleInputChange('logo.url', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Sağ Sütun: Özellikler */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Özellikler</h2>
            
            <div className="space-y-6">
              {/* 3D Model Yönetimi Bilgisi */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CubeIcon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-800 mb-2">3D Model İndirme Yönetimi</h3>
                    
                    <p className="text-sm text-slate-600 mb-3">
                      3D model dosyalarının (STL, OBJ, GLTF, GLB) indirme izinleri artık her portfolio projesi 
                      için ayrı ayrı ayarlanabilir. Admin panelinde portfolio düzenlerken her model için 
                      indirme iznini açıp kapatabilirsiniz.
                    </p>
                    
                    <div className="flex items-center space-x-2 text-xs">
                      <ArrowDownTrayIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 font-medium">Proje bazlı kontrol</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gelecekteki özellikler için yer */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Gelecek Özellikler</h3>
                <p className="text-sm text-slate-500">
                  Yakında daha fazla özellik ayarı eklenecek...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Ayarları */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">SEO Ayarları</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Meta Başlık
              </label>
              <input
                type="text"
                value={settings.seo.metaTitle}
                onChange={(e) => handleInputChange('seo.metaTitle', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                placeholder="SEO başlığınızı girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Anahtar Kelimeler (virgülle ayırın)
              </label>
              <input
                type="text"
                value={settings.seo.keywords.join(', ')}
                onChange={(e) => handleKeywordsChange(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                placeholder="3d tasarım, tersine mühendislik, 3d baskı"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Meta Açıklama
              </label>
              <textarea
                value={settings.seo.metaDescription}
                onChange={(e) => handleInputChange('seo.metaDescription', e.target.value)}
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                placeholder="SEO açıklamanızı girin (160 karakter önerilir)"
              />
            </div>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">İletişim Bilgileri</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={settings.contact.email}
                onChange={(e) => handleInputChange('contact.email', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                placeholder="info@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={settings.contact.phone}
                onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                placeholder="+90 555 123 45 67"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Adres
              </label>
              <input
                type="text"
                value={settings.contact.address}
                onChange={(e) => handleInputChange('contact.address', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-600"
                placeholder="İstanbul, Türkiye"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}