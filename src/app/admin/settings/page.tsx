'use client';

import { useState, useEffect } from 'react';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminInput, AdminTextarea, AdminTabs, AdminAlert, AdminSpinner, AdminCheckbox } from '@/components/admin/ui';
import { CheckIcon, Cog6ToothIcon, PhotoIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [data, setData] = useState({
    siteName: '',
    siteTitle: '',
    siteDescription: '',
    siteUrl: '',
    logo: '',
    maintenanceMode: false,
    allowRegistration: false,
    googleAnalyticsId: '',
    googleTagManagerId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const defaultData = {
      siteName: '',
      siteTitle: '',
      siteDescription: '',
      siteUrl: '',
      logo: '',
      maintenanceMode: false,
      allowRegistration: false,
      googleAnalyticsId: '',
      googleTagManagerId: ''
    };
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : Promise.resolve(defaultData))
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setSuccess('Ayarlar kaydedildi!');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminLayoutNew title="Ayarlar"><div className="flex justify-center py-12"><AdminSpinner size="lg" /></div></AdminLayoutNew>
  );

  const tabs = [
    { id: 'basic', label: 'Temel', icon: Cog6ToothIcon, content: null },
    { id: 'logo', label: 'Logo', icon: PhotoIcon, content: null },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, content: null }
  ];

  return (
    <AdminLayoutNew
      title="Sistem Ayarları"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Ayarlar' }]}
      actions={<AdminButton variant="primary" icon={CheckIcon} onClick={handleSave} loading={saving}>Kaydet</AdminButton>}
    >
      <div className="space-y-6">
        {success && <AdminAlert variant="success" onClose={() => setSuccess('')}>{success}</AdminAlert>}
        
        <AdminTabs tabs={tabs} defaultTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'basic' && (
          <AdminCard title="Temel Ayarlar" padding="md">
            <div className="space-y-4">
              <AdminInput label="Site Adı" value={data.siteName} onChange={e => setData({...data, siteName: e.target.value})} />
              <AdminInput label="Site URL" type="url" value={data.siteUrl} onChange={e => setData({...data, siteUrl: e.target.value})} />
              <AdminInput label="Site Başlığı" value={data.siteTitle} onChange={e => setData({...data, siteTitle: e.target.value})} />
              <AdminTextarea label="Site Açıklaması" value={data.siteDescription} onChange={e => setData({...data, siteDescription: e.target.value})} rows={4} />
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <AdminCheckbox label="Bakım Modu" checked={data.maintenanceMode} onChange={e => setData({...data, maintenanceMode: e.target.checked})} />
                <AdminCheckbox label="Kullanıcı Kaydına İzin Ver" checked={data.allowRegistration} onChange={e => setData({...data, allowRegistration: e.target.checked})} />
              </div>
            </div>
          </AdminCard>
        )}

        {activeTab === 'logo' && (
          <AdminCard title="Logo Ayarları" padding="md">
            <div className="space-y-4">
              <AdminInput label="Logo URL" type="url" value={data.logo} onChange={e => setData({...data, logo: e.target.value})} placeholder="https://example.com/logo.png" />
              {data.logo && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Önizleme:</p>
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg inline-block">
                    <img src={data.logo} alt="Logo" className="h-12 object-contain" />
                  </div>
                </div>
              )}
            </div>
          </AdminCard>
        )}

        {activeTab === 'analytics' && (
          <AdminCard title="Analytics Ayarları" padding="md">
            <div className="space-y-4">
              <AdminInput label="Google Analytics ID" value={data.googleAnalyticsId} onChange={e => setData({...data, googleAnalyticsId: e.target.value})} placeholder="G-XXXXXXXXXX" />
              <AdminInput label="Google Tag Manager ID" value={data.googleTagManagerId} onChange={e => setData({...data, googleTagManagerId: e.target.value})} placeholder="GTM-XXXXXXX" />
            </div>
          </AdminCard>
        )}
      </div>
    </AdminLayoutNew>
  );
}
