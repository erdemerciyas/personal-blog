'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MediaBrowser from '@/components/MediaBrowser';
import { 
  CogIcon,
  ArrowLeftIcon,
  CubeTransparentIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  UserIcon,
  CameraIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  Cog8ToothIcon,
  PencilIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  UsersIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

interface Settings {
  _id?: string;
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  ogImage: string;
  twitterHandle: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  adminSettings: {
    defaultLanguage: string;
    timezone: string;
    dateFormat: string;
    enableNotifications: boolean;
  };
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUploadSize: number;
  isActive: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  
  // User Management States
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [settings, setSettings] = useState<Settings>({
    siteName: '',
    siteTitle: '',
    siteDescription: '',
    siteKeywords: '',
    siteUrl: '',
    logo: '',
    favicon: '',
    ogImage: '',
    twitterHandle: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    adminSettings: {
      defaultLanguage: 'tr',
      timezone: 'Europe/Istanbul',
      dateFormat: 'DD/MM/YYYY',
      enableNotifications: true
    },
    maintenanceMode: false,
    allowRegistration: false,
    maxUploadSize: 10,
    isActive: true
  });

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          console.log('Settings loaded:', data);
          setSettings(data);
        }
      } catch (error) {
        console.error('Settings yükleme hatası:', error);
        setMessage({ type: 'error', text: 'Ayarlar yüklenirken hata oluştu.' });
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadSettings();
    }
  }, [status]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.startsWith('adminSettings.')) {
      const subField = field.replace('adminSettings.', '');
      setSettings(prev => ({
        ...prev,
        adminSettings: {
          ...prev.adminSettings,
          [subField]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    // Dosya türü kontrolü
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Lütfen sadece resim dosyası yükleyin.' });
      return;
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Dosya boyutu 5MB\'dan küçük olmalıdır.' });
      return;
    }

    setUploadingLogo(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        handleInputChange('logo', data.url);
        setMessage({ type: 'success', text: 'Logo başarıyla yüklendi!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload hatası');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Logo yüklenirken hata oluştu.' });
    } finally {
      setUploadingLogo(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleMediaSelect = (logoUrl: string) => {
    handleInputChange('logo', logoUrl);
    setMessage({ type: 'success', text: 'Logo seçildi!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const openMediaLibrary = () => {
    setShowMediaLibrary(true);
  };

  const handleUploadNew = () => {
    setShowMediaLibrary(false);
    // Dosya input'unu aç
    document.getElementById('logo-upload')?.click();
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Kaydetme hatası');
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  // User Management Functions
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error('Kullanıcılar yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Users load error:', error);
      setMessage({ type: 'error', text: 'Kullanıcılar yüklenirken hata oluştu.' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      setMessage({ type: 'error', text: 'Tüm alanları doldurun.' });
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Kullanıcı başarıyla oluşturuldu!' });
        setShowAddUser(false);
        setNewUser({ name: '', email: '', password: '', role: 'user' });
        loadUsers();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kullanıcı oluşturulurken hata oluştu');
      }
    } catch (error) {
      console.error('Create user error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Kullanıcı oluşturulurken hata oluştu.' 
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Kullanıcı başarıyla silindi!' });
        loadUsers();
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Kullanıcı silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      setMessage({ type: 'error', text: 'Kullanıcı silinirken hata oluştu.' });
    }
  };

  const changePassword = async () => {
    if (!passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor veya boş.' });
      return;
    }

    try {
      const response = await fetch('/api/admin/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser?._id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          isAdmin: true
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi!' });
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSelectedUser(null);
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Şifre değiştirilirken hata oluştu');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Şifre değiştirilirken hata oluştu.' 
      });
    }
  };

  // Load users when users tab is selected
  useEffect(() => {
    if (activeTab === 'users' && status === 'authenticated') {
      loadUsers();
    }
  }, [activeTab, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-white text-lg">Ayarlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const tabs = [
    { id: 'basic', name: 'Temel Ayarlar', icon: GlobeAltIcon },
    { id: 'branding', name: 'Marka & Logo', icon: CameraIcon },
    { id: 'admin', name: 'Yönetici Ayarları', icon: UserIcon },
    { id: 'system', name: 'Sistem Ayarları', icon: ShieldCheckIcon },
    { id: 'analytics', name: 'Analitik', icon: ChartBarIcon },
    { id: 'advanced', name: 'Gelişmiş', icon: Cog8ToothIcon },
    { id: 'users', name: 'Kullanıcı Yönetimi', icon: UsersIcon }
  ];

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
                <h1 className="text-xl font-bold text-white">Sistem Ayarları</h1>
                <p className="text-sm text-slate-300">Site ve sistem yapılandırması</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                <p className="text-xs text-slate-400">{session?.user?.email}</p>
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
      <main className="max-w-7xl mx-auto p-6 sm:p-8">

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/30 text-green-300' 
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}>
            {message.type === 'success' ? (
              <CheckIcon className="w-5 h-5" />
            ) : (
              <XMarkIcon className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/5 p-1 rounded-xl overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
          
          {/* Basic Settings Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Temel Site Ayarları</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Site Adı
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Site adınız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Site URL
                  </label>
                  <input
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Site Başlığı (SEO)
                  </label>
                  <input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="SEO için site başlığı"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Site Açıklaması
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    rows={4}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Site açıklamanız..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    SEO Anahtar Kelimeleri
                  </label>
                  <input
                    type="text"
                    value={settings.siteKeywords}
                    onChange={(e) => handleInputChange('siteKeywords', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="mühendislik, 3d tarama, teknoloji (virgülle ayırın)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Branding & Logo Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Marka ve Logo Yönetimi</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Logo Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Site Logo</h3>
                  
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    {/* Logo Preview - Büyütülmüş alan */}
                    <div className="mb-6 bg-white rounded-xl p-6 flex items-center justify-center min-h-[200px]">
                      {settings.logo ? (
                        <div className="relative group">
                          <Image
                            src={settings.logo}
                            alt="Site Logo"
                            width={400}
                            height={150}
                            className="max-w-full max-h-full object-contain"
                            onError={() => handleInputChange('logo', '')}
                          />
                          <button
                            onClick={() => handleInputChange('logo', '')}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Logoyu kaldır"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-slate-400 text-center">
                          <CameraIcon className="w-16 h-16 mx-auto mb-4" />
                          <p className="text-lg font-semibold">Logo Önizlemesi</p>
                          <p className="text-sm">Logo yükleyin veya URL girin</p>
                        </div>
                      )}
                    </div>

                    {/* Upload Options */}
                    <div className="space-y-4">
                      {/* Media Library Button */}
                      <button
                        onClick={openMediaLibrary}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <PhotoIcon className="w-5 h-5" />
                        <span>Medya Kütüphanesinden Seç</span>
                      </button>

                      <div className="flex items-center">
                        <div className="flex-1 border-t border-white/20"></div>
                        <span className="px-3 text-xs text-slate-400">VEYA YENİ LOGO YÜKLE</span>
                        <div className="flex-1 border-t border-white/20"></div>
                      </div>

                      {/* File Upload Area */}
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                          uploadingLogo
                            ? 'border-teal-500 bg-teal-500/10'
                            : 'border-white/30 hover:border-teal-500 hover:bg-white/5'
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          id="logo-upload"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingLogo}
                        />
                        
                        {uploadingLogo ? (
                          <div className="space-y-3">
                            <CloudArrowUpIcon className="w-12 h-12 mx-auto text-teal-400 animate-pulse" />
                            <div className="space-y-2">
                              <p className="text-teal-300 font-semibold">Logo yükleniyor...</p>
                              <div className="w-full bg-white/20 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-slate-400">{uploadProgress}%</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <CloudArrowUpIcon className="w-12 h-12 mx-auto text-slate-400" />
                            <div>
                              <p className="text-white font-semibold">Yeni Logo Yükle</p>
                              <p className="text-sm text-slate-400 mt-1">
                                Dosyayı buraya sürükleyin veya tıklayın
                              </p>
                              <p className="text-xs text-slate-500 mt-2">
                                JPG, PNG, GIF, WebP (Maks. 5MB)
                              </p>
                            </div>
                            <button
                              type="button"
                              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                              onClick={handleUploadNew}
                            >
                              Dosya Seç
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center">
                        <div className="flex-1 border-t border-white/20"></div>
                        <span className="px-3 text-xs text-slate-400">VEYA URL GİR</span>
                        <div className="flex-1 border-t border-white/20"></div>
                      </div>

                      {/* URL Input */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-2">
                          Logo URL (manuel giriş)
                        </label>
                        <input
                          type="url"
                          value={settings.logo}
                          onChange={(e) => handleInputChange('logo', e.target.value)}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Favicon & OG Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">İkonlar</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Favicon URL
                    </label>
                    <input
                      type="url"
                      value={settings.favicon}
                      onChange={(e) => handleInputChange('favicon', e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="/favicon.ico"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      OG Image URL (Sosyal Medya)
                    </label>
                    <input
                      type="url"
                      value={settings.ogImage}
                      onChange={(e) => handleInputChange('ogImage', e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="/images/og-image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Twitter Handle
                    </label>
                    <input
                      type="text"
                      value={settings.twitterHandle}
                      onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Settings Tab */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Yönetici Ayarları</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Varsayılan Dil
                  </label>
                  <select
                    value={settings.adminSettings.defaultLanguage}
                    onChange={(e) => handleInputChange('adminSettings.defaultLanguage', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Zaman Dilimi
                  </label>
                  <select
                    value={settings.adminSettings.timezone}
                    onChange={(e) => handleInputChange('adminSettings.timezone', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                    <option value="Europe/London">Londra (UTC+0)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                    <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Tarih Formatı
                  </label>
                  <select
                    value={settings.adminSettings.dateFormat}
                    onChange={(e) => handleInputChange('adminSettings.dateFormat', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={settings.adminSettings.enableNotifications}
                    onChange={(e) => handleInputChange('adminSettings.enableNotifications', e.target.checked)}
                    className="w-4 h-4 text-teal-600 bg-white/5 border-white/20 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="notifications" className="text-sm font-semibold text-slate-200">
                    Bildirimler Etkin
                  </label>
                </div>
              </div>

              {/* Current User Info */}
              <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Mevcut Oturum</h3>
                <div className="space-y-2 text-slate-300">
                  <p><strong>Email:</strong> {session?.user?.email}</p>
                  <p><strong>İsim:</strong> {session?.user?.name}</p>
                  <p><strong>Rol:</strong> {(session?.user as any)?.role || 'Admin'}</p>
                </div>
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Sistem Ayarları</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="maintenance"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                      className="w-4 h-4 text-red-600 bg-white/5 border-white/20 rounded focus:ring-red-500"
                    />
                    <label htmlFor="maintenance" className="text-sm font-semibold text-slate-200">
                      Bakım Modu
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="registration"
                      checked={settings.allowRegistration}
                      onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                      className="w-4 h-4 text-teal-600 bg-white/5 border-white/20 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="registration" className="text-sm font-semibold text-slate-200">
                      Kullanıcı Kaydına İzin Ver
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Maksimum Upload Boyutu (MB)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxUploadSize}
                    onChange={(e) => handleInputChange('maxUploadSize', parseInt(e.target.value))}
                    className="w-full md:w-1/3 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {settings.maintenanceMode && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                      <InformationCircleIcon className="w-6 h-6 text-yellow-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-yellow-300">Bakım Modu Aktif</h3>
                        <p className="text-yellow-200 text-sm">Site ziyaretçiler için erişilebilir değil. Sadece admin kullanıcılar erişebilir.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Analitik ve İzleme</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={settings.googleAnalyticsId}
                    onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-slate-400 mt-1">Google Analytics 4 Measurement ID</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Google Tag Manager ID
                  </label>
                  <input
                    type="text"
                    value={settings.googleTagManagerId}
                    onChange={(e) => handleInputChange('googleTagManagerId', e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="GTM-XXXXXXX"
                  />
                  <p className="text-xs text-slate-400 mt-1">Google Tag Manager Container ID</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Kurulum Bilgileri</h3>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>• Google Analytics: Site trafiği ve kullanıcı davranışlarını izler</p>
                    <p>• Google Tag Manager: Çeşitli izleme kodlarını merkezi olarak yönetir</p>
                    <p>• Bu ayarlar değiştirildiğinde site otomatik olarak güncellenecektir</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Gelişmiş Ayarlar</h2>
              
              <div className="space-y-6">
                {/* Senkronizasyon Butonu */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-4">Veri Senkronizasyonu</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200">
                      Logo ve site bilgilerini header'da göstermek için veritabanı senkronizasyonu yapın.
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          setSaving(true);
                          const response = await fetch('/api/settings/sync', {
                            method: 'POST'
                          });
                          
                          if (response.ok) {
                            const data = await response.json();
                            console.log('Senkronizasyon sonucu:', data);
                            setMessage({ type: 'success', text: 'Veriler başarıyla senkronize edildi!' });
                          } else {
                            throw new Error('Senkronizasyon hatası');
                          }
                        } catch (error) {
                          console.error('Sync error:', error);
                          setMessage({ type: 'error', text: 'Senkronizasyon sırasında hata oluştu.' });
                        } finally {
                          setSaving(false);
                          setTimeout(() => setMessage(null), 5000);
                        }
                      }}
                      disabled={saving}
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          <span>Senkronize ediliyor...</span>
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-4 h-4" />
                          <span>Verileri Senkronize Et</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-300 mb-4">Tehlikeli Bölge</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={settings.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="w-4 h-4 text-green-600 bg-white/5 border-white/20 rounded focus:ring-green-500"
                      />
                      <label htmlFor="isActive" className="text-sm font-semibold text-slate-200">
                        Ayarlar Aktif
                      </label>
                    </div>
                    <p className="text-sm text-red-300">
                      Bu seçeneği devre dışı bırakırsanız, tüm site ayarları geçici olarak pasif hale gelir.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-4">Sistem Bilgileri</h3>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p><strong>Ayarlar ID:</strong> {settings._id || 'Yeni kayıt'}</p>
                    <p><strong>Son Güncelleme:</strong> {new Date().toLocaleString('tr-TR')}</p>
                    <p><strong>Veritabanı:</strong> MongoDB</p>
                    <p><strong>Framework:</strong> Next.js 14</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Kullanıcı Yönetimi</h2>
              
              {/* Current User Info */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-300 mb-4">Mevcut Oturum Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="font-medium">{session?.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">İsim</p>
                    <p className="font-medium">{session?.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Rol</p>
                    <p className="font-medium capitalize">{(session?.user as any)?.role || 'Admin'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser({
                          _id: (session?.user as any)?.id,
                          name: session?.user?.name || '',
                          email: session?.user?.email || '',
                          role: (session?.user as any)?.role || 'admin',
                          createdAt: '',
                          updatedAt: ''
                        });
                        setShowPasswordModal(true);
                      }}
                      className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 hover:text-yellow-200 rounded-xl transition-all duration-200 text-sm font-medium border border-yellow-600/30 flex items-center space-x-2"
                    >
                      <KeyIcon className="w-4 h-4" />
                      <span>Şifre Değiştir</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Add User Button */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Tüm Kullanıcılar</h3>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Yeni Kullanıcı</span>
                </button>
              </div>

              {/* Add User Form */}
              {showAddUser && (
                <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-teal-300 mb-4">Yeni Kullanıcı Ekle</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">İsim</label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Kullanıcı adı"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">Şifre</label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="En az 6 karakter"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">Rol</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'user'})}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="user" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>Kullanıcı</option>
                        <option value="admin" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-3 mt-4">
                    <button
                      onClick={() => {
                        setShowAddUser(false);
                        setNewUser({ name: '', email: '', password: '', role: 'user' });
                      }}
                      className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      onClick={createUser}
                      className="px-6 py-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
                    >
                      Kullanıcı Oluştur
                    </button>
                  </div>
                </div>
              )}

              {/* Users List */}
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-slate-200">İsim</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-200">Email</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-200">Rol</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-200">Oluşturulma</th>
                        <th className="text-right p-4 text-sm font-semibold text-slate-200">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingUsers ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div>
                              <span className="text-slate-400">Kullanıcılar yükleniyor...</span>
                            </div>
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400">
                            Henüz kullanıcı bulunmuyor
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <div className="font-medium text-white">{user.name}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-slate-300">{user.email}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                user.role === 'admin' 
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="text-slate-400 text-sm">
                                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowPasswordModal(true);
                                  }}
                                  className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 hover:text-yellow-200 rounded-lg transition-colors"
                                  title="Şifre değiştir"
                                >
                                  <KeyIcon className="w-4 h-4" />
                                </button>
                                {user._id !== (session?.user as any)?.id && (
                                  <button
                                    onClick={() => deleteUser(user._id)}
                                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 rounded-lg transition-colors"
                                    title="Kullanıcıyı sil"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-white/10">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>Tüm Ayarları Kaydet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Media Library Modal */}
      <MediaBrowser
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleMediaSelect}
        onUploadNew={handleUploadNew}
        title="Logo Seç"
        allowedTypes={['image/']}
        theme="light"
      />

      {/* Password Change Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl max-w-md w-full border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <KeyIcon className="w-5 h-5 text-yellow-400" />
                <span>Şifre Değiştir</span>
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedUser(null);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-slate-300 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <strong>{selectedUser.name}</strong> kullanıcısının şifresini değiştiriyorsunuz
              </div>

              {selectedUser._id === (session?.user as any)?.id && (
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Mevcut Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Mevcut şifrenizi girin"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="En az 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Yeni şifreyi tekrar girin"
                />
              </div>

              {passwordData.newPassword && passwordData.confirmPassword && 
               passwordData.newPassword !== passwordData.confirmPassword && (
                <div className="text-red-400 text-sm">
                  Şifreler eşleşmiyor
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedUser(null);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                onClick={changePassword}
                disabled={!passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Şifre Değiştir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 