'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Prioritize query param callback, else default to /products as requested
    const callbackUrl = searchParams?.get('callbackUrl') || '/products';

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            } else {
                toast.success('Giriş başarılı!');
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (error) {
            toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
            <div className="container-main max-w-md w-full">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Giriş Yap</h1>
                    <p className="text-slate-500 mb-8 text-center">
                        Hesabınıza giriş yapın ve alışverişe devam edin.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900 outline-none transition-all"
                                placeholder="ornek@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-end">
                            <Link href="/forgot-password" className="text-sm text-brand-primary-900 hover:underline">
                                Şifremi Unuttum
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-brand-primary-900 text-white font-bold rounded-xl hover:bg-brand-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
                        Hesabınız yok mu? <Link href="/register" className="text-brand-primary-900 font-bold hover:underline">Kayıt Ol</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
