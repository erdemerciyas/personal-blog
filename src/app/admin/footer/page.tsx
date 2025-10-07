'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '../../../components/AdminLoader';
import AdminLayout from '../../../components/admin/AdminLayout';
import UniversalEditor from '../../../components/ui/UniversalEditor';
import { 
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ArrowPathIcon,
  LinkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PaintBrushIcon
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
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        if (response.status === 401) {
          setMessage({ type: 'error', text: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.' });
          router.push('/admin/login');
        } else {
          setMessage({ 
            type: 'error', 
            text: errorData.message || 'Ayarlar kaydedilemedi' 
          });
        }
      }
    } catch (error) {
      console.error('Save error:', error);
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
    } catch {
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

  const updateSettings = (field: string, value: string | boolean | number) => {
    if (!settings) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentValue = settings[parent as keyof FooterSettings];
      
      if (parentValue && typeof parentValue === 'object' && !Array.isArray(parentValue)) {
        setSettings({
          ...settings,
          [parent]: {
            ...parentValue,
            [child]: value
          }
        });
      }
    } else {
      setSettings({
        ...settings,
        [field]: value
      });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <PageLoader text="Footer ayarları yükleniyor..." />
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Footer ayarları yüklenemedi</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Footer Ayarları"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Footer Ayarları' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600">Footer bölümü ayarlarını yönetin</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              disabled={resetting}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                resetting
                  ? 'bg-slate-400 cursor-not-allowed text-white'
                  : 'bg-slate-600 hover:bg-slate-700 text-white shadow-sm'
              }`}
            >
              {resetting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Sıfırlanıyor...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Sıfırla</span>
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                saving
                  ? 'bg-slate-400 cursor-not-allowed text-white'
                  : 'bg-brand-primary-700 hover:bg-brand-primary-800 text-white shadow-sm'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-brand-primary-50 border border-brand-primary-200 text-brand-primary-900' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'content', label: 'İçerik', icon: PencilIcon },
                { id: 'links', label: 'Hızlı Bağlantılar', icon: LinkIcon },
                { id: 'social', label: 'Sosyal Medya', icon: GlobeAltIcon },
                { id: 'appearance', label: 'Görünüm', icon: PaintBrushIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'content' | 'links' | 'social' | 'appearance')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-primary-600 text-brand-primary-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Main Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-4">
                    Ana Açıklama
                  </label>
                  <UniversalEditor
                    value={settings.mainDescription}
                    onChange={(value) => updateSettings('mainDescription', value)}
                    placeholder="Sitenizin ana açıklaması..."
                    minHeight="120px"
                  />
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                    <EnvelopeIcon className="w-5 h-5 text-brand-primary-700" />
                    <span>İletişim Bilgileri</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        E-posta
                      </label>
                      <input
                        type="email"
                        value={settings.contactInfo.email}
                        onChange={(e) => updateSettings('contactInfo.email', e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                        placeholder="info@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={settings.contactInfo.phone}
                        onChange={(e) => updateSettings('contactInfo.phone', e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                        placeholder="+90 555 000 00 00"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Adres
                      </label>
                      <input
                        type="text"
                        value={settings.contactInfo.address}
                        onChange={(e) => updateSettings('contactInfo.address', e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                        placeholder="Tam adres..."
                      />
                    </div>
                  </div>
                </div>

                {/* Copyright Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Telif Hakkı Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Şirket Adı
                      </label>
                      <input
                        type="text"
                        value={settings.copyrightInfo.companyName}
                        onChange={(e) => updateSettings('copyrightInfo.companyName', e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                        placeholder="Şirket adı..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Yıl
                      </label>
                      <input
                        type="number"
                        value={settings.copyrightInfo.year}
                        onChange={(e) => updateSettings('copyrightInfo.year', parseInt(e.target.value))}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                        placeholder="2024"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Ek Metin
                      </label>
                      <input
                        type="text"
                        value={settings.copyrightInfo.additionalText}
                        onChange={(e) => updateSettings('copyrightInfo.additionalText', e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                        placeholder="Tüm hakları saklıdır."
                      />
                    </div>
                  </div>
                </div>

                {/* Visibility Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Görünürlük Ayarları
                  </h3>
                  <div className="space-y-4">
                    {[
                      { key: 'showQuickLinks', label: 'Hızlı Bağlantıları Göster' },
                      { key: 'showSocialLinks', label: 'Sosyal Medya Bağlantılarını Göster' },
                      { key: 'showContactInfo', label: 'İletişim Bilgilerini Göster' },
                      { key: 'showDeveloperInfo', label: 'Geliştirici Bilgilerini Göster' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={settings.visibility[item.key as keyof typeof settings.visibility]}
                          onChange={(e) => updateSettings(`visibility.${item.key}`, e.target.checked)}
                          className="w-5 h-5 text-brand-primary-700 border-slate-300 rounded focus:ring-brand-primary-600"
                        />
                        <label htmlFor={item.key} className="text-sm font-medium text-slate-700">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Links Tab */}
            {activeTab === 'links' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Hızlı Bağlantılar
                  </h3>
                  <button
                    onClick={addQuickLink}
                    className="flex items-center space-x-2 px-4 py-2 bg-brand-primary-700 hover:bg-brand-primary-800 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Bağlantı Ekle</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {settings.quickLinks.map((link, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Başlık
                          </label>
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateQuickLink(index, 'title', e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                            placeholder="Bağlantı başlığı..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            URL
                          </label>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`external-${index}`}
                            checked={link.isExternal}
                            onChange={(e) => updateQuickLink(index, 'isExternal', e.target.checked)}
                            className="w-5 h-5 text-brand-primary-700 border-slate-300 rounded focus:ring-brand-primary-600"
                          />
                          <label htmlFor={`external-${index}`} className="text-sm font-medium text-slate-700">
                            Yeni sekmede aç
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveQuickLink(index, 'up')}
                            disabled={index === 0}
                            className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                          >
                            <ArrowUpIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveQuickLink(index, 'down')}
                            disabled={index === settings.quickLinks.length - 1}
                            className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                          >
                            <ArrowDownIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeQuickLink(index)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Sosyal Medya Bağlantıları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(settings.socialLinks).map(([platform, url]) => (
                    <div key={platform}>
                      <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                        {platform}
                      </label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateSettings(`socialLinks.${platform}`, e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                        placeholder={`https://${platform}.com/...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Görünüm Ayarları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Arka Plan Rengi
                    </label>
                    <input
                      type="color"
                      value={settings.theme.backgroundColor}
                      onChange={(e) => updateSettings('theme.backgroundColor', e.target.value)}
                      className="w-full h-12 border border-slate-300 rounded-xl cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Metin Rengi
                    </label>
                    <input
                      type="color"
                      value={settings.theme.textColor}
                      onChange={(e) => updateSettings('theme.textColor', e.target.value)}
                      className="w-full h-12 border border-slate-300 rounded-xl cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Vurgu Rengi
                    </label>
                    <input
                      type="color"
                      value={settings.theme.accentColor}
                      onChange={(e) => updateSettings('theme.accentColor', e.target.value)}
                      className="w-full h-12 border border-slate-300 rounded-xl cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 