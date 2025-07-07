'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AdminLayout from '../../../components/admin/AdminLayout';
import ImageUpload from '../../../components/ImageUpload';
import { 
  PhotoIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  XMarkIcon,

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
  imageType: 'upload' | 'url';
  imageUrl: string;
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
    imageType: 'upload' as 'upload' | 'url',
    imageUrl: '',
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

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      buttonText: 'Daha Fazla',
      buttonLink: '/contact',
      badge: 'Yenilik',
      imageType: 'upload' as 'upload' | 'url',
      imageUrl: '',
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
    setSubmitting(true);
    setError('');

    try {
      const url = modalMode === 'create' ? '/api/admin/slider' : `/api/admin/slider/${editingSlider?._id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('İşlem başarısız');
      }

      const data = await response.json();
      
      if (modalMode === 'create') {
        setSliders(prev => [...prev, data]);
      } else {
        setSliders(prev => prev.map(s => s._id === editingSlider?._id ? data : s));
      }
      
      setSuccess(modalMode === 'create' ? 'Slider başarıyla eklendi!' : 'Slider başarıyla güncellendi!');
      setShowModal(false);
      resetForm();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('İşlem başarısız oldu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu slider\'ı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/slider/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız');
      }

      setSliders(prev => prev.filter(s => s._id !== id));
      setSuccess('Slider başarıyla silindi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Silme işlemi başarısız oldu');
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

      if (!response.ok) {
        throw new Error('Güncelleme başarısız');
      }

      const data = await response.json();
      setSliders(prev => prev.map(s => s._id === slider._id ? data : s));
      
    } catch (error) {
      setError('Durum güncellenemedi');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            <p className="text-slate-600">Slider yükleniyor...</p>
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
      title="Slider Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Slider Yönetimi' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600">Ana sayfa slider içeriklerini yönetin</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Yeni Slider</span>
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center space-x-3">
            <CheckIcon className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Slider Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Toplam Slider</p>
                <p className="text-2xl font-bold text-slate-900">{sliders.length}</p>
              </div>
              <PhotoIcon className="w-8 h-8 text-teal-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Aktif Slider</p>
                <p className="text-2xl font-bold text-slate-900">{sliders.filter(s => s.isActive).length}</p>
              </div>
              <PlayIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pasif Slider</p>
                <p className="text-2xl font-bold text-slate-900">{sliders.filter(s => !s.isActive).length}</p>
              </div>
              <PauseIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Ortalama Süre</p>
                <p className="text-2xl font-bold text-slate-900">
                  {sliders.length > 0 ? Math.round(sliders.reduce((acc, s) => acc + s.duration, 0) / sliders.length / 1000) : 0}s
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Slider List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Slider Listesi</h3>
          </div>
          
          {sliders.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Henüz slider eklenmemiş</p>
              <p className="text-sm text-slate-500 mt-1">İlk slider'ınızı eklemek için yukarıdaki butonu kullanın</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {sliders
                .sort((a, b) => a.order - b.order)
                .map((slider) => (
                <div key={slider._id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden">
                        {slider.imageUrl ? (
                          <Image
                            src={slider.imageUrl}
                            alt={slider.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PhotoIcon className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-lg font-semibold text-slate-900">{slider.title}</h4>
                            {slider.badge && (
                              <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-medium">
                                {slider.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 mb-2">{slider.subtitle}</p>
                          <p className="text-sm text-slate-500 line-clamp-2">{slider.description}</p>
                          
                          <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500">
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>{slider.duration / 1000}s</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ArrowsUpDownIcon className="w-4 h-4" />
                              <span>Sıra: {slider.order + 1}</span>
                            </div>
                            {slider.buttonLink && (
                              <div className="flex items-center space-x-1">
                                <LinkIcon className="w-4 h-4" />
                                <span>{slider.buttonText}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                          {/* Status Toggle */}
                          <button
                            onClick={() => toggleActive(slider)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              slider.isActive ? 'bg-teal-600' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                slider.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(slider)}
                            className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(slider._id)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {modalMode === 'create' ? 'Yeni Slider Ekle' : 'Slider Düzenle'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Başlık *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Slider başlığı"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Alt Başlık
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleFormChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Alt başlık"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rozet
                    </label>
                    <input
                      type="text"
                      name="badge"
                      value={formData.badge}
                      onChange={handleFormChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Rozet metni"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Süre (saniye)
                    </label>
                    <input
                      type="number"
                      value={formData.duration / 1000}
                      onChange={handleDurationChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min="1"
                      max="60"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Slider açıklaması"
                  />
                </div>
                
                {/* Button Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Buton Metni
                    </label>
                    <input
                      type="text"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleFormChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Buton metni"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Buton Linki
                    </label>
                    <input
                      type="text"
                      name="buttonLink"
                      value={formData.buttonLink}
                      onChange={handleFormChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="/contact"
                    />
                  </div>
                </div>
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Slider Görseli
                  </label>
                  <ImageUpload
                    onImageUpload={handleImageChange}
                    onImageRemove={handleImageRemove}
                    currentImage={formData.imageUrl}
                  />
                </div>
                
                {/* Settings */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                    Aktif slider
                  </label>
                </div>
                
                {/* Submit Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      submitting
                        ? 'bg-slate-400 cursor-not-allowed text-white'
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>{modalMode === 'create' ? 'Oluştur' : 'Güncelle'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 