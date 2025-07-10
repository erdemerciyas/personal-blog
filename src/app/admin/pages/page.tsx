'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader } from '../../../components/ui';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  HomeIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface PageSetting {
  _id: string;
  pageId: string;
  title: string;
  path: string;
  description: string;
  isActive: boolean;
  showInNavigation: boolean;
  order: number;
}

export default function AdminPagesManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pages, setPages] = useState<PageSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string }>({ title: '', description: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchPages();
    }
  }, [status, router]);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/page-settings');
      if (!response.ok) throw new Error('Sayfa ayarları getirilemedi');
      const data = await response.json();
      setPages(data);
    } catch (err) {
      setError('Sayfa ayarları yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePage = async (pageId: string, updates: Partial<PageSetting>) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/page-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId, ...updates }),
      });

      if (!response.ok) throw new Error('Güncelleme başarısız oldu');
      
      const updatedPage = await response.json();
      setPages(prev => prev.map(page => 
        page.pageId === pageId ? { ...page, ...updatedPage } : page
      ));
      
      setSuccess('Sayfa ayarları başarıyla güncellendi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Güncelleme sırasında bir hata oluştu');
      setTimeout(() => setError(''), 3000);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const reorderPages = async (pageId: string, direction: 'up' | 'down') => {
    const currentIndex = pages.findIndex(p => p.pageId === pageId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= pages.length) return;
    
    const newPages = [...pages];
    [newPages[currentIndex], newPages[newIndex]] = [newPages[newIndex], newPages[currentIndex]];
    
    // Update order values
    newPages.forEach((page, index) => {
      page.order = index;
    });
    
    try {
      setSaving(true);
      const response = await fetch('/api/admin/page-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPages),
      });

      if (!response.ok) throw new Error('Sıralama güncellenemedi');
      
      setPages(newPages);
      setSuccess('Sayfa sıralaması güncellendi!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Sıralama güncellenirken bir hata oluştu');
      setTimeout(() => setError(''), 3000);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (page: PageSetting) => {
    setEditingPage(page.pageId);
    setEditForm({ title: page.title, description: page.description });
  };

  const cancelEditing = () => {
    setEditingPage(null);
    setEditForm({ title: '', description: '' });
  };

  const saveEditing = async () => {
    if (!editingPage) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/admin/page-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pageId: editingPage, 
          title: editForm.title,
          description: editForm.description
        }),
      });

      if (!response.ok) throw new Error('Güncelleme başarısız oldu');
      
      const updatedPage = await response.json();
      setPages(prev => prev.map(page => 
        page.pageId === editingPage ? { ...page, ...updatedPage } : page
      ));
      
      setSuccess('Hero alanı başarıyla güncellendi!');
      setTimeout(() => setSuccess(''), 3000);
      cancelEditing();
    } catch (err) {
      setError('Güncelleme sırasında bir hata oluştu');
      setTimeout(() => setError(''), 3000);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader size="xl" color="primary">
              Sayfa ayarları yükleniyor...
            </Loader>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <AdminLayout 
      title="Sayfa Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Sayfa Yönetimi' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600">Sitenizin sayfalarını aktif/pasif yapın ve menüde gösterilecek sayfaları belirleyin</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <Cog6ToothIcon className="w-4 h-4" />
            <span>Toplam {pages.length} sayfa</span>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center space-x-3">
            <CheckIcon className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Page List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5 text-teal-600" />
              <span>Sayfa Listesi</span>
            </h3>
          </div>
          
          <div className="divide-y divide-slate-200">
            {pages.map((page) => (
              <div key={page._id} className="p-6 hover:bg-slate-50 transition-colors">
                {editingPage === page.pageId ? (
                  // Düzenleme Modu
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          page.isActive ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {page.pageId === 'home' && <HomeIcon className="w-5 h-5" />}
                          {page.pageId !== 'home' && <DocumentTextIcon className="w-5 h-5" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {page.path}
                          </span>
                          <span className="text-sm text-slate-500">- Hero Alanı Düzenleme</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Hero Başlığı
                        </label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Sayfa hero başlığı"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Hero Açıklaması
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                          placeholder="Sayfa hero açıklaması"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={saveEditing}
                        disabled={saving}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                      >
                        <CheckIcon className="w-4 h-4" />
                        <span>Kaydet</span>
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={saving}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 transition-colors flex items-center space-x-2"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        <span>İptal</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Normal Görünüm
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            page.isActive ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {page.pageId === 'home' && <HomeIcon className="w-5 h-5" />}
                            {page.pageId !== 'home' && <DocumentTextIcon className="w-5 h-5" />}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-semibold text-slate-900">{page.title}</h4>
                            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {page.path}
                            </span>
                            <button
                              onClick={() => startEditing(page)}
                              className="p-1 text-slate-400 hover:text-teal-600 transition-colors"
                              title="Hero alanını düzenle"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{page.description}</p>
                        </div>
                      </div>
                    </div>
                  
                    <div className="flex items-center space-x-4">
                      {/* Active Toggle */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">Aktif</span>
                        <button
                          onClick={() => updatePage(page.pageId, { isActive: !page.isActive })}
                          disabled={saving}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            page.isActive ? 'bg-teal-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              page.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {/* Navigation Toggle */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">Menüde</span>
                        <button
                          onClick={() => updatePage(page.pageId, { showInNavigation: !page.showInNavigation })}
                          disabled={saving}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            page.showInNavigation ? 'bg-teal-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              page.showInNavigation ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {/* Order Controls */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => reorderPages(page.pageId, 'up')}
                          disabled={saving || page.order === 0}
                          className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => reorderPages(page.pageId, 'down')}
                          disabled={saving || page.order === pages.length - 1}
                          className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
                        >
                          <ArrowDownIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status Legend */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Durum Açıklamaları</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-teal-600" />
              <span className="text-slate-700">Aktif: Sayfa erişilebilir</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircleIcon className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">Pasif: Sayfa 404 döndürür</span>
            </div>
            <div className="flex items-center space-x-2">
              <EyeIcon className="w-4 h-4 text-teal-600" />
              <span className="text-slate-700">Menüde: Navigasyon menüsünde gösterilir</span>
            </div>
            <div className="flex items-center space-x-2">
              <EyeSlashIcon className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">Menüde değil: Navigasyon menüsünde gizli</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 