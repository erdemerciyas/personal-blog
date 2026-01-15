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
        <div className="flex flex-col items-center justify-center py-20 text-center container-main">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
                <CheckCircleIcon className="w-16 h-16 text-emerald-600" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Siparişiniz Alındı!</h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg">
                Teşekkür ederiz. Siparişiniz başarıyla oluşturuldu.
                <br />
                Sipariş Numaranız: <span className="font-bold text-slate-900">#{orderId?.slice(-6).toUpperCase()}</span>
                <br />
                <span className="text-sm text-slate-400 mt-2 block">15 saniye içinde ürünler sayfasına yönlendirileceksiniz...</span>
            </p>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-lg w-full mb-8">
                <h3 className="font-bold text-slate-900 mb-2">Bundan sonra ne olacak?</h3>
                <ul className="text-sm text-slate-600 space-y-2 text-left list-disc pl-5">
                    <li>Sipariş detaylarınız e-posta adresinize gönderildi.</li>
                    <li>Siparişiniz hazırlandığında kargo takip numarası iletilecektir.</li>
                    <li>Sipariş durumunu "Hesabım" sayfasından takip edebilirsiniz.</li>
                </ul>
            </div>

            <div className="flex gap-4">
                <Link href="/" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                    Anasayfaya Dön
                </Link>
                <Link href="/products" className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                    Alışverişe Devam Et
                </Link>
            </div>
        </div>
    );
}
