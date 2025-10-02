'use client';

import { useState, useEffect } from 'react';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminInput, AdminTextarea, AdminAlert, AdminSpinner } from '@/components/admin/ui';
import { CheckIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
  const [data, setData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    storyTitle: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const defaultData = {
      heroTitle: '',
      heroSubtitle: '',
      heroDescription: '',
      storyTitle: '',
      contactEmail: '',
      contactPhone: ''
    };
    fetch('/api/admin/about')
      .then(r => r.ok ? r.json() : Promise.resolve(defaultData))
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setSuccess('Kaydedildi!');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminLayoutNew title="Hakkımda"><div className="flex justify-center py-12"><AdminSpinner size="lg" /></div></AdminLayoutNew>
  );

  return (
    <AdminLayoutNew
      title="Hakkımda"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Hakkımda' }]}
      actions={<AdminButton variant="primary" icon={CheckIcon} onClick={handleSave} loading={saving}>Kaydet</AdminButton>}
    >
      <div className="space-y-6">
        {success && <AdminAlert variant="success" onClose={() => setSuccess('')}>{success}</AdminAlert>}
        
        <AdminCard title="Hero Bölümü" padding="md">
          <div className="space-y-4">
            <AdminInput label="Başlık" value={data.heroTitle} onChange={e => setData({...data, heroTitle: e.target.value})} />
            <AdminInput label="Alt Başlık" value={data.heroSubtitle} onChange={e => setData({...data, heroSubtitle: e.target.value})} />
            <AdminTextarea label="Açıklama" value={data.heroDescription} onChange={e => setData({...data, heroDescription: e.target.value})} rows={4} />
          </div>
        </AdminCard>

        <AdminCard title="Hikaye" padding="md">
          <AdminInput label="Başlık" value={data.storyTitle} onChange={e => setData({...data, storyTitle: e.target.value})} />
        </AdminCard>

        <AdminCard title="İletişim" padding="md">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="E-posta" type="email" value={data.contactEmail} onChange={e => setData({...data, contactEmail: e.target.value})} />
            <AdminInput label="Telefon" type="tel" value={data.contactPhone} onChange={e => setData({...data, contactPhone: e.target.value})} />
          </div>
        </AdminCard>
      </div>
    </AdminLayoutNew>
  );
}
