'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  StarIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

type AdminReview = {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  product?: { title: string };
  user?: { name: string; email: string };
};

export default function AdminProductReviewsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/product-reviews?status=${filter}`);
      const data = res.ok ? await res.json() : { items: [] };
      setItems(data.items || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === 'authenticated') load();
  }, [status, filter]);

  async function update(reviewId: string, next: 'approved' | 'rejected' | 'pending') {
    setUpdating(reviewId);
    try {
      const res = await fetch('/api/admin/product-reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status: next })
      });
      if (res.ok) load();
    } catch (err) {
      console.error('Error updating review:', err);
    } finally {
      setUpdating(null);
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return null;

  return (
          <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ürün Yorumları</h1>
            <p className="text-sm text-slate-500 mt-1">Müşteri yorumlarını inceleyin ve yönetin</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'pending' | 'approved' | 'rejected')}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="pending">Beklemede</option>
              <option value="approved">Onaylı</option>
              <option value="rejected">Reddedilen</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800">Beklemede</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">
                  {items.filter(r => r._id).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-800">Onaylı</p>
                <p className="text-3xl font-bold text-emerald-900 mt-2">
                  {items.filter(r => r._id).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Reddedilen</p>
                <p className="text-3xl font-bold text-red-900 mt-2">
                  {items.filter(r => r._id).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <XMarkIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((r: AdminReview) => (
              <div
                key={r._id}
                className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {r.product?.title || 'Ürün'}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {renderStars(r.rating)}
                          <span className="text-sm text-slate-500">
                            {new Date(r.createdAt).toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        filter === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : filter === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {filter === 'pending' ? 'Beklemede' : filter === 'approved' ? 'Onaylı' : 'Reddedilen'}
                      </div>
                    </div>

                    {r.user && (
                      <div className="text-sm text-slate-600 mb-2">
                        <span className="font-medium">{r.user.name}</span>
                        {r.user.email && <span className="text-slate-400 ml-2">({r.user.email})</span>}
                      </div>
                    )}

                    {r.comment && (
                      <div className="bg-slate-50 rounded-xl p-4 mt-3">
                        <p className="text-slate-700">{r.comment}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    {filter !== 'approved' && (
                      <button
                        onClick={() => update(r._id, 'approved')}
                        disabled={updating === r._id}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckIcon className="w-4 h-4" />
                        <span>Onayla</span>
                      </button>
                    )}
                    {filter !== 'rejected' && (
                      <button
                        onClick={() => update(r._id, 'rejected')}
                        disabled={updating === r._id}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Reddet</span>
                      </button>
                    )}
                    {filter !== 'pending' && (
                      <button
                        onClick={() => update(r._id, 'pending')}
                        disabled={updating === r._id}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ClockIcon className="w-4 h-4" />
                        <span>Beklemeye Al</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <ExclamationTriangleIcon className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Kayıt bulunamadı</p>
                <p className="text-sm text-slate-400 mt-1">Bu durumda yorum bulunmuyor</p>
              </div>
            )}
          </div>
        )}
      </div>
      );
}
