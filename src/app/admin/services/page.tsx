'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CubeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  TagIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CheckCircleIcon,
  EyeIcon,
  FunnelIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface ServiceItem {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  status: 'published' | 'draft';
  price?: number;
  category?: string;
  icon?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    loadServices();
  }, [status, router]);

  const loadServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          ...item,
          title: item.title || item.name || 'İsimsiz Hizmet',
          status: item.status || 'published',
          category: item.category || 'Genel',
          description: item.description || 'Açıklama yok',
          price: item.price || undefined,
          image: item.image || ''
        }));

        // Sort by date descending
        mappedData.sort((a: ServiceItem, b: ServiceItem) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setServices(mappedData);
      }
    } catch (error) {
      console.error('Hizmetler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setServices(services.filter(service => service._id !== serviceId));
        if (selectedItems.has(serviceId)) {
          const newSelected = new Set(selectedItems);
          newSelected.delete(serviceId);
          setSelectedItems(newSelected);
        }
      }
    } catch (error) {
      console.error('Hizmet silinirken hata:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedItems.size} hizmeti silmek istediğinizden emin misiniz?`)) return;

    try {
      await Promise.all(
        Array.from(selectedItems).map(id =>
          fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
        )
      );
      setServices(services.filter(service => !selectedItems.has(service._id)));
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Hizmetler silinirken hata:', error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredServices.map(service => service._id)));
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

  const filteredServices = services.filter(service => {
    const title = service.title || '';
    const description = service.description || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">Hizmetler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm py-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hizmet Yönetimi</h1>
          <p className="text-slate-500 mt-1">Hizmetlerinizi, paketlerinizi ve fiyatlandırmayı yönetin</p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Yeni Hizmet Ekle
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
                placeholder="Hizmetlerde ara..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center bg-slate-100 border border-slate-200/50 rounded-xl p-1 shadow-sm shrink-0 overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                Tümü
              </button>
              <div className="w-px h-4 bg-slate-200 mx-1" />
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${statusFilter === 'published'
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-emerald-700'
                  }`}
              >
                Yayında
              </button>
              <div className="w-px h-4 bg-slate-200 mx-1" />
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${statusFilter === 'draft'
                  ? 'bg-amber-50 text-amber-700 shadow-sm'
                  : 'text-slate-500 hover:text-amber-700'
                  }`}
              >
                Taslak
              </button>
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
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CubeIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Hizmet bulunamadı</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Arama kriterlerinize uygun hizmet bulunamadı. Filtreleri temizlemeyi deneyin.'
              : 'Henüz hiç hizmet eklenmemiş. İlk hizmetinizi oluşturarak başlayın.'}
          </p>
          {(searchQuery || statusFilter !== 'all') ? (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
            >
              Filtreleri Temizle
            </button>
          ) : (
            <Link
              href="/admin/services/new"
              className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Hizmet Ekle
            </Link>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map(service => (
                <div
                  key={service._id}
                  className={`group relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl overflow-hidden
                         ${selectedItems.has(service._id) ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'}
                      `}
                >
                  {/* Image / Icon Cover */}
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden group-hover:bg-slate-50 transition-colors">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100`}>
                          <CubeIcon className="w-8 h-8 text-indigo-500" />
                        </div>
                      </div>
                    )}

                    {/* Selection Overlay */}
                    <div
                      onClick={() => handleSelectItem(service._id)}
                      className={`absolute inset-0 bg-black/40 transition-opacity cursor-pointer flex items-center justify-center
                              ${selectedItems.has(service._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                           `}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                               ${selectedItems.has(service._id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-white text-transparent hover:bg-white/20'}
                            `}>
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 pointer-events-none">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-sm border border-white/20
                               ${service.status === 'published' ? 'bg-emerald-500/90 text-white' : 'bg-amber-400/90 text-white'}
                            `}>
                        {service.status === 'published' ? 'Yayında' : 'Taslak'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(service.createdAt)}</span>
                      {service.category && (
                        <>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-slate-600 font-medium">{service.category}</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center text-sm font-semibold text-slate-700">
                        {service.price ? (
                          <span className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-4 h-4 text-slate-400" />
                            {service.price}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Fiyat girilmemiş</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/services/edit/${service._id}`}
                          className="flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          <PencilIcon className="w-3.5 h-3.5 mr-1.5" />
                          Düzenle
                        </Link>
                      </div>
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
                        checked={selectedItems.size === filteredServices.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-4">Hizmet Detayı</th>
                    <th className="px-6 py-4 w-32">Durum</th>
                    <th className="px-6 py-4 w-32">Fiyat</th>
                    <th className="px-6 py-4 w-40">Tarih</th>
                    <th className="px-6 py-4 w-32 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredServices.map(service => (
                    <tr
                      key={service._id}
                      className={`group transition-colors ${selectedItems.has(service._id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(service._id)}
                          onChange={() => handleSelectItem(service._id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center">
                            {service.image ? (
                              <img src={service.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <CubeIcon className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {service.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              {service.category && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                  {service.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                                  ${service.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'}
                               `}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5
                                     ${service.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}
                                  `} />
                          {service.status === 'published' ? 'Yayında' : 'Taslak'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {service.price ? (
                          <span className="text-sm font-medium text-slate-700">${service.price}</span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{formatDate(service.createdAt).split(' ').slice(0, 2).join(' ')}</span>
                          <span>{formatDate(service.createdAt).split(' ')[2]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/services/edit/${service._id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(service._id)}
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
