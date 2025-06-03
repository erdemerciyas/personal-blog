'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  ArrowLeftIcon,
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

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-slate-300">Sayfa ayarları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/dashboard"
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Dashboard&apos;a Dön</span>
              </Link>
              <div className="w-px h-6 bg-slate-600"></div>
              <h1 className="text-2xl font-bold text-white">Sayfa Yönetimi</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                  <DocumentTextIcon className="w-8 h-8 text-teal-400" />
                  <span>Sayfa Yönetimi</span>
                </h2>
                <p className="text-slate-300 text-lg">
                  Sitenizin sayfalarını aktif/pasif yapın ve menüde gösterilecek sayfaları belirleyin.
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-2 text-sm text-slate-400">
                <Cog6ToothIcon className="w-4 h-4" />
                <span>Toplam {pages.length} sayfa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 text-red-300 p-4 rounded-2xl flex items-center space-x-2">
              <XCircleIcon className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6">
            <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/30 text-green-300 p-4 rounded-2xl flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Pages List */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">Sayfalar</h3>
            
            <div className="space-y-4">
              {pages.map((page, index) => (
                <div
                  key={page.pageId}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <HomeIcon className="w-5 h-5 text-slate-400" />
                        <div>
                          <h4 className="text-lg font-semibold text-white">{page.title}</h4>
                          <p className="text-sm text-slate-400">{page.path}</p>
                          <p className="text-xs text-slate-500 mt-1">{page.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Page Order Controls */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => reorderPages(page.pageId, 'up')}
                          disabled={index === 0 || saving}
                          className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Yukarı taşı"
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => reorderPages(page.pageId, 'down')}
                          disabled={index === pages.length - 1 || saving}
                          className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Aşağı taşı"
                        >
                          <ArrowDownIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Navigation Visibility Toggle */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-400">Menüde:</span>
                        <button
                          onClick={() => updatePage(page.pageId, { showInNavigation: !page.showInNavigation })}
                          disabled={saving}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            page.showInNavigation ? 'bg-teal-600' : 'bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              page.showInNavigation ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Page Active Toggle */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-400">Aktif:</span>
                        <button
                          onClick={() => updatePage(page.pageId, { isActive: !page.isActive })}
                          disabled={saving}
                          className={`p-2 rounded-lg transition-colors ${
                            page.isActive
                              ? 'text-green-400 hover:text-green-300 bg-green-500/10'
                              : 'text-red-400 hover:text-red-300 bg-red-500/10'
                          }`}
                          title={page.isActive ? 'Sayfayı gizle' : 'Sayfayı göster'}
                        >
                          {page.isActive ? (
                            <EyeIcon className="w-5 h-5" />
                          ) : (
                            <EyeSlashIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-8 bg-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <Cog6ToothIcon className="w-5 h-5 text-blue-400" />
            <span>Açıklamalar</span>
          </h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong>Aktif/Pasif:</strong> Pasif yapılan sayfalar siteye erişilemez hale gelir (404 hatası verir)</p>
            <p><strong>Menüde Göster:</strong> Bu ayar sayfanın navigasyon menüsünde görünüp görünmeyeceğini belirler</p>
            <p><strong>Sıralama:</strong> Sayfaların menüdeki sırasını yukarı/aşağı okları ile değiştirebilirsiniz</p>
          </div>
        </div>
      </main>
    </div>
  );
} 