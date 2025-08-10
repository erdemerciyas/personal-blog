'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  UserIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  TrophyIcon,
  HeartIcon,
  UserGroupIcon,
  CogIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

import ContentSkeleton from '../../components/ContentSkeleton';

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

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState<{ title: string; description: string }>({ title: '', description: '' });

  useEffect(() => {
    fetchAboutData();
    fetch('/api/admin/page-settings/about')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setHero({ title: data.title || '', description: data.description || '' });
        else setHero({ title: '', description: '' });
      });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary-600 to-cyan-600">
        <div className="container mx-auto px-4 py-20">
          <ContentSkeleton type="profile" count={1} className="mb-8" />
          <ContentSkeleton type="article" count={2} />
        </div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="section-hero bg-gradient-subtle">
        <div className="container-content text-center">
          <div className="card-modern max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">İçerik Bulunamadı</h2>
            <p className="text-slate-600 mb-6">Hakkımda sayfası içeriği yüklenemedi.</p>
            <Link href="/" className="btn-primary">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-28 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] bg-blueprint" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-4 h-4 bg-brand-primary-400 rounded-full animate-pulse"></div>
                <span className="text-brand-primary-300 font-semibold text-sm uppercase tracking-wider">
                  {aboutData.heroSubtitle}
                </span>
              </div>
              <h1 className="hero-title text-white mb-10 leading-none">
                {hero.title || aboutData.heroTitle}
              </h1>
              {(hero.description || aboutData.heroDescription) && (
                <p className="text-lg md:text-xl lg:text-2xl text-slate-200 mb-2 leading-relaxed">
                  {hero.description || aboutData.heroDescription}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-6 mt-6">
                <Link href="/contact" className="btn-primary">
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  İletişime Geç
                </Link>
                <Link href="/portfolio" className="btn-secondary">
                  <BriefcaseIcon className="w-5 h-5 mr-2" />
                  Projelerimi Gör
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
            {/* Right Content - Profile Card */}
            <div className="lg:flex lg:justify-center">
              <div className="card-glass relative p-8 max-w-sm mx-auto">
                {/* Profile Image */}
                <div className="w-32 h-32 bg-gradient-to-br from-brand-primary-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <UserIcon className="w-16 h-16 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">FIXRAL</h3>
                  <p className="text-brand-primary-300 font-medium mb-6">{aboutData.heroSubtitle}</p>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    {aboutData.achievements.slice(0, 4).map((achievement, index) => (
                      <div key={index} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                        <p className="text-xs text-slate-300 mb-1">
                          {achievement.split(' ').slice(-1)[0]}
                        </p>
                        <p className="text-sm font-bold text-white">
                          {achievement.split(' ').slice(0, -1).join(' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-brand-primary-400 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Story Section */}
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 lg:p-16 mb-16">
            <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Story Content */}
            <div>
              <h2 className="section-title text-slate-800 mb-8">{aboutData.storyTitle}</h2>
              
              <div className="space-y-6">
                {aboutData.storyParagraphs.map((paragraph, index) => (
                  <p key={index} className="text-body leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            
            {/* Skills & Values */}
            <div className="space-y-12">
              {/* Skills */}
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <CodeBracketIcon className="w-6 h-6 mr-3 text-brand-primary-700" />
                  Uzmanlık Alanları
                </h3>
                <div className="flex flex-wrap gap-3">
                  {aboutData.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-brand-primary-100 text-brand-primary-800 rounded-xl font-medium text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Values */}
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                  <HeartIcon className="w-6 h-6 mr-3 text-brand-primary-700" />
                  Değerlerim
                </h3>
                <div className="space-y-4">
                  {aboutData.values.map((value, index) => {
                    const IconComponent = iconMap[value.iconName as keyof typeof iconMap] || SparklesIcon;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-brand-primary-100 rounded-lg flex items-center justify-center mt-1">
                          <IconComponent className="w-5 h-5 text-brand-primary-700" />
                        </div>
                        <p className="text-body">{value.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 lg:p-16 mb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title text-slate-800 mb-6">Deneyimlerim</h2>
            <p className="section-subtitle">Profesyonel yolculuğumda geçirdiğim önemli aşamalar</p>
          </div>
          
          <div className="space-y-8">
            {aboutData.experience.map((exp, index) => (
              <div key={index} className="card-modern group">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BriefcaseIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{exp.title}</h3>
                        <p className="text-brand-primary-700 font-medium">{exp.company}</p>
                      </div>
                      <div className="flex items-center text-slate-500 text-sm mt-2 sm:mt-0">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {exp.period}
                      </div>
                    </div>
                    <p className="text-body">{exp.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* Contact CTA */}
  <section className="section bg-gradient-primary text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.08] bg-blueprint" />

        <div className="container-content text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-title text-white mb-6">
              {aboutData.contactTitle}
            </h2>
            <p className="section-subtitle text-brand-primary-100 mb-12 leading-relaxed">
              {aboutData.contactDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/contact" className="btn-primary">
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                İletişime Geç
              </Link>
              <Link href="/portfolio" className="btn-secondary">
                <RocketLaunchIcon className="w-5 h-5 mr-2" />
                Projelerime Bak
              </Link>
            </div>
            
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center text-sm opacity-90">
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="w-4 h-4" />
                <span>{aboutData.contactEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-4 h-4" />
                <span>{aboutData.contactPhone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4" />
                <span>{aboutData.contactLocation}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 