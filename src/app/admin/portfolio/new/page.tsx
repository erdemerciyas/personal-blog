'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '../../../../components/ImageUpload';
import { 
  PlusIcon,
  UserIcon,
  CubeTransparentIcon,
  FolderOpenIcon,
  TagIcon,
  ClockIcon,
  ArrowLeftIcon,
  HomeIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  StarIcon,
  HashtagIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

// Random placeholder images for fallback
const RANDOM_IMAGES = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop&crop=center'
];

export default function NewPortfolioItem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    client: '',
    completionDate: '',
    technologies: [''],
    coverImage: '',
    images: [''],
    featured: false,
    order: 0,
    projectUrl: '',
    githubUrl: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchCategories();
    }
  }, [status, session, router]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Kategoriler getirilemedi');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Kategoriler yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRandomImage = () => {
    return RANDOM_IMAGES[Math.floor(Math.random() * RANDOM_IMAGES.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Prepare cleaned data
      const cleanedData = {
        ...formData,
        technologies: formData.technologies.filter(tech => tech.trim() !== ''),
        images: formData.images.filter(img => img.trim() !== ''),
        // Use random image if no cover image is provided
        coverImage: formData.coverImage || getRandomImage(),
      };

      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Bir hata oluştu');
      }

      router.push('/admin/portfolio');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTechnologyChange = (index: number, value: string) => {
    const newTechnologies = [...formData.technologies];
    newTechnologies[index] = value;
    
    if (index === newTechnologies.length - 1 && value.trim() !== '') {
      newTechnologies.push('');
    }
    
    setFormData(prev => ({
      ...prev,
      technologies: newTechnologies,
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    
    if (index === newImages.length - 1 && value.trim() !== '') {
      newImages.push('');
    }
    
    setFormData(prev => ({
      ...prev,
      images: newImages,
    }));
  };

  const removeTechnology = (index: number) => {
    const newTechnologies = formData.technologies.filter((_, i) => i !== index);
    if (newTechnologies.length === 0) {
      newTechnologies.push('');
    }
    setFormData(prev => ({
      ...prev,
      technologies: newTechnologies,
    }));
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    if (newImages.length === 0) {
      newImages.push('');
    }
    setFormData(prev => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleCoverImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, coverImage: url }));
  };

  const handleCoverImageRemove = () => {
    setFormData(prev => ({ ...prev, coverImage: '' }));
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-slate-300">Sayfa yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const quickActions = [
    {
      title: 'Portfolio Listesi',
      icon: FolderOpenIcon,
      href: '/admin/portfolio',
      color: 'bg-gradient-to-r from-blue-600 to-blue-700'
    },
    {
      title: 'Kategoriler',
      icon: TagIcon,
      href: '/admin/categories',
      color: 'bg-gradient-to-r from-purple-600 to-purple-700'
    },
    {
      title: 'Dashboard',
      icon: HomeIcon,
      href: '/admin/dashboard',
      color: 'bg-gradient-to-r from-slate-600 to-slate-700'
    }
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
                href="/admin/portfolio"
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <CubeTransparentIcon className="w-6 h-6 text-white" />
                </div>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Yeni Proje Ekle</h1>
                <p className="text-sm text-slate-300">Yeni portfolio projesi oluştur</p>
              </div>
            </div>

            {/* User Info & Actions */}
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
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                  <PlusIcon className="w-8 h-8 text-emerald-400" />
                  <span>Yeni Proje Ekle</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  Portfolio&apos;nuzun taze yeni bir projesi oluşturun.
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-2 text-sm text-slate-400">
                <ClockIcon className="w-4 h-4" />
                <span>Toplam {categories.length} kategori mevcut</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-300 p-4 rounded-2xl">
              {error}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link 
                key={action.title}
                href={action.href}
                className="group"
              >
                <div className={`${action.color} rounded-2xl p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                  <div className="flex items-center space-x-3">
                    <action.icon className="w-6 h-6" />
                    <span className="font-semibold">{action.title}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Create Form */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <div className="p-8">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center space-x-2">
                <DocumentTextIcon className="w-5 h-5 text-emerald-400" />
                <span>Proje Bilgileri</span>
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Proje Adı *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Proje adını girin"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Kategori *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      style={{
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                      }}
                      required
                    >
                      <option value="">Kategori seçin</option>
                      {categories.map((category: Category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Müşteri *
                    </label>
                    <div className="relative">
                      <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.client}
                        onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                        className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="Müşteri adı"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tamamlanma Tarihi *
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="date"
                        value={formData.completionDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                        className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Proje Açıklaması *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={5}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                    placeholder="Proje hakkında detaylı açıklama yazın..."
                    required
                  />
                </div>

                {/* Cover Image Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center space-x-2">
                    <PhotoIcon className="w-4 h-4" />
                    <span>Kapak Görseli (Opsiyonel)</span>
                  </label>
                  
                  {/* Image Input */}
                  <ImageUpload
                    value={formData.coverImage}
                    onChange={handleCoverImageUpload}
                    onRemove={handleCoverImageRemove}
                    label="Kapak Görseli"
                    className="w-full"
                    showAIGeneration={true}
                    showUrlInput={true}
                    projectTitle={formData.title}
                  />
                  
                  <p className="text-xs text-slate-400 mt-2">
                    Görsel yüklemezseniz otomatik olarak rastgele bir görsel atanacaktır.
                  </p>
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center space-x-2">
                    <HashtagIcon className="w-4 h-4" />
                    <span>Kullanılan Teknolojiler</span>
                  </label>
                  <div className="space-y-3">
                    {formData.technologies.map((tech, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={tech}
                          onChange={(e) => handleTechnologyChange(index, e.target.value)}
                          placeholder={index === formData.technologies.length - 1 ? "Yeni teknoloji ekle..." : "Teknoloji adı"}
                          className="flex-1 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                        {index < formData.technologies.length - 1 && (
                          <button
                            type="button"
                            onClick={() => removeTechnology(index)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail Images */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center space-x-2">
                    <PhotoIcon className="w-4 h-4" />
                    <span>Detay Görselleri (Opsiyonel)</span>
                  </label>
                  <div className="space-y-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="space-y-2">
                        {index < formData.images.length - 1 ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Detay Görseli #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Görseli Sil"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null}
                        
                        {index < formData.images.length - 1 ? (
                          <ImageUpload
                            value={image}
                            onChange={(url) => handleImageChange(index, url)}
                            onRemove={() => removeImage(index)}
                            label={`Detay Görseli ${index + 1}`}
                            className="w-full"
                          />
                        ) : (
                          <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
                            <button
                              type="button"
                              onClick={() => handleImageChange(index, 'placeholder')}
                              className="text-slate-400 hover:text-slate-300 transition-colors"
                            >
                              <PhotoIcon className="w-8 h-8 mx-auto mb-2" />
                              <span className="text-sm">Yeni detay görseli ekle</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <TagIcon className="w-5 h-5" />
                    <span>Proje Ayarları</span>
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={formData.featured}
                          onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                          className="w-5 h-5 text-emerald-500 bg-white/10 border-white/20 rounded focus:ring-emerald-500 focus:ring-2"
                        />
                        <label htmlFor="featured" className="flex items-center space-x-2 text-sm font-medium text-slate-300">
                          <StarIcon className="w-4 h-4 text-yellow-400" />
                          <span>Öne Çıkan Proje</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-slate-300">
                        Sıralama
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        className="w-20 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white text-center focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Project URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proje URL&apos;si
                  </label>
                  <input
                    type="url"
                    value={formData.projectUrl}
                    onChange={(e) => setFormData({...formData, projectUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                {/* GitHub URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
                  <Link
                    href="/admin/portfolio"
                    className="flex items-center space-x-2 px-6 py-3 bg-slate-500/20 hover:bg-slate-500/30 text-slate-300 hover:text-white rounded-xl transition-all duration-200"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>İptal</span>
                  </Link>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>
                      {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-sm">Proje Oluşturma Aktif</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <Link href="/admin/portfolio" className="hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <FolderOpenIcon className="w-4 h-4" />
                <span>Portfolio</span>
              </Link>
              <Link href="/admin/dashboard" className="hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <HomeIcon className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 