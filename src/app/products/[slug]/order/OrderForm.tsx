'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircleIcon, ArrowLeftIcon, ShieldCheckIcon, TruckIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface OrderFormProps {
    product: {
        _id: string;
        name: string;
        slug: string;
        price?: number;
        currency?: string;
        images?: string[];
        colors?: string[];
        sizes?: string[];
    };
}

export default function OrderForm({ product }: OrderFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');

    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        note: '',
    });

    const totalPrice = product.price ? product.price * quantity : undefined;

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty >= 1) setQuantity(newQty);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const selectedOptions = [];
            if (selectedColor) selectedOptions.push({ group: 'Renk', option: selectedColor });
            if (selectedSize) selectedOptions.push({ group: 'Beden', option: selectedSize });

            const unitPrice = Number(product.price) || 0;
            console.log('Unit Price determined:', unitPrice, 'from product.price:', product.price);

            const payload = {
                productId: product._id,
                ...formData,
                quantity,
                price: unitPrice,
                selectedOptions,
            };

            console.log('Sending payload:', payload);

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.emailStatus && (!data.emailStatus.admin || !data.emailStatus.customer)) {
                    console.warn('Orders created but some emails failed:', data.emailStatus);
                    // You could optionally show a different success message here "Sipariş alındı ancak e-posta gönderilemedi"
                }
                setSuccess(true);
            } else {
                const errorData = await response.json();
                console.error('Order failed:', errorData);
                alert(`Sipariş oluşturulurken bir hata oluştu: ${errorData.error || 'Bilinmeyen hata'}`);
            }
        } catch (error) {
            console.error('Order submission error:', error);
            alert('Bir hata oluştu. Lütfen konsolu kontrol ediniz.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-green-900/10 animate-in zoom-in duration-300 delay-150">
                    <CheckCircleIcon className="w-14 h-14 text-green-600" />
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Siparişiniz Alındı!</h2>
                <div className="text-slate-600 max-w-lg mb-10 leading-relaxed text-lg">
                    <p className="mb-2">Sayın <strong>{formData.customerName}</strong>,</p>
                    <p>Siparişiniz başarıyla oluşturulmuştur. Detaylar <strong>{formData.customerEmail}</strong> adresine gönderilmiştir.</p>
                </div>
                <Link
                    href="/products"
                    className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl bg-brand-primary-900 text-white font-bold text-lg shadow-lg shadow-brand-primary-900/25 hover:bg-brand-primary-800 hover:shadow-xl hover:shadow-brand-primary-900/30 transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
                >
                    Alışverişe Devam Et
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pt-8">
            <div className="mb-8">
                <Link href={`/products/${product.slug}`} className="inline-flex items-center text-slate-500 hover:text-brand-primary-600 transition-colors font-medium group">
                    <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Ürüne Dön
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                {/* Left Column: Form */}
                <div className="lg:col-span-7 space-y-8">

                    {/* Product Options Section */}
                    {(product.colors && product.colors.length > 0 || product.sizes && product.sizes.length > 0) && (
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Ürün Seçenekleri</h2>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {product.colors && product.colors.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3">Renk Seçimi</label>
                                        <div className="flex flex-wrap gap-3">
                                            {product.colors.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedColor === color
                                                        ? 'border-brand-primary-600 bg-brand-primary-50 text-brand-primary-700 shadow-sm'
                                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {product.sizes && product.sizes.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3">Beden / Ölçü Seçimi</label>
                                        <div className="flex flex-wrap gap-3">
                                            {product.sizes.map(size => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedSize === size
                                                        ? 'border-brand-primary-600 bg-brand-primary-50 text-brand-primary-700 shadow-sm'
                                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-brand-primary-50 flex items-center justify-center text-brand-primary-600">
                                <ShieldCheckIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Teslimat Bilgileri</h1>
                                <p className="text-slate-500 text-sm">Lütfen iletişim ve adres bilgilerinizi eksiksiz giriniz.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-brand-primary-600 transition-colors">Ad Soyad</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-primary-500 focus:ring-4 focus:ring-brand-primary-500/10 focus:outline-none transition-all duration-300"
                                    placeholder="Adınız Soyadınız"
                                    value={formData.customerName}
                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-brand-primary-600 transition-colors">E-posta</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-primary-500 focus:ring-4 focus:ring-brand-primary-500/10 focus:outline-none transition-all duration-300"
                                        placeholder="ornek@email.com"
                                        value={formData.customerEmail}
                                        onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-brand-primary-600 transition-colors">Telefon</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-primary-500 focus:ring-4 focus:ring-brand-primary-500/10 focus:outline-none transition-all duration-300"
                                        placeholder="05XX XXX XX XX"
                                        value={formData.customerPhone}
                                        onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-brand-primary-600 transition-colors">Teslimat Adresi</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-primary-500 focus:ring-4 focus:ring-brand-primary-500/10 focus:outline-none transition-all duration-300 resize-none"
                                    placeholder="Açık adresiniz..."
                                    value={formData.customerAddress}
                                    onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-brand-primary-600 transition-colors">Sipariş Notu (İsteğe bağlı)</label>
                                <textarea
                                    rows={2}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-primary-500 focus:ring-4 focus:ring-brand-primary-500/10 focus:outline-none transition-all duration-300 resize-none"
                                    placeholder="Varsa eklemek istedikleriniz..."
                                    value={formData.note}
                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative overflow-hidden group/btn inline-flex justify-center items-center rounded-2xl bg-brand-primary-900 px-6 py-5 text-lg font-bold text-white shadow-xl shadow-brand-primary-900/20 hover:bg-brand-primary-800 hover:shadow-2xl hover:shadow-brand-primary-900/30 focus:outline-none focus:ring-4 focus:ring-brand-primary-500/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.99]"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-3">
                                            <svg className="animate-spin h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            İşleminiz Yapılıyor...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Siparişi ve Ödemeyi Onayla
                                        </span>
                                    )}
                                </button>
                                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                                    <ShieldCheckIcon className="w-4 h-4" />
                                    <span>Bilgileriniz 256-bit SSL sertifikası ile korunmaktadır.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="lg:col-span-5 sticky top-32">
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">1</span>
                            Sipariş Özeti
                        </h3>

                        <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                                {product.images?.[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Görsel Yok</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                                <h4 className="font-bold text-slate-900 line-clamp-2 leading-tight mb-2">{product.name}</h4>
                                <div className="flex items-center gap-1 text-green-600 text-xs font-semibold mt-2 bg-green-50 w-fit px-2 py-1 rounded-full">
                                    <TruckIcon className="w-3 h-3" />
                                    <span>Hemen Teslim</span>
                                </div>
                                {(selectedColor || selectedSize) && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedColor && <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Renk: {selectedColor}</span>}
                                        {selectedSize && <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Beden: {selectedSize}</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Quantity Selector handled here in summary */}
                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-700 font-medium">Adet</span>
                                <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-l-lg transition-colors disabled:opacity-50"
                                    >
                                        <MinusIcon className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-semibold text-slate-900">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(1)}
                                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-r-lg transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 my-2" />

                            <div className="flex justify-between text-slate-600 text-sm">
                                <span>Birim Fiyat</span>
                                <span className="font-medium">{product.price ? `${product.price.toLocaleString('tr-TR')} ${product.currency || 'TL'}` : 'Teklif Alın'}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 text-sm">
                                <span>Kargo Ücreti</span>
                                <span className="text-green-600 font-bold">Ücretsiz</span>
                            </div>

                            <div className="h-px bg-slate-100 my-2" />

                            <div className="flex justify-between items-end">
                                <span className="text-slate-900 font-bold">Toplam Tutar</span>
                                <span className="text-3xl font-black text-slate-900 tracking-tight">
                                    {totalPrice ? `${totalPrice.toLocaleString('tr-TR')}` : '-'} <span className="text-sm font-bold text-slate-500 ml-1 align-top relative top-2">{product.currency || 'TL'}</span>
                                </span>
                            </div>

                            {product.price && (
                                <div className="bg-blue-50/50 rounded-xl p-3 text-xs text-blue-700 leading-relaxed border border-blue-100/50 mt-4 text-center">
                                    Bu ürünü sipariş verdiğinizde sizinle iletişime geçilerek ödeme ve teslimat detayları netleştirilecektir.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}
