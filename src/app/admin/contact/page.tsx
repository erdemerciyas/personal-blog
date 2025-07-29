'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import Toast from '../../../components/admin/Toast';
import { useToast } from '../../../hooks/useToast';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function AdminContactPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
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

  // Auth check
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch contact data
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
        error('Yükleme Hatası', 'İletişim bilgileri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchContactData();
    }
  }, [status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
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
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Client-side validation
    if (!contactData.email || !contactData.phone || !contactData.address) {
      error('Doğrulama Hatası', 'E-posta, telefon ve adres alanları zorunludur');
      setSaving(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
      error('Doğrulama Hatası', 'Geçerli bir e-posta adresi giriniz');
      setSaving(false);
      return;
    }

    try {
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('/api/contact-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        throw new Error(errorData.error || `HTTP ${response.status}: İletişim bilgileri güncellenirken hata oluştu`);
      }

      const result = await response.json();
      console.log('Update successful:', result);

      success('Başarılı!', 'İletişim bilgileri başarıyla güncellendi');

    } catch (updateError) {
      console.error('Update error:', updateError);
      
      if (updateError instanceof Error) {
        if (updateError.name === 'AbortError') {
          error('Zaman Aşımı', 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
        } else {
          error('Güncelleme Hatası', updateError.message || 'İletişim bilgileri güncellenirken hata oluştu');
        }
      } else {
        error('Güncelleme Hatası', 'İletişim bilgileri güncellenirken hata oluştu');
      }
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <span>İletişim bilgileri yükleniyor...</span>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout 
      title="İletişim Bilgileri"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'İletişim Bilgileri' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600">İletişim sayfası bilgilerini düzenleyin</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              saving
                ? 'bg-slate-400 cursor-not-allowed text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
            }`}
          >
            {saving ? (
              <>
                <div className="flex items-center space-x-2">
                  <span>Kaydediliyor...</span>
                </div>
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Kaydet</span>
              </>
            )}
          </button>
        </div>

        {/* Toast Notifications */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Contact Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <EnvelopeIcon className="w-5 h-5 text-teal-600" />
              <span>Temel İletişim Bilgileri</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  name="email"
                  value={contactData.email}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="info@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Telefon Numarası
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={contactData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="+90 555 000 00 00"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adres
                </label>
                <textarea
                  name="address"
                  value={contactData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Tam adres bilgisi..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Çalışma Saatleri
                </label>
                <input
                  type="text"
                  name="workingHours"
                  value={contactData.workingHours}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Pazartesi - Cuma: 09:00 - 18:00"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <GlobeAltIcon className="w-5 h-5 text-teal-600" />
              <span>Sosyal Medya Hesapları</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="socialLinks.linkedin"
                  value={contactData.socialLinks.linkedin}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  name="socialLinks.twitter"
                  value={contactData.socialLinks.twitter}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://twitter.com/..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  name="socialLinks.instagram"
                  value={contactData.socialLinks.instagram}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://instagram.com/..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  name="socialLinks.facebook"
                  value={contactData.socialLinks.facebook}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5 text-teal-600" />
              <span>Önizleme</span>
            </h3>
            
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-teal-600" />
                    <span className="text-slate-700">{contactData.email || 'E-posta girilmedi'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-teal-600" />
                    <span className="text-slate-700">{contactData.phone || 'Telefon girilmedi'}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-teal-600 mt-0.5" />
                    <span className="text-slate-700">{contactData.address || 'Adres girilmedi'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-teal-600" />
                    <span className="text-slate-700">{contactData.workingHours || 'Çalışma saatleri girilmedi'}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900">Sosyal Medya:</h4>
                  {Object.entries(contactData.socialLinks).map(([platform, url]) => (
                    <div key={platform} className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                      <span className="text-slate-700 capitalize">
                        {platform}: {url || 'Girilmedi'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 