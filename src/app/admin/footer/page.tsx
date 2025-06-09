'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CogIcon, 
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CubeTransparentIcon,
  UserIcon,
  LinkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface FooterSettings {
  _id?: string;
  mainDescription: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  quickLinks: Array<{
    title: string;
    url: string;
    isExternal: boolean;
  }>;
  socialLinks: {
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
    github: string;
    youtube: string;
  };
  copyrightInfo: {
    companyName: string;
    year: number;
    additionalText: string;
  };
  developerInfo: {
    name: string;
    website: string;
    companyName: string;
  };
  visibility: {
    showQuickLinks: boolean;
    showSocialLinks: boolean;
    showContactInfo: boolean;
    showDeveloperInfo: boolean;
  };
  theme: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
  };
}

export default function FooterSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'links' | 'social' | 'appearance'>('content');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSettings();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/footer-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Footer settings fetch error:', error);
      setMessage({ type: 'error', text: 'Ayarlar yüklenemedi' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/footer-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Kaydetme başarısız');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ayarlar kaydedilemedi' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Tüm ayarları varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      return;
    }
    
    setResetting(true);
    try {
      const response = await fetch('/api/admin/footer-settings', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setMessage({ type: 'success', text: 'Ayarlar varsayılan değerlere sıfırlandı!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Sıfırlama başarısız');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ayarlar sıfırlanamadı' });
    } finally {
      setResetting(false);
    }
  };

  const addQuickLink = () => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      quickLinks: [
        ...settings.quickLinks,
        { title: '', url: '', isExternal: false }
      ]
    });
  };

  const removeQuickLink = (index: number) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      quickLinks: settings.quickLinks.filter((_, i) => i !== index)
    });
  };

  const updateQuickLink = (index: number, field: string, value: string | boolean) => {
    if (!settings) return;
    
    const updatedLinks = [...settings.quickLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    
    setSettings({
      ...settings,
      quickLinks: updatedLinks
    });
  };

  const moveQuickLink = (index: number, direction: 'up' | 'down') => {
    if (!settings) return;
    
    const newLinks = [...settings.quickLinks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;
    
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    
    setSettings({
      ...settings,
      quickLinks: newLinks
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-slate-300">Footer ayarları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/dashboard"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <CubeTransparentIcon className="w-6 h-6 text-white" />
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Footer Ayarları</h1>
                <p className="text-sm text-slate-300">Site alt kısmının görünümünü ve içeriğini yönetin</p>
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
                className="text-slate-300 hover:text-white transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        
        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-8 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Footer Yönetimi</h2>
              <p className="text-slate-400">Site alt kısmındaki içeriği ve görünümü düzenleyin</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckIcon className="h-5 w-5" />
                )}
                <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-white/20">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'content', label: 'İçerik & İletişim', icon: CogIcon },
                { id: 'links', label: 'Hızlı Bağlantılar', icon: LinkIcon },
                { id: 'social', label: 'Sosyal Medya', icon: LinkIcon },
                { id: 'appearance', label: 'Görünüm', icon: PencilIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-teal-400 text-teal-300'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* Content Tab */}
          {activeTab === 'content' && (
            <>
              {/* Ana Açıklama */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <CogIcon className="h-5 w-5 mr-2 text-teal-400" />
                  Ana Açıklama
                </h3>
                <textarea
                  value={settings.mainDescription}
                  onChange={(e) => setSettings({ ...settings, mainDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  placeholder="Footer'da görünecek ana açıklama metni..."
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* İletişim Bilgileri */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CogIcon className="h-5 w-5 mr-2 text-teal-400" />
                    İletişim Bilgileri
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">E-posta</label>
                      <input
                        type="email"
                        value={settings.contactInfo.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          contactInfo: { ...settings.contactInfo, email: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="ornek@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Telefon</label>
                      <input
                        type="text"
                        value={settings.contactInfo.phone}
                        onChange={(e) => setSettings({
                          ...settings,
                          contactInfo: { ...settings.contactInfo, phone: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="+90 (500) 123 45 67"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Adres</label>
                      <input
                        type="text"
                        value={settings.contactInfo.address}
                        onChange={(e) => setSettings({
                          ...settings,
                          contactInfo: { ...settings.contactInfo, address: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Şehir, Ülke"
                      />
                    </div>
                  </div>
                </div>

                {/* Copyright ve Geliştirici Bilgileri */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Copyright & Geliştirici</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Şirket Adı</label>
                      <input
                        type="text"
                        value={settings.copyrightInfo.companyName}
                        onChange={(e) => setSettings({
                          ...settings,
                          copyrightInfo: { ...settings.copyrightInfo, companyName: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Yıl</label>
                      <input
                        type="number"
                        value={settings.copyrightInfo.year}
                        onChange={(e) => setSettings({
                          ...settings,
                          copyrightInfo: { ...settings.copyrightInfo, year: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Geliştirici Website</label>
                      <input
                        type="url"
                        value={settings.developerInfo.website}
                        onChange={(e) => setSettings({
                          ...settings,
                          developerInfo: { ...settings.developerInfo, website: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Şirket Adı</label>
                      <input
                        type="text"
                        value={settings.developerInfo.companyName}
                        onChange={(e) => setSettings({
                          ...settings,
                          developerInfo: { ...settings.developerInfo, companyName: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Quick Links Tab */}
          {activeTab === 'links' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2 text-teal-400" />
                  Hızlı Bağlantılar
                </h3>
                <button
                  onClick={addQuickLink}
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Yeni Bağlantı</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {settings.quickLinks.map((link, index) => (
                  <div key={index} className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Bağlantı Adı</label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateQuickLink(index, 'title', e.target.value)}
                          placeholder="Örn: Anasayfa"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                          placeholder="Örn: /contact veya https://..."
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={link.isExternal}
                            onChange={(e) => updateQuickLink(index, 'isExternal', e.target.checked)}
                            className="rounded border-slate-400 text-teal-600 focus:ring-teal-500 bg-white/10"
                          />
                          <span className="ml-2 text-sm text-slate-300">Harici bağlantı</span>
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => moveQuickLink(index, 'up')}
                          disabled={index === 0}
                          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowUpIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveQuickLink(index, 'down')}
                          disabled={index === settings.quickLinks.length - 1}
                          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowDownIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeQuickLink(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {settings.quickLinks.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz hızlı bağlantı eklenmemiş</p>
                    <p className="text-sm">Yukarıdaki "Yeni Bağlantı" butonunu kullanarak ekleyebilirsiniz</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <LinkIcon className="h-5 w-5 mr-2 text-teal-400" />
                Sosyal Medya Bağlantıları
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.socialLinks).map(([platform, url]) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">{platform}</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setSettings({
                        ...settings,
                        socialLinks: { ...settings.socialLinks, [platform]: e.target.value }
                      })}
                      placeholder={`https://${platform}.com/username`}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Görünürlük Ayarları */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-6">Görünürlük Ayarları</h3>
                <div className="space-y-4">
                  {Object.entries(settings.visibility).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSettings({
                          ...settings,
                          visibility: { ...settings.visibility, [key]: e.target.checked }
                        })}
                        className="rounded border-slate-400 text-teal-600 focus:ring-teal-500 bg-white/10"
                      />
                      <span className="ml-3 text-sm text-slate-300">
                        {key === 'showQuickLinks' && 'Hızlı Bağlantıları Göster'}
                        {key === 'showSocialLinks' && 'Sosyal Medya Bağlantılarını Göster'}
                        {key === 'showContactInfo' && 'İletişim Bilgilerini Göster'}
                        {key === 'showDeveloperInfo' && 'Geliştirici Bilgilerini Göster'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tema Ayarları */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-6">Tema Ayarları</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Arkaplan Rengi</label>
                    <select
                      value={settings.theme.backgroundColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme: { ...settings.theme, backgroundColor: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="bg-slate-800">Koyu Gri</option>
                      <option value="bg-gray-900">Siyah</option>
                      <option value="bg-slate-900">Koyu Slate</option>
                      <option value="bg-teal-800">Koyu Teal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Metin Rengi</label>
                    <select
                      value={settings.theme.textColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme: { ...settings.theme, textColor: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="text-slate-300">Açık Gri</option>
                      <option value="text-gray-300">Gri</option>
                      <option value="text-white">Beyaz</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Vurgu Rengi</label>
                    <select
                      value={settings.theme.accentColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        theme: { ...settings.theme, accentColor: e.target.value }
                      })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="text-teal-400">Teal</option>
                      <option value="text-blue-400">Mavi</option>
                      <option value="text-green-400">Yeşil</option>
                      <option value="text-purple-400">Mor</option>
                      <option value="text-orange-400">Turuncu</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-sm">Footer Yönetimi Aktif</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <Link href="/admin/dashboard" className="hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <CubeTransparentIcon className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/" className="hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <span>Site Görünümü</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 