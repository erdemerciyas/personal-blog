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
        <div className="min-h-screen bg-slate-50">
            {/* Simplified Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="container-main h-20 flex items-center justify-between">
                    <Link href="/" className="font-bold text-2xl text-slate-900">
                        FIXRAL
                    </Link>
                    <div className="text-sm font-medium text-slate-500">
                        Güvenli Ödeme
                    </div>
                </div>
            </header>

            {/* Steps Progress */}
            {!pathname?.includes('/success') && (
                <div className="bg-white border-b border-slate-200 py-6">
                    <div className="container-main">
                        <div className="flex justify-center items-center gap-4 md:gap-12">
                            {steps.map((step, index) => {
                                const isCompleted = index < currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={step.id} className="flex flex-col items-center relative">
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors
                                            ${isCompleted || isCurrent ? 'bg-brand-primary-900 text-white' : 'bg-slate-100 text-slate-400'}
                                        `}>
                                            {isCompleted ? <CheckIcon className="w-5 h-5" /> : index + 1}
                                        </div>
                                        <span className={`
                                            text-xs font-medium uppercase tracking-wider
                                            ${isCompleted || isCurrent ? 'text-brand-primary-900' : 'text-slate-400'}
                                        `}>
                                            {step.label}
                                        </span>

                                        {/* Connector Line */}
                                        {index < steps.length - 1 && (
                                            <div className={`
                                                hidden md:block absolute top-5 left-1/2 w-[calc(100%+3rem)] h-0.5 -z-10
                                                ${index < currentStepIndex ? 'bg-brand-primary-900' : 'bg-slate-100'}
                                            `} style={{ left: '50%' }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="py-10">
                <div className="container-main max-w-5xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
