'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    XMarkIcon,
    PaperAirplaneIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../ui/useToast';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
    const [mounted, setMounted] = useState(false);
    const [projectForm, setProjectForm] = useState({
        name: '',
        email: '',
        phone: '',
        projectType: '',
        description: '',
        budget: '',
        timeline: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const { show } = useToast();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleProjectFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProjectForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProjectFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: projectForm.name,
                    email: projectForm.email,
                    phone: projectForm.phone,
                    subject: `Proje Başvurusu: ${projectForm.projectType}`,
                    message: `
Proje Türü: ${projectForm.projectType}
Bütçe: ${projectForm.budget}
Zaman Planı: ${projectForm.timeline}

Proje Açıklaması: ${projectForm.description}
Ad Soyad: ${projectForm.name}
Telefon: ${projectForm.phone}
E-posta: ${projectForm.email}
          `.trim()
                }),
            });

            if (response.ok) {
                setSubmitStatus('success');
                show({
                    title: 'Başvurunuz alındı',
                    description: 'Size en kısa sürede geri dönüş yapacağım.',
                    variant: 'success',
                    duration: 4000,
                });

                // GA4 event tracking could be added here via props or context if needed

                setProjectForm({
                    name: '',
                    email: '',
                    phone: '',
                    projectType: '',
                    description: '',
                    budget: '',
                    timeline: ''
                });
                setTimeout(() => {
                    onClose();
                    setSubmitStatus('idle');
                }, 2000);
            } else {
                setSubmitStatus('error');
                show({
                    title: 'Gönderilemedi',
                    description: 'Lütfen daha sonra tekrar deneyin.',
                    variant: 'danger',
                    duration: 4500,
                });
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitStatus('error');
            show({
                title: 'Bir hata oluştu',
                description: 'Bağlantı sırasında bir sorun yaşandı.',
                variant: 'danger',
                duration: 4500,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                        <PaperAirplaneIcon className="w-6 h-6 text-brand-primary-700" />
                        <span>Proje Başvurusu</span>
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Diyaloğu kapat"
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600"
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleProjectFormSubmit} className="p-6 space-y-6" aria-labelledby="project-modal-title">
                    <h2 id="project-modal-title" className="sr-only">Proje Başvurusu Formu</h2>
                    {submitStatus === 'success' && (
                        <div className="bg-brand-primary-50 border border-brand-primary-200 rounded-xl p-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-brand-primary-600 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-brand-primary-800 font-medium">Proje başvurunuz başarıyla gönderildi!</p>
                            </div>
                        </div>
                    )}

                    {submitStatus === 'error' && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-red-800">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Ad Soyad *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={projectForm.name}
                                onChange={handleProjectFormChange}
                                required
                                aria-required="true"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 transition-all"
                                placeholder="Adınız ve soyadınız"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                E-posta *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={projectForm.email}
                                onChange={handleProjectFormChange}
                                required
                                aria-required="true"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 transition-all"
                                placeholder="ornek@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                Telefon
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={projectForm.phone}
                                onChange={handleProjectFormChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 transition-all"
                                placeholder="05XX XXX XX XX"
                            />
                        </div>

                        <div>
                            <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
                                Proje Türü *
                            </label>
                            <select
                                id="projectType"
                                name="projectType"
                                value={projectForm.projectType}
                                onChange={handleProjectFormChange}
                                required
                                aria-required="true"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 transition-all"
                            >
                                <option value="">Seçiniz</option>
                                <option value="3d-scanning">3D Tarama</option>
                                <option value="reverse-engineering">Tersine Mühendislik</option>
                                <option value="3d-modeling">3D Modelleme</option>
                                <option value="cad-design">CAD Tasarım</option>
                                <option value="prototype">Prototip Geliştirme</option>
                                <option value="consulting">Danışmanlık</option>
                                <option value="other">Diğer</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                                Bütçe Aralığı
                            </label>
                            <select
                                id="budget"
                                name="budget"
                                value={projectForm.budget}
                                onChange={handleProjectFormChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 transition-all"
                            >
                                <option value="">Seçiniz</option>
                                <option value="under-5k">5.000 TL altı</option>
                                <option value="5k-15k">5.000 - 15.000 TL</option>
                                <option value="15k-50k">15.000 - 50.000 TL</option>
                                <option value="50k-plus">50.000 TL üzeri</option>
                                <option value="discuss">Görüşmeli</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                                Zaman Planı
                            </label>
                            <select
                                id="timeline"
                                name="timeline"
                                value={projectForm.timeline}
                                onChange={handleProjectFormChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 transition-all"
                            >
                                <option value="">Seçiniz</option>
                                <option value="asap">Mümkün olan en kısa sürede</option>
                                <option value="1-week">1 hafta içinde</option>
                                <option value="1-month">1 ay içinde</option>
                                <option value="3-months">3 ay içinde</option>
                                <option value="flexible">Esnek</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text sm font-medium text-gray-700 mb-2">
                            Proje Detayları *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={projectForm.description}
                            onChange={handleProjectFormChange}
                            required
                            aria-required="true"
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2 transition-all resize-none"
                            placeholder="Projenizin detaylarını, hedeflerinizi ve özel gereksinimlerinizi açıklayın..."
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 focus-visible:ring-offset-2"
                        >
                            {isSubmitting ? (
                                <span>Gönderiliyor...</span>
                            ) : (
                                <>
                                    <EnvelopeIcon className="w-5 h-5" />
                                    <span>Başvuruyu Gönder</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
