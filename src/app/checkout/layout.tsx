'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/solid';

const steps = [
    { id: 'auth', label: 'Giriş / Üyelik', path: '/checkout/auth' },
    { id: 'address', label: 'Adres & Fatura', path: '/checkout/address' },
    { id: 'payment', label: 'Ödeme', path: '/checkout/payment' },
];

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const getCurrentStepIndex = () => {
        if (pathname?.includes('/payment')) return 2;
        if (pathname?.includes('/address')) return 1;
        return 0; // auth or default
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <main className="min-h-screen bg-slate-50 pt-28 pb-20">
            {/* Hero Section */}
            <div className="bg-slate-900 pb-20 pt-10">
                <div className="container-main">
                    {!pathname?.includes('/success') ? (
                        <div className="flex flex-col items-center">
                            <h1 className="text-2xl font-bold text-white mb-8">Güvenli Ödeme</h1>

                            {/* Steps Progress */}
                            <div className="w-full max-w-3xl">
                                <div className="flex justify-between items-center relative px-4 sm:px-12">
                                    {/* Connector Line Background */}
                                    <div className="absolute left-6 right-6 top-5 h-0.5 bg-white/10 -z-0 sm:left-14 sm:right-14" />

                                    {steps.map((step, index) => {
                                        const isCompleted = index < currentStepIndex;
                                        const isCurrent = index === currentStepIndex;

                                        return (
                                            <div key={step.id} className="relative z-10 flex flex-col items-center group">
                                                <div
                                                    className={`
                                                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-3 transition-all duration-300 ring-4
                                                        ${isCompleted
                                                            ? 'bg-emerald-500 text-white ring-slate-900 shadow-lg shadow-emerald-500/30'
                                                            : isCurrent
                                                                ? 'bg-brand-primary-400 text-slate-900 ring-slate-900 shadow-lg shadow-brand-primary-400/50 scale-110'
                                                                : 'bg-slate-800 text-slate-400 ring-slate-900 border border-slate-700'
                                                        }
                                                    `}
                                                >
                                                    {isCompleted ? <CheckIcon className="w-6 h-6" /> : index + 1}
                                                </div>
                                                <span className={`
                                                    text-xs font-bold uppercase tracking-wider transition-colors duration-300
                                                    ${isCompleted
                                                        ? 'text-emerald-400'
                                                        : isCurrent
                                                            ? 'text-white'
                                                            : 'text-slate-500'
                                                    }
                                                `}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-emerald-500/30">
                                <CheckIcon className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Siparişiniz Alındı</h1>
                            <p className="text-slate-400">Teşekkür ederiz, siparişiniz başarıyla oluşturuldu.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area - Overlapping */}
            <div className="container-main -mt-10 relative z-20">
                {children}
            </div>
        </main>
    );
}
