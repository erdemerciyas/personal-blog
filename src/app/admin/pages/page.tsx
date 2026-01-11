'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Reorder, useDragControls } from 'framer-motion';
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface PageItem {
  _id: string;
  pageId: string;
  title: string;
  path: string;
  description: string;
  isActive: boolean;
  showInNavigation: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [hasReordered, setHasReordered] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Edit Modal State
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    path: '',
    description: '',
    showInNavigation: true
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadPages();
  }, [status, router]);

  const loadPages = async () => {
    try {
      const response = await fetch('/api/admin/pages');
      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (error) {
      console.error('Sayfalar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (page: PageItem) => {
    try {
      // Optimistic update
      const newStatus = !page.isActive;
      const updatedPages = pages.map(p =>
        p._id === page._id ? { ...p, isActive: newStatus } : p
      );
      setPages(updatedPages);

      const response = await fetch(`/api/admin/pages/${page._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        setPages(pages);
        alert('Durum güncellenemedi');
      }
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      setPages(pages);
    }
  };

  const handleReorder = (newOrder: PageItem[]) => {
    setPages(newOrder);
    setHasReordered(true);
  };

  const saveOrder = async () => {
    if (!hasReordered) return;

    setSavingOrder(true);
    try {
      const updates = pages.map((page, index) => ({
        pageId: page.pageId,
        order: index
      }));

      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setHasReordered(false);
        loadPages();
      } else {
        alert('Sıralama kaydedilemedi');
      }
    } catch (error) {
      console.error('Sıralama kaydedilirken hata:', error);
      alert('Sıralama kaydedilirken hata oluştu');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPages(pages.filter(page => page._id !== pageId));
      }
    } catch (error) {
      console.error('Sayfa silinirken hata:', error);
    }
  };

  const openEditModal = (page: PageItem) => {
    setEditingPage(page);
    setEditForm({
      title: page.title,
      path: page.path,
      description: page.description,
      showInNavigation: page.showInNavigation
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    try {
      const response = await fetch(`/api/admin/pages/${editingPage._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedPage = await response.json();
        const pageData = updatedPage.data || updatedPage; // Handle potential response inconsistencies

        setPages(pages.map(p => p._id === editingPage._id ? {
          ...p,
          ...editForm,
        } : p));

        setIsEditModalOpen(false);
        setEditingPage(null);
        loadPages(); // Reload to ensure sync
      } else {
        alert('Sayfa güncellenemedi');
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && page.isActive) ||
      (statusFilter === 'draft' && !page.isActive);
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isReorderEnabled = searchQuery === '' && statusFilter === 'all';

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Sayfalar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sayfalar</h1>
          <p className="text-slate-500 mt-1">Site sayfalarınızı yönetin</p>
        </div>
        <div className="flex gap-3">
          {hasReordered && (
            <button
              onClick={saveOrder}
              disabled={savingOrder}
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50"
            >
              {savingOrder ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <CheckCircleIcon className="w-5 h-5 mr-2" />
              )}
              Sıralamayı Kaydet
            </button>
          )}
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200">
            <PlusIcon className="w-5 h-5 mr-2" />
            Sayfa Oluştur
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sayfa ara..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'all'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Tümü ({pages.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'published'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Aktif ({pages.filter(p => p.isActive).length})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'draft'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Pasif ({pages.filter(p => !p.isActive).length})
            </button>
          </div>
        </div>
        {!isReorderEnabled && (
          <div className="mt-2 text-xs text-amber-600 flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />
            Sıralama yapmak için filtreleri temizleyin (Arama yaparken sıralama devre dışıdır)
          </div>
        )}
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {filteredPages.length > 0 ? (
          isReorderEnabled ? (
            <Reorder.Group axis="y" values={filteredPages} onReorder={handleReorder} className="divide-y divide-slate-200">
              {filteredPages.map((page) => (
                <DraggablePageItem
                  key={page._id}
                  page={page}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  onStatusToggle={handleStatusToggle}
                  formatDate={formatDate}
                />
              ))}
            </Reorder.Group>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredPages.map((page) => (
                <PageListItem
                  key={page._id}
                  page={page}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  onStatusToggle={handleStatusToggle}
                  formatDate={formatDate}
                  isDraggable={false}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <DocumentTextIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Sayfa bulunamadı</h3>
            <p className="text-slate-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Aramanızı veya filtrenizi değiştirmeyi deneyin'
                : 'Sayfalar Site Ayarları sayfasından yönetilir'
              }
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Sayfa Düzenle</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Yol (Path)</label>
                  <input
                    type="text"
                    value={editForm.path}
                    onChange={(e) => setEditForm({ ...editForm, path: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showInNav"
                    checked={editForm.showInNavigation}
                    onChange={(e) => setEditForm({ ...editForm, showInNavigation: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="showInNav" className="ml-2 text-sm text-slate-700">
                    Menüde Göster
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Draggable Page Item with specific drag controls
function DraggablePageItem({
  page,
  onDelete,
  onEdit,
  onStatusToggle,
  formatDate
}: {
  page: PageItem,
  onDelete: (id: string) => void,
  onEdit: (page: PageItem) => void,
  onStatusToggle: (page: PageItem) => void,
  formatDate: (d: string) => string
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={page}
      dragListener={false}
      dragControls={dragControls}
      className="bg-white"
    >
      <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Specific Drag Handle */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1"
          >
            <Bars3Icon className="w-5 h-5" />
          </div>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <DocumentTextIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              {page.title}
            </h3>
            <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
              <button
                onClick={() => onStatusToggle(page)}
                className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${page.isActive
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
              >
                {page.isActive ? (
                  <>
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Aktif
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-3 h-3 mr-1" />
                    Pasif
                  </>
                )}
              </button>
              <span>{page.path}</span>
              <span>• Sıra: {page.order}</span>
              {!page.showInNavigation && (
                <span className="text-amber-600">• Menüde Gizli</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-slate-500 mr-2">
            {formatDate(page.updatedAt)}
          </span>
          <button
            onClick={() => onEdit(page)}
            className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <PencilIcon className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={() => onDelete(page._id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
          >
            <TrashIcon className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

// Static Page Item for non-search/filtered view
function PageListItem({
  page,
  onDelete,
  onEdit,
  onStatusToggle,
  formatDate,
  isDraggable
}: {
  page: PageItem,
  onDelete: (id: string) => void,
  onEdit: (page: PageItem) => void,
  onStatusToggle: (page: PageItem) => void,
  formatDate: (d: string) => string,
  isDraggable: boolean
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {isDraggable && (
          <div className="text-slate-300 p-1">
            {/* Disabled drag handle visual */}
            <Bars3Icon className="w-5 h-5" />
          </div>
        )}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <DocumentTextIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
            {page.title}
          </h3>
          <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
            <button
              onClick={() => onStatusToggle(page)}
              className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${page.isActive
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
            >
              {page.isActive ? (
                <>
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Aktif
                </>
              ) : (
                <>
                  <XCircleIcon className="w-3 h-3 mr-1" />
                  Pasif
                </>
              )}
            </button>
            <span>{page.path}</span>
            {isDraggable && <span>• Sıra: {page.order}</span>}
            {!page.showInNavigation && (
              <span className="text-amber-600">• Menüde Gizli</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-slate-500 mr-2">
          {formatDate(page.updatedAt)}
        </span>
        <button
          onClick={() => onEdit(page)}
          className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <PencilIcon className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={() => onDelete(page._id)}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
        >
          <TrashIcon className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
