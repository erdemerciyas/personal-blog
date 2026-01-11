'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  TrashIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
  TagIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ProductItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  price: number;
  currency: string;
  categoryIds: string[];
  stock: number;
  coverImage?: string;
  createdAt: string;
}

interface MessageItem {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  status: string;
}

export default function AdminProductsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>([]);

  // States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Message Viewer State
  const [selectedProductForMessages, setSelectedProductForMessages] = useState<ProductItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }
    loadProducts();
  }, [status, router]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is array
        const list = Array.isArray(data.items) ? data.items : [];
        setProducts(list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      if (response.ok) {
        setProducts(prev => prev.filter(p => p._id !== productId));
        if (selectedItems.has(productId)) {
          const newSet = new Set(selectedItems);
          newSet.delete(productId);
          setSelectedItems(newSet);
        }
      }
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedItems.size} ürünü silmek istediğinizden emin misiniz?`)) return;

    try {
      await Promise.all(
        Array.from(selectedItems).map(id => fetch(`/api/admin/products/${id}`, { method: 'DELETE' }))
      );
      setProducts(prev => prev.filter(p => !selectedItems.has(p._id)));
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Toplu silme hatası:', error);
    }
  };

  const openMessages = async (product: ProductItem) => {
    setSelectedProductForMessages(product);
    setLoadingMessages(true);
    setMessages([]);

    try {
      const res = await fetch(`/api/messages/product?productId=${product._id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.items || []);
      }
    } catch (err) {
      console.error('Mesajları yüklerken hata:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectItem = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedItems(new Set(filteredProducts.map(p => p._id)));
    else setSelectedItems(new Set());
  };

  // Filter Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && product.isActive) ||
      (statusFilter === 'draft' && !product.isActive);
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'in_stock' && product.stock > 0) ||
      (stockFilter === 'out_of_stock' && product.stock <= 0);

    return matchesSearch && matchesStatus && matchesStock;
  });

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(price || 0);
  };

  if (status === 'loading' || loading) {
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ürün Yönetimi</h1>
          <p className="text-slate-500 mt-1">Mağaza ürünlerinizi ve stok durumunu yönetin</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Yeni Ürün
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sm:p-3 sticky top-24 z-10 transition-all duration-300">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

          {/* Search & Filters */}
          <div className="flex-1 w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün adı, kod..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="published">Yayında</option>
                <option value="draft">Taslak</option>
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="all">Stok Durumu</option>
                <option value="in_stock">Stokta Var</option>
                <option value="out_of_stock">Tükendi</option>
              </select>
            </div>
          </div>

          {/* View Toggle & Bulk Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full lg:w-auto">
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-200">
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

            <div className="flex bg-slate-100 border border-slate-200/50 rounded-xl p-1 shadow-sm shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBagIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Ürün bulunamadı</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Arama kriterlerinize uygun ürün bulunamadı.'
              : 'Henüz hiç ürün eklenmemiş. Yeni ürün ekleyerek başlayın.'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); setStockFilter('all'); }}
              className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product._id}
                  className={`group relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl overflow-hidden flex flex-col
                        ${selectedItems.has(product._id) ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'}
                      `}
                >
                  {/* Image Area */}
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    {product.coverImage ? (
                      <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ShoppingBagIcon className="w-12 h-12" />
                      </div>
                    )}

                    {/* Selection Overlay */}
                    <div
                      onClick={() => handleSelectItem(product._id)}
                      className={`absolute inset-0 bg-black/40 transition-opacity cursor-pointer flex items-center justify-center z-10
                              ${selectedItems.has(product._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                            `}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                              ${selectedItems.has(product._id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-white text-transparent hover:bg-white/20'}
                            `}>
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded-lg shadow-sm backdrop-blur-md
                              ${product.isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'}
                            `}>
                        {product.isActive ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
                      <Link href={`/admin/products/edit/${product._id}`} className="hover:underline">
                        {product.title}
                      </Link>
                    </h3>
                    <p className="text-sm font-semibold text-slate-700 mb-4">{formatPrice(product.price, product.currency)}</p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className={product.stock > 0 ? 'text-slate-600' : 'text-red-600 font-medium'}>
                          {product.stock > 0 ? `${product.stock} Stok` : 'Tükendi'}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <TagIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openMessages(product)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sorular"
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === filteredProducts.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-4">Ürün</th>
                    <th className="px-6 py-4">Fiyat</th>
                    <th className="px-6 py-4">Stok</th>
                    <th className="px-6 py-4">Durum</th>
                    <th className="px-6 py-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(product => (
                    <tr key={product._id} className={`group ${selectedItems.has(product._id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(product._id)}
                          onChange={() => handleSelectItem(product._id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.coverImage ? (
                              <img src={product.coverImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ShoppingBagIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link href={`/admin/products/edit/${product._id}`} className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                              {product.title}
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5">ID: {product._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">
                        {formatPrice(product.price, product.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="text-sm text-slate-700">{product.stock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${product.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                          {product.isActive ? 'Yayında' : 'Taslak'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/products/edit/${product._id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <TagIcon className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openMessages(product)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Sorular"
                          >
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Messages Sidebar / Modal */}
      {selectedProductForMessages && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedProductForMessages(null)}
          />

          {/* Sidebar */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900">Ürün Soruları</h3>
                <p className="text-xs text-slate-500 truncate max-w-[200px]">{selectedProductForMessages.title}</p>
              </div>
              <button
                onClick={() => setSelectedProductForMessages(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Bu ürün için henüz soru sorulmamış.</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-slate-900">{msg.name}</div>
                      <span className="text-xs text-slate-500">
                        {new Date(msg.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="text-xs text-indigo-600 mb-2">{msg.email}</div>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                      {msg.message}
                    </p>
                    <div className="mt-3 flex justify-end">
                      <Link
                        href={`/admin/messages?id=${msg._id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Mesaj Detayına Git &rarr;
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
