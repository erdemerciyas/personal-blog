'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '../../../components/ImageUpload';
import {
  CogIcon,
  UserIcon,
  ShieldCheckIcon,
  CheckIcon,
  PhotoIcon,
  UserGroupIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface SettingsData {
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
}

interface SiteSettings {
  _id?: string;
  siteName: string;
  slogan: string;
  description: string;
  logo: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  security: {
    enableSecurityQuestion: boolean;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  pageSettings: {
    home: boolean;
    about: boolean;
    services: boolean;
    portfolio: boolean;
    contact: boolean;
    blog: boolean;
  };
}

interface MediaItem {
  _id?: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploader?: string;
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Settings State
  const [settingsData, setSettingsData] = useState<SettingsData>({
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
      enableNotifications: true,
    },
    maintenanceMode: false,
    allowRegistration: false,
    maxUploadSize: 10,
  });

  // Brand Settings State
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [brandFormData, setBrandFormData] = useState({
    siteName: '',
    slogan: '',
    logoUrl: ''
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Name Change State
  const [nameData, setNameData] = useState({
    newName: '',
    currentPassword: ''
  });

  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  // Email Change State
  const [emailData, setEmailData] = useState({
    newEmail: '',
    currentPassword: ''
  });

  // Media Management State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [mediaFilter, setMediaFilter] = useState('all'); // 'all', 'images', 'videos', 'documents'
  const [mediaSortBy, setMediaSortBy] = useState('date'); // 'date', 'name', 'size'
  const [mediaSearchTerm, setMediaSearchTerm] = useState('');
  const [deletingMedia, setDeletingMedia] = useState(false);

  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [changingName, setChangingName] = useState(false);
  const [changingUser, setChangingUser] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
    emailCurrent: false
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [savingPageSettings, setSavingPageSettings] = useState(false);

  // Auth check
  useEffect(() => {
    if (status === 'loading') return;
    
    console.log('Admin Settings - Session Status:', status);
    console.log('Admin Settings - Session Data:', session);
    
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch settings data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsRes, siteSettingsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/admin/site-settings')
        ]);
        
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettingsData(data);
        }
        
        if (siteSettingsRes.ok) {
          const siteData = await siteSettingsRes.json();
          setSiteSettings(siteData);
          setBrandFormData({
            siteName: siteData.siteName || '',
            slogan: siteData.slogan || '',
            logoUrl: siteData.logo?.url || ''
          });
        }
      } catch (error) {
        console.error('Settings fetch error:', error);
        setError('Ayarlar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  // Fetch users when account tab is active
  useEffect(() => {
    if (status === 'authenticated' && activeTab === 'account') {
      fetchUsers();
    }
  }, [status, activeTab]);

  // Fetch media when media tab is active
  useEffect(() => {
    if (status === 'authenticated' && activeTab === 'media') {
      fetchMediaItems();
    }
  }, [status, activeTab]);

  const fetchMediaItems = async () => {
    setLoadingMedia(true);
    try {
      const response = await fetch('/api/admin/media');
      if (response.ok) {
        const data = await response.json();
        setMediaItems(data);
      } else {
        setError('Medya dosyaları yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Media fetch error:', error);
      setError('Medya dosyaları yüklenirken hata oluştu');
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleMediaSelect = (mediaId: string) => {
    setSelectedMedia(prev => 
      prev.includes(mediaId) 
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const handleSelectAllMedia = () => {
    const filteredItems = getFilteredMediaItems();
    const allSelected = filteredItems.every(item => selectedMedia.includes(item._id!));
    
    if (allSelected) {
      setSelectedMedia([]);
    } else {
      setSelectedMedia(filteredItems.map(item => item._id!));
    }
  };

  const getFilteredMediaItems = () => {
    let filtered = [...mediaItems];

    // Filter by type
    if (mediaFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (mediaFilter === 'images') return item.mimeType.startsWith('image/');
        if (mediaFilter === 'videos') return item.mimeType.startsWith('video/');
        if (mediaFilter === 'documents') return !item.mimeType.startsWith('image/') && !item.mimeType.startsWith('video/');
        return true;
      });
    }

    // Filter by search term
    if (mediaSearchTerm) {
      filtered = filtered.filter(item => 
        item.originalName.toLowerCase().includes(mediaSearchTerm.toLowerCase()) ||
        item.filename.toLowerCase().includes(mediaSearchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (mediaSortBy === 'date') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      if (mediaSortBy === 'name') {
        return a.originalName.localeCompare(b.originalName);
      }
      if (mediaSortBy === 'size') {
        return b.size - a.size;
      }
      return 0;
    });

    return filtered;
  };

  const handleDeleteSelectedMedia = async () => {
    if (selectedMedia.length === 0) return;
    
    const confirmed = window.confirm(`${selectedMedia.length} dosyayı silmek istediğinizden emin misiniz?`);
    if (!confirmed) return;

    setDeletingMedia(true);
    try {
      const response = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaIds: selectedMedia }),
      });

      if (response.ok) {
        setSuccess(`${selectedMedia.length} dosya başarıyla silindi`);
        setSelectedMedia([]);
        await fetchMediaItems(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Dosyalar silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Delete media error:', error);
      setError('Dosyalar silinirken hata oluştu');
    } finally {
      setDeletingMedia(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.includes('pdf')) return '📄';
    return '📁';
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('adminSettings.')) {
      const settingKey = name.split('.')[1];
      setSettingsData(prev => ({
        ...prev,
        adminSettings: {
          ...prev.adminSettings,
          [settingKey]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setSettingsData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleBrandFormChange = (field: string, value: string) => {
    setBrandFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (logoUrl: string) => {
    setBrandFormData(prev => ({
      ...prev,
      logoUrl
    }));
  };

  const handleLogoRemove = () => {
    setBrandFormData(prev => ({
      ...prev,
      logoUrl: ''
    }));
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBrand(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteName: brandFormData.siteName,
          slogan: brandFormData.slogan,
          logo: {
            url: brandFormData.logoUrl,
            alt: brandFormData.siteName + ' Logo',
            width: 200,
            height: 60
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSiteSettings(result.settings);
        setSuccess('Marka ayarları başarıyla güncellendi!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Güncelleme başarısız');
      }
    } catch (error) {
      setError('Marka ayarları güncellenirken hata oluştu');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSavingBrand(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailData({ ...emailData, [e.target.name]: e.target.value });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameData({ ...nameData, [e.target.name]: e.target.value });
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
    } else {
      setNewUser({ ...newUser, [e.target.name]: e.target.value });
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error('Kullanıcılar getirilemedi');
      }
    } catch (error) {
      setError('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      if (response.ok) {
        setSuccess('Ayarlar başarıyla güncellendi!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Güncelleme başarısız');
      }
    } catch (error) {
      setError('Ayarlar güncellenirken hata oluştu');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Şifre güncellenirken hata oluştu');
      }

      setSuccess('Şifre başarıyla güncellendi!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Password update error:', error);
      setError(error instanceof Error ? error.message : 'Şifre güncellenirken hata oluştu');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingEmail(true);
    setError('');
    setSuccess('');

    try {
      console.log('Email değiştirme isteği gönderiliyor...', {
        newEmail: emailData.newEmail,
        userId: session?.user?.id
      });

      const response = await fetch('/api/settings/email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          currentPassword: emailData.currentPassword
        }),
      });

      console.log('API Response status:', response.status);
      const result = await response.json();
      console.log('API Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Email güncellenirken hata oluştu');
      }

      setSuccess('Email başarıyla güncellendi! Yeni email adresi ile giriş yapınız.');
      setEmailData({ newEmail: '', currentPassword: '' });
      
      // Session'ı yenilemek için page refresh
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('Email update error:', error);
      setError(error instanceof Error ? error.message : 'Email güncellenirken hata oluştu');
    } finally {
      setChangingEmail(false);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingName(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/settings/name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newName: nameData.newName,
          currentPassword: nameData.currentPassword
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'İsim güncellenirken hata oluştu');
      }

      setSuccess('İsim başarıyla güncellendi! Sayfa yenilenerek değişiklik gösterilecek.');
      setNameData({ newName: '', currentPassword: '' });
      
      // Session'ı yenilemek için page refresh
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('İsim güncelleme hatası:', error);
      setError(error instanceof Error ? error.message : 'İsim güncellenirken hata oluştu');
    } finally {
      setChangingName(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingUser(true);
    setError('');
    setSuccess('');

    try {
      const userData = editingUser || newUser;
      const url = editingUser ? `/api/admin/users/${editingUser._id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kullanıcı işlemi başarısız');
      }

      setSuccess(editingUser ? 'Kullanıcı başarıyla güncellendi!' : 'Kullanıcı başarıyla oluşturuldu!');
      setEditingUser(null);
      setShowAddUser(false);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      console.error('Kullanıcı işlem hatası:', error);
      setError(error instanceof Error ? error.message : 'İşlem sırasında hata oluştu');
    } finally {
      setChangingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kullanıcı silinemedi');
      }

      setSuccess('Kullanıcı başarıyla silindi!');
      fetchUsers();
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      setError(error instanceof Error ? error.message : 'Kullanıcı silinirken hata oluştu');
    }
  };

  const handleSecurityChange = (field: string, value: boolean) => {
    setSiteSettings(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        security: {
          ...prev.security,
          enableSecurityQuestion: prev.security?.enableSecurityQuestion ?? true,
          maintenanceMode: prev.security?.maintenanceMode ?? false,
          allowRegistration: prev.security?.allowRegistration ?? false,
          [field]: value
        }
      } as SiteSettings;
    });
  };

  const handlePageSettingChange = (key: string, value: boolean) => {
    setSiteSettings(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        pageSettings: {
          ...prev.pageSettings,
          home: prev.pageSettings?.home ?? true,
          about: prev.pageSettings?.about ?? true,
          services: prev.pageSettings?.services ?? true,
          portfolio: prev.pageSettings?.portfolio ?? true,
          contact: prev.pageSettings?.contact ?? true,
          blog: prev.pageSettings?.blog ?? false,
          [key]: value
        }
      } as SiteSettings;
    });
  };

  const handlePageSettingsSave = async () => {
    setSavingPageSettings(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          security: siteSettings?.security,
          pageSettings: siteSettings?.pageSettings
        }),
      });

      if (response.ok) {
        setSuccess('Sayfa ayarları başarıyla kaydedildi!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Sayfa ayarları kaydedilirken hata oluştu');
      }
    } catch (error) {
      setError('Sayfa ayarları kaydedilirken hata oluştu');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSavingPageSettings(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-slate-300">Ayarlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  const tabs = [
    { id: 'general', name: 'Genel Ayarlar', icon: CogIcon },
    { id: 'brand', name: 'Marka ve Logo', icon: BuildingStorefrontIcon },
    { id: 'pages', name: 'Sayfa Yönetimi', icon: DocumentTextIcon },
    { id: 'media', name: 'Medya Yönetimi', icon: PhotoIcon },
    { id: 'seo', name: 'SEO & Meta', icon: UserGroupIcon },
    { id: 'admin', name: 'Admin Ayarları', icon: ShieldCheckIcon },
    { id: 'account', name: 'Hesap Yönetimi', icon: UserIcon },
  ];

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
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Site Ayarları</h1>
                <p className="text-sm text-slate-300">Sistem ve site konfigürasyonu</p>
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
      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                  <CogIcon className="w-8 h-8 text-teal-400" />
                  <span>Site Ayarları Yönetimi</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  Web sitesi yapılandırması, SEO ayarları ve güvenlik seçenekleri.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6">
            <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/30 text-green-300 p-6 rounded-2xl flex items-center space-x-3">
              <CheckIcon className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-semibold">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6">
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-300 p-4 rounded-2xl flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <form onSubmit={handleSettingsSubmit} className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <CogIcon className="w-6 h-6 text-teal-400" />
                  <span>Genel Site Bilgileri</span>
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                      <span>Site Adı</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="siteName"
                      required
                      value={settingsData.siteName}
                      onChange={handleSettingsChange}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="Erciyas Engineering"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                      <span>Site URL</span>
                    </label>
                    <input
                      type="url"
                      name="siteUrl"
                      value={settingsData.siteUrl}
                      onChange={handleSettingsChange}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://erciyas-engineering.com"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                    <span>Site Başlığı</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="siteTitle"
                    required
                    value={settingsData.siteTitle}
                    onChange={handleSettingsChange}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    placeholder="3D Tasarım ve Mühendislik Çözümleri"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                    <span>Site Açıklaması</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="siteDescription"
                    required
                    rows={3}
                    value={settingsData.siteDescription}
                    onChange={handleSettingsChange}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Site açıklaması..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    saving
                      ? 'bg-teal-600/50 cursor-not-allowed text-teal-200'
                      : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span>Değişiklikleri Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Brand Tab */}
          {activeTab === 'brand' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <BuildingStorefrontIcon className="w-6 h-6 text-teal-400" />
                  <span>Marka ve Logo Yönetimi</span>
                </h3>
                
                {/* Logo Upload Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Logo Upload */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-white">Logo Yükleme</h4>
                    
                    {/* Current Logo Display */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <div className="text-center">
                        {siteSettings?.logo?.url ? (
                          <div className="space-y-4">
                            <img
                              src={siteSettings.logo.url}
                              alt={siteSettings.logo.alt}
                              className="max-w-[200px] max-h-[60px] mx-auto object-contain bg-white/10 rounded-lg p-2"
                            />
                            <p className="text-slate-400 text-sm">{siteSettings.logo.alt}</p>
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <PhotoIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-400">Henüz logo yüklenmedi</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                      <ImageUpload
                        value={brandFormData.logoUrl}
                        onChange={handleLogoChange}
                        onRemove={handleLogoRemove}
                        label="Logo Yükle"
                        maxSize={5}
                      />
                    </div>
                  </div>

                  {/* Brand Information */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-white">Marka Bilgileri</h4>
                    
                    <form onSubmit={handleBrandSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-200">
                          Site Adı
                        </label>
                        <input
                          type="text"
                          value={brandFormData.siteName}
                          onChange={(e) => handleBrandFormChange('siteName', e.target.value)}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          placeholder="Erciyas Engineering"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-200">
                          Slogan
                        </label>
                        <textarea
                          value={brandFormData.slogan}
                          onChange={(e) => handleBrandFormChange('slogan', e.target.value)}
                          rows={3}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="Yenilikçi çözümlerle geleceği inşa ediyoruz"
                        />
                      </div>

                      {/* Brand Preview */}
                      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/10">
                        <h5 className="text-sm font-medium text-slate-200 mb-4">Marka Önizleme</h5>
                        <div className="flex items-center space-x-4">
                          {brandFormData.logoUrl && (
                            <img
                              src={brandFormData.logoUrl}
                              alt="Logo"
                              className="w-12 h-12 object-contain bg-white/10 rounded-lg p-1"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <h6 className="text-white font-bold">
                              {brandFormData.siteName || 'Site Adınız'}
                            </h6>
                            <p className="text-slate-300 text-sm">
                              {brandFormData.slogan || 'Site sloganınız'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={savingBrand}
                          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                            savingBrand
                              ? 'bg-teal-600/50 cursor-not-allowed text-teal-200'
                              : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl'
                          }`}
                        >
                          {savingBrand ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                              <span>Kaydediliyor...</span>
                            </>
                          ) : (
                            <>
                              <CheckIcon className="w-5 h-5" />
                              <span>Marka Bilgilerini Kaydet</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Upload Instructions */}
                <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20">
                  <h5 className="text-blue-300 font-semibold mb-3 flex items-center space-x-2">
                    <PhotoIcon className="w-5 h-5" />
                    <span>Logo Yükleme Rehberi</span>
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-200">
                    <div>
                      <p className="font-medium mb-2">📏 Boyutlar:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Önerilen: 200x60 piksel</li>
                        <li>• Maksimum: 400x120 piksel</li>
                        <li>• Şeffaf arka plan (PNG)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-2">📎 Desteklenen Formatlar:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• PNG (önerilen)</li>
                        <li>• JPG/JPEG</li>
                        <li>• WebP, GIF</li>
                        <li>• Maksimum 5MB</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media Management Tab */}
          {activeTab === 'media' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <PhotoIcon className="w-6 h-6 text-teal-400" />
                  <span>Medya Yönetimi</span>
                </h3>
                
                {/* Media Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    {/* Filter */}
                    <select
                      value={mediaFilter}
                      onChange={(e) => setMediaFilter(e.target.value)}
                      className="bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      style={{
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <option value="all" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                        Tüm Dosyalar
                      </option>
                      <option value="images" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                        Görseller
                      </option>
                      <option value="videos" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                        Videolar
                      </option>
                      <option value="documents" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                        Belgeler
                      </option>
                    </select>

                    {/* Sort */}
                    <select
                      value={mediaSortBy}
                      onChange={(e) => setMediaSortBy(e.target.value)}
                      className="bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      style={{
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <option value="date" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                        Tarihe Göre
                      </option>
                      <option value="name" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                        Ada Göre
                      </option>
                      <option value="size" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                        Boyuta Göre
                      </option>
                    </select>

                    {/* Search */}
                    <input
                      type="text"
                      placeholder="Dosya ara..."
                      value={mediaSearchTerm}
                      onChange={(e) => setMediaSearchTerm(e.target.value)}
                      className="bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedMedia.length > 0 && (
                      <button
                        onClick={handleDeleteSelectedMedia}
                        disabled={deletingMedia}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 text-sm"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>
                          {deletingMedia ? 'Siliniyor...' : `${selectedMedia.length} Dosyayı Sil`}
                        </span>
                      </button>
                    )}
                    
                    <button
                      onClick={handleSelectAllMedia}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all duration-200 text-sm"
                    >
                      {getFilteredMediaItems().length > 0 && 
                       getFilteredMediaItems().every(item => selectedMedia.includes(item._id!))
                        ? 'Hiçbirini Seçme'
                        : 'Tümünü Seç'
                      }
                    </button>
                  </div>
                </div>

                {/* Media Grid */}
                {loadingMedia ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                    <span className="ml-3 text-slate-400">Medya dosyaları yükleniyor...</span>
                  </div>
                ) : getFilteredMediaItems().length === 0 ? (
                  <div className="text-center py-12">
                    <PhotoIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">
                      {mediaSearchTerm || mediaFilter !== 'all' 
                        ? 'Arama kriterlerinize uygun dosya bulunamadı' 
                        : 'Henüz yüklenmiş medya dosyası bulunmuyor'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {getFilteredMediaItems().map((item) => (
                      <div
                        key={item._id}
                        className={`relative bg-white/5 border rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                          selectedMedia.includes(item._id!)
                            ? 'border-teal-500 bg-teal-500/10'
                            : 'border-white/20 hover:border-white/40 hover:bg-white/10'
                        }`}
                        onClick={() => handleMediaSelect(item._id!)}
                      >
                        {/* Selection Checkbox */}
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="checkbox"
                            checked={selectedMedia.includes(item._id!)}
                            onChange={() => handleMediaSelect(item._id!)}
                            className="w-4 h-4 text-teal-600 bg-white/10 border-white/30 rounded focus:ring-teal-500"
                          />
                        </div>

                        {/* Media Preview */}
                        <div className="aspect-square mb-3 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">
                          {item.mimeType.startsWith('image/') ? (
                            <img
                              src={item.url}
                              alt={item.originalName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="text-4xl">
                              {getFileIcon(item.mimeType)}
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="space-y-2">
                          <h4 className="text-white text-sm font-medium truncate" title={item.originalName}>
                            {item.originalName}
                          </h4>
                          
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{formatFileSize(item.size)}</span>
                            <span>{new Date(item.uploadedAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                          
                          <div className="text-xs text-slate-500 truncate">
                            {item.mimeType}
                          </div>
                          
                          {/* File Location */}
                          <div className="text-xs text-slate-400 truncate">
                            📁 {item._id?.includes('/') ? item._id.split('/')[0] : 'root'}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(item.url);
                                setSuccess('URL kopyalandı!');
                              }}
                              className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                            >
                              URL Kopyala
                            </button>
                            
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Görüntüle
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Media Stats */}
                {!loadingMedia && mediaItems.length > 0 && (
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mt-8">
                    <h4 className="text-lg font-semibold text-white mb-4">Medya İstatistikleri</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-400">
                          {mediaItems.length}
                        </div>
                        <div className="text-sm text-slate-400">Toplam Dosya</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {mediaItems.filter(item => item.mimeType.startsWith('image/')).length}
                        </div>
                        <div className="text-sm text-slate-400">Görsel</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {formatFileSize(mediaItems.reduce((total, item) => total + item.size, 0))}
                        </div>
                        <div className="text-sm text-slate-400">Toplam Boyut</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {getFilteredMediaItems().length}
                        </div>
                        <div className="text-sm text-slate-400">Gösterilen</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEO & Meta Tab */}
          {activeTab === 'seo' && (
            <form onSubmit={handleSettingsSubmit} className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <UserGroupIcon className="w-6 h-6 text-teal-400" />
                  <span>SEO ve Meta Bilgileri</span>
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-200">Site Anahtar Kelimeleri</label>
                    <input
                      type="text"
                      name="siteKeywords"
                      value={settingsData.siteKeywords}
                      onChange={handleSettingsChange}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="3D tasarım, mühendislik, CAD..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-200">Open Graph Görsel</label>
                      <input
                        type="text"
                        name="ogImage"
                        value={settingsData.ogImage}
                        onChange={handleSettingsChange}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="/images/og-image.jpg"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-200">Twitter Kullanıcı Adı</label>
                      <input
                        type="text"
                        name="twitterHandle"
                        value={settingsData.twitterHandle}
                        onChange={handleSettingsChange}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="@erciyaseng"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-200">Google Analytics ID</label>
                      <input
                        type="text"
                        name="googleAnalyticsId"
                        value={settingsData.googleAnalyticsId}
                        onChange={handleSettingsChange}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-200">Google Tag Manager ID</label>
                      <input
                        type="text"
                        name="googleTagManagerId"
                        value={settingsData.googleTagManagerId}
                        onChange={handleSettingsChange}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="GTM-XXXXXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    saving
                      ? 'bg-teal-600/50 cursor-not-allowed text-teal-200'
                      : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span>SEO Ayarlarını Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Admin Settings Tab */}
          {activeTab === 'admin' && (
            <form onSubmit={handleSettingsSubmit} className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <ShieldCheckIcon className="w-6 h-6 text-teal-400" />
                  <span>Admin Panel Ayarları</span>
                </h3>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                        <UserGroupIcon className="w-4 h-4 text-teal-400" />
                        <span>Varsayılan Dil</span>
                      </label>
                      <select
                        name="adminSettings.defaultLanguage"
                        value={settingsData.adminSettings.defaultLanguage}
                        onChange={handleSettingsChange}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        style={{
                          color: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <option value="tr" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                          Türkçe
                        </option>
                        <option value="en" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                          English
                        </option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                        <ClockIcon className="w-4 h-4 text-teal-400" />
                        <span>Zaman Dilimi</span>
                      </label>
                      <select
                        name="adminSettings.timezone"
                        value={settingsData.adminSettings.timezone}
                        onChange={handleSettingsChange}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        style={{
                          color: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <option value="Europe/Istanbul" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                          İstanbul
                        </option>
                        <option value="Europe/London" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                          Londra
                        </option>
                        <option value="America/New_York" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                          New York
                        </option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                        <UserGroupIcon className="w-4 h-4 text-teal-400" />
                        <span>Tarih Formatı</span>
                      </label>
                      <select
                        name="adminSettings.dateFormat"
                        value={settingsData.adminSettings.dateFormat}
                        onChange={handleSettingsChange}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        style={{
                          color: 'white',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <option value="DD/MM/YYYY" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                          DD/MM/YYYY
                        </option>
                        <option value="MM/DD/YYYY" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                          MM/DD/YYYY
                        </option>
                        <option value="YYYY-MM-DD" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                          YYYY-MM-DD
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Sistem Ayarları</h4>
                    
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="adminSettings.enableNotifications"
                          checked={settingsData.adminSettings.enableNotifications}
                          onChange={handleSettingsChange}
                          className="w-5 h-5 text-teal-600 bg-white/10 border-white/20 rounded focus:ring-teal-500 focus:ring-2"
                        />
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="w-4 h-4 text-teal-400" />
                          <span className="text-slate-200">Bildirimler etkin</span>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="maintenanceMode"
                          checked={settingsData.maintenanceMode}
                          onChange={handleSettingsChange}
                          className="w-5 h-5 text-teal-600 bg-white/10 border-white/20 rounded focus:ring-teal-500 focus:ring-2"
                        />
                        <div className="flex items-center space-x-2">
                          <CogIcon className="w-4 h-4 text-orange-400" />
                          <span className="text-slate-200">Bakım modu</span>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="allowRegistration"
                          checked={settingsData.allowRegistration}
                          onChange={handleSettingsChange}
                          className="w-5 h-5 text-teal-600 bg-white/10 border-white/20 rounded focus:ring-teal-500 focus:ring-2"
                        />
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-200">Yeni kullanıcı kaydı açık</span>
                        </div>
                      </label>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
                        <UserGroupIcon className="w-4 h-4 text-teal-400" />
                        <span>Maksimum Upload Boyutu (MB)</span>
                      </label>
                      <input
                        type="number"
                        name="maxUploadSize"
                        min="1"
                        max="100"
                        value={settingsData.maxUploadSize}
                        onChange={handleSettingsChange}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    saving
                      ? 'bg-teal-600/50 cursor-not-allowed text-teal-200'
                      : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      <span>Admin Ayarlarını Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Account Management Tab */}
          {activeTab === 'account' && (
            <div className="space-y-8">
              {/* Tab Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <UserIcon className="w-6 h-6 text-teal-400" />
                  <span>Hesap Yönetimi</span>
                </h3>
              </div>

              {/* Current Account Info */}
              <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <UserIcon className="w-5 h-5 text-teal-400" />
                  <span>Mevcut Hesap Bilgileri</span>
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Kullanıcı Adı</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                      {session?.user?.name || 'Admin'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email Adresi</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                      {session?.user?.email || 'Yükleniyor...'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Yetki</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Admin
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                  <KeyIcon className="w-5 h-5 text-teal-400" />
                  <span>Şifre Değiştir</span>
                </h4>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-200">Mevcut Şifre</label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          name="currentPassword"
                          required
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          placeholder="Mevcut şifrenizi girin"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showPassword.current ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-200">Yeni Şifre</label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          name="newPassword"
                          required
                          minLength={6}
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          placeholder="En az 6 karakter"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showPassword.new ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-200">Yeni Şifre (Tekrar)</label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          name="confirmPassword"
                          required
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          placeholder="Yeni şifreyi tekrar girin"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showPassword.confirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-white/10">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                        changingPassword
                          ? 'bg-teal-600/50 cursor-not-allowed text-teal-200'
                          : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl'
                      }`}
                    >
                      {changingPassword ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                          <span>Değiştiriliyor...</span>
                        </>
                      ) : (
                        <>
                          <KeyIcon className="w-5 h-5" />
                          <span>Şifreyi Değiştir</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Name Change Section */}
              <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                  <UserIcon className="w-5 h-5 text-teal-400" />
                  <span>İsim Değiştir</span>
                </h4>
                <form onSubmit={handleNameSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-200">Mevcut Şifre</label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          name="currentPassword"
                          required
                          value={nameData.currentPassword}
                          onChange={handleNameChange}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          placeholder="Mevcut şifrenizi girin"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showPassword.current ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-200">Yeni İsim</label>
                      <input
                        type="text"
                        name="newName"
                        required
                        minLength={2}
                        value={nameData.newName}
                        onChange={handleNameChange}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="Yeni isminizi girin"
                      />
                      <p className="text-xs text-slate-400">
                        Mevcut isim: <span className="text-white font-medium">{session?.user?.name || 'Yükleniyor...'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-white/10">
                    <button
                      type="submit"
                      disabled={changingName}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                        changingName
                          ? 'bg-teal-600/50 cursor-not-allowed text-teal-200'
                          : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl'
                      }`}
                    >
                      {changingName ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                          <span>Değiştiriliyor...</span>
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-5 h-5" />
                          <span>İsmi Değiştir</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Email Change Section */}
              <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                  <KeyIcon className="w-5 h-5 text-teal-400" />
                  <span>Email Değiştir</span>
                </h4>
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-200">Mevcut Şifre</label>
                      <div className="relative">
                        <input
                          type={showPassword.emailCurrent ? 'text' : 'password'}
                          name="currentPassword"
                          required
                          value={emailData.currentPassword}
                          onChange={handleEmailChange}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          placeholder="Mevcut şifrenizi girin"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, emailCurrent: !prev.emailCurrent }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showPassword.emailCurrent ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-200">Yeni Email</label>
                      <input
                        type="email"
                        name="newEmail"
                        required
                        value={emailData.newEmail}
                        onChange={handleEmailChange}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="Yeni email adresinizi girin"
                      />
                      <p className="text-xs text-slate-400">
                        Email değiştirildikten sonra yeni email adresi ile giriş yapmanız gerekecek.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-white/10">
                    <button
                      type="submit"
                      disabled={changingEmail}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                        changingEmail
                          ? 'bg-teal-600/50 cursor-not-allowed text-teal-200'
                          : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl'
                      }`}
                    >
                      {changingEmail ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                          <span>Değiştiriliyor...</span>
                        </>
                      ) : (
                        <>
                          <KeyIcon className="w-5 h-5" />
                          <span>Email Değiştir</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* User Management Section */}
              <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <UserIcon className="w-5 h-5 text-teal-400" />
                    <span>Kullanıcı Yönetimi</span>
                  </h4>
                  <button
                    onClick={() => {
                      setShowAddUser(true);
                      fetchUsers();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Yeni Kullanıcı</span>
                  </button>
                </div>

                {/* Add/Edit User Form */}
                {(showAddUser || editingUser) && (
                  <div className="bg-white/5 border border-white/20 rounded-2xl p-6 mb-6">
                    <h5 className="text-md font-semibold text-white mb-4">
                      {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
                    </h5>
                    <form onSubmit={handleUserSubmit} className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-200">İsim</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={editingUser ? editingUser.name : newUser.name}
                          onChange={handleUserChange}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          placeholder="Kullanıcı adı"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-200">Email</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={editingUser ? editingUser.email : newUser.email}
                          onChange={handleUserChange}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          placeholder="email@example.com"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-200">
                          {editingUser ? 'Yeni Şifre (Boş bırakabilirsiniz)' : 'Şifre'}
                        </label>
                        <input
                          type="password"
                          name="password"
                          required={!editingUser}
                          value={editingUser ? editingUser.password || '' : newUser.password}
                          onChange={handleUserChange}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          placeholder={editingUser ? "Yeni şifre (opsiyonel)" : "Şifre"}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-200">Rol</label>
                        <select
                          name="role"
                          value={editingUser ? editingUser.role : newUser.role}
                          onChange={handleUserChange}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          style={{
                            color: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <option value="user" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                            Kullanıcı
                          </option>
                          <option value="admin" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                            Admin
                          </option>
                        </select>
                      </div>

                      <div className="md:col-span-2 flex items-center space-x-4">
                        <button
                          type="submit"
                          disabled={changingUser}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                            changingUser
                              ? 'bg-teal-600/50 cursor-not-allowed text-teal-200'
                              : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white'
                          }`}
                        >
                          {changingUser ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                              <span>İşleniyor...</span>
                            </>
                          ) : (
                            <>
                              <CheckIcon className="w-5 h-5" />
                              <span>{editingUser ? 'Güncelle' : 'Oluştur'}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(null);
                            setShowAddUser(false);
                            setNewUser({ name: '', email: '', password: '', role: 'user' });
                          }}
                          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200"
                        >
                          İptal
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Users List */}
                <div className="bg-white/5 border border-white/20 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <h5 className="text-md font-semibold text-white">Kayıtlı Kullanıcılar</h5>
                  </div>
                  
                  {loadingUsers ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
                      <p className="text-slate-300">Kullanıcılar yükleniyor...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      Henüz kullanıcı bulunmuyor.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                              Kullanıcı
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                              Rol
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                              Kayıt Tarihi
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                              İşlemler
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {users.map((user) => (
                            <tr key={user._id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                                    <UserIcon className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-white">{user.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                {user.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.role === 'admin' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => setEditingUser(user)}
                                    className="text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-blue-500/10"
                                    title="Düzenle"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  {user._id !== (session?.user as any)?.id && (
                                    <button
                                      onClick={() => handleDeleteUser(user._id)}
                                      className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                                      title="Sil"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pages Management Tab */}
          {activeTab === 'pages' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <DocumentTextIcon className="w-6 h-6 text-teal-400" />
                  <span>Sayfa ve Güvenlik Yönetimi</span>
                </h3>
                
                {/* Security Settings */}
                <div className="bg-white/5 border border-white/20 rounded-2xl p-6 mb-8">
                  <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                    <ShieldCheckIcon className="w-5 h-5 text-orange-400" />
                    <span>Güvenlik Ayarları</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <KeyIcon className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-white font-medium">Admin Login Güvenlik Sorusu</p>
                          <p className="text-slate-400 text-sm">Admin giriş yaparken güvenlik sorusu zorunlu olsun</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={siteSettings?.security?.enableSecurityQuestion ?? true}
                        onChange={(e) => handleSecurityChange('enableSecurityQuestion', e.target.checked)}
                        className="w-5 h-5 text-orange-600 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <CogIcon className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-white font-medium">Bakım Modu</p>
                          <p className="text-slate-400 text-sm">Site ziyaretçilere bakım sayfası gösterilsin</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={siteSettings?.security?.maintenanceMode ?? false}
                        onChange={(e) => handleSecurityChange('maintenanceMode', e.target.checked)}
                        className="w-5 h-5 text-yellow-600 bg-white/10 border-white/20 rounded focus:ring-yellow-500 focus:ring-2"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <UserGroupIcon className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">Yeni Kullanıcı Kaydı</p>
                          <p className="text-slate-400 text-sm">Ziyaretçiler yeni hesap oluşturabilsin</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={siteSettings?.security?.allowRegistration ?? false}
                        onChange={(e) => handleSecurityChange('allowRegistration', e.target.checked)}
                        className="w-5 h-5 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500 focus:ring-2"
                      />
                    </label>
                  </div>
                </div>

                {/* Page Management */}
                <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-400" />
                    <span>Sayfa Erişim Kontrolü</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'home', name: 'Ana Sayfa', icon: '🏠', description: 'Site ana sayfası' },
                      { key: 'about', name: 'Hakkımda', icon: '👤', description: 'Hakkımda sayfası' },
                      { key: 'services', name: 'Hizmetler', icon: '⚙️', description: 'Hizmetler sayfası' },
                      { key: 'portfolio', name: 'Portfolyo', icon: '💼', description: 'Portfolyo sayfası' },
                      { key: 'contact', name: 'İletişim', icon: '📞', description: 'İletişim sayfası' },
                      { key: 'blog', name: 'Blog', icon: '📝', description: 'Blog sayfası (gelecekte)' }
                    ].map((page) => (
                      <label key={page.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{page.icon}</span>
                          <div>
                            <p className="text-white font-medium">{page.name}</p>
                            <p className="text-slate-400 text-sm">{page.description}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={siteSettings?.pageSettings?.[page.key as keyof typeof siteSettings.pageSettings] ?? true}
                          onChange={(e) => handlePageSettingChange(page.key, e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <h5 className="text-blue-300 font-semibold mb-2 flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      <span>Önemli Bilgi</span>
                    </h5>
                    <p className="text-blue-200 text-sm">
                      Sayfaları pasif hale getirdiğinizde, ziyaretçiler o sayfalara erişemeyecek ve 404 sayfası göreceklerdir. 
                      Ana sayfa ve Admin paneli hiçbir zaman kapatılamaz.
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handlePageSettingsSave}
                    disabled={savingPageSettings}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                      savingPageSettings
                        ? 'bg-teal-600/50 cursor-not-allowed text-teal-200'
                        : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-xl'
                    }`}
                  >
                    {savingPageSettings ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-5 h-5" />
                        <span>Sayfa Ayarlarını Kaydet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 