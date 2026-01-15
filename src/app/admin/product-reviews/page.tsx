'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    MagnifyingGlassIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChatBubbleBottomCenterTextIcon,
    StarIcon as StarIconOutline
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface ProductReview {
    _id: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    product?: { title: string };
    user?: { name: string; email: string };
}

export default function AdminProductReviewsPage() {
    const { status: sessionStatus } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (sessionStatus === 'loading') return;
        if (sessionStatus === 'unauthenticated') {
            router.push('/admin/login');
            return;
        }
        loadReviews();
    }, [sessionStatus, statusFilter]);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/product-reviews?status=${statusFilter}`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data.items || []);
            }
        } catch (error) {
            console.error('Yorumlar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
        try {
            const response = await fetch('/api/admin/product-reviews', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, status: newStatus }),
            });

            if (response.ok) {
                // Optimistic update or reload
                // Since list might depend on filter, if we filter by pending and approve, it should disappear from list
                if (statusFilter === 'all') {
                    setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, status: newStatus } : r));
                } else {
                    setReviews(prev => prev.filter(r => r._id !== reviewId));
                }
            }
        } catch (error) {
            console.error('Durum güncellenirken hata:', error);
        }
    };

    const handleDelete = async (reviewId: string) => {
        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: "Bu yorumu silmek istediğinizden emin misiniz?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'Vazgeç'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/api/admin/product-reviews?id=${reviewId}`, { method: 'DELETE' });
            if (response.ok) {
                setReviews(prev => prev.filter(r => r._id !== reviewId));
                if (selectedItems.has(reviewId)) {
                    const newSet = new Set(selectedItems);
                    newSet.delete(reviewId);
                    setSelectedItems(newSet);
                }
                toast.success('Yorum silindi');
            } else {
                toast.error('Silme başarısız');
            }
        } catch (error) {
            console.error('Silme hatası:', error);
            toast.error('Hata oluştu');
        }
    };

    const handleBulkDelete = async () => {
        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: `${selectedItems.size} yorumu silmek istediğinizden emin misiniz?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'Vazgeç'
        });

        if (!result.isConfirmed) return;

        try {
            // Naive Promise.all since API supports single ID delete for now
            await Promise.all(
                Array.from(selectedItems).map(id => fetch(`/api/admin/product-reviews?id=${id}`, { method: 'DELETE' }))
            );
            setReviews(prev => prev.filter(r => !selectedItems.has(r._id)));
            setSelectedItems(new Set());
            toast.success('Seçilen yorumlar silindi');
        } catch (error) {
            console.error('Toplu silme hatası:', error);
            toast.error('Toplu silme hatası');
        }
    };

    const handleSelectItem = (id: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedItems(newSet);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedItems(new Set(reviews.map(r => r._id)));
        else setSelectedItems(new Set());
    };

    // Render Stars
    const renderStars = (rating: number) => {
        return (
            <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                    i < rating ? <StarIconSolid key={i} className="w-4 h-4" /> : <StarIconOutline key={i} className="w-4 h-4 text-slate-300" />
                ))}
            </div>
        );
    };

    if (sessionStatus === 'loading' || loading && reviews.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-slate-200 rounded-full border-t-indigo-600 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm py-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ürün Yorumları</h1>
                    <p className="text-slate-500 mt-1">Müşteri geri bildirimlerini ve değerlendirmelerini yönetin</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sm:p-3 sticky top-24 z-10 transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-48"
                        >
                            <option value="pending">Bekleyenler</option>
                            <option value="approved">Onaylananlar</option>
                            <option value="rejected">Reddedilenler</option>
                            <option value="all">Tümü</option>
                        </select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedItems.size > 0 && (
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-200 ml-auto">
                            <span className="text-sm font-medium text-slate-600 hidden sm:inline">
                                {selectedItems.size} seçildi
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Sil
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Yorum bulunamadı</h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                        {statusFilter === 'pending' ? 'Bekleyen yorum yok.' : 'Bu kriterlere uygun yorum bulunamadı.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={reviews.length > 0 && selectedItems.size === reviews.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </th>
                                <th className="px-6 py-4">Ürün / Kullanıcı</th>
                                <th className="px-6 py-4">Değerlendirme</th>
                                <th className="px-6 py-4 w-1/3">Yorum</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reviews.map(review => (
                                <tr key={review._id} className={`group ${selectedItems.has(review._id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(review._id)}
                                            onChange={() => handleSelectItem(review._id)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900 line-clamp-1">{review.product?.title || 'Silinmiş Ürün'}</span>
                                            <span className="text-xs text-slate-500 mt-0.5">{review.user?.name || review.user?.email || 'Bilinmeyen Kullanıcı'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {renderStars(review.rating)}
                                        <span className="text-xs text-slate-400 mt-1 block">{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600 line-clamp-2" title={review.comment}>{review.comment}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold
                                    ${review.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                review.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                    'bg-amber-50 text-amber-700 border border-amber-100'
                                            }`}>
                                            {review.status === 'approved' ? 'Onaylı' : review.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {review.status !== 'approved' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(review._id, 'approved')}
                                                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Onayla"
                                                >
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            {review.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(review._id, 'rejected')}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Reddet"
                                                >
                                                    <XCircleIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
