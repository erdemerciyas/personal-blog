'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AdminLayoutNew } from '@/components/admin/layout';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminTextarea,
  AdminSpinner,
  AdminAlert
} from '@/components/admin/ui';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function AdminContactPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contactData, setContactData] = useState({
    email: '',
    phone: '',
    address: '',
    workingHours: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: '',
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch('/api/contact-info');
        if (response.ok) {
          const data = await response.json();
          setContactData(data);
        } else {
          throw new Error('İletişim bilgileri yüklenirken hata oluştu');
        }
      } catch (fetchError) {
        console.error('Contact data fetch error:', fetchError);
        setErrorMsg('İletişim bilgileri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchContactData();
    }
  }, [status]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('socialLinks.')) {
      const socialKey = field.split('.')[1];
      setContactData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setContactData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!contactData.email || !contactData.phone || !contactData.address) {
      setErrorMsg('E-posta, telefon ve adres alanları zorunludur');
      setSaving(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
      setErrorMsg('Geçerli bir e-posta adresi giriniz');
      setSaving(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/contact-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        throw new Error(errorData.error || `HTTP ${response.status}: İletişim bilgileri güncellenirken hata oluştu`);
      }

      setSuccessMsg('İletişim bilgileri başarıyla güncellendi');
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (updateError) {
      console.error('Update error:', updateError);
      
      if (updateError instanceof Error) {
        if (updateError.name === 'AbortError') {
          setErrorMsg('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
        } else {
          setErrorMsg(updateError.message || 'İletişim bilgileri güncellenirken hata oluştu');
        }
      } else {
        setErrorMsg('İletişim bilgileri güncellenirken hata oluştu');
      }
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayoutNew
        title="İletişim Bilgileri"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'İletişim' }
        ]}
      >
        <div className="flex items-center justify-center py-12">
          <AdminSpinner size="lg" />
        </div>
      </AdminLayoutNew>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayoutNew 
      title="İletişim Bilgileri"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'İletişim' }
      ]}
      actions={
        <AdminButton
          onClick={handleSubmit}
          disabled={saving}
          variant="primary"
          icon={CheckIcon}
          loading={saving}
        >
          Kaydet
        </AdminButton>
      }
    >
      <div className="space-y-6">
        
        {/* Header Info */}
        <p className="text-slate-600 dark:text-slate-400">İletişim sayfası bilgilerini düzenleyin</p>

        {/* Success/Error Messages */}
        {successMsg && (
          <AdminAlert variant="success" onClose={() => setSuccessMsg('')}>
            {successMsg}
          </AdminAlert>
        )}

        {errorMsg && (
          <AdminAlert variant="error" onClose={() => setErrorMsg('')}>
            {errorMsg}
          </AdminAlert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Contact Info */}
          <AdminCard title="Temel İletişim Bilgileri" padding="md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminInput
                label="E-posta Adresi"
                type="email"
                value={contactData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="info@example.com"
                required
              />
              
              <AdminInput
                label="Telefon Numarası"
                type="tel"
                value={contactData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+90 555 000 00 00"
                required
              />
              
              <div className="md:col-span-2">
                <AdminTextarea
                  label="Adres"
                  value={contactData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  placeholder="Tam adres bilgisi..."
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <AdminInput
                  label="Çalışma Saatleri"
                  value={contactData.workingHours}
                  onChange={(e) => handleInputChange('workingHours', e.target.value)}
                  placeholder="Pazartesi - Cuma: 09:00 - 18:00"
                />
              </div>
            </div>
          </AdminCard>

          {/* Social Media Links */}
          <AdminCard title="Sosyal Medya Hesapları" padding="md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminInput
                label="LinkedIn"
                type="url"
                value={contactData.socialLinks.linkedin}
                onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
              
              <AdminInput
                label="Twitter"
                type="url"
                value={contactData.socialLinks.twitter}
                onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                placeholder="https://twitter.com/..."
              />
              
              <AdminInput
                label="Instagram"
                type="url"
                value={contactData.socialLinks.instagram}
                onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                placeholder="https://instagram.com/..."
              />
              
              <AdminInput
                label="Facebook"
                type="url"
                value={contactData.socialLinks.facebook}
                onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
          </AdminCard>

          {/* Preview Section */}
          <AdminCard title="Önizleme" padding="md">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-brand-primary-700 dark:text-brand-primary-400" />
                    <span className="text-slate-700 dark:text-slate-300">{contactData.email || 'E-posta girilmedi'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-brand-primary-700 dark:text-brand-primary-400" />
                    <span className="text-slate-700 dark:text-slate-300">{contactData.phone || 'Telefon girilmedi'}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-brand-primary-700 dark:text-brand-primary-400 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">{contactData.address || 'Adres girilmedi'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-brand-primary-700 dark:text-brand-primary-400" />
                    <span className="text-slate-700 dark:text-slate-300">{contactData.workingHours || 'Çalışma saatleri girilmedi'}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Sosyal Medya:</h4>
                  {Object.entries(contactData.socialLinks).map(([platform, url]) => (
                    <div key={platform} className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-brand-primary-700 dark:bg-brand-primary-400 rounded-full"></div>
                      <span className="text-slate-700 dark:text-slate-300 capitalize">
                        {platform}: {url || 'Girilmedi'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AdminCard>
        </form>
      </div>
    </AdminLayoutNew>
  );
}
