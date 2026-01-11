'use client';

import { useState, useEffect, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import {
    MagnifyingGlassIcon,
    TrashIcon,
    EnvelopeIcon,
    CheckIcon,
    ClockIcon,
    ShoppingBagIcon,
    MapPinIcon,
    PhoneIcon,
    UserIcon,
    ArrowPathIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

interface Order {
    _id: string;
    product: string;
    productName: string;
    productSlug: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    note?: string;
    quantity: number;
    price: number;
    selectedOptions: { group: string; option: string }[];
    status: 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
    adminNotes?: string;
    createdAt: string;
}

export default function AdminOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Edit Modal State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [editStatus, setEditStatus] = useState<string>('new');
    const [editNote, setEditNote] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.push('/admin/login');
            return;
        }
        loadOrders();
    }, [status, router]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/orders');
            if (response.ok) {
                const data = await response.json();
                setOrders(data.data || []);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (order: Order) => {
        setSelectedOrder(order);
        setEditStatus(order.status);
        setEditNote(order.adminNotes || '');
        setIsModalOpen(true);
    };

    const handleSaveUpdate = async () => {
        if (!selectedOrder) return;

        try {
            const response = await fetch(`/api/orders/${selectedOrder._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: editStatus,
                    adminNotes: editNote
                }),
            });

            if (response.ok) {
                const updatedOrder = await response.json();
                // Update local state with the returned updated order data
                setOrders(orders.map(o => o._id === selectedOrder._id ? updatedOrder.data : o));
                setIsModalOpen(false);
                alert('Sipariş başarıyla güncellendi ve müşteriye bildirim gönderildi.');
            } else {
                alert('Güncelleme başarısız.');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Bir hata oluştu.');
        }
    };

    const filteredOrders = orders.filter(order => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            order.productName.toLowerCase().includes(query) ||
            order.customerName.toLowerCase().includes(query) ||
            order.customerEmail.toLowerCase().includes(query) ||
            order._id.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            new: 'bg-blue-100 text-blue-800 border-blue-200',
            processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        const labels: Record<string, string> = {
            new: 'Yeni',
            processing: 'İşleniyor',
            shipped: 'Kargolandı',
            completed: 'Tamamlandı',
            cancelled: 'İptal',
        };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Siparişler</h1>
                    <p className="text-slate-500 mt-1">Gelen siparişleri takip edin ve yönetin</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Sipariş, müşteri veya ürün ara..."
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="relative">
                        <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select
                            className="pl-12 pr-8 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none min-w-[180px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="new">Yeni</option>
                            <option value="processing">İşleniyor</option>
                            <option value="shipped">Kargolandı</option>
                            <option value="completed">Tamamlandı</option>
                            <option value="cancelled">İptal Edildi</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4 whitespace-nowrap">Sipariş / Ürün</th>
                                <th className="px-6 py-4 whitespace-nowrap">Müşteri</th>
                                <th className="px-6 py-4 whitespace-nowrap">Detaylar</th>
                                <th className="px-6 py-4 whitespace-nowrap">Tutar</th>
                                <th className="px-6 py-4 whitespace-nowrap">Durum</th>
                                <th className="px-6 py-4 text-right whitespace-nowrap">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col max-w-[200px]">
                                            <Link href={`/products/${order.productSlug}`} target="_blank" className="font-bold text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors" title={order.productName}>
                                                {order.productName}
                                            </Link>
                                            <span className="text-xs text-slate-400 mt-1 font-mono">#{order._id.slice(-6).toUpperCase()}</span>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <ClockIcon className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col text-sm max-w-[200px]">
                                            <div className="flex items-center gap-1.5 font-medium text-slate-900 mb-0.5">
                                                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                                {order.customerName}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-xs">
                                                <PhoneIcon className="w-3.5 h-3.5" />
                                                {order.customerPhone}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5 truncate" title={order.customerEmail}>
                                                <EnvelopeIcon className="w-3.5 h-3.5" />
                                                {order.customerEmail}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 align-top">
                                        <div className="flex flex-col gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 font-medium text-xs border border-slate-200">Adet: {order.quantity || 1}</span>
                                            </div>
                                            {order.selectedOptions && order.selectedOptions.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {order.selectedOptions.map((opt, i) => (
                                                        <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-500 text-[11px]">
                                                            <span className="font-medium text-slate-700">{opt.group}:</span> {opt.option}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {order.note && (
                                                <div className="text-xs text-slate-600 italic bg-amber-50 p-2.5 rounded-lg border border-amber-100/50 max-w-[220px]">
                                                    <span className="font-semibold text-amber-700 not-italic block mb-0.5">Not:</span>
                                                    "{order.note}"
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 align-top">
                                        <div className="flex flex-col items-start gap-1">
                                            {order.price !== undefined && order.price !== null ? (
                                                <>
                                                    <div className="text-sm font-bold text-slate-900">
                                                        {(order.price * (order.quantity || 1)).toLocaleString('tr-TR')} ₺
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-medium">
                                                        {order.price.toLocaleString('tr-TR')} ₺ x {order.quantity || 1}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-slate-400 text-sm italic">Fiyat Yok</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col items-start gap-2">
                                            {getStatusBadge(order.status)}
                                            {order.adminNotes && (
                                                <div className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 font-medium flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                                    Admin Notu
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top text-right">
                                        <button
                                            onClick={() => openEditModal(order)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium text-sm transition-colors"
                                        >
                                            <ArrowPathIcon className="w-4 h-4" />
                                            Yönet
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <ShoppingBagIcon className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-slate-900 font-medium mb-1">Sipariş Bulunamadı</h3>
                                            <p className="text-slate-500 text-sm">Arama kriterlerinize uygun sipariş yok veya henüz sipariş almadınız.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <Transition show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-slate-900 mb-1">
                                        Siparişi Düzenle
                                    </Dialog.Title>
                                    <div className="text-sm text-slate-500 mb-6 font-mono">
                                        #{selectedOrder?._id.slice(-6).toUpperCase()}
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Sipariş Durumu</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all appearance-none"
                                                    value={editStatus}
                                                    onChange={(e) => setEditStatus(e.target.value)}
                                                >
                                                    <option value="new">Yeni</option>
                                                    <option value="processing">İşleniyor</option>
                                                    <option value="shipped">Kargolandı</option>
                                                    <option value="completed">Tamamlandı</option>
                                                    <option value="cancelled">İptal</option>
                                                </select>
                                                <ArrowPathIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Yönetici Notu <span className="font-normal text-slate-400">(Müşteriye e-posta ile iletilir)</span></label>
                                            <textarea
                                                className="w-full rounded-xl border-slate-200 p-4 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all resize-none"
                                                rows={4}
                                                placeholder="Örn: Kargo takip numarası: 123456789 (Yurtiçi Kargo)"
                                                value={editNote}
                                                onChange={(e) => setEditNote(e.target.value)}
                                            />
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                                            <EnvelopeIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <p className="text-sm text-blue-800">
                                                "Güncelle ve Bildir" butonuna tıkladığınızda müşteriye <strong>{selectedOrder?.customerEmail}</strong> adresinden otomatik bilgilendirme e-postası gönderilecektir.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            onClick={handleSaveUpdate}
                                            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all active:scale-95"
                                        >
                                            Güncelle ve Bildir
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
