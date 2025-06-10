'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ImageUpload from '../../../components/ImageUpload';
import { 
  PhotoIcon,
  ArrowLeftIcon,
  UserIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CubeTransparentIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  XMarkIcon,
  SparklesIcon,
  EyeIcon,
  ClockIcon,
  LinkIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

interface Slider {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  badge: string;
  imageType: 'upload' | 'url' | 'ai-generated';
  imageUrl: string;
  aiPrompt?: string;
  aiProvider?: string;
  isActive: boolean;
  order: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSliderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    buttonText: 'Daha Fazla',
    buttonLink: '/contact',
    badge: 'Yenilik',
    imageType: 'upload' as 'upload' | 'url' | 'ai-generated',
    imageUrl: '',
    aiPrompt: '',
    aiProvider: 'unsplash',
    order: 0,
    duration: 5000,
    isActive: true
  });

  // Auth check
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch sliders
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch('/api/admin/slider');
        if (response.ok) {
          const data = await response.json();
          setSliders(data);
        } else {
          throw new Error('Sliderlar yüklenirken hata oluştu');
        }
      } catch (error) {
        console.error('Sliders fetch error:', error);
        setError('Sliderlar yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSliders();
    }
  }, [status]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      buttonText: 'Daha Fazla',
      buttonLink: '/contact',
      badge: 'Yenilik',
      imageType: 'upload' as 'upload' | 'url' | 'ai-generated',
      imageUrl: '',
      aiPrompt: '',
      aiProvider: 'unsplash',
      order: sliders.length,
      duration: 5000,
      isActive: true
    });
    setEditingSlider(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (slider: Slider) => {
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle,
      description: slider.description,
      buttonText: slider.buttonText,
      buttonLink: slider.buttonLink,
      badge: slider.badge,
      imageType: slider.imageType,
      imageUrl: slider.imageUrl,
      aiPrompt: slider.aiPrompt || '',
      aiProvider: slider.aiProvider || 'unsplash',
      order: slider.order,
      duration: slider.duration,
      isActive: slider.isActive
    });
    setEditingSlider(slider);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl,
      imageType: 'upload'
    }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: '',
      imageType: 'upload'
    }));
  };



  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = parseInt(e.target.value) || 5;
    setFormData(prev => ({
      ...prev,
      duration: seconds * 1000
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validation
      if (!formData.title.trim() || !formData.subtitle.trim() || !formData.description.trim()) {
        throw new Error('Başlık, alt başlık ve açıklama alanları zorunludur');
      }

      if (!formData.imageUrl.trim()) {
        throw new Error('Lütfen bir resim yükleyin veya URL girin');
      }

      const submitData = { ...formData };
      
      const url = modalMode === 'create' 
        ? '/api/slider' 
        : `/api/admin/slider/${editingSlider?._id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
        setShowModal(false);
        
        // Refresh sliders
        const slidersResponse = await fetch('/api/admin/slider');
        if (slidersResponse.ok) {
          const slidersData = await slidersResponse.json();
          setSliders(slidersData);
        }
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'İşlem sırasında hata oluştu');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'İşlem sırasında hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu slideri silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/slider/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSliders(prev => prev.filter(s => s._id !== id));
        setSuccess('Slider başarıyla silindi');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Slider silinirken hata oluştu');
      }
    } catch {
      setError('Slider silinirken hata oluştu');
    }
  };

  const toggleActive = async (slider: Slider) => {
    try {
      const response = await fetch(`/api/admin/slider/${slider._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...slider,
          isActive: !slider.isActive
        }),
      });

      if (response.ok) {
        setSliders(prev => prev.map(s => 
          s._id === slider._id ? { ...s, isActive: !s.isActive } : s
        ));
        setSuccess(`Slider ${!slider.isActive ? 'aktif' : 'pasif'} edildi`);
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch {
      setError('Durum güncellenirken hata oluştu');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-slate-300">Sliderlar yükleniyor...</p>
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
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
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
                <h1 className="text-xl font-bold text-white">Slider Yönetimi</h1>
                <p className="text-sm text-slate-300">Ana sayfa slider yönetimi</p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center space-x-6 text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <PhotoIcon className="w-4 h-4" />
                <span>Toplam: {sliders.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <PlayIcon className="w-4 h-4 text-green-400" />
                <span>Aktif: {sliders.filter(s => s.isActive).length}</span>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                target="_blank"
                className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <EyeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Site Görünümü</span>
              </Link>
              
              <div className="flex items-center space-x-3 bg-white/10 rounded-lg px-3 py-2">
                <UserIcon className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300 text-sm">{session?.user?.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Çıkış
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                  <PhotoIcon className="w-8 h-8 text-teal-400" />
                  <span>Ana Sayfa Slider Yönetimi</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  Ana sayfada görüntülenecek sliderları oluşturun, düzenleyin ve yönetin.
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Yeni Slider</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6">
            <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/30 text-green-300 p-6 rounded-2xl flex items-center space-x-3">
              <CheckIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6">
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-300 p-4 rounded-2xl flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Sliders List */}
        <div className="space-y-4">
          {sliders.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
              <PhotoIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Henüz slider yok</h3>
              <p className="text-slate-400 mb-6">İlk sliderinizi oluşturup ana sayfanızı canlandırın.</p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200"
              >
                <PlusIcon className="w-5 h-5" />
                <span>İlk Sliderinizi Oluşturun</span>
              </button>
            </div>
          ) : (
            sliders.map((slider) => (
              <div 
                key={slider._id}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200"
              >
                <div className="flex items-start space-x-6">
                  {/* Slider Image */}
                  <div className="flex-shrink-0 w-40 h-24 bg-slate-700 rounded-xl overflow-hidden border border-slate-600 relative">
                    <Image
                      src={slider.imageUrl}
                      alt={slider.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?grayscale';
                      }}
                    />
                  </div>

                  {/* Slider Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {slider.title || 'İsimsiz Slayt'}
                          </h3>
                          <span className="px-3 py-1 text-xs font-medium bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30">
                            {slider.badge}
                          </span>
                          {!slider.isActive && (
                            <span className="px-3 py-1 text-xs font-medium bg-gray-500/20 text-gray-300 rounded-full border border-gray-500/30">
                              Pasif
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-sm mb-2 font-medium">{slider.subtitle}</p>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-3">{slider.description}</p>
                        
                        {/* Stats */}
                        <div className="flex items-center space-x-6 text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <ArrowsUpDownIcon className="w-3 h-3" />
                            <span>Sıra: {slider.order}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>Süre: {slider.duration / 1000}s</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <PhotoIcon className="w-3 h-3" />
                            <span>Tür: {slider.imageType}</span>
                          </div>
                          {slider.buttonLink && (
                            <div className="flex items-center space-x-1">
                              <LinkIcon className="w-3 h-3" />
                              <span>Link: {slider.buttonLink}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleActive(slider)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            slider.isActive
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-600 hover:bg-gray-700 text-white'
                          }`}
                          title={slider.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                        >
                          {slider.isActive ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => openEditModal(slider)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
                          title="Düzenle"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(slider._id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
                          title="Sil"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Slider Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-slate-800 rounded-t-3xl border-b border-slate-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                  <PhotoIcon className="w-8 h-8 text-teal-400" />
                  <span>
                    {modalMode === 'create' ? 'Yeni Slider Oluştur' : 'Slider Düzenle'}
                  </span>
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                {/* Basic Information */}
                <div className="bg-slate-700/50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-teal-400" />
                    <span>Temel Bilgiler</span>
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Başlık <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="Örn: Yenilikçi Çözümlerimiz"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Alt Başlık <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="subtitle"
                        required
                        value={formData.subtitle}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="Örn: Teknolojinin Gücü"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Badge
                      </label>
                      <input
                        type="text"
                        name="badge"
                        value={formData.badge}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="Örn: Yenilik, Hot, Özel"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Buton Metni
                      </label>
                      <input
                        type="text"
                        name="buttonText"
                        value={formData.buttonText}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="Örn: Daha Fazla Bilgi"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Açıklama <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="description"
                      required
                      rows={3}
                      value={formData.description}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Slider için açıklayıcı ve etkileyici bir metin yazın..."
                    />
                  </div>
                </div>

                {/* Image Configuration */}
                <div className="bg-slate-700/50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <PhotoIcon className="w-5 h-5 text-teal-400" />
                    <span>Görsel Ayarları</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Görsel Türü
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageType: 'upload', imageUrl: '' }))}
                          className={`p-4 rounded-xl border transition-all duration-200 ${
                            formData.imageType === 'upload'
                              ? 'border-teal-500 bg-teal-500/20'
                              : 'border-slate-500 bg-slate-600/30 hover:border-teal-400'
                          }`}
                        >
                          <PhotoIcon className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                          <span className="text-sm text-slate-300">Dosya Yükle</span>
                          <p className="text-xs text-slate-400 mt-1">Cloudinary & AI Destekli</p>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageType: 'url' }))}
                          className={`p-4 rounded-xl border transition-all duration-200 ${
                            formData.imageType === 'url'
                              ? 'border-teal-500 bg-teal-500/20'
                              : 'border-slate-500 bg-slate-600/30 hover:border-teal-400'
                          }`}
                        >
                          <LinkIcon className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                          <span className="text-sm text-slate-300">URL Girin</span>
                          <p className="text-xs text-slate-400 mt-1">Doğrudan Link</p>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageType: 'ai-generated' }))}
                          className={`p-4 rounded-xl border transition-all duration-200 ${
                            formData.imageType === 'ai-generated'
                              ? 'border-teal-500 bg-teal-500/20'
                              : 'border-slate-500 bg-slate-600/30 hover:border-teal-400'
                          }`}
                        >
                          <SparklesIcon className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                          <span className="text-sm text-slate-300">AI Prompt</span>
                          <p className="text-xs text-slate-400 mt-1">Metin ile Oluştur</p>
                        </button>
                      </div>
                    </div>

                    {/* Upload Section */}
                    {formData.imageType === 'upload' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                          Resim Yükle <span className="text-red-400">*</span>
                        </label>
                        <ImageUpload
                          value={formData.imageUrl}
                          onChange={handleImageChange}
                          onRemove={handleImageRemove}
                          showAIGeneration={true}
                          showUrlInput={true}
                          projectTitle={formData.title}
                          label="Slider Görseli"
                        />
                      </div>
                    )}

                    {/* URL Section */}
                    {formData.imageType === 'url' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Resim URL&apos;si <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="url"
                          name="imageUrl"
                          required
                          value={formData.imageUrl}
                          onChange={handleFormChange}
                          className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    )}

                    {/* AI Generation Section */}
                    {formData.imageType === 'ai-generated' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            AI Prompt <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            name="aiPrompt"
                            required
                            rows={3}
                            value={formData.aiPrompt}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="Modern teknoloji ofisi, profesyonel iş ortamı, minimalist tasarım..."
                          />
                          <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <p className="text-purple-200 text-xs">
                              <strong>💡 İpucu:</strong> "Modern", "profesyonel", "teknoloji", "minimalist" gibi kelimeler daha iyi sonuçlar verir.
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            AI Provider
                          </label>
                          <select
                            name="aiProvider"
                            value={formData.aiProvider}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                            style={{
                              color: 'white',
                              backgroundColor: '#475569' // slate-600
                            }}
                          >
                            <option value="unsplash" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                              Unsplash
                            </option>
                            <option value="openai" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                              OpenAI DALL-E
                            </option>
                            <option value="custom" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                              Custom
                            </option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Preview */}
                    {formData.imageUrl && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Önizleme
                        </label>
                        <div className="w-full h-40 bg-slate-600 rounded-xl overflow-hidden border border-slate-500 relative">
                          <Image
                            src={formData.imageUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?grayscale';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings */}
                <div className="bg-slate-700/50 rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-teal-400" />
                    <span>Ayarlar</span>
                  </h4>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Buton Linki
                      </label>
                      <input
                        type="text"
                        name="buttonLink"
                        value={formData.buttonLink}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                        placeholder="/contact"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Sıra
                      </label>
                      <input
                        type="number"
                        name="order"
                        min="0"
                        value={formData.order}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Gösterim Süresi (saniye)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        min="1"
                        step="1"
                        value={formData.duration / 1000}
                        onChange={handleDurationChange}
                        className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleFormChange}
                        className="w-5 h-5 text-teal-600 bg-slate-600 border-slate-500 rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="text-slate-300">Slider&apos;ı aktif et</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-slate-300 hover:text-white transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.title.trim() || !formData.subtitle.trim() || !formData.description.trim() || !formData.imageUrl.trim()}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200"
                  >
                    {submitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    )}
                    <span>
                      {submitting 
                        ? 'Kaydediliyor...' 
                        : modalMode === 'create' 
                          ? 'Slider Oluştur' 
                          : 'Değişiklikleri Kaydet'
                      }
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer Status */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-sm">Slider Yönetimi Aktif</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <Link href="/admin/dashboard" className="hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <CubeTransparentIcon className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/" className="hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <EyeIcon className="w-4 h-4" />
                <span>Site Görünümü</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 