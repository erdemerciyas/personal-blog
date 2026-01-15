'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    PhotoIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    EyeIcon,
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon,
    ArrowPathIcon,
    CloudArrowUpIcon,
    XMarkIcon,
    DocumentIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface MediaItem {
    _id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    width?: number;
    height?: number;
    createdAt: string;
}

export default function AdminProductMediaPage() {
    const { status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/admin/login');
        if (status === 'authenticated') loadMedia();
    }, [status, router]);

    const loadMedia = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/product-media');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMediaItems(data);
                }
            }
        } catch (error) {
            console.error('Failed to load media', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = useMemo(() => {
        return mediaItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [mediaItems, searchQuery]);

    const handleSelectItem = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) newSelected.delete(itemId);
        else newSelected.add(itemId);
        setSelectedItems(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === filteredItems.length && filteredItems.length > 0) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredItems.map(i => i._id)));
        }
    };

    const handleDelete = async (itemsToDelete: string[]) => {
        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: `${itemsToDelete.length} öğeyi silmek istediğinize emin misiniz?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Evet, sil!',
            cancelButtonText: 'Vazgeç'
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/media', {
                method: 'DELETE',
                body: JSON.stringify({ mediaIds: itemsToDelete }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setMediaItems(prev => prev.filter(item => !itemsToDelete.includes(item._id)));
                setSelectedItems(new Set());
                if (selectedItem && itemsToDelete.includes(selectedItem._id)) {
                    setSelectedItem(null);
                }
                toast.success('Başarıyla silindi');
            } else {
                toast.error('Silme işlemi başarısız oldu.');
            }
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        // Process sequentially to handle rate limits better if multiple files
        // But for better UX parallel is okay for small batches. 
        // Product upload route handles one file at a time usually, logic below sends one by one

        const files = Array.from(e.target.files);
        let successCount = 0;

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/admin/product-upload', {
                    method: 'POST',
                    body: formData
                });
                if (res.ok) successCount++;
            } catch (error) {
                console.error(`Failed to upload ${file.name}`, error);
            }
        }

        setIsUploading(false);
        setShowUploadModal(false);
        if (successCount > 0) {
            loadMedia();
            toast.success(`${successCount} dosya başarıyla yüklendi`);
        } else {
            toast.error('Yükleme başarısız oldu.');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    if (status === 'loading') return null;

    return (
        <div className="space-y-6">
            {/* Sticky Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm py-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ürün Medyası</h1>
                    <p className="text-slate-500 mt-1">
                        Toplam {mediaItems.length} dosya, {formatSize(mediaItems.reduce((acc, item) => acc + item.size, 0))}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedItems.size > 0 && (
                        <button
                            onClick={() => handleDelete(Array.from(selectedItems))}
                            className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
                        >
                            <TrashIcon className="w-5 h-5 mr-2" />
                            {selectedItems.size} Sil
                        </button>
                    )}
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
                    >
                        <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                        Dosya Yükle
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sm:p-3 sticky top-24 z-10 transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full lg:w-auto relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Dosya adı ara..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                        />
                    </div>

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

                    <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                    <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <input
                            type="checkbox"
                            checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                            onChange={handleSelectAll}
                            className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-slate-700 hidden sm:inline">Tümünü Seç</span>
                    </label>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-16 h-16 border-4 border-slate-200 rounded-full border-t-indigo-600 animate-spin"></div>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PhotoIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Medya Bulunamadı</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Bu klasörde henüz görsel yok. Yukarıdaki "Dosya Yükle" butonunu kullanarak yeni dosya ekleyebilirsiniz.
                    </p>
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                            {filteredItems.map(item => (
                                <div
                                    key={item._id}
                                    className={`group relative w-full bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer transition-all duration-200 ${selectedItems.has(item._id)
                                        ? 'ring-2 ring-indigo-500 border-transparent shadow-indigo-100'
                                        : 'border-slate-200 hover:shadow-md hover:border-indigo-300'
                                        }`}
                                    onClick={() => handleSelectItem(item._id)}
                                >
                                    {/* Aspect Ratio Maintainer - Manual Padding Hack */}
                                    <div className="pb-[100%]" />

                                    {/* Content Container - Absolute fill */}
                                    <div className="absolute inset-0 w-full h-full">
                                        <div className="w-full h-full relative">
                                            <img
                                                src={item.url}
                                                alt={item.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />

                                            {/* Preview/Delete Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 z-20">
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedItem(item);
                                                        }}
                                                        className="p-1.5 bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-slate-900 rounded-lg transition-all"
                                                        title="Önizle"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete([item._id]);
                                                        }}
                                                        className="p-1.5 bg-white/10 backdrop-blur-md hover:bg-red-500 text-white rounded-lg transition-all"
                                                        title="Sil"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Checkbox - Absolute Top Left */}
                                        <div className={`absolute top-2 left-2 z-30 transition-all duration-200 ${selectedItems.has(item._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <div className="bg-white rounded-md shadow-sm p-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(item._id)}
                                                    onChange={() => handleSelectItem(item._id)}
                                                    className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer block"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                            />
                                        </th>
                                        <th className="px-4 py-3">Önizleme</th>
                                        <th className="px-4 py-3">Dosya Adı</th>
                                        <th className="px-4 py-3">Boyut</th>
                                        <th className="px-4 py-3">Tarih</th>
                                        <th className="px-4 py-3 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.map(item => (
                                        <tr
                                            key={item._id}
                                            className={`hover:bg-slate-50 group cursor-pointer ${selectedItems.has(item._id) ? 'bg-indigo-50/50' : ''}`}
                                            onClick={() => handleSelectItem(item._id)}
                                        >
                                            <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(item._id)}
                                                    onChange={() => handleSelectItem(item._id)}
                                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2 w-16">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                                                    <img src={item.url} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 font-medium text-slate-900">{item.name}</td>
                                            <td className="px-4 py-2 text-slate-500">{formatSize(item.size)}</td>
                                            <td className="px-4 py-2 text-slate-500">{new Date(item.createdAt).toLocaleDateString('tr-TR')}</td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                                        className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete([item._id]); }}
                                                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
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
                </>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900">Dosya Yükle (Ürün Medyası)</h3>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8">
                            {isUploading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-16 h-16 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin mb-4"></div>
                                    <p className="text-lg font-medium text-slate-900">Yükleniyor...</p>
                                    <p className="text-slate-500">Lütfen bekleyin, dosyalarınız işleniyor.</p>
                                </div>
                            ) : (
                                <label
                                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer group"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <CloudArrowUpIcon className="w-8 h-8" />
                                        </div>
                                        <p className="mb-2 text-lg font-medium text-slate-700">Tıklayın veya sürükleyin</p>
                                        <p className="text-sm text-slate-500">PNG, JPG, WEBP (Maks. 5MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleUpload}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-900 truncate pr-4">{selectedItem.name}</h3>
                            <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <span className="sr-only">Kapat</span>
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-6 bg-[url('/img/grid.png')]">
                            <img src={selectedItem.url} alt={selectedItem.name} className="max-w-full max-h-[60vh] object-contain shadow-lg rounded-lg" />
                        </div>
                        <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                            <div>
                                <p>Boyut: {formatSize(selectedItem.size)}</p>
                                <p>Tarih: {new Date(selectedItem.createdAt).toLocaleString('tr-TR')}</p>
                            </div>
                            <a
                                href={selectedItem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-600/20"
                            >
                                Tam Boyut Görüntüle
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
