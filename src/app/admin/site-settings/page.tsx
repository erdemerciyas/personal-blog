'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CogIcon,
  CheckIcon,
  GlobeAltIcon,
  ServerIcon,
  BellIcon,
  ShieldCheckIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import ImageUpload from '../../../components/ImageUpload';

interface SiteSettings {
  siteName: string;
  siteUrl: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  enableComments: boolean;
  enableAnalytics: boolean;
}

export default function AdminSiteSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<any>({
    siteName: '',
    siteUrl: '',
    timezone: 'Europe/Istanbul',
    language: 'tr',
    maintenanceMode: false,
    allowRegistration: true,
    enableComments: true,
    system: { maxUploadSize: 10 },
    analytics: { enableAnalytics: false, googleAnalyticsId: '', googleTagManagerId: '', googleSiteVerification: '' },
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    contact: { email: '', phone: '', address: '' },
    logo: { url: '' },
    socialMedia: { twitter: '', facebook: '', instagram: '', linkedin: '', github: '' }
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
        // Merge with defaults to avoid undefined errors
        setSettings((prev: any) => ({
          ...prev,
          ...data,
          system: { ...prev.system, ...data.system },
          analytics: { ...prev.analytics, ...data.analytics },
          seo: { ...prev.seo, ...data.seo },
          contact: { ...prev.contact, ...data.contact },
          logo: { ...prev.logo, ...data.logo },
          socialMedia: { ...prev.socialMedia, ...data.socialMedia }
        }));
      }
    } catch (error) {
      console.error('Site ayarları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Site ayarları başarıyla kaydedildi!' });
      } else {
        throw new Error('Ayarlar kaydedilemedi');
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken bir hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  // Helper to update nested state
  const updateNested = (parent: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Site Ayarları</h1>
          <p className="text-slate-500 mt-1">Sitenizin tüm yapılandırmasını buradan yönetebilirsiniz</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? 'Kaydediliyor...' : (
            <>
              <CheckIcon className="w-5 h-5" />
              Kaydet
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800'
          }`}>
          {message.type === 'success' ? <CheckIcon className="w-5 h-5" /> : <ServerIcon className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Sol Kolon: Temel Bilgiler */}
        <div className="space-y-6">

          {/* Temel Site Ayarları */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <GlobeAltIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Temel Ayarlar</h2>
                <p className="text-sm text-slate-500">Site kimliği ve temel bilgiler</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Site Adı</label>
                <input type="text" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Site URL</label>
                <input type="url" value={settings.siteUrl} onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slogan</label>
                <input type="text" value={settings.slogan || ''} onChange={(e) => setSettings({ ...settings, slogan: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dil</label>
                  <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none">
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Saat Dilimi</label>
                  <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="w-full px-3 py-2 border rounded-lg outline-none">
                    <option value="Europe/Istanbul">Istanbul (UTC+3)</option>
                    <option value="UTC">UTC</option>
                    <option value="Europe/London">London</option>
                    <option value="America/New_York">New York</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Logo & Görsel Ayarlar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Logo & Görseller</h2>
                <p className="text-sm text-slate-500">Site logosu ve ikonları</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Site Logosu</label>
                <ImageUpload
                  value={settings.logo?.url}
                  onChange={(url) => updateNested('logo', 'url', Array.isArray(url) ? url[0] : url)}
                  pageContext="site-logo"
                  label="Logo Yükle"
                />
                <p className="text-xs text-slate-500 mt-1">Önerilen boyut: 200x60px. Format: PNG, SVG</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Favicon</label>
                <p className="text-xs text-slate-500 mb-2">Tarayıcı sekmesinde görünen ikon</p>
                <ImageUpload
                  value={settings.favicon}
                  onChange={(url) => setSettings({ ...settings, favicon: Array.isArray(url) ? url[0] : url })}
                  pageContext="favicon"
                  label="Favicon Yükle"
                />
              </div>
            </div>
          </div>


          {/* İletişim Bilgileri */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">İletişim Bilgileri</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={settings.contact?.email || ''} onChange={(e) => updateNested('contact', 'email', e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                <input type="text" value={settings.contact?.phone || ''} onChange={(e) => updateNested('contact', 'phone', e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                <textarea rows={2} value={settings.contact?.address || ''} onChange={(e) => updateNested('contact', 'address', e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Sistem ve Diğer */}
        <div className="space-y-6">

          {/* Özellik Kontrolleri (Toggle'lar) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Sistem Durumu</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="font-medium text-slate-900">Bakım Modu</span>
                  <p className="text-xs text-slate-500">Siteyi ziyaretçilere kapatır</p>
                </div>
                <button onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })} className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'translate-x-6' : ''}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="font-medium text-slate-900">Kayıt Olma</span>
                  <p className="text-xs text-slate-500">Yeni üye alımını aç/kapat</p>
                </div>
                <button onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })} className={`w-12 h-6 rounded-full relative transition-colors ${settings.allowRegistration ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.allowRegistration ? 'translate-x-6' : ''}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="font-medium text-slate-900">Yorumlar</span>
                  <p className="text-xs text-slate-500">Site genelinde yorumları aç/kapat</p>
                </div>
                <button onClick={() => setSettings({ ...settings, enableComments: !settings.enableComments })} className={`w-12 h-6 rounded-full relative transition-colors ${settings.enableComments ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.enableComments ? 'translate-x-6' : ''}`}></div>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Maksimum Dosya Yükleme Boyutu (MB)</label>
                <input type="number" value={settings.system?.maxUploadSize || 10} onChange={(e) => updateNested('system', 'maxUploadSize', parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg outline-none" min="1" max="100" />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
            <h3 className="font-semibold text-indigo-900 mb-2">Eklentiler</h3>
            <p className="text-sm text-indigo-700 mb-4">Analytics, SEO ve Sosyal Medya ayarları artık Eklentiler sayfasından yönetilmektedir.</p>
            <a href="/admin/plugins" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Eklentilere Git
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
