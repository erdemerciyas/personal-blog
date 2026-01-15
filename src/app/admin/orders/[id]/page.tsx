'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    CalendarIcon,
    CreditCardIcon,
    CurrencyDollarIcon,
    MapPinIcon,
    PhoneIcon,
    UserIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    EnvelopeIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface OrderItem {
    product: string;
    productName: string;
    productSlug: string;
    quantity: number;
    price: number;
    selectedOptions?: { group: string; option: string }[];
}

interface Order {
    _id: string;
    items: OrderItem[];
    totalPrice: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    note?: string;
    status: 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
    adminNotes?: string;
    createdAt: string;
    paymentProvider?: string;
    paymentId?: string;
    isUserVisible?: boolean;
    // Legacy support
    productName?: string;
    quantity?: number;
    price?: number;
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);

    // Status Management
    const [updating, setUpdating] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string>('');
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin/login');
        } else if (status === 'authenticated') {
            fetchOrder();
        }
    }, [status, params.id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data.data);
                setCurrentStatus(data.data.status);
                setAdminNote(data.data.adminNotes || '');
            } else {
                toast.error('Sipariş bulunamadı');
                router.push('/admin/orders');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: currentStatus,
                    adminNotes: adminNote
                }),
            });

            if (res.ok) {
                toast.success('Sipariş güncellendi');
                fetchOrder(); // Refresh
            } else {
                toast.error('Güncelleme başarısız');
            }
        } catch (error) {
            console.error(error);
            toast.error('Hata oluştu');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusInfo = (s: string) => {
        switch (s) {
            case 'new': return { label: 'Yeni Sipariş', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ClockIcon };
            case 'processing': return { label: 'Hazırlanıyor', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: ArrowLeftIcon }; // Used generic icon for now
            case 'shipped': return { label: 'Kargolandı', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: TruckIcon };
            case 'completed': return { label: 'Tamamlandı', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircleIcon };
            case 'cancelled': return { label: 'İptal Edildi', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircleIcon };
            default: return { label: s, color: 'bg-gray-100 text-gray-700', icon: ClockIcon };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
            </div>
        );
    }

    if (!order) return null;

    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/orders" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                <ArrowLeftIcon className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    Sipariş #{order._id.slice(-6).toUpperCase()}
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color} flex items-center gap-1`}>
                                        {statusInfo.label}
                                    </span>
                                </h1>
                                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <a href={`mailto:${order.customerEmail}`} className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                                <EnvelopeIcon className="w-4 h-4" />
                                E-posta Gönder
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <ShoppingBagIcon className="w-5 h-5 text-indigo-500" />
                                    Sipariş İçeriği
                                </h2>
                                <span className="text-sm font-medium text-slate-500">
                                    {order.items?.length || 1} Ürün
                                </span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                                    <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/30 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <h3 className="font-medium text-slate-900 text-lg mb-1">
                                                    <Link href={`/products/${item.productSlug}`} target="_blank" className="hover:text-indigo-600 transition-colors">
                                                        {item.productName}
                                                    </Link>
                                                </h3>
                                                <span className="font-bold text-slate-900 ml-4">
                                                    {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-1">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-700 border border-slate-200">
                                                    {item.quantity} Adet
                                                </span>
                                                <span>x</span>
                                                <span>{item.price.toLocaleString('tr-TR')} ₺</span>
                                            </div>
                                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {item.selectedOptions.map((opt, i) => (
                                                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                            <span className="opacity-70 mr-1">{opt.group}:</span> {opt.option}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    // Legacy Fallback
                                    <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-slate-900 text-lg mb-1">{order.productName}</h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-700 border border-slate-200">
                                                    {order.quantity || 1} Adet
                                                </span>
                                                <span>x</span>
                                                <span>{order.price?.toLocaleString('tr-TR')} ₺</span>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-900">
                                            {((order.price || 0) * (order.quantity || 1)).toLocaleString('tr-TR')} ₺
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-slate-50 p-6 border-t border-slate-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Toplam Tutar</span>
                                    <span className="text-2xl font-bold text-slate-900">
                                        {order.totalPrice?.toLocaleString('tr-TR')} ₺
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Notes */}
                        {order.note && (
                            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <EnvelopeIcon className="w-24 h-24 text-amber-600" />
                                </div>
                                <h3 className="text-amber-900 font-semibold mb-2 relative z-10 flex items-center gap-2">
                                    <EnvelopeIcon className="w-5 h-5" />
                                    Müşteri Notu
                                </h3>
                                <p className="text-amber-800 text-sm leading-relaxed relative z-10 italic">
                                    "{order.note}"
                                </p>
                            </div>
                        )}

                    </div>

                    {/* Right Column - Status & Info */}
                    <div className="space-y-6">

                        {/* Status Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-indigo-500" />
                                Sipariş Durumu
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Durum Güncelle</label>
                                    <select
                                        value={currentStatus}
                                        onChange={(e) => setCurrentStatus(e.target.value)}
                                        className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    >
                                        <option value="new">Yeni Sipariş</option>
                                        <option value="processing">Hazırlanıyor</option>
                                        <option value="shipped">Kargolandı</option>
                                        <option value="completed">Tamamlandı</option>
                                        <option value="cancelled">İptal Edildi</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Yönetici Notu</label>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        rows={4}
                                        className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-400"
                                        placeholder="Kargo takip no, özel notlar..."
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                                        * Bu not güncellendiğinde müşteriye e-posta ile bildirim gönderilecektir.
                                    </p>
                                </div>

                                <button
                                    onClick={handleUpdate}
                                    disabled={updating}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {updating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Güncelleniyor...
                                        </>
                                    ) : (
                                        'Güncelle ve Bildir'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Customer Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-indigo-500" />
                                Müşteri Bilgileri
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium uppercase">Ad Soyad</div>
                                        <div className="text-slate-900 font-medium">{order.customerName}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                        <EnvelopeIcon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs text-slate-500 font-medium uppercase">E-Posta</div>
                                        <div className="text-slate-900 truncate" title={order.customerEmail}>{order.customerEmail}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                        <PhoneIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium uppercase">Telefon</div>
                                        <div className="text-slate-900 font-mono">{order.customerPhone}</div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 mt-2">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                            <MapPinIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 font-medium uppercase mb-0.5">Teslimat Adresi</div>
                                            <div className="text-sm text-slate-700 leading-relaxed">
                                                {order.customerAddress}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        {order.paymentId && (
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-500 font-mono">
                                <div className="flex justify-between items-center mb-1">
                                    <span>Payment Provider:</span>
                                    <span className="font-bold text-slate-700">{order.paymentProvider || 'iyzico'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Transaction ID:</span>
                                    <span className="truncate ml-2">{order.paymentId}</span>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
