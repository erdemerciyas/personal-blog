'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams?.get('orderId');

    // Cart is automatically cleared by the API, and the context will sync on new fetch.
    useEffect(() => {
        // Optional: Trigger global event or analytics here
        localStorage.removeItem('guestCartId');

        // Auto redirect after 15 seconds
        const timer = setTimeout(() => {
            window.location.href = '/products';
        }, 15000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 mx-auto border border-emerald-100">
                <CheckCircleIcon className="w-16 h-16 text-emerald-500" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Siparişiniz Başarıyla Alındı!</h1>
            <p className="text-slate-600 mb-8">
                Siparişiniz başarıyla oluşturuldu ve ödemeniz onaylandı.
                <br />
                Sipariş Numaranız: <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded ml-1">#{orderId?.slice(-6).toUpperCase()}</span>
            </p>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-left mb-8">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Bundan sonra ne olacak?
                </h3>
                <ul className="text-sm text-slate-600 space-y-3 pl-1">
                    <li className="flex gap-2">
                        <span className="text-slate-400">•</span>
                        Sipariş detaylarınız e-posta adresinize gönderildi.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-slate-400">•</span>
                        Siparişiniz hazırlandığında kargo takip numarası iletilecektir.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-slate-400">•</span>
                        Sipariş durumunu "Hesabım" sayfasından takip edebilirsiniz.
                    </li>
                </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="px-8 py-3.5 bg-brand-primary-900 text-white font-bold rounded-xl hover:bg-brand-primary-800 transition-all shadow-lg shadow-brand-primary-900/20 active:scale-95">
                    Anasayfaya Dön
                </Link>
                <Link href="/products" className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors active:scale-95">
                    Alışverişe Devam Et
                </Link>
            </div>

            <p className="mt-8 text-xs text-slate-400">
                15 saniye içinde otomatik olarak ürünler sayfasına yönlendirileceksiniz...
            </p>
        </div>
    );
}
