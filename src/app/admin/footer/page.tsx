'use client';

import { useState, useEffect } from 'react';
import { AdminLayoutNew } from '@/components/admin/layout';
import { AdminCard, AdminButton, AdminInput, AdminTextarea, AdminTabs, AdminAlert, AdminSpinner } from '@/components/admin/ui';
import { CheckIcon, GlobeAltIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function FooterPage() {
  const [data, setData] = useState({
    mainDescription: '',
    contactInfo: { email: '', phone: '', address: '' },
    socialLinks: { linkedin: '', twitter: '', instagram: '', facebook: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    const defaultData = {
      mainDescription: '',
      contactInfo: { email: '', phone: '', address: '' },
      socialLinks: { linkedin: '', twitter: '', instagram: '', facebook: '' }
    };
    fetch('/api/admin/footer-settings')
      .then(r => r.ok ? r.json() : Promise.resolve(defaultData))
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/footer-settings', {
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
    <AdminLayoutNew title="Footer"><div className="flex justify-center py-12"><AdminSpinner size="lg" /></div></AdminLayoutNew>
  );

  const tabs = [
    { id: 'content', label: 'İçerik', icon: EnvelopeIcon, content: null },
    { id: 'social', label: 'Sosyal Medya', icon: GlobeAltIcon, content: null }
  ];

  return (
    <AdminLayoutNew
      title="Footer Ayarları"
      breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Footer' }]}
      actions={<AdminButton variant="primary" icon={CheckIcon} onClick={handleSave} loading={saving}>Kaydet</AdminButton>}
    >
      <div className="space-y-6">
        {success && <AdminAlert variant="success" onClose={() => setSuccess('')}>{success}</AdminAlert>}
        
        <AdminTabs tabs={tabs} defaultTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'content' && (
          <AdminCard title="İçerik" padding="md">
            <div className="space-y-4">
              <AdminTextarea label="Ana Açıklama" value={data.mainDescription} onChange={e => setData({...data, mainDescription: e.target.value})} rows={4} />
              <AdminInput label="E-posta" type="email" value={data.contactInfo.email} onChange={e => setData({...data, contactInfo: {...data.contactInfo, email: e.target.value}})} />
              <AdminInput label="Telefon" type="tel" value={data.contactInfo.phone} onChange={e => setData({...data, contactInfo: {...data.contactInfo, phone: e.target.value}})} />
              <AdminInput label="Adres" value={data.contactInfo.address} onChange={e => setData({...data, contactInfo: {...data.contactInfo, address: e.target.value}})} />
            </div>
          </AdminCard>
        )}

        {activeTab === 'social' && (
          <AdminCard title="Sosyal Medya" padding="md">
            <div className="grid grid-cols-2 gap-4">
              <AdminInput label="LinkedIn" type="url" value={data.socialLinks.linkedin} onChange={e => setData({...data, socialLinks: {...data.socialLinks, linkedin: e.target.value}})} />
              <AdminInput label="Twitter" type="url" value={data.socialLinks.twitter} onChange={e => setData({...data, socialLinks: {...data.socialLinks, twitter: e.target.value}})} />
              <AdminInput label="Instagram" type="url" value={data.socialLinks.instagram} onChange={e => setData({...data, socialLinks: {...data.socialLinks, instagram: e.target.value}})} />
              <AdminInput label="Facebook" type="url" value={data.socialLinks.facebook} onChange={e => setData({...data, socialLinks: {...data.socialLinks, facebook: e.target.value}})} />
            </div>
          </AdminCard>
        )}
      </div>
    </AdminLayoutNew>
  );
}
