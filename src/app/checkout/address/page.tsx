'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function CheckoutAddressPage() {
    const router = useRouter();
    const { data: session } = useSession();

    // Initial state
    const [formData, setFormData] = useState({
        title: 'Ev',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        zipCode: '',
        country: 'Türkiye',
    });

    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    // New Options
    const [saveToAccount, setSaveToAccount] = useState(false);
    const [makePrimary, setMakePrimary] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Pre-fill from session
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                fullName: session.user?.name || '',
                email: session.user?.email || '',
            }));
            fetchSavedAddresses();
        }

        // Load saved checkout data from local storage
        const saved = localStorage.getItem('checkout_address');
        if (saved) {
            setFormData(prev => ({ ...prev, ...JSON.parse(saved) }));
        }
    }, [session]);

    const fetchSavedAddresses = async () => {
        setLoadingAddresses(true);
        try {
            const res = await fetch('/api/user/addresses');
            const data = await res.json();
            if (data.success) {
                setSavedAddresses(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch addresses', error);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const handleSelectAddress = (addr: any) => {
        setFormData(prev => ({
            ...prev,
            title: addr.title || 'Ev',
            fullName: addr.fullName,
            phone: addr.phone,
            address: addr.address,
            city: addr.city,
            district: addr.district || '',
            zipCode: addr.zipCode,
            country: addr.country
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // If user wants to save this address to their account
            if (saveToAccount && session?.user) {
                await fetch('/api/user/addresses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: formData.title,
                        fullName: formData.fullName,
                        phone: formData.phone,
                        country: formData.country,
                        city: formData.city,
                        district: formData.district,
                        address: formData.address,
                        zipCode: formData.zipCode,
                        isPrimary: makePrimary
                    })
                });
            }

            // Save to local storage for checkout flow
            localStorage.setItem('checkout_address', JSON.stringify(formData));
            router.push('/checkout/payment');
        } catch (error) {
            console.error('Submit error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
                {/* Saved Addresses Selection */}
                {session?.user && savedAddresses.length > 0 && (
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Kayıtlı Adreslerim</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {savedAddresses.map((addr) => (
                                <div
                                    key={addr._id}
                                    onClick={() => handleSelectAddress(addr)}
                                    className="border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-brand-primary-900 hover:bg-slate-50 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-slate-900 text-sm">{addr.title}</span>
                                        {addr.isPrimary && <span className="text-xs bg-brand-primary-100 text-brand-primary-900 px-2 py-0.5 rounded">Varsayılan</span>}
                                    </div>
                                    <p className="text-slate-600 text-sm line-clamp-2">{addr.address}</p>
                                    <p className="text-slate-500 text-xs mt-1">{addr.city} / {addr.district}</p>
                                    <div className="mt-3 text-brand-primary-900 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Bu Adresi Seç
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Teslimat Adresi</h2>
                    <form id="address-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Adres Başlığı (Örn: Ev)</label>
                                <input
                                    name="title" value={formData.title} onChange={handleChange} required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900"
                                />
                            </div>

                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                                <input
                                    name="fullName" value={formData.fullName} onChange={handleChange} required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                                <input
                                    name="email" type="email" value={formData.email} onChange={handleChange} required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900"
                                    disabled={!!session?.user?.email}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                            <input
                                name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="5XX XXX XX XX"
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                            <textarea
                                name="address" value={formData.address} onChange={handleChange} required rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900"
                            />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">İl / Şehir</label>
                                <input
                                    name="city" value={formData.city} onChange={handleChange} required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">İlçe</label>
                                <input
                                    name="district" value={formData.district} onChange={handleChange} required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Posta Kodu</label>
                                <input
                                    name="zipCode" value={formData.zipCode} onChange={handleChange} required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ülke</label>
                            <input
                                name="country" value={formData.country} onChange={handleChange} readOnly
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-500"
                            />
                        </div>

                        {/* Save Options */}
                        {session?.user && (
                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={saveToAccount}
                                        onChange={(e) => setSaveToAccount(e.target.checked)}
                                        className="w-5 h-5 text-brand-primary-900 rounded focus:ring-brand-primary-900 border-slate-300"
                                    />
                                    <span className="text-slate-700 font-medium">Bu adresi hesabıma kaydet</span>
                                </label>

                                {saveToAccount && (
                                    <label className="flex items-center gap-3 cursor-pointer ml-8">
                                        <input
                                            type="checkbox"
                                            checked={makePrimary}
                                            onChange={(e) => setMakePrimary(e.target.checked)}
                                            className="w-4 h-4 text-brand-primary-900 rounded focus:ring-brand-primary-900 border-slate-300"
                                        />
                                        <span className="text-slate-600 text-sm">Varsayılan adresim olarak ayarla</span>
                                    </label>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <div className="lg:col-span-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:sticky lg:top-8">
                    <h3 className="font-bold text-slate-900 mb-4">İşlemler</h3>
                    <button
                        type="submit"
                        form="address-form"
                        disabled={submitting}
                        className="w-full py-4 bg-brand-primary-900 text-white font-bold rounded-xl hover:bg-brand-primary-800 transition-colors shadow-lg shadow-brand-primary-900/10 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'İşleniyor...' : 'Ödeme Adımına Geç'}
                    </button>
                    <p className="mt-4 text-xs text-slate-500 text-center">
                        Devam ederek Kullanıcı Sözleşmesi'ni kabul etmiş sayılırsınız.
                    </p>
                </div>
            </div>
        </div>
    );
}
