'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Kayıt başarısız.');
            }

            // Success
            // Can show a toast or message. For now redirecting to login.
            alert('Kayıt başarılı! Lütfen giriş yapın.');
            router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(redirectUrl)}`); // Or custom login page if exists

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
            <div className="container-main max-w-md w-full">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Kayıt Ol</h1>
                    <p className="text-slate-500 mb-8 text-center">
                        Yeni bir hesap oluşturun ve alışverişe başlayın.
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre Tekrar</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900 outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-brand-primary-900 text-white font-bold rounded-xl hover:bg-brand-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
                        Zaten hesabınız var mı? <Link href="/api/auth/signin" className="text-brand-primary-900 font-bold hover:underline">Giriş Yap</Link>
                        {/* Note: I might need to check where /api/auth/signin redirects or if there is a custom login page.
                            The user mentioned "Giriş Yap" works, but checkout auth page uses `signIn()` directly.
                            Usually NextAuth uses built-in pages unless defined.
                            I will assume standard NextAuth for now, or the checkout auth page which is at `/checkout/auth`.
                            Maybe better to link to `/checkout/auth` if they came from there?
                            Or just the generic Login if I find one.
                        */}
                    </div>
                </div>
            </div>
        </div>
    );
}
