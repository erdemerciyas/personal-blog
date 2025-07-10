'use client';

import { useState, useEffect, Suspense } from 'react';
import { Loader } from '../../components/ui';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, PaperAirplaneIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
  };
}

// Helper component to handle client-side logic dependent on Suspense if needed (though not strictly for this form yet)
function ContactPageContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'info@example.com',
    phone: '+90 (500) 123 45 67',
    address: 'Teknoloji Vadisi, No: 42, Cyberpark, Ankara, Türkiye',
    workingHours: 'Pazartesi - Cuma: 09:00 - 18:00',
    socialLinks: {
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: '',
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(true);
  const [hero, setHero] = useState<{ title: string; description: string }>({ title: '', description: '' });

  // Fetch contact information
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info');
        if (response.ok) {
          const data = await response.json();
          setContactInfo(data);
        }
      } catch (error) {
        console.error('Contact info fetch error:', error);
        // Keep default values if fetch fails
      } finally {
        setContactLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  useEffect(() => {
    fetch('/api/admin/page-settings/contact')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setHero({ title: data.title || 'Bizimle İletişime Geçin', description: data.description || '' });
        else setHero({ title: 'Bizimle İletişime Geçin', description: '' });
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Mesaj gönderilirken bir hata oluştu.');
      }

      setSubmitStatus('success');
      setSubmitMessage(result.message || 'Mesajınız başarıyla gönderildi!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Form gönderimi sırasında hata:', error);
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white py-28 md:py-32">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-10">
            {hero.title}
          </h1>
          {hero.description && (
            <p className="text-lg md:text-xl lg:text-2xl text-teal-100 max-w-2xl mx-auto mt-0 mb-2 md:mb-0">
              {hero.description}
            </p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          
          {/* Contact Form and Info Section */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Contact Form Card */}
              <div className="card">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Mesaj Gönderin</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="label-text">Adınız Soyadınız</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Örn: Ali Veli"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="label-text">E-posta Adresiniz</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="iletisim@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="label-text">Konu</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Proje Teklifi"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="label-text">Mesajınız</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      className="input-field resize-none"
                      placeholder="Merhaba, ..."
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader size="md" color="white">
                          Gönderiliyor...
                        </Loader>
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                        Mesajı Gönder
                      </>
                    )}
                  </button>
                  
                  {submitStatus === 'success' && submitMessage && (
                    <div className="flex items-center p-4 mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{submitMessage}</span>
                    </div>
                  )}
                  {submitStatus === 'error' && submitMessage && (
                    <div className="flex items-center p-4 mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                      <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{submitMessage}</span>
                    </div>
                  )}
                </form>
              </div>
              
              {/* Contact Information Card */}
              <div className="space-y-8">
                <div className="card">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">İletişim Bilgilerimiz</h2>
                  
                  {contactLoading ? (
                    <div className="space-y-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                      <div className="animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                      <div className="animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <EnvelopeIcon className="h-6 w-6 text-teal-600 mr-4 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-slate-800 font-semibold mb-1">E-posta</h3>
                          <a href={`mailto:${contactInfo.email}`} className="text-slate-600 hover:text-teal-600 transition-colors focus-ring rounded px-1 py-0.5">
                            {contactInfo.email}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <PhoneIcon className="h-6 w-6 text-teal-600 mr-4 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-slate-800 font-semibold mb-1">Telefon</h3>
                          <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="text-slate-600 hover:text-teal-600 transition-colors focus-ring rounded px-1 py-0.5">
                            {contactInfo.phone}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPinIcon className="h-6 w-6 text-teal-600 mr-4 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="text-slate-800 font-semibold mb-1">Adres</h3>
                          <p className="text-slate-600">
                            {contactInfo.address}
                          </p>
                        </div>
                      </div>
                      {contactInfo.workingHours && (
                        <div className="flex items-start">
                          <ClockIcon className="h-6 w-6 text-teal-600 mr-4 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-slate-800 font-semibold mb-1">Çalışma Saatleri</h3>
                            <p className="text-slate-600">
                              {contactInfo.workingHours}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Social Links */}
                {!contactLoading && (contactInfo.socialLinks.linkedin || contactInfo.socialLinks.twitter || contactInfo.socialLinks.instagram || contactInfo.socialLinks.facebook) && (
                  <div className="card">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Sosyal Medya</h3>
                    <div className="flex space-x-4">
                      {contactInfo.socialLinks.linkedin && (
                        <a
                          href={contactInfo.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                        >
                          <span className="sr-only">LinkedIn</span>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                      {contactInfo.socialLinks.twitter && (
                        <a
                          href={contactInfo.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-sky-500 text-white rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors"
                        >
                          <span className="sr-only">Twitter</span>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        </a>
                      )}
                      {contactInfo.socialLinks.instagram && (
                        <a
                          href={contactInfo.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-pink-600 text-white rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors"
                        >
                          <span className="sr-only">Instagram</span>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                      {contactInfo.socialLinks.facebook && (
                        <a
                          href={contactInfo.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-blue-800 text-white rounded-lg flex items-center justify-center hover:bg-blue-900 transition-colors"
                        >
                          <span className="sr-only">Facebook</span>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Map Section */}
          <div className="max-w-6xl mx-auto mt-16">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Konumumuz</h2>
                <div className="flex items-center text-sm text-slate-500">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span>Haritada göster</span>
                </div>
              </div>
              
              {contactLoading ? (
                <div className="animate-pulse">
                  <div className="h-96 bg-slate-200 rounded-xl"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Address summary */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                        <MapPinIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">İletişim Bilgileri</h3>
                        <p className="text-sm text-slate-600">{contactInfo.address}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-300 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Büyük Harita
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contactInfo.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                        </svg>
                        Yol Tarifi
                      </a>
                    </div>
                  </div>
                  
                  {/* Interactive Map */}
                  <div className="relative h-96 rounded-xl overflow-hidden bg-slate-100 shadow-lg">
                    {/* Google Maps embed without API key - uses search URL */}
                    <iframe
                      src={`https://www.google.com/maps?q=${encodeURIComponent(contactInfo.address)}&output=embed&z=15`}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="İletişim Konumu"
                    />
                    
                    {/* Map loading overlay */}
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300" id="map-loading">
                      <div className="text-center">
                        <Loader size="lg" color="primary">
                      Harita yükleniyor...
                    </Loader>
                      </div>
                    </div>
                  </div>
                  
                  {/* Alternative map providers and additional info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-2">Alternatif Harita Uygulamaları</h4>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`https://maps.apple.com/?q=${encodeURIComponent(contactInfo.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2C6.686 2 4 4.686 4 8c0 5.5 6 10 6 10s6-4.5 6-10c0-3.314-2.686-6-6-6zm0 8c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" clipRule="evenodd" />
                          </svg>
                          Apple Maps
                        </a>
                        <a
                          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(contactInfo.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2C6.686 2 4 4.686 4 8c0 5.5 6 10 6 10s6-4.5 6-10c0-3.314-2.686-6-6-6zm0 8c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" clipRule="evenodd" />
                          </svg>
                          OpenStreetMap
                        </a>
                        <a
                          href={`https://waze.com/ul?q=${encodeURIComponent(contactInfo.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2C6.686 2 4 4.686 4 8c0 5.5 6 10 6 10s6-4.5 6-10c0-3.314-2.686-6-6-6zm0 8c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" clipRule="evenodd" />
                          </svg>
                          Waze
                        </a>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-teal-50 rounded-lg">
                      <h4 className="font-semibold text-teal-800 mb-2">Ulaşım Bilgileri</h4>
                      <div className="space-y-2 text-sm text-teal-700">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Ziyaret öncesi arayarak randevu alınız</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>Otopark imkanı mevcuttur</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Toplu taşıma ile kolay ulaşım</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  // Suspense can be used if there are searchParams or other async dependencies for the page itself
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader size="xl" color="primary">
          Sayfa yükleniyor...
        </Loader>
      </div>
    }>
      <ContactPageContent />
    </Suspense>
  );
} 