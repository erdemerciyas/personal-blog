'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CubeTransparentIcon,
  ArrowLeftIcon,
  UserIcon,
  DocumentTextIcon,
  GlobeAltIcon
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
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      } catch (error) {
        console.error('Contact data fetch error:', error);
        setError('İletişim bilgileri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchContactData();
    }
  }, [status]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

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
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/contact-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        throw new Error('İletişim bilgileri güncellenirken hata oluştu');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Update error:', error);
      setError('İletişim bilgileri güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-slate-300">İletişim bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo and Title */}
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
                <h1 className="text-xl font-bold text-white">İletişim Bilgileri</h1>
                <p className="text-sm text-slate-300">İletişim sayfası ayarları</p>
              </div>
            </div>

            {/* User Menu */}
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
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 text-sm font-medium border border-red-500/30"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                  <EnvelopeIcon className="w-8 h-8 text-teal-400" />
                  <span>İletişim Bilgileri Yönetimi</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  Web sitesinde görünen iletişim bilgilerini düzenleyin.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6">
            <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/30 text-green-300 p-6 rounded-2xl flex items-center space-x-3">
              <CheckIcon className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-semibold">İletişim bilgileri başarıyla güncellendi!</p>
                <p className="text-sm text-green-200">Değişiklikler web sitesinde görünecek.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-300 p-4 rounded-2xl flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Contact Info */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Email */}
              <div className="space-y-3">
                <label htmlFor="email" className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                  <EnvelopeIcon className="w-5 h-5 text-teal-400" />
                  <span>E-posta Adresi</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={contactData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="ornek@sirket.com"
                />
              </div>

              {/* Phone */}
              <div className="space-y-3">
                <label htmlFor="phone" className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                  <PhoneIcon className="w-5 h-5 text-teal-400" />
                  <span>Telefon Numarası</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={contactData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="+90 (555) 123 45 67"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <label htmlFor="address" className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                <MapPinIcon className="w-5 h-5 text-teal-400" />
                <span>Adres</span>
                <span className="text-red-400">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                value={contactData.address}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Tam adres bilgisi..."
              />
            </div>

            {/* Working Hours */}
            <div className="space-y-3">
              <label htmlFor="workingHours" className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                <ClockIcon className="w-5 h-5 text-teal-400" />
                <span>Çalışma Saatleri</span>
              </label>
              <input
                type="text"
                id="workingHours"
                name="workingHours"
                value={contactData.workingHours}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="Pazartesi - Cuma: 09:00 - 18:00"
              />
            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <h3 className="flex items-center space-x-2 text-lg font-semibold text-white">
                <GlobeAltIcon className="w-6 h-6 text-teal-400" />
                <span>Sosyal Medya Bağlantıları</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">LinkedIn</label>
                  <input
                    type="url"
                    name="socialLinks.linkedin"
                    value={contactData.socialLinks.linkedin}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Twitter</label>
                  <input
                    type="url"
                    name="socialLinks.twitter"
                    value={contactData.socialLinks.twitter}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://twitter.com/username"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Instagram</label>
                  <input
                    type="url"
                    name="socialLinks.instagram"
                    value={contactData.socialLinks.instagram}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://instagram.com/username"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Facebook</label>
                  <input
                    type="url"
                    name="socialLinks.facebook"
                    value={contactData.socialLinks.facebook}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://facebook.com/username"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
              <Link
                href="/admin/dashboard"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl transition-all duration-200 font-medium border border-white/20"
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={saving || success}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  saving || success
                    ? 'bg-teal-600/50 cursor-not-allowed text-teal-200'
                    : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Başarılı!</span>
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>Değişiklikleri Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 