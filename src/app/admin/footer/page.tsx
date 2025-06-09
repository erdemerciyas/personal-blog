'use client';

import { useState, useEffect } from 'react';
import { 
  CogIcon, 
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
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
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'links' | 'social' | 'appearance'>('content');

  useEffect(() => {
    fetchSettings();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Footer Ayarları</h1>
          <p className="text-slate-600 mt-2">Site alt kısmının görünümünü ve içeriğini yönetin</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {resetting ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5" />
            )}
            <span>Sıfırla</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <CheckIcon className="h-5 w-5" />
            )}
            <span>Kaydet</span>
          </button>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ana Açıklama */}
        <div className="lg:col-span-2">
          <label className="label-text">Ana Açıklama</label>
          <textarea
            value={settings.mainDescription}
            onChange={(e) => setSettings({ ...settings, mainDescription: e.target.value })}
            rows={3}
            className="input-field resize-none"
            placeholder="Footer'da görünecek ana açıklama metni..."
          />
        </div>

        {/* İletişim Bilgileri */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <CogIcon className="h-5 w-5 mr-2" />
            İletişim Bilgileri
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label-text">E-posta</label>
              <input
                type="email"
                value={settings.contactInfo.email}
                onChange={(e) => setSettings({
                  ...settings,
                  contactInfo: { ...settings.contactInfo, email: e.target.value }
                })}
                className="input-field"
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <label className="label-text">Telefon</label>
              <input
                type="text"
                value={settings.contactInfo.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  contactInfo: { ...settings.contactInfo, phone: e.target.value }
                })}
                className="input-field"
                placeholder="+90 (500) 123 45 67"
              />
            </div>
            <div>
              <label className="label-text">Adres</label>
              <input
                type="text"
                value={settings.contactInfo.address}
                onChange={(e) => setSettings({
                  ...settings,
                  contactInfo: { ...settings.contactInfo, address: e.target.value }
                })}
                className="input-field"
                placeholder="Şehir, Ülke"
              />
            </div>
          </div>
        </div>

        {/* Copyright Bilgileri */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Copyright & Geliştirici</h3>
          <div className="space-y-4">
            <div>
              <label className="label-text">Şirket Adı</label>
              <input
                type="text"
                value={settings.copyrightInfo.companyName}
                onChange={(e) => setSettings({
                  ...settings,
                  copyrightInfo: { ...settings.copyrightInfo, companyName: e.target.value }
                })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Yıl</label>
              <input
                type="number"
                value={settings.copyrightInfo.year}
                onChange={(e) => setSettings({
                  ...settings,
                  copyrightInfo: { ...settings.copyrightInfo, year: parseInt(e.target.value) }
                })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Geliştirici Adı</label>
              <input
                type="text"
                value={settings.developerInfo.name}
                onChange={(e) => setSettings({
                  ...settings,
                  developerInfo: { ...settings.developerInfo, name: e.target.value }
                })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Geliştirici Website</label>
              <input
                type="url"
                value={settings.developerInfo.website}
                onChange={(e) => setSettings({
                  ...settings,
                  developerInfo: { ...settings.developerInfo, website: e.target.value }
                })}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 