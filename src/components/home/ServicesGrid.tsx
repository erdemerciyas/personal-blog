'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import HTMLContent from '../HTMLContent';
import { resolveIcon } from '../../lib/icons';

interface ServiceItem {
    _id: string;
    title: string;
    description: string;
    image?: string;
    icon?: string;
    features?: string[];
}

interface ServicesGridProps {
    services: ServiceItem[];
}

export default function ServicesGrid({ services = [] }: ServicesGridProps) {
    if (!services || services.length === 0) {
        return (
            <div className="col-span-full text-center py-12 mb-16">
                <p className="text-slate-600 mb-4">Şu an gösterilecek hizmet bulunamadı.</p>
                <Link href="/contact" className="btn-secondary">Proje talebi bırakın</Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16" aria-live="polite">
            {services.map((service, index) => {
                const IconComponent = resolveIcon(service.icon);

                return (
                    <article
                        key={service._id}
                        className="card-modern group h-full flex flex-col will-change-transform transition-transform duration-500"
                        style={{
                            animationDelay: `${index * 0.05}s`,
                        }}
                        onMouseMove={(e) => {
                            if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                            const el = e.currentTarget as HTMLElement;
                            const rect = el.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            const midX = rect.width / 2;
                            const midY = rect.height / 2;
                            const rotateY = ((x - midX) / midX) * 2;
                            const rotateX = -((y - midY) / midY) * 2;
                            el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                        }}
                        onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
                        }}
                    >
                        {/* Icon or Image */}
                        <div className="mb-8 flex justify-center">
                            {service.image ? (
                                <div className="relative w-full h-48 rounded-2xl overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                                    {IconComponent && (
                                        <IconComponent className="w-8 h-8 text-white" />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="text-center flex-1 flex flex-col">
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-brand-primary-800 transition-colors duration-300">
                                {service.title}
                            </h3>
                            <div className="text-body mb-6 flex-1">
                                <HTMLContent
                                    content={service.description}
                                    truncate={150}
                                    className="line-clamp-3"
                                />
                            </div>
                            <Link
                                href={`/services#${service.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}`}
                                className="inline-flex items-center text-brand-primary-800 hover:text-brand-primary-900 font-semibold transition-colors duration-200 mt-auto focus:outline-none focus:ring-2 focus:ring-brand-primary-600/50 rounded-full px-4 py-2 min-h-[44px]"
                            >
                                Detayları Gör
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
