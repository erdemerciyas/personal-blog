'use client';

import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutAuthPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Removed auto-redirect useEffect to allow user choice

    if (status === 'loading') return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-900"></div>
        </div>
    );

    // If already logged in, show confirmation
    if (status === 'authenticated') {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">👤</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Hoşgeldiniz, {session.user?.name}</h2>
                <p className="text-slate-600 mb-8">
                    <span className="font-semibold">{session.user?.email}</span> hesabı ile alışverişe devam etmek istiyor musunuz?
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.push('/checkout/address')}
                        className="px-8 py-3 bg-brand-primary-900 text-white font-bold rounded-xl hover:bg-brand-primary-800 transition-colors shadow-lg shadow-brand-primary-900/10"
                    >
                        Evet, Devam Et
                    </button>
                    <Link
                        href="/api/auth/signout?callbackUrl=/checkout/auth"
                        className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Farklı Hesapla Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            {/* Login Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Giriş Yap</h2>
                <p className="text-slate-600 mb-8">
                    Siparişlerinizi takip etmek ve kampanyalardan haberdar olmak için giriş yapın.
                </p>

                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                        const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
                        await signIn('credentials', {
                            email,
                            password,
                            redirect: false,
                            callbackUrl: '/checkout/address'
                        });
                        // Manual redirect after successful sign in to update state
                        router.push('/checkout/address');
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                        <input name="email" type="email" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                        <input name="password" type="password" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-brand-primary-900 text-white font-bold rounded-xl hover:bg-brand-primary-800 transition-colors">
                        Giriş Yap ve Devam Et
                    </button>
                    <div className="text-center text-sm text-slate-500">
                        Hesabınız yok mu? <Link href="/register?redirect=/checkout/auth" className="text-brand-primary-900 font-bold hover:underline">Kayıt Ol</Link>
                    </div>
                </form>
            </div>

            {/* Guest Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Misafir Olarak Devam Et</h2>
                <p className="text-slate-600 mb-8">
                    Üye olmadan siparişinizi hızlıca tamamlayabilirsiniz. Sipariş takibi için e-posta adresiniz istenecek.
                </p>

                <button
                    onClick={() => router.push('/checkout/address')}
                    className="w-full py-3 bg-white border-2 border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                    Misafir Olarak Devam Et
                </button>

                <div className="mt-8 pt-8 border-t border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-2">Avantajlar</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li>• Hızlı sipariş tamamlama</li>
                        <li>• Üye olma zorunluluğu yok</li>
                        <li>• Sipariş sonrası kolayca üye olabilirsiniz</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
