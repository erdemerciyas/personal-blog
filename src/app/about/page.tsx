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
  CogIcon
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">İçerik Bulunamadı</h2>
          <p className="text-slate-600">Hakkımda sayfası içeriği yüklenemedi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10"></div>
        <div className="absolute top-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
                <span className="text-teal-400 font-medium text-sm uppercase tracking-wider">
                  {aboutData.heroSubtitle}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                {aboutData.heroTitle.includes('Erdem Erciyas') ? (
                  <>
                    {aboutData.heroTitle.split('Erdem Erciyas')[0]}
                    <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                      Erdem Erciyas
                    </span>
                    {aboutData.heroTitle.split('Erdem Erciyas')[1]}
                  </>
                ) : (
                  aboutData.heroTitle
                )}
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                {aboutData.heroDescription}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/contact" 
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-xl"
                >
                  <EnvelopeIcon className="w-5 h-5" />
                  <span>İletişime Geç</span>
                </Link>
                
                <Link 
                  href="/portfolio" 
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 border border-white/20"
                >
                  <BriefcaseIcon className="w-5 h-5" />
                  <span>Projelerimi Gör</span>
                </Link>
              </div>
            </div>
            
            {/* Right Content - Profile */}
            <div className="lg:flex lg:justify-center">
              <div className="relative">
                {/* Profile Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="text-center">
                    {/* Profile Image Placeholder */}
                    <div className="w-32 h-32 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <UserIcon className="w-16 h-16 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">Erdem Erciyas</h3>
                    <p className="text-teal-400 font-medium mb-4">{aboutData.heroSubtitle}</p>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      {aboutData.achievements.map((achievement, index) => (
                        <div key={index} className="bg-white/5 rounded-xl p-3">
                          <p className="text-xs text-slate-400 mb-1">
                            {achievement.split(' ').slice(-1)[0]}
                          </p>
                          <p className="text-sm font-bold text-white">
                            {achievement.split(' ').slice(0, -1).join(' ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-teal-400 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left - Story */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8">
                {aboutData.storyTitle}
              </h2>
              
              <div className="space-y-6 text-slate-600 leading-relaxed">
                {aboutData.storyParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              {/* Values */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Değerlerim</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aboutData.values.map((value, index) => {
                    const IconComponent = iconMap[value.iconName as keyof typeof iconMap] || SparklesIcon;
                    return (
                      <div key={index} className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                        <IconComponent className="w-6 h-6 text-teal-600" />
                        <span className="font-medium text-slate-700">{value.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Right - Skills & Experience */}
            <div className="space-y-12">
              {/* Skills */}
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
                  <CodeBracketIcon className="w-6 h-6 text-teal-600" />
                  <span>Yeteneklerim</span>
                </h3>
                
                <div className="flex flex-wrap gap-3">
                  {aboutData.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Experience */}
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
                  <BriefcaseIcon className="w-6 h-6 text-teal-600" />
                  <span>Deneyimim</span>
                </h3>
                
                <div className="space-y-6">
                  {aboutData.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-teal-500 pl-6 pb-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500 font-medium">{exp.period}</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 mb-1">{exp.title}</h4>
                      <p className="text-teal-600 font-medium mb-3">{exp.company}</p>
                      <p className="text-slate-600 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            {aboutData.contactTitle}
          </h2>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            {aboutData.contactDescription}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <EnvelopeIcon className="w-8 h-8 text-teal-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-800 mb-2">Email</h3>
              <p className="text-slate-600">{aboutData.contactEmail}</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <MapPinIcon className="w-8 h-8 text-teal-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-800 mb-2">Lokasyon</h3>
              <p className="text-slate-600">{aboutData.contactLocation}</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <PhoneIcon className="w-8 h-8 text-teal-600 mx-auto mb-4" />
              <h3 className="font-bold text-slate-800 mb-2">Telefon</h3>
              <p className="text-slate-600">{aboutData.contactPhone}</p>
            </div>
          </div>
          
          <Link 
            href="/contact"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
          >
            <span>Hemen İletişime Geç</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
} 