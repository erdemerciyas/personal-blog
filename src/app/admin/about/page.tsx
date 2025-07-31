'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '../../../components/AdminLoader';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  SparklesIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Value {
  text: string;
  iconName: string;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

interface AboutData {
  _id?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  storyTitle: string;
  storyParagraphs: string[];
  skills: string[];
  experience: Experience[];
  achievements: string[];
  values: Value[];
  contactTitle: string;
  contactDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
}

export default function AdminAboutPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [aboutData, setAboutData] = useState<AboutData>({
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    storyTitle: '',
    storyParagraphs: [''],
    skills: [''],
    experience: [{
      title: '',
      company: '',
      period: '',
      description: ''
    }],
    achievements: [''],
    values: [{
      text: '',
      iconName: 'SparklesIcon'
    }],
    contactTitle: '',
    contactDescription: '',
    contactEmail: '',
    contactPhone: '',
    contactLocation: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [, setMessageType] = useState<'success' | 'error'>('success');

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Fetch about data
  useEffect(() => {
    if (status === 'authenticated') {
      fetchAboutData();
    }
  }, [status]);

  const fetchAboutData = async () => {
    try {
      const response = await fetch('/api/admin/about');
      if (response.ok) {
        const data = await response.json();
        setAboutData(data);
      } else {
        console.error('About data fetch failed:', response.status);
        setMessage({ type: 'error', text: 'Veriler yüklenirken hata oluştu' });
      }
    } catch (error) {
      console.error('About data fetch error:', error);
      setMessage({ type: 'error', text: 'Veriler yüklenirken hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aboutData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Güncelleme sırasında hata oluştu');
      }

      setMessage({ type: 'success', text: 'Hakkımda sayfası başarıyla güncellendi!' });
      setMessageType('success');
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Bir hata oluştu' });
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (field: keyof AboutData, defaultValue: string | Experience | Value) => {
    setAboutData(prev => ({
      ...prev,
      [field]: [...(prev[field] as (string | Experience | Value)[]), defaultValue]
    }));
  };

  const removeArrayItem = (field: keyof AboutData, index: number) => {
    setAboutData(prev => ({
      ...prev,
      [field]: (prev[field] as (string | Experience | Value)[]).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: keyof AboutData, index: number, value: string | Experience | Value) => {
    setAboutData(prev => ({
      ...prev,
      [field]: (prev[field] as (string | Experience | Value)[]).map((item, i) => i === index ? value : item)
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <PageLoader text="Hakkımda sayfası yükleniyor..." />
      </AdminLayout>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <AdminLayout 
      title="Hakkımda Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Hakkımda Yönetimi' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600">Hakkımda sayfasının içeriğini düzenleyin</p>
          </div>
          <div className="flex items-center space-x-3">
            <a 
              href="/about" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              <span>Önizle</span>
            </a>
            
            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                saving
                  ? 'bg-slate-400 cursor-not-allowed text-white'
                  : 'bg-brand-primary-700 hover:bg-brand-primary-800 text-white shadow-sm'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>Kaydet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-brand-primary-50 border-brand-primary-200 text-brand-primary-900' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Hero Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-brand-primary-700" />
              <span>Hero Bölümü</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Başlık</label>
                <input
                  type="text"
                  value={aboutData.heroTitle}
                  onChange={(e) => setAboutData(prev => ({ ...prev, heroTitle: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                  placeholder="Ana başlık"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alt Başlık</label>
                <input
                  type="text"
                  value={aboutData.heroSubtitle}
                  onChange={(e) => setAboutData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                  placeholder="Alt başlık"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                <textarea
                  value={aboutData.heroDescription}
                  onChange={(e) => setAboutData(prev => ({ ...prev, heroDescription: e.target.value }))}
                  rows={4}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                  placeholder="Kısa açıklama"
                />
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Hikaye Bölümü</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bölüm Başlığı</label>
                <input
                  type="text"
                  value={aboutData.storyTitle}
                  onChange={(e) => setAboutData(prev => ({ ...prev, storyTitle: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                  placeholder="Hikaye başlığı"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Paragraflar</label>
                {aboutData.storyParagraphs.map((paragraph, index) => (
                  <div key={index} className="flex items-start space-x-2 mb-3">
                    <textarea
                      value={paragraph}
                      onChange={(e) => updateArrayItem('storyParagraphs', index, e.target.value)}
                      rows={3}
                      className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                      placeholder={`Paragraf ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('storyParagraphs', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('storyParagraphs', '')}
                  className="flex items-center space-x-2 text-brand-primary-700 hover:text-brand-primary-800 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Paragraf Ekle</span>
                </button>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Yetenekler</h3>
            
            {aboutData.skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateArrayItem('skills', index, e.target.value)}
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                  placeholder={`Yetenek ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('skills', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('skills', '')}
              className="flex items-center space-x-2 text-brand-primary-700 hover:text-brand-primary-800 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Yetenek Ekle</span>
            </button>
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Deneyimler</h3>
            
            {aboutData.experience.map((exp, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-4 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-slate-900">Deneyim {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('experience', index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateArrayItem('experience', index, { ...exp, title: e.target.value })}
                      className="border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                      placeholder="Pozisyon"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateArrayItem('experience', index, { ...exp, company: e.target.value })}
                      className="border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                      placeholder="Şirket"
                    />
                  </div>
                  <input
                    type="text"
                    value={exp.period}
                    onChange={(e) => updateArrayItem('experience', index, { ...exp, period: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                    placeholder="Dönem (örn: 2020-2023)"
                  />
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateArrayItem('experience', index, { ...exp, description: e.target.value })}
                    rows={3}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                    placeholder="Açıklama"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('experience', { title: '', company: '', period: '', description: '' })}
              className="flex items-center space-x-2 text-brand-primary-700 hover:text-brand-primary-800 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Deneyim Ekle</span>
            </button>
          </div>

          {/* Achievements Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Başarılar</h3>
            
            {aboutData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => updateArrayItem('achievements', index, e.target.value)}
                  className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                  placeholder={`Başarı ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('achievements', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('achievements', '')}
              className="flex items-center space-x-2 text-brand-primary-700 hover:text-brand-primary-800 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Başarı Ekle</span>
            </button>
          </div>

          {/* Values Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Değerler</h3>
            
            {aboutData.values.map((value, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-4 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-slate-900">Değer {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('values', index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={value.text}
                    onChange={(e) => updateArrayItem('values', index, { ...value, text: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                    placeholder="Değer metni"
                  />
                  <select
                    value={value.iconName}
                    onChange={(e) => updateArrayItem('values', index, { ...value, iconName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                  >
                    <option value="SparklesIcon">Yıldız</option>
                    <option value="CheckIcon">Onay</option>
                    <option value="UserIcon">Kullanıcı</option>
                    <option value="ExclamationTriangleIcon">Ünlem</option>
                  </select>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('values', { text: '', iconName: 'SparklesIcon' })}
              className="flex items-center space-x-2 text-brand-primary-700 hover:text-brand-primary-800 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Değer Ekle</span>
            </button>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">İletişim Bölümü</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Başlık</label>
                <input
                  type="text"
                  value={aboutData.contactTitle}
                  onChange={(e) => setAboutData(prev => ({ ...prev, contactTitle: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                  placeholder="İletişim başlığı"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                <textarea
                  value={aboutData.contactDescription}
                  onChange={(e) => setAboutData(prev => ({ ...prev, contactDescription: e.target.value }))}
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                  placeholder="İletişim açıklaması"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
                  <input
                    type="email"
                    value={aboutData.contactEmail}
                    onChange={(e) => setAboutData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                    placeholder="email@domain.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                  <input
                    type="text"
                    value={aboutData.contactPhone}
                    onChange={(e) => setAboutData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                    placeholder="+90 555 000 00 00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Konum</label>
                  <input
                    type="text"
                    value={aboutData.contactLocation}
                    onChange={(e) => setAboutData(prev => ({ ...prev, contactLocation: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary-600 focus:border-transparent"
                    placeholder="Şehir, Ülke"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}