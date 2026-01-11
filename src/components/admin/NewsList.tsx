'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsItem } from '@/types/news';
import { logger } from '@/core/lib/logger';

interface NewsListProps {
  language?: 'tr' | 'es';
  page?: number;
}

/**
 * News List Component for Admin Panel - Brutalist Industrial Design
 * Displays news articles with search, filters, pagination, and bulk operations
 */
export default function NewsList({ language = 'tr', page = 1 }: NewsListProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [bulkAction, setBulkAction] = useState<'publish' | 'unpublish' | 'delete' | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (status !== 'all') {
        params.append('status', status);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/news?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();

      if (data.success && data.data) {
        setNews(data.data.items);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch news');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error fetching news list', 'NEWS_LIST', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(news.map((item) => item._id as string)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;

    try {
      setBulkLoading(true);
      setError(null);

      const response = await fetch('/api/news/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: bulkAction,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }

      const data = await response.json();

      if (data.success) {
        setSelectedIds(new Set());
        setBulkAction(null);
        await fetchNews();
      } else {
        throw new Error(data.error || 'Failed to perform bulk action');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error performing bulk action', 'NEWS_LIST', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu makaleyi silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      await fetchNews();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error deleting article', 'NEWS_LIST', { error: errorMessage });
      setError(errorMessage);
    }
  };

  const getTranslation = (item: NewsItem) => {
    return item.translations[language] || item.translations.tr;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-16 h-16 border-4 border-[#0a0a0a] dark:border-slate-600 border-t-[#0066ff] rounded-none animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Alerts */}
      {error && (
        <div className="p-6 border-4 border-[#ff0000] bg-red-50 text-red-700 font-bold">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1 flex gap-4">
            <input
              type="text"
              placeholder="Makale ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-6 py-4 border-4 border-[#0a0a0a] dark:border-slate-600 bg-white dark:bg-slate-900 text-lg focus:outline-none focus:border-[#0066ff] font-medium"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-6 py-4 border-4 border-[#0a0a0a] dark:border-slate-600 bg-white dark:bg-slate-900 text-lg focus:outline-none focus:border-[#0066ff] font-bold"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="draft">Taslak</option>
              <option value="published">Yayınlanmış</option>
            </select>
          </div>
          <Link
            href="/admin/news/create"
            className="flex items-center px-8 py-4 bg-[#0066ff] border-4 border-[#0066ff] text-white font-bold text-lg hover:bg-[#ff6b00] hover:border-[#ff6b00] transition-all duration-200"
          >
            + YENİ MAKALE
          </Link>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex gap-4 p-6 border-4 border-[#0066ff] bg-[#0066ff]/10">
            <span className="text-lg font-bold text-[#0a0a0a] dark:text-white">
              {selectedIds.size} makale seçildi
            </span>
            <select
              value={bulkAction || ''}
              onChange={(e) => setBulkAction(e.target.value as any)}
              className="px-6 py-4 border-4 border-[#0a0a0a] dark:border-slate-600 bg-white dark:bg-slate-900 text-lg focus:outline-none focus:border-[#0066ff] font-bold"
            >
              <option value="">İşlem seç...</option>
              <option value="publish">Yayınla</option>
              <option value="unpublish">Yayından Kaldır</option>
              <option value="delete">Sil</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkLoading}
              className="px-8 py-4 bg-[#0a0a0a] border-4 border-[#0a0a0a] dark:border-slate-600 text-white font-bold text-lg hover:bg-[#ff6b00] hover:border-[#ff6b00] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {bulkLoading ? 'İşleniyor...' : 'UYGULA'}
            </button>
          </div>
        )}
      </div>

      {/* Articles Table */}
      {news.length > 0 ? (
        <div className="overflow-x-auto border-4 border-[#0a0a0a] dark:border-slate-600">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0a0a0a] border-b-4 border-[#0066ff]">
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === news.length && news.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-5 h-5"
                  />
                </th>
                <th className="px-6 py-4 text-left font-bold text-white text-lg">BAŞLIK</th>
                <th className="px-6 py-4 text-left font-bold text-white text-lg">DURUM</th>
                <th className="px-6 py-4 text-left font-bold text-white text-lg">YAYINLANMA</th>
                <th className="px-6 py-4 text-left font-bold text-white text-lg">OLUŞTURULMA</th>
                <th className="px-6 py-4 text-left font-bold text-white text-lg">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => {
                const translation = getTranslation(item);
                return (
                  <tr key={item._id} className="border-b-4 border-[#0a0a0a] dark:border-slate-600 hover:bg-[#0066ff]/5">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item._id as string)}
                        onChange={(e) => handleSelectItem(item._id as string, e.target.checked)}
                        className="w-5 h-5"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {item.featuredImage.url && (
                          <div className="relative w-16 h-16 border-2 border-[#0a0a0a] dark:border-slate-600 overflow-hidden">
                            <Image
                              src={item.featuredImage.url}
                              alt={item.featuredImage.altText}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-lg font-bold text-[#0a0a0a] dark:text-white line-clamp-1">
                            {translation.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{item.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-4 py-2 font-bold text-sm ${item.status === 'published'
                            ? 'bg-[#0066ff] text-white'
                            : 'bg-[#ff6b00] text-white'
                          }`}
                      >
                        {item.status === 'published' ? 'YAYINLANMIŞ' : 'TASLAK'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString('tr-TR')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/news/${item._id}/edit`}
                          className="px-4 py-2 border-2 border-[#0066ff] text-[#0066ff] font-bold hover:bg-[#0066ff] hover:text-white transition-colors text-sm"
                        >
                          DÜZENLE
                        </Link>
                        <button
                          onClick={() => handleDelete(item._id as string)}
                          className="px-4 py-2 border-2 border-[#ff0000] text-[#ff0000] font-bold hover:bg-[#ff0000] hover:text-white transition-colors text-sm"
                        >
                          SİL
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 border-4 border-[#0a0a0a] dark:border-slate-600">
          <p className="text-2xl font-bold text-[#0a0a0a] dark:text-white">HİÇ MAKALE BULUNAMADI</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          {pagination.page > 1 && (
            <Link
              href={`?page=${pagination.page - 1}`}
              className="px-6 py-3 border-4 border-[#0a0a0a] dark:border-slate-600 text-[#0a0a0a] dark:text-white font-bold hover:border-[#0066ff] hover:text-[#0066ff] transition-colors text-lg"
            >
              ÖNCEKİ
            </Link>
          )}

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}`}
              className={`px-6 py-3 font-bold transition-colors text-lg ${p === pagination.page
                  ? 'bg-[#0066ff] border-4 border-[#0066ff] text-white'
                  : 'border-4 border-[#0a0a0a] dark:border-slate-600 text-[#0a0a0a] dark:text-white hover:border-[#0066ff] hover:text-[#0066ff]'
                }`}
            >
              {p}
            </Link>
          ))}

          {pagination.page < pagination.totalPages && (
            <Link
              href={`?page=${pagination.page + 1}`}
              className="px-6 py-3 border-4 border-[#0a0a0a] dark:border-slate-600 text-[#0a0a0a] dark:text-white font-bold hover:border-[#0066ff] hover:text-[#0066ff] transition-colors text-lg"
            >
              SONRAKİ
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
