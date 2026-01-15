'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { LockClosedIcon, CreditCardIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function CheckoutPaymentPage() {
    const router = useRouter();
    const { cart, cartTotal, loading: cartLoading } = useCart();
    const [address, setAddress] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Validation: Redirect if no address
        const savedAddress = localStorage.getItem('checkout_address');
        if (!savedAddress) {
            router.push('/checkout/address');
            return;
        }
        setAddress(JSON.parse(savedAddress));
    }, [router]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const res = await fetch('/api/checkout/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartId: localStorage.getItem('guestCartId'), // Optional if Auth
                    address: address,
                    payment: {
                        provider: 'iyzico-mock',
                        cardHolder: 'Mock User', // In real app, from form
                    }
                    // Note: Cart items are fetched server-side from DB based on cartId/userId
                }),
            });

            if (res.ok) {
                const data = await res.json();
                // Clear local storage cart
                localStorage.removeItem('guestCartId');
                localStorage.removeItem('checkout_address');
                // Redirect
                router.push(`/checkout/success?orderId=${data.orderId}`);
            } else {
                toast.error('Ödeme başarısız oldu. Lütfen tekrar deneyiniz.');
            }
        } catch (error) {
            console.error('Payment Error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartLoading) return <div className="py-20 text-center">Yükleniyor...</div>;

    if (!cart || cart.items.length === 0) {
        // Ideally redirect to cart, but show message for now
        return <div className="py-20 text-center">Sepetiniz boş.</div>;
    }

    return (
        <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <LockClosedIcon className="w-6 h-6 text-brand-primary-900" />
                        Güvenli Ödeme
                    </h2>

                    {/* Payment Form (Mock) */}
                    <form id="payment-form" onSubmit={handlePayment} className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex items-center gap-4">
                            <div className="w-12 h-8 bg-white rounded border border-slate-200 flex items-center justify-center">
                                <CreditCardIcon className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-700">Kredi / Banka Kartı</div>
                                <div className="text-xs text-slate-500">Tüm kartlara taksit imkanı</div>
                            </div>
                        </div>

                        <div className="space-y-4 opacity-75 pointer-events-none select-none relative">
                            {/* Overlay for Mock */}
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                                <span className="bg-brand-primary-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                    Simülasyon Modu
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kart Numarası</label>
                                <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Son Kullanma (AA/YY)</label>
                                    <input type="text" placeholder="MM/YY" className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                                    <input type="text" placeholder="123" className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kart Sahibi</label>
                                <input type="text" placeholder="AD SOYAD" className="w-full px-4 py-2 rounded-lg border border-slate-300" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:sticky lg:top-8">
                    <h3 className="font-bold text-slate-900 mb-4">Sipariş Özeti</h3>

                    <div className="space-y-3 mb-6">
                        {cart.items.map(item => (
                            <div key={item.product._id} className="flex justify-between text-sm">
                                <span className="text-slate-600 truncate max-w-[180px]">{item.product.title} <span className="text-xs text-slate-400">x{item.quantity}</span></span>
                                <span className="font-medium">{(item.product.price * item.quantity).toLocaleString('tr-TR')} TL</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 pt-4 mb-6">
                        <div className="flex justify-between items-end">
                            <span className="font-bold text-slate-900">Toplam Tutar</span>
                            <span className="text-2xl font-bold text-brand-primary-900">{cartTotal.toLocaleString('tr-TR')} TL</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        form="payment-form"
                        disabled={isProcessing}
                        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? 'İşleniyor...' : `Ödemeyi Tamamla (${cartTotal.toLocaleString('tr-TR')} TL)`}
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 opacity-60 grayscale">
                        {/* Payment Logos Placeholder */}
                        <div className="h-6 w-10 bg-slate-200 rounded"></div>
                        <div className="h-6 w-10 bg-slate-200 rounded"></div>
                        <div className="h-6 w-10 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
