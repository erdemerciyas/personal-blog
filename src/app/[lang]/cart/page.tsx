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

    return (
        <main className="min-h-screen pt-28 pb-20 bg-slate-50">
            {/* Hero Section */}
            <div className="bg-slate-900 pb-20 pt-10">
                <div className="container-main">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3 justify-center md:justify-start">
                                <ShoppingBagIcon className="w-8 h-8 text-brand-primary-400" />
                                Sepetim
                            </h1>
                            <p className="text-slate-400">
                                Sahip olmak istediğiniz ürünleri buradan yönetebilirsiniz.
                            </p>
                        </div>
                        {cart && cart.items.length > 0 && (
                            <div className="bg-white/10 rounded-xl p-4 px-6 border border-white/10 backdrop-blur-sm flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white leading-none">{cart.items.length}</div>
                                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">Ürün</div>
                                </div>
                                <div className="h-8 w-px bg-white/20"></div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-brand-primary-400 leading-none">{cartTotal.toLocaleString('tr-TR')} ₺</div>
                                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">Toplam</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container-main -mt-10">
                {!cart || cart.items.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-12 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 mx-auto border border-slate-100">
                            <ShoppingBagIcon className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Sepetiniz Boş</h2>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                            Henüz sepetinize bir ürün eklemediniz. Hemen alışverişe başlayın!
                        </p>
                        <Link href="/products" className="inline-block px-8 py-3 bg-brand-primary-900 text-white rounded-xl font-bold hover:bg-brand-primary-800 transition-colors shadow-lg shadow-brand-primary-900/20">
                            Ürünleri Keşfet
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-4">
                            {cart.items.map((item) => (
                                <div key={item.product._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex gap-4 sm:gap-6 hover:shadow-md transition-shadow">
                                    {/* Image */}
                                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
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
                                            <Link href={`/products/${item.product.slug}`} className="font-bold text-slate-900 hover:text-brand-primary-700 transition-colors line-clamp-2 mb-2 text-lg">
                                                {item.product.title}
                                            </Link>
                                            <div className="text-sm font-medium text-slate-500 mb-4 bg-slate-50 inline-block px-2 py-1 rounded-md border border-slate-100">
                                                Birim Fiyat: {item.product.price.toLocaleString('tr-TR')} TL
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
                                                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:text-red-500 hover:shadow-sm rounded-md transition-all"
                                                    aria-label="Azalt"
                                                >
                                                    <MinusIcon className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:text-green-600 hover:shadow-sm rounded-md transition-all"
                                                    disabled={item.quantity >= item.product.stock}
                                                    aria-label="Artır"
                                                >
                                                    <PlusIcon className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                                <div className="text-xl font-bold text-brand-primary-900">
                                                    {(item.product.price * item.quantity).toLocaleString('tr-TR')} TL
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.product._id)}
                                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all p-2 rounded-lg"
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
                            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                                    <ShoppingBagIcon className="w-5 h-5 text-brand-primary-900" />
                                    Sipariş Özeti
                                </h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Ara Toplam</span>
                                        <span className="font-medium">{cartTotal.toLocaleString('tr-TR')} TL</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Kargo</span>
                                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">
                                            {cartTotal > 1500 ? 'Ücretsiz Kargo' : 'Alıcı Öder'}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 mb-6">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-slate-900">Toplam</span>
                                        <span className="text-3xl font-bold text-brand-primary-900">{cartTotal.toLocaleString('tr-TR')} <span className="text-sm font-medium text-slate-400">TL</span></span>
                                    </div>
                                </div>

                                <Link href="/checkout/auth" className="block w-full py-4 bg-brand-primary-900 text-white text-center font-bold rounded-xl hover:bg-brand-primary-800 transition-all shadow-lg shadow-brand-primary-900/20 hover:shadow-brand-primary-900/40 transform active:scale-[0.98]">
                                    Alışverişi Tamamla
                                </Link>

                                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    Güvenli ödeme altyapısı ile korunmaktadır.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default CartPage;
