'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRightIcon,
    CheckCircleIcon,
    ClockIcon,
    CogIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import HTMLContent from '../../components/HTMLContent';

interface Service {
    _id: string;
    title: string;
    description: string;
    image?: string;
    features?: string[];
    price?: string;
    duration?: string;
    rating?: number;
    createdAt: string;
}

interface ServicesClientProps {
    services: Service[];
    hero: {
        title: string;
        description: string;
    };
}

export default function ServicesClient({ services, hero }: ServicesClientProps) {
    const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

    const toggleExpand = (serviceId: string) => {
        const newExpanded = new Set(expandedServices);
        if (newExpanded.has(serviceId)) {
            newExpanded.delete(serviceId);
        } else {
            newExpanded.add(serviceId);
        }
        setExpandedServices(newExpanded);
    };

    return (
        <>
            {/* Main Content */}
            <section id="services" className="py-2 md:py-2 lg:py-2 bg-gray-50">
                <div className="container mx-auto px-4">
                    {/* Section Title */}
                    <div className="section-header">
                        <h2 className="text-gray-900">Detaylı Hizmet Açıklamaları</h2>
                        <p className="text-gray-600 px-4">
                            Her bir hizmetimizin detaylarını inceleyin ve ihtiyaçlarınıza en uygun çözümü keşfedin.
                        </p>
                    </div>

                    {services.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                <SparklesIcon className="w-12 h-12 text-gray-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                Henüz hizmet bulunmuyor
                            </h2>
                            <p className="text-gray-600">
                                Yakında sizlere hizmet sunmaya başlayacağız.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-12 md:space-y-16 lg:space-y-20">
                            {services.map((service, index) => (
                                <div
                                    key={service._id}
                                    id={service.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-6xl mx-auto"
                                >
                                    {/* Service Image */}
                                    <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                                        <div className="relative h-64 md:h-72 lg:h-80 rounded-xl overflow-hidden shadow-lg">
                                            {service.image ? (
                                                <Image
                                                    src={service.image}
                                                    alt={service.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="bg-gradient-to-br from-brand-primary-600 to-blue-600 h-full flex items-center justify-center">
                                                    <div className="text-white text-6xl md:text-7xl lg:text-8xl font-bold opacity-30">
                                                        {service.title.charAt(0)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Service Info */}
                                    <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                                        {/* Service Badge - Outside container for perfect alignment */}
                                        <div className="inline-flex items-center bg-brand-primary-100 text-brand-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                                            <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                                {service.title.charAt(0)}
                                            </div>
                                            {service.title}
                                        </div>

                                        <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg h-fit">
                                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                                                {service.title}
                                            </h3>

                                            {/* Description with Collapse */}
                                            <div className="mb-6">
                                                <div className="text-gray-600 leading-relaxed text-sm md:text-base">
                                                    <HTMLContent
                                                        content={service.description}
                                                        truncate={expandedServices.has(service._id) ? undefined : 180}
                                                        showMore={expandedServices.has(service._id)}
                                                        onToggle={() => toggleExpand(service._id)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Features Section */}
                                            {service.features && service.features.length > 0 && (
                                                <div className="mb-6">
                                                    <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                                        <CheckCircleIcon className="w-5 h-5 text-brand-primary-600 mr-2" />
                                                        Öne Çıkan Özellikler
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {service.features.map((feature, idx) => (
                                                            <li key={idx} className="flex items-start text-gray-700 text-sm md:text-base">
                                                                <div className="w-2 h-2 bg-brand-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                                                <span>{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Service Meta Info */}
                                            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                                {service.duration && (
                                                    <div className="flex items-center text-gray-600">
                                                        <ClockIcon className="w-4 h-4 mr-2" />
                                                        <span className="text-sm">Süre: {service.duration}</span>
                                                    </div>
                                                )}

                                                {service.rating && (
                                                    <div className="flex items-center text-gray-600">
                                                        <CogIcon className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-sm">{service.rating}/5</span>
                                                    </div>
                                                )}

                                                {service.price && (
                                                    <div className="text-brand-primary-700 font-semibold text-sm md:text-base">
                                                        {service.price}
                                                    </div>
                                                )}
                                            </div>

                                            {/* CTA Button */}
                                            <Link
                                                href={`/contact?service=${encodeURIComponent(service.title)}`}
                                                className="btn-primary inline-flex items-center group text-sm md:text-base"
                                            >
                                                <span>Detaylı Bilgi Al</span>
                                                <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient-primary text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
                    <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rotate-45"></div>
                    <div className="absolute bottom-20 left-1/4 w-24 h-24 border-2 border-white rounded-full"></div>
                    <div className="absolute bottom-10 right-10 w-12 h-12 border-2 border-white rotate-12"></div>
                </div>

                <div className="container-content text-center relative z-10">
                    <h2 className="section-title text-white mb-6">
                        Özel Bir Projeniz mi Var?
                    </h2>
                    <p className="section-subtitle text-brand-primary-100 mb-12 max-w-2xl mx-auto">
                        Size özel çözümler geliştirmek için buradayız. Projenizi birlikte değerlendirelim.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/contact" className="btn-primary">
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Proje Teklifi Al
                        </Link>
                        <Link href="/portfolio" className="btn-secondary">
                            Örnek Projelerimizi İnceleyin
                            <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
