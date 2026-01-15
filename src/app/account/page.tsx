'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingBagIcon, MapPinIcon, UserIcon, ArrowRightOnRectangleIcon, TruckIcon, XCircleIcon, ChatBubbleLeftIcon, NoSymbolIcon, TrashIcon, EnvelopeIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

// Simple Modal Component
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function AccountPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('orders');

    // Orders Logic
    const { addToCart } = useCart();
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Messages Logic
    const [messages, setMessages] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });

    // Modal States
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [messageModalOpen, setMessageModalOpen] = useState(false);
    const [messageSubject, setMessageSubject] = useState('Sipariş Durumu Hakkında');
    const [messageText, setMessageText] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

    const handleMessageSelect = (id: string) => {
        const newSelected = new Set(selectedMessages);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedMessages(newSelected);
    };

    const handleBulkDeleteMessages = async () => {
        const result = await Swal.fire({
            title: 'Seçilenleri Sil?',
            text: `${selectedMessages.size} mesajı silmek istediğinize emin misiniz?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'Vazgeç'
        });

        if (!result.isConfirmed) return;

        setActionLoading(true);
        try {
            // Delete individually since we don't have a bulk API yet
            const promises = Array.from(selectedMessages).map(id =>
                fetch(`/api/user/messages/${id}`, { method: 'DELETE' })
            );

            await Promise.all(promises);

            setMessages(messages.filter(m => !selectedMessages.has(m._id)));
            setSelectedMessages(new Set());
            toast.success('Seçilen mesajlar silindi.');
        } catch (error) {
            console.error('Bulk delete error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };


    // Address Logic
    const [addresses, setAddresses] = useState<any[]>([]);
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const [addressForm, setAddressForm] = useState({
        title: '',
        fullName: '',
        phone: '',
        country: 'Türkiye',
        city: '',
        district: '',
        address: '',
        zipCode: '',
        isPrimary: false
    });

    useEffect(() => {
        if (status === 'authenticated') {
            if (activeTab === 'orders') fetchOrders();
            if (activeTab === 'addresses') fetchAddresses();
            if (activeTab === 'messages') fetchMessages();
        }
    }, [activeTab, status]);

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/user/addresses');
            const data = await res.json();
            if (data.success) setAddresses(data.data);
        } catch (error) {
            console.error('Fetch addresses error', error);
        }
    };

    const fetchMessages = async (page = 1) => {
        setLoadingMessages(true);
        try {
            const res = await fetch(`/api/user/messages?page=${page}&limit=20`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
                if (data.pagination) {
                    setPagination(data.pagination);
                    setCurrentPage(data.pagination.page);
                }
                if (data.unreadCount !== undefined) {
                    setUnreadCount(data.unreadCount);
                }
            }
        } catch (error) {
            console.error('Fetch messages error', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Unread count state
    const [unreadCount, setUnreadCount] = useState(0);

    // Initial fetch for unread count
    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/user/messages?page=1&limit=1').then(res => res.json()).then(data => {
                if (data.success && data.unreadCount !== undefined) {
                    setUnreadCount(data.unreadCount);
                }
            });
        }
    }, [status]);

    // Update unread count when messages are fetched full
    useEffect(() => {
        if (messages.length > 0) {
            // Optional: Refetch or just rely on the API response if we stored it
        }
    }, [messages]);

    const openAddressModal = (address: any = null) => {
        if (address) {
            setEditingAddress(address);
            setAddressForm({
                title: address.title,
                fullName: address.fullName,
                phone: address.phone,
                country: address.country,
                city: address.city,
                district: address.district,
                address: address.address,
                zipCode: address.zipCode,
                isPrimary: address.isPrimary
            });
        } else {
            setEditingAddress(null);
            setAddressForm({
                title: '',
                fullName: session?.user?.name || '',
                phone: '',
                country: 'Türkiye',
                city: '',
                district: '',
                address: '',
                zipCode: '',
                isPrimary: false
            });
        }
        setAddressModalOpen(true);
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const url = editingAddress ? `/api/user/addresses/${editingAddress._id}` : '/api/user/addresses';
            const method = editingAddress ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressForm)
            });
            const data = await res.json();

            if (data.success) {
                toast.success(editingAddress ? 'Adres güncellendi.' : 'Adres eklendi.');
                setAddressModalOpen(false);
                fetchAddresses();
            } else {
                toast.error(data.error || 'İşlem başarısız.');
            }
        } catch (error) {
            console.error('Save address error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: "Bu adresi silmek istediğinize emin misiniz?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'Vazgeç'
        });

        if (!result.isConfirmed) return;

        setActionLoading(true);
        try {
            const res = await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setAddresses(addresses.filter(a => a._id !== id));
                toast.success('Adres silindi.');
            } else {
                toast.error(data.error || 'Silinemedi.');
            }
        } catch (error) {
            console.error('Delete address error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSetPrimaryAddress = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/user/addresses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPrimary: true })
            });
            const data = await res.json();
            if (data.success) {
                fetchAddresses(); // Refresh to update sorting and flags
                toast.success('Varsayılan adres güncellendi.');
            } else {
                toast.error(data.error || 'Güncellenemedi.');
            }
        } catch (error) {
            console.error('Set primary error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    const fetchOrders = async (page = 1) => {
        setLoadingOrders(true);
        try {
            const res = await fetch(`/api/orders/my-orders?page=${page}&limit=20`);
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
                if (data.pagination) {
                    setPagination(data.pagination);
                    setCurrentPage(data.pagination.page);
                }
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchOrders(newPage);
            // Scroll to top of orders list smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleReorder = async (order: any) => {
        // Add all items from order to cart
        for (const item of order.items) {
            if (item.product && item.product._id) {
                await addToCart(item.product._id, item.quantity);
            }
        }
        router.push('/cart');
    };

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/orders/${selectedOrder._id}/cancel`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                toast.success('Siparişiniz iptal edildi.');
                setCancelModalOpen(false);
                fetchOrders(); // Refresh list
            } else {
                toast.error(data.error || 'İptal işlemi başarısız.');
            }
        } catch (error) {
            console.error('Cancel error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        const result = await Swal.fire({
            title: 'Listeden Kaldır?',
            text: "Bu siparişi listenizden kaldırmak istediğinize emin misiniz?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Evet, kaldır!',
            cancelButtonText: 'Vazgeç'
        });

        if (!result.isConfirmed) return;

        setActionLoading(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                // Remove from local state immediately
                setOrders(orders.filter(o => o._id !== orderId));
                toast.success('Sipariş listenizden kaldırıldı.');
            } else {
                toast.error(data.error || 'Silme işlemi başarısız.');
            }
        } catch (error) {
            console.error('Delete error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;
        setActionLoading(true);
        try {
            const res = await fetch('/api/orders/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: selectedOrder._id,
                    subject: messageSubject,
                    message: messageText,
                    messageId: selectedOrder._messageId // Use thread ID if responding
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Mesajınız satıcıya iletildi.');
                setMessageModalOpen(false);
                setMessageText('');
                fetchMessages(); // Refresh messages immediately
            } else {
                toast.error(data.error || 'Mesaj gönderilemedi.');
            }
        } catch (error) {
            console.error('Message error', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setActionLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen pt-32 pb-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-900"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/api/auth/signin');
        return null;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Siparişlerim</h2>

                        {loadingOrders ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-900"></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-slate-400">
                                    <ShoppingBagIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Henüz siparişiniz bulunmuyor</h3>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                    Alışverişe başlayarak favori ürünlerinizi sipariş verebilirsiniz.
                                </p>
                                <Link href="/products" className="inline-block px-8 py-3 bg-brand-primary-900 text-white font-bold rounded-xl hover:bg-brand-primary-800 transition-colors">
                                    Alışverişe Başla
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Header */}
                                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                                            <div className="flex gap-8 text-sm flex-wrap">
                                                <div>
                                                    <span className="block text-slate-500 mb-1">Sipariş Tarihi</span>
                                                    <span className="font-medium text-slate-900">
                                                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-slate-500 mb-1">Tutar</span>
                                                    <span className="font-bold text-brand-primary-900">{order.totalPrice?.toLocaleString('tr-TR')} TL</span>
                                                </div>
                                                <div>
                                                    <span className="block text-slate-500 mb-1">Durum</span>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                                                                    'bg-blue-100 text-blue-800'}`}>
                                                        {order.status === 'completed' ? 'Tamamlandı' :
                                                            order.status === 'cancelled' ? 'İptal Edildi' :
                                                                order.status === 'shipped' ? 'Kargoda' :
                                                                    order.status === 'preparing' ? 'Hazırlanıyor' :
                                                                        'Sipariş Alındı'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {/* Kargo Takip */}
                                                {order.status === 'shipped' && order.cargoTrackingUrl && (
                                                    <a
                                                        href={order.cargoTrackingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2 bg-indigo-50 text-indigo-700 bg-opacity-50 border border-indigo-100 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2"
                                                    >
                                                        <TruckIcon className="w-4 h-4" />
                                                        Kargo Takip
                                                    </a>
                                                )}

                                                {/* İptal Et (Sadece kargolanmamışsa) */}
                                                {['pending', 'new', 'preparing'].includes(order.status) && (
                                                    <button
                                                        onClick={() => { setSelectedOrder(order); setCancelModalOpen(true); }}
                                                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                                                    >
                                                        <NoSymbolIcon className="w-4 h-4" />
                                                        İptal Et
                                                    </button>
                                                )}

                                                {/* Listeden Kaldır (İptal edilmiş veya tamamlanmışsa) */}
                                                {['cancelled', 'completed', 'refunded'].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleDeleteOrder(order._id)}
                                                        className="px-4 py-2 bg-slate-50 text-slate-500 border border-slate-200 text-sm font-bold rounded-lg hover:bg-slate-100 hover:text-red-500 transition-colors flex items-center gap-2"
                                                        title="Siparişi Listeden Kaldır"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                        Sil
                                                    </button>
                                                )}

                                                {/* Satıcıya Sor */}
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setMessageModalOpen(true); }}
                                                    className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                                                >
                                                    <ChatBubbleLeftIcon className="w-4 h-4" />
                                                    Satıcıya Sor
                                                </button>

                                                {/* Tekrar Sipariş */}
                                                <button
                                                    onClick={() => handleReorder(order)}
                                                    className="px-4 py-2 bg-brand-primary-900 text-white text-sm font-bold rounded-lg hover:bg-brand-primary-800 transition-colors"
                                                >
                                                    Tekrar Sipariş
                                                </button>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="p-6">
                                            {order.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-4 mb-4 last:mb-0">
                                                    <div className="relative w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden border border-slate-100">
                                                        {item.product?.coverImage ? (
                                                            <Image src={item.product.coverImage} alt={item.productName || 'Ürün'} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <ShoppingBagIcon className="w-6 h-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{item.productName}</div>
                                                        <div className="text-sm text-slate-500">
                                                            {item.quantity} Adet x {item.price} TL
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Admin/Seller Note Display */}
                                        {order.adminNotes && (
                                            <div className="mx-6 mb-6 mt-2 bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex gap-3 text-sm">
                                                <ChatBubbleLeftIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                                <div>
                                                    <span className="font-bold text-yellow-800 block mb-1">Satıcıdan Not:</span>
                                                    <p className="text-yellow-700">{order.adminNotes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {orders.length > 0 && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Önceki
                                </button>
                                <span className="text-sm font-medium text-slate-600">
                                    Sayfa {currentPage} / {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Sonraki
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'addresses':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Adreslerim</h2>
                            <button
                                onClick={() => openAddressModal()}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors"
                            >
                                + Yeni Adres Ekle
                            </button>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-slate-400">
                                        <MapPinIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">Kayıtlı adresiniz yok</h3>
                                    <p className="text-slate-500">
                                        Siparişlerinizde kullanmak için yeni bir adres ekleyin.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {addresses.map((addr) => (
                                    <div key={addr._id} className={`bg-white p-6 rounded-xl border ${addr.isPrimary ? 'border-brand-primary-900 ring-1 ring-brand-primary-900' : 'border-slate-200'} shadow-sm relative group`}>
                                        {addr.isPrimary && (
                                            <span className="absolute top-4 right-4 bg-brand-primary-100 text-brand-primary-900 text-xs font-bold px-2 py-1 rounded">
                                                Varsayılan
                                            </span>
                                        )}

                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                                                <MapPinIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{addr.title}</h3>
                                                <p className="text-sm text-slate-500">{addr.fullName}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-sm text-slate-600 mb-6">
                                            <p>{addr.address}</p>
                                            <p>{addr.district} / {addr.city}</p>
                                            <p>{addr.country}</p>
                                            <p>{addr.phone}</p>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                            {!addr.isPrimary && (
                                                <button
                                                    onClick={() => handleSetPrimaryAddress(addr._id)}
                                                    className="text-sm text-slate-500 hover:text-brand-primary-900 font-medium transition-colors"
                                                >
                                                    Varsayılan Yap
                                                </button>
                                            )}

                                            <div className="flex gap-3 ml-auto">
                                                <button
                                                    onClick={() => openAddressModal(addr)}
                                                    className="text-sm text-brand-primary-900 font-bold hover:underline"
                                                >
                                                    Düzenle
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAddress(addr._id)}
                                                    className="text-sm text-red-600 font-bold hover:underline"
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'messages':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Mesajlarım</h2>

                        {loadingMessages ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-900"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-slate-400">
                                    <EnvelopeIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Henüz mesajınız yok</h3>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                    Size özel duyurular ve sorularınızın cevapları burada listelenir.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedMessages.size > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2">
                                        <span className="text-red-700 font-medium px-2">{selectedMessages.size} mesaj seçildi</span>
                                        <button
                                            onClick={handleBulkDeleteMessages}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition w-auto"
                                        >
                                            {actionLoading ? 'Siliniyor...' : 'Seçilenleri Sil'}
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-end px-2 mb-2">
                                    {/* Select All could go here if needed, but per-item select is fine for now */}
                                </div>

                                {messages.map((msg) => (
                                    <div key={msg._id} className={`p-6 rounded-xl border relative group transition-all ${selectedMessages.has(msg._id) ? 'bg-indigo-50 border-indigo-200 shadow-sm' :
                                        msg.isGlobal || msg.type === 'announcement' ? 'bg-brand-primary-50 border-brand-primary-100' : 'bg-white border-slate-200'
                                        }`}>
                                        <div className="absolute top-6 left-4 z-10">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-slate-300 text-brand-primary-900 focus:ring-brand-primary-900 cursor-pointer"
                                                checked={selectedMessages.has(msg._id)}
                                                onChange={() => handleMessageSelect(msg._id)}
                                            />
                                        </div>
                                        <div className="flex items-start gap-4 pl-8">
                                            <div className={`p-3 rounded-lg flex-shrink-0 ${msg.isGlobal || msg.type === 'announcement' ? 'bg-brand-primary-100 text-brand-primary-900' : 'bg-slate-100 text-slate-500'}`}>
                                                {msg.isGlobal || msg.type === 'announcement' ? <MegaphoneIcon className="w-6 h-6" /> : <ChatBubbleLeftIcon className="w-6 h-6" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className={`font-bold ${msg.isGlobal || msg.type === 'announcement' ? 'text-brand-primary-900' : 'text-slate-900'}`}>
                                                            {msg.subject || (msg.isGlobal ? 'Genel Duyuru' : 'Sorunuz')}
                                                        </h3>
                                                        <span className="text-xs text-slate-500">
                                                            {new Date(msg.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    {(msg.type === 'announcement' || msg.isGlobal) && (
                                                        <span className="px-2 py-1 bg-brand-primary-100 text-brand-primary-800 text-xs font-bold rounded">Duyuru</span>
                                                    )}
                                                </div>

                                                {msg.conversation && msg.conversation.length > 0 ? (
                                                    <div className="space-y-4 mt-4">
                                                        {msg.conversation.map((chat: any, idx: number) => (
                                                            <div key={idx} className={`flex flex-col ${chat.sender === 'admin' ? 'items-start' : 'items-end'}`}>
                                                                <div className={`max-w-[85%] rounded-2xl p-4 ${chat.sender === 'admin'
                                                                    ? 'bg-slate-100 text-slate-700 rounded-tl-none'
                                                                    : 'bg-brand-primary-900 text-white rounded-tr-none'
                                                                    }`}>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs font-bold opacity-80">
                                                                            {chat.sender === 'admin' ? 'Yönetici' : 'Siz'}
                                                                        </span>
                                                                        <span className="text-[10px] opacity-60">
                                                                            {new Date(chat.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{chat.message}</p>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {msg.orderId && (
                                                            <div className="flex justify-end pt-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedOrder({ _id: msg.orderId, _messageId: msg._id });
                                                                        setMessageSubject(`Ynt: ${msg.subject}`);
                                                                        setMessageModalOpen(true);
                                                                    }}
                                                                    className="text-sm font-medium text-brand-primary-900 hover:text-brand-primary-800 flex items-center gap-2 bg-brand-primary-50 px-4 py-2 rounded-lg transition-colors"
                                                                >
                                                                    <ChatBubbleLeftIcon className="w-4 h-4" />
                                                                    Yanıta Cevap Yaz
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    /* Legacy View */
                                                    <>
                                                        <div className="text-slate-700 leading-relaxed mb-4">
                                                            {msg.message}
                                                        </div>

                                                        {(msg.adminReply || msg.answer) && (
                                                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">Y</div>
                                                                    <span className="font-bold text-slate-900 text-sm">Yönetici Cevabı</span>
                                                                </div>
                                                                <p className="text-slate-600 text-sm mb-3">
                                                                    {msg.adminReply || msg.answer}
                                                                </p>

                                                                {msg.orderId && (
                                                                    <div className="flex justify-end border-t border-slate-200 pt-3">
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedOrder({ _id: msg.orderId, _messageId: msg._id });
                                                                                setMessageSubject(`Ynt: ${msg.subject}`);
                                                                                setMessageModalOpen(true);
                                                                            }}
                                                                            className="text-sm font-medium text-brand-primary-900 hover:text-brand-primary-800 flex items-center gap-2"
                                                                        >
                                                                            <ChatBubbleLeftIcon className="w-4 h-4" />
                                                                            Yanıtla
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {messages.length > 0 && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                                <button
                                    onClick={() => fetchMessages(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Önceki
                                </button>
                                <span className="text-sm font-medium text-slate-600">
                                    Sayfa {currentPage} / {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => fetchMessages(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Sonraki
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'profile':
                return (
                    <div className="max-w-xl">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Hesap Bilgilerim</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                                <input type="text" defaultValue={session?.user?.name || ''} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900 text-slate-600 bg-slate-50" readOnly />
                                <span className="text-xs text-slate-400 mt-1 block">Değişiklik yapmak için müşteri hizmetleri ile iletişime geçiniz.</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                                <input type="email" defaultValue={session?.user?.email || ''} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900 text-slate-600 bg-slate-50" readOnly />
                            </div>

                            <div className="pt-4 border-t border-slate-100 mt-6">
                                <h3 className="font-bold text-slate-900 mb-4">Şifre Değiştir</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Mevcut Şifre</label>
                                        <input type="password" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre</label>
                                        <input type="password" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary-900" />
                                    </div>
                                    <button className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                                        Şifreyi Güncelle
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <main className="min-h-screen pt-32 pb-20 bg-slate-50">
            <div className="container-main">

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Sidebar / Menu */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 sticky top-24 overflow-hidden">
                            <div className="p-6 bg-slate-900 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-xl backdrop-blur-sm border border-white/20">
                                        {session?.user?.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <div className="font-bold">{session?.user?.name}</div>
                                        <div className="text-xs text-slate-400 truncate max-w-[150px]">{session?.user?.email}</div>
                                    </div>
                                </div>
                            </div>

                            <nav className="p-2 space-y-1">
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === 'orders' ? 'bg-brand-primary-50 text-brand-primary-900 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <ShoppingBagIcon className="w-5 h-5" />
                                    Siparişlerim
                                </button>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === 'addresses' ? 'bg-brand-primary-50 text-brand-primary-900 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <MapPinIcon className="w-5 h-5" />
                                    Adreslerim
                                </button>
                                <button
                                    onClick={() => setActiveTab('messages')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === 'messages' ? 'bg-brand-primary-50 text-brand-primary-900 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <div className="flex-1 flex items-center gap-3">
                                        <EnvelopeIcon className="w-5 h-5" />
                                        Mesajlarım
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === 'profile' ? 'bg-brand-primary-50 text-brand-primary-900 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <UserIcon className="w-5 h-5" />
                                    Hesap Bilgilerim
                                </button>
                                <div className="my-2 border-t border-slate-100"></div>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left text-red-600 hover:bg-red-50 font-medium"
                                >
                                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                    Çıkış Yap
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-9">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                title="Siparişi İptal Et"
            >
                <div>
                    <p className="text-slate-600 mb-6">
                        Bu siparişi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setCancelModalOpen(false)}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-bold"
                        >
                            Vazgeç
                        </button>
                        <button
                            onClick={handleCancelOrder}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold disabled:opacity-50"
                        >
                            {actionLoading ? 'İptal Ediliyor...' : 'Evet, İptal Et'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={messageModalOpen}
                onClose={() => setMessageModalOpen(false)}
                title="Satıcıya Soru Sor"
            >
                <form onSubmit={handleSendMessage}>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Konu</label>
                            {selectedOrder?._messageId ? (
                                <input
                                    type="text"
                                    value={messageSubject}
                                    readOnly
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500"
                                />
                            ) : (
                                <select
                                    value={messageSubject}
                                    onChange={(e) => setMessageSubject(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary-900"
                                >
                                    <option>Sipariş Durumu Hakkında</option>
                                    <option>Ürün Detayları Hakkında</option>
                                    <option>Sipariş Düzenleme İsteği</option>
                                    <option>Diğer</option>
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mesajınız</label>
                            <textarea
                                required
                                rows={4}
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-primary-900 resize-none"
                                placeholder="Sorunuzu buraya yazın..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setMessageModalOpen(false)}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-bold"
                        >
                            Vazgeç
                        </button>
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="px-4 py-2 bg-brand-primary-900 text-white rounded-lg hover:bg-brand-primary-800 font-bold disabled:opacity-50"
                        >
                            {actionLoading ? 'Gönderiliyor...' : 'Gönder'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={addressModalOpen}
                onClose={() => setAddressModalOpen(false)}
                title={editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
            >
                <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Adres Başlığı (Ev, İş vb.)</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-900"
                            value={addressForm.title}
                            onChange={e => setAddressForm({ ...addressForm, title: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-900"
                                value={addressForm.fullName}
                                onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-900"
                                value={addressForm.phone}
                                onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ülke</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                            value="Türkiye"
                            readOnly
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Şehir (İl)</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-900"
                                value={addressForm.city}
                                onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">İlçe</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-900"
                                value={addressForm.district}
                                onChange={e => setAddressForm({ ...addressForm, district: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Açık Adres</label>
                        <textarea
                            rows={3}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-900 resize-none"
                            value={addressForm.address}
                            onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Posta Kodu (Opsiyonel)</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary-900"
                                value={addressForm.zipCode}
                                onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-brand-primary-900 rounded focus:ring-brand-primary-900"
                                    checked={addressForm.isPrimary}
                                    onChange={e => setAddressForm({ ...addressForm, isPrimary: e.target.checked })}
                                />
                                Varsayılan adres olarak ayarla
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setAddressModalOpen(false)}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-bold"
                        >
                            Vazgeç
                        </button>
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="px-4 py-2 bg-brand-primary-900 text-white rounded-lg hover:bg-brand-primary-800 font-bold disabled:opacity-50"
                        >
                            {actionLoading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </Modal>

        </main>
    );
}
