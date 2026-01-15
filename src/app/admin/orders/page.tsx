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
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

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
    // Legacy fields support (optional)
    product?: string;
    productName?: string;
    productSlug?: string;
    quantity?: number;
    price?: number;

    // New Multi-item support
    items: OrderItem[];
    totalPrice: number;

    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    note?: string;

    // selectedOptions: { group: string; option: string }[]; // Deprecated in favor of items[].selectedOptions

    status: 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
    adminNotes?: string;
    createdAt: string;
    paymentProvider?: string;
    paymentId?: string;
    isUserVisible?: boolean;
}

export default function AdminOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });



    // Trash & Bulk State
    const [showTrash, setShowTrash] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [trashCount, setTrashCount] = useState(0);

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
    }, [status, router, showTrash]); // Reload when tab changes

    const loadOrders = async (page = 1) => {
        setLoading(true);
        setSelectedOrders(new Set()); // Clear selection on reload
        try {
            const response = await fetch(`/api/orders?deleted=${showTrash}&page=${page}&limit=20&t=${Date.now()}`, {
                cache: 'no-store'
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data.data || []);
                if (data.trashCount !== undefined) setTrashCount(data.trashCount);
                if (data.pagination) {
                    setPagination(data.pagination);
                    setCurrentPage(data.pagination.page);
                }
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Bulk Actions
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedOrders(new Set(filteredOrders.map(o => o._id)));
        } else {
            setSelectedOrders(new Set());
        }
    };

    const handleSelectOrder = (id: string) => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedOrders(newSelected);
    };

    const handleBulkAction = async (action: 'soft_delete' | 'restore' | 'permanent_delete') => {
        if (selectedOrders.size === 0) return;

        const actionText =
            action === 'soft_delete' ? 'Çöp Kutusuna Taşı' :
                action === 'restore' ? 'Geri Yükle' : 'Kalıcı Olarak Sil';

        const confirmResult = await Swal.fire({
            title: 'Emin misiniz?',
            text: `${selectedOrders.size} adet siparişi ${actionText}mak üzeresiniz.`,
            icon: action === 'permanent_delete' ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Evet, Uygula',
            cancelButtonText: 'İptal'
        });

        if (!confirmResult.isConfirmed) return;

        // Map frontend action to API endpoint if needed, or use same naming
        // API expects: 'soft_delete', 'restore', or sending DELETE request for permanent

        try {
            let response;
            if (action === 'permanent_delete') {
                response = await fetch('/api/orders/bulk', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderIds: Array.from(selectedOrders) }),
                });
            } else {
                response = await fetch('/api/orders/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderIds: Array.from(selectedOrders),
                        action: action
                    }),
                });
            }

            const result = await response.json();
            if (response.ok) {
                toast.success(result.message || 'İşlem başarılı.');
                loadOrders(); // Refresh list
            } else {
                toast.error(result.error || 'İşlem başarısız.');
            }
        } catch (error) {
            console.error('Bulk action error:', error);
            toast.error('Bir hata oluştu.');
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
                toast.success('Sipariş başarıyla güncellendi ve müşteriye bildirim gönderildi.');
            } else {
                toast.error('Güncelleme başarısız.');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Bir hata oluştu.');
        }
    };

    const filteredOrders = orders.filter(order => {
        const query = searchQuery.toLowerCase();

        // Helper to check items
        const hasMatchingItem = order.items && order.items.some(item =>
            (item.productName || '').toLowerCase().includes(query)
        );

        const matchesSearch =
            (order.productName || '').toLowerCase().includes(query) ||
            hasMatchingItem ||
            (order.customerName || '').toLowerCase().includes(query) ||
            (order.customerEmail || '').toLowerCase().includes(query) ||
            (order._id || '').toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            new: 'bg-blue-100 text-blue-800 border-blue-200',
            preparing: 'bg-yellow-100 text-yellow-800 border-yellow-200', // Matches dropdown value
            processing: 'bg-yellow-100 text-yellow-800 border-yellow-200', // Backward compatibility
            shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        const labels: Record<string, string> = {
            new: 'Yeni',
            preparing: 'Hazırlanıyor',
            processing: 'İşleniyor',
            shipped: 'Kargolandı',
            completed: 'Tamamlandı',
            cancelled: 'İptal',
            // Default English fallback if needed
        };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
    };

    if (loading && orders.length === 0) {
        return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Siparişler</h1>
                    <p className="text-slate-500 mt-1">Gelen siparişleri takip edin ve yönetin</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setShowTrash(false)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${!showTrash ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Aktif Siparişler
                    </button>
                    <button
                        onClick={() => setShowTrash(true)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${showTrash ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Çöp Kutusu
                        {trashCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-bold">
                                {trashCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedOrders.size > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-sm text-indigo-900 font-medium px-2">
                        <CheckIcon className="w-5 h-5 text-indigo-600" />
                        {selectedOrders.size} sipariş seçildi
                    </div>
                    <div className="flex gap-2">
                        {!showTrash ? (
                            <button
                                onClick={() => handleBulkAction('soft_delete')}
                                className="px-3 py-1.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Çöpe Taşı
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleBulkAction('restore')}
                                    className="px-3 py-1.5 bg-white text-green-600 border border-green-200 hover:bg-green-50 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                                >
                                    <ArrowPathIcon className="w-4 h-4" />
                                    Geri Yükle
                                </button>
                                <button
                                    onClick={() => handleBulkAction('permanent_delete')}
                                    className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm shadow-red-200"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Kalıcı Sil
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

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
                                <th className="px-4 py-4 w-[40px]">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        checked={filteredOrders.length > 0 && selectedOrders.size === filteredOrders.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap">Sipariş / Ürünler</th>
                                <th className="px-6 py-4 whitespace-nowrap">Müşteri</th>
                                <th className="px-6 py-4 whitespace-nowrap">Notlar</th>
                                <th className="px-6 py-4 whitespace-nowrap">Tutar</th>
                                <th className="px-6 py-4 whitespace-nowrap">Durum</th>
                                <th className="px-6 py-4 text-right whitespace-nowrap">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                <tr key={order._id} className={`hover:bg-slate-50/50 transition-colors ${selectedOrders.has(order._id) ? 'bg-indigo-50/30' : ''}`}>
                                    <td className="px-4 py-4 align-top">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-1"
                                            checked={selectedOrders.has(order._id)}
                                            onChange={() => handleSelectOrder(order._id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col space-y-2 max-w-[250px]">
                                            <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mb-1">
                                                <span>#{order._id.slice(-6).toUpperCase()}</span>
                                                <span className="text-slate-300">•</span>
                                                <ClockIcon className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                                {showTrash && (
                                                    <span className="ml-2 text-red-500 font-bold text-[10px] bg-red-50 px-1 rounded border border-red-100">SILINMIS</span>
                                                )}
                                            </div>

                                            {/* Legacy Single Product Support */}
                                            {(!order.items || order.items.length === 0) && order.productName && (
                                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                    <Link href={`/products/${order.productSlug}`} target="_blank" className="font-semibold text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors text-sm">
                                                        {order.productName}
                                                    </Link>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {order.quantity || 1} x {order.price?.toLocaleString('tr-TR')} ₺
                                                    </div>
                                                </div>
                                            )}

                                            {/* Multi-Item Display */}
                                            {order.items && order.items.map((item, idx) => (
                                                <div key={idx} className="flex flex-col p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                    <Link href={`/products/${item.productSlug}`} target="_blank" className="font-semibold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors text-sm" title={item.productName}>
                                                        {item.productName}
                                                    </Link>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-xs text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                            {item.quantity} adet
                                                        </span>
                                                        <span className="text-xs font-medium text-slate-700">
                                                            {item.price?.toLocaleString('tr-TR')} ₺
                                                        </span>
                                                    </div>
                                                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-slate-200/50">
                                                            {item.selectedOptions.map((opt, i) => (
                                                                <span key={i} className="text-[10px] text-slate-500">
                                                                    <span className="font-medium">{opt.group}:</span> {opt.option}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
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
                                            <div className="flex items-start gap-1.5 text-slate-500 text-xs mt-1 border-t border-slate-100 pt-1" title={order.customerAddress}>
                                                <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{order.customerAddress}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 align-top">
                                        {/* Notes Section moved here to clear up space */}
                                        {order.note ? (
                                            <div className="text-xs text-slate-600 italic bg-amber-50 p-2.5 rounded-lg border border-amber-100/50 max-w-[180px]">
                                                <span className="font-semibold text-amber-700 not-italic block mb-0.5">Müşteri Notu:</span>
                                                "{order.note}"
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6 align-top">
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="text-sm font-bold text-slate-900">
                                                {order.totalPrice ? order.totalPrice.toLocaleString('tr-TR') : 0} ₺
                                            </div>
                                            {order.items && order.items.length > 1 && (
                                                <div className="text-xs text-slate-400 font-medium">
                                                    {order.items.length} Kalem Ürün
                                                </div>
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
                                        <div className="flex flex-col items-end gap-2">
                                            <button
                                                onClick={() => openEditModal(order)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium text-sm transition-colors"
                                            >
                                                <ArrowPathIcon className="w-4 h-4" />
                                                Yönet
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <ShoppingBagIcon className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-slate-900 font-medium mb-1">
                                                {showTrash ? 'Çöp Kutusu Boş' : 'Sipariş Bulunamadı'}
                                            </h3>
                                            <p className="text-slate-500 text-sm">
                                                {showTrash
                                                    ? 'Silinen sipariş bulunmuyor.'
                                                    : 'Arama kriterlerinize uygun sipariş yok veya henüz sipariş almadınız.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {orders.length > 0 && pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-slate-50">
                        <div className="text-sm text-slate-500">
                            Toplam <strong>{pagination.total}</strong> siparişten <strong>{((currentPage - 1) * pagination.limit) + 1}</strong> - <strong>{Math.min(currentPage * pagination.limit, pagination.total)}</strong> arası gösteriliyor
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => loadOrders(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Önceki
                            </button>
                            {/* Page Numbers */}
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === pagination.totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                                .map((p, idx, arr) => (
                                    <Fragment key={p}>
                                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-slate-400">...</span>}
                                        <button
                                            onClick={() => loadOrders(p)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === p
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    </Fragment>
                                ))
                            }
                            <button
                                onClick={() => loadOrders(currentPage + 1)}
                                disabled={currentPage === pagination.totalPages}
                                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Sonraki
                            </button>
                        </div>
                    </div>
                )}
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
                                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-slate-900 mb-1">
                                                Siparişi Düzenle
                                            </Dialog.Title>
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm text-slate-500 font-mono">
                                                    #{selectedOrder?._id.slice(-6).toUpperCase()}
                                                </div>
                                                {selectedOrder?.isUserVisible === false && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">Silinmiş</span>
                                                )}
                                                {selectedOrder?.paymentProvider && (
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full font-medium border border-slate-200 uppercase">
                                                        {selectedOrder.paymentProvider}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {getStatusBadge(editStatus)}
                                    </div>

                                    <div className="space-y-6">
                                        {/* Products Summary in Modal */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-[200px] overflow-y-auto">
                                            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <ShoppingBagIcon className="w-4 h-4 text-indigo-600" />
                                                Sipariş İçeriği
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedOrder?.items && selectedOrder.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-slate-200">
                                                        <div>
                                                            <div className="font-medium text-slate-900">{item.productName}</div>
                                                            <div className="text-xs text-slate-500">{item.quantity} adet x {item.price} ₺</div>
                                                        </div>
                                                        <div className="font-bold text-slate-700">
                                                            {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Fallback for legacy */}
                                                {(!selectedOrder?.items || selectedOrder.items.length === 0) && selectedOrder?.productName && (
                                                    <div className="flex justify-between items-center text-sm p-2 bg-white rounded border border-slate-200">
                                                        <div>
                                                            <div className="font-medium text-slate-900">{selectedOrder.productName}</div>
                                                            <div className="text-xs text-slate-500">{selectedOrder.quantity} adet</div>
                                                        </div>
                                                        <div className="font-bold text-slate-700">
                                                            {/* Price might be total or unit in legacy, likely unit */}
                                                            {((selectedOrder.price || 0) * (selectedOrder.quantity || 1)).toLocaleString('tr-TR')} ₺
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-end">
                                                    <div className="text-right">
                                                        <span className="text-xs text-slate-500 mr-2">Toplam Tutar:</span>
                                                        <span className="text-lg font-bold text-indigo-600">
                                                            {selectedOrder?.totalPrice?.toLocaleString('tr-TR')} ₺
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address & Payment Info */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <MapPinIcon className="w-4 h-4 text-indigo-600" />
                                                Teslimat ve Ödeme Bilgileri
                                            </h4>
                                            <div className="text-sm text-slate-600 space-y-1 mb-3">
                                                <div><strong>Alıcı:</strong> {selectedOrder?.customerName}</div>
                                                <div><strong>Telefon:</strong> {selectedOrder?.customerPhone}</div>
                                                <div><strong>Adres:</strong> {selectedOrder?.customerAddress}</div>
                                            </div>
                                            {selectedOrder?.paymentId && (
                                                <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 font-mono">
                                                    Payment ID: {selectedOrder.paymentId}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Sipariş Durumu</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full rounded-xl border-slate-200 p-3 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all appearance-none"
                                                    value={editStatus}
                                                    onChange={(e) => setEditStatus(e.target.value)}
                                                >
                                                    <option value="new">Yeni</option>
                                                    <option value="preparing">İşleniyor</option>
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
        </div >
    );
}
