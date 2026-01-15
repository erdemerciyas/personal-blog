'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

const CartPage = () => {
    const { cart, loading, updateQuantity, removeFromCart, cartTotal } = useCart();

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-900"></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-20 container-main flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBagIcon className="w-12 h-12 text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Sepetiniz Boş</h1>
                <p className="text-slate-500 mb-8 max-w-sm">
                    Henüz sepetinize bir ürün eklemediniz. Hemen alışverişe başlayın!
                </p>
                <Link href="/products" className="px-8 py-3 bg-brand-primary-900 text-white rounded-xl font-bold hover:bg-brand-primary-800 transition-colors">
                    Ürünleri Keşfet
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-32 pb-20 bg-slate-50">
            <div className="container-main">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Sepetim ({cart.items.length} Ürün)</h1>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        {cart.items.map((item) => (
                            <div key={item.product._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex gap-4 sm:gap-6">
                                {/* Image */}
                                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                                    <Image
                                        src={item.product.coverImage}
                                        alt={item.product.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col sm:flex-row justify-between">
                                    <div className="flex-1 mr-4">
                                        <Link href={`/products/${item.product.slug}`} className="font-bold text-slate-900 hover:text-brand-primary-700 transition-colors line-clamp-2 mb-1">
                                            {item.product.title}
                                        </Link>
                                        <div className="text-sm text-slate-500 mb-4">
                                            {item.product.price} TL
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-between">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
                                            <button
                                                onClick={() => {
                                                    if (item.quantity > 1) {
                                                        updateQuantity(item.product._id, item.quantity - 1);
                                                    } else {
                                                        removeFromCart(item.product._id);
                                                    }
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                                                aria-label="Azalt"
                                            >
                                                <MinusIcon className="w-4 h-4" />
                                            </button>
                                            <span className="w-4 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                                                disabled={item.quantity >= item.product.stock}
                                                aria-label="Artır"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                            <div className="text-lg font-bold text-brand-primary-900">
                                                {(item.product.price * item.quantity).toLocaleString('tr-TR')} TL
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.product._id)}
                                                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                                aria-label="Sil"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Sipariş Özeti</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Ara Toplam</span>
                                    <span>{cartTotal.toLocaleString('tr-TR')} TL</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Kargo</span>
                                    <span className="text-emerald-600 font-medium">
                                        {cartTotal > 1500 ? 'Ücretsiz' : 'Alıcı Öder'}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 mb-6">
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-slate-900">Toplam</span>
                                    <span className="text-2xl font-bold text-brand-primary-900">{cartTotal.toLocaleString('tr-TR')} TL</span>
                                </div>
                            </div>

                            <Link href="/checkout/auth" className="block w-full py-4 bg-brand-primary-900 text-white text-center font-bold rounded-xl hover:bg-brand-primary-800 transition-transform active:scale-[0.98] shadow-lg shadow-brand-primary-900/10">
                                Alışverişi Tamamla
                            </Link>

                            <div className="mt-4 text-xs text-slate-400 text-center">
                                Güvenli ödeme altyapısı ile korunmaktadır.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CartPage;
