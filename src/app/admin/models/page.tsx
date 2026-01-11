'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CubeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  CalendarIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

interface Model3D {
  _id: string;
  name: string;
  file: string;
  fileSize: number;
  format: string;
  createdAt: string;
  portfolioId?: string;
  portfolioTitle?: string;
  downloads?: number;
}

export default function AdminModelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<Model3D[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadModels();
  }, [status, router]);

  const loadModels = async () => {
    try {
      const response = await fetch('/api/admin/models');
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          ...item,
          name: item.name || 'İsimsiz Model',
          format: item.format?.toUpperCase() || 'UNKNOWN',
          fileSize: item.fileSize || 0
        }));

        // Sort by date descending
        mappedData.sort((a: Model3D, b: Model3D) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setModels(mappedData);
      }
    } catch (error) {
      console.error('Modeller yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (modelId: string) => {
    if (!confirm('Bu 3D modeli silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setModels(models.filter(model => model._id !== modelId));
        if (selectedItems.has(modelId)) {
          const newSelected = new Set(selectedItems);
          newSelected.delete(modelId);
          setSelectedItems(newSelected);
        }
      }
    } catch (error) {
      console.error('Model silinirken hata:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedItems.size} modeli silmek istediğinizden emin misiniz?`)) return;

    try {
      await Promise.all(
        Array.from(selectedItems).map(id =>
          fetch(`/api/admin/models/${id}`, { method: 'DELETE' })
        )
      );
      setModels(models.filter(model => !selectedItems.has(model._id)));
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Modeller silinirken hata:', error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredModels.map(model => model._id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const filteredModels = models.filter(model => {
    const name = model.name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = formatFilter === 'all' || model.format === formatFilter;
    return matchesSearch && matchesFormat;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get unique formats for filter
  const formats = Array.from(new Set(models.map(m => m.format))).sort();

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Modeller yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm py-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">3D Model Yönetimi</h1>
          <p className="text-slate-500 mt-1">3D dosyalarınızı ve dijital varlıklarınızı yönetin</p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200"
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          Model Yükle
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sm:p-3 sticky top-24 z-10 transition-all duration-300">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search & Filter Group */}
          <div className="flex-1 w-full lg:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Model ara..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center bg-slate-100 border border-slate-200/50 rounded-xl p-1 shadow-sm shrink-0 overflow-x-auto">
              <button
                onClick={() => setFormatFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${formatFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                Tümü
              </button>
              {formats.map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setFormatFilter(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${formatFilter === fmt
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-indigo-700'
                    }`}
                >
                  {fmt}
                </button>
              ))}
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
                title="Grid Görünümü"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="Liste Görünümü"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {filteredModels.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CubeIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">3D Model bulunamadı</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {searchQuery || formatFilter !== 'all'
              ? 'Arama kriterlerinize uygun model bulunamadı.'
              : 'Henüz hiç 3D model yüklenmemiş. Portfolyo üzerinden model ekleyebilirsiniz.'}
          </p>
          {(searchQuery || formatFilter !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setFormatFilter('all'); }}
              className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredModels.map(model => (
                <div
                  key={model._id}
                  className={`group relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl overflow-hidden
                         ${selectedItems.has(model._id) ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'}
                      `}
                >
                  {/* Icon Cover */}
                  <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden group-hover:bg-slate-100 transition-colors flex items-center justify-center p-8">
                    <div className="relative z-0">
                      <CubeIcon className="w-24 h-24 text-indigo-200 group-hover:text-indigo-300 transition-colors" strokeWidth={1} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">{model.format}</span>
                      </div>
                    </div>

                    {/* Selection Overlay */}
                    <div
                      onClick={() => handleSelectItem(model._id)}
                      className={`absolute inset-0 bg-black/40 transition-opacity cursor-pointer flex items-center justify-center z-10
                              ${selectedItems.has(model._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                           `}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                               ${selectedItems.has(model._id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-white text-transparent hover:bg-white/20'}
                            `}>
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(model.createdAt)}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-slate-600 font-medium">{formatFileSize(model.fileSize)}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {model.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-4 h-5">
                      {model.portfolioTitle ? `Proje: ${model.portfolioTitle}` : 'Bağlı proje yok'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <a
                        href={model.file}
                        download
                        className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5 mr-1" />
                        İndir
                      </a>

                      <button
                        onClick={() => handleDelete(model._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // LIST VIEW
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === filteredModels.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-4">Model Detayı</th>
                    <th className="px-6 py-4 w-32">Format</th>
                    <th className="px-6 py-4 w-32">Boyut</th>
                    <th className="px-6 py-4 w-40">Tarih</th>
                    <th className="px-6 py-4 w-32 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredModels.map(model => (
                    <tr
                      key={model._id}
                      className={`group transition-colors ${selectedItems.has(model._id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(model._id)}
                          onChange={() => handleSelectItem(model._id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 text-indigo-600">
                            <CubeIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {model.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {model.portfolioTitle || 'Bağlı proje yok'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 uppercase">
                          {model.format}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-mono">
                          {formatFileSize(model.fileSize)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{formatDate(model.createdAt).split(' ').slice(0, 2).join(' ')}</span>
                          <span>{formatDate(model.createdAt).split(' ')[2]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={model.file}
                            download
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="İndir"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(model._id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
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
    </div>
  );
}
