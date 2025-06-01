'use client';

import { useState, useEffect } from 'react';
import {
  UserIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  HeartIcon,
  TrophyIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CogIcon,
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

const iconMap = {
  SparklesIcon: SparklesIcon,
  HeartIcon: HeartIcon,
  TrophyIcon: TrophyIcon,
  AcademicCapIcon: AcademicCapIcon,
  UserGroupIcon: UserGroupIcon,
  CogIcon: CogIcon
};

export default function AdminAboutPage() {
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
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Fetch about data
  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await fetch('/api/admin/about');
      if (response.ok) {
        const data = await response.json();
        setAboutData(data);
      }
    } catch (error) {
      console.error('About data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

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

      setMessage('Hakkımda sayfası başarıyla güncellendi!');
      setMessageType('success');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Bir hata oluştu');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (field: keyof AboutData, defaultValue: any) => {
    setAboutData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), defaultValue]
    }));
  };

  const removeArrayItem = (field: keyof AboutData, index: number) => {
    setAboutData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: keyof AboutData, index: number, value: any) => {
    setAboutData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => i === index ? value : item)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-8 h-8 text-teal-400" />
              <h1 className="text-2xl font-bold text-white">Hakkımda Yönetimi</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <a 
                href="/about" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <EyeIcon className="w-4 h-4" />
                <span>Önizle</span>
              </a>
              
              <button
                onClick={handleSubmit}
                disabled={saving}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  saving
                    ? 'bg-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 hover:scale-105'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl border flex items-center space-x-3 ${
            messageType === 'success' 
              ? 'bg-green-900/20 border-green-500/30 text-green-300' 
              : 'bg-red-900/20 border-red-500/30 text-red-300'
          }`}>
            {messageType === 'success' ? (
              <CheckIcon className="w-6 h-6 text-green-400" />
            ) : (
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            )}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hero Section */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <SparklesIcon className="w-6 h-6 text-teal-400" />
              <span>Hero Bölümü</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ana Başlık
                </label>
                <input
                  type="text"
                  value={aboutData.heroTitle}
                  onChange={(e) => setAboutData(prev => ({ ...prev, heroTitle: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500"
                  placeholder="Örn: Merhaba, Ben Erdem Erciyas"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Alt Başlık
                </label>
                <input
                  type="text"
                  value={aboutData.heroSubtitle}
                  onChange={(e) => setAboutData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500"
                  placeholder="Örn: Developer & Mühendis"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={aboutData.heroDescription}
                  onChange={(e) => setAboutData(prev => ({ ...prev, heroDescription: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Hero bölümü açıklaması..."
                />
              </div>
            </div>
          </div>

          {/* Personal Story */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Kişisel Hikaye</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bölüm Başlığı
                </label>
                <input
                  type="text"
                  value={aboutData.storyTitle}
                  onChange={(e) => setAboutData(prev => ({ ...prev, storyTitle: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500"
                  placeholder="Örn: Hikayem"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Paragraflar
                </label>
                {aboutData.storyParagraphs.map((paragraph, index) => (
                  <div key={index} className="flex space-x-2 mb-3">
                    <textarea
                      value={paragraph}
                      onChange={(e) => updateArrayItem('storyParagraphs', index, e.target.value)}
                      rows={3}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 resize-none"
                      placeholder={`Paragraf ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('storyParagraphs', index)}
                      className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('storyParagraphs', '')}
                  className="flex items-center space-x-2 px-4 py-2 text-teal-400 hover:text-teal-300 hover:bg-teal-900/20 rounded-xl transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Paragraf Ekle</span>
                </button>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Yetenekler</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {aboutData.skills.map((skill, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateArrayItem('skills', index, e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-teal-500"
                    placeholder={`Yetenek ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('skills', index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={() => addArrayItem('skills', '')}
              className="mt-4 flex items-center space-x-2 px-4 py-2 text-teal-400 hover:text-teal-300 hover:bg-teal-900/20 rounded-xl transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Yetenek Ekle</span>
            </button>
          </div>

          {/* Experience */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Deneyim</h2>
            
            {aboutData.experience.map((exp, index) => (
              <div key={index} className="bg-slate-700/50 rounded-xl p-4 mb-4 border border-slate-600">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Deneyim {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('experience', index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Pozisyon</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateArrayItem('experience', index, { ...exp, title: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-teal-500"
                      placeholder="Pozisyon adı"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Şirket</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateArrayItem('experience', index, { ...exp, company: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-teal-500"
                      placeholder="Şirket adı"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Dönem</label>
                    <input
                      type="text"
                      value={exp.period}
                      onChange={(e) => updateArrayItem('experience', index, { ...exp, period: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-teal-500"
                      placeholder="Örn: 2020 - Günümüz"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateArrayItem('experience', index, { ...exp, description: e.target.value })}
                      rows={2}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-teal-500 resize-none"
                      placeholder="Deneyim açıklaması"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayItem('experience', { title: '', company: '', period: '', description: '' })}
              className="flex items-center space-x-2 px-4 py-2 text-teal-400 hover:text-teal-300 hover:bg-teal-900/20 rounded-xl transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Deneyim Ekle</span>
            </button>
          </div>

          {/* Achievements */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Başarılar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aboutData.achievements.map((achievement, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => updateArrayItem('achievements', index, e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-teal-500"
                    placeholder={`Başarı ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('achievements', index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={() => addArrayItem('achievements', '')}
              className="mt-4 flex items-center space-x-2 px-4 py-2 text-teal-400 hover:text-teal-300 hover:bg-teal-900/20 rounded-xl transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Başarı Ekle</span>
            </button>
          </div>

          {/* Values */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Değerler</h2>
            
            {aboutData.values.map((value, index) => (
              <div key={index} className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={value.text}
                  onChange={(e) => updateArrayItem('values', index, { ...value, text: e.target.value })}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-teal-500"
                  placeholder="Değer metni"
                />
                <select
                  value={value.iconName}
                  onChange={(e) => updateArrayItem('values', index, { ...value, iconName: e.target.value })}
                  className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-teal-500"
                  style={{
                    color: 'white',
                    backgroundColor: '#334155'
                  }}
                >
                  <option value="SparklesIcon" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                    Yıldız
                  </option>
                  <option value="HeartIcon" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                    Kalp
                  </option>
                  <option value="TrophyIcon" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                    Kupa
                  </option>
                  <option value="AcademicCapIcon" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                    Mezuniyet
                  </option>
                  <option value="UserGroupIcon" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                    Grup
                  </option>
                  <option value="CogIcon" style={{ color: '#1e293b', backgroundColor: '#ffffff' }}>
                    Ayar
                  </option>
                </select>
                <button
                  type="button"
                  onClick={() => removeArrayItem('values', index)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayItem('values', { text: '', iconName: 'SparklesIcon' })}
              className="flex items-center space-x-2 px-4 py-2 text-teal-400 hover:text-teal-300 hover:bg-teal-900/20 rounded-xl transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Değer Ekle</span>
            </button>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">İletişim Bilgileri</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bölüm Başlığı
                </label>
                <input
                  type="text"
                  value={aboutData.contactTitle}
                  onChange={(e) => setAboutData(prev => ({ ...prev, contactTitle: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500"
                  placeholder="Örn: Birlikte Çalışalım"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={aboutData.contactDescription}
                  onChange={(e) => setAboutData(prev => ({ ...prev, contactDescription: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="İletişim bölümü açıklaması..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={aboutData.contactEmail}
                    onChange={(e) => setAboutData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500"
                    placeholder="E-posta adresi"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={aboutData.contactPhone}
                    onChange={(e) => setAboutData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500"
                    placeholder="Telefon numarası"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Lokasyon
                  </label>
                  <input
                    type="text"
                    value={aboutData.contactLocation}
                    onChange={(e) => setAboutData(prev => ({ ...prev, contactLocation: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-teal-500"
                    placeholder="Şehir, Ülke"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                saving
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 hover:scale-105 shadow-xl'
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
      </div>
    </div>
  );
} 