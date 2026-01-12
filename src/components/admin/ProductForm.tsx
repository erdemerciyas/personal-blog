'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    PhotoIcon,
    CloudArrowUpIcon,
    StarIcon as StarOutlineIcon,
    TrashIcon,
    PaperClipIcon,
    TagIcon,
    CheckIcon,
    ArrowLeftIcon,
    ExclamationTriangleIcon,
    CubeIcon,
    SwatchIcon,
    CurrencyDollarIcon,
    QueueListIcon,
    PlusIcon,
    FolderIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import MediaBrowser from '@/components/MediaBrowser';

interface ProductFormProps {
    initialData?: any;
    isEditing?: boolean;
}

interface CategoryItem {
    _id: string;
    name: string;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [mediaBrowserOpen, setMediaBrowserOpen] = useState(false);

    // Validation State
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [form, setForm] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        condition: initialData?.condition || 'new',
        price: initialData?.price || '',
        currency: initialData?.currency || 'TRY',
        stock: initialData?.stock || 0,
        categoryIds: initialData?.categoryIds || [],
        coverImage: initialData?.coverImage || '',
        images: initialData?.images || [],
        attachments: initialData?.attachments || [],
        colors: initialData?.colors || [],
        sizes: initialData?.sizes || [],
        attributes: initialData?.attributes || [],
        isActive: initialData?.isActive ?? true
    });

    const [uploading, setUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const attachInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/product-categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.items || []);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const uploadFile = async (file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('context', 'products');

        const res = await fetch('/api/admin/product-upload', {
            method: 'POST',
            body: fd
        });

        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploaded: string[] = [];
            for (const f of files) {
                const up = await uploadFile(f);
                uploaded.push(up.url);
            }

            setForm(prev => ({
                ...prev,
                images: [...prev.images, ...uploaded],
                coverImage: prev.coverImage || uploaded[0]
            }));
        } catch (err) {
            setError('Görsel yüklenirken bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploaded: any[] = [];
            for (const f of files) {
                const up = await uploadFile(f);
                uploaded.push({
                    url: up.url,
                    type: up.resourceType === 'image' ? 'image' : (up.format === 'pdf' ? 'pdf' : 'raw'),
                    name: f.name,
                    size: f.size
                });
            }

            setForm(prev => ({
                ...prev,
                attachments: [...prev.attachments, ...uploaded]
            }));
        } catch (err) {
            setError('Dosya yüklenirken hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    const handleMediaSelect = (urls: string | string[]) => {
        const selectedUrls = Array.isArray(urls) ? urls : [urls];
        if (selectedUrls.length === 0) return;

        setForm(prev => ({
            ...prev,
            images: [...prev.images, ...selectedUrls],
            coverImage: prev.coverImage || selectedUrls[0]
        }));
    };

    const handleSubmit = async () => {
        // Basic Validation
        if (!form.title.trim()) {
            setError('Lütfen ürün başlığını giriniz.');
            setTouched(p => ({ ...p, title: true }));
            return;
        }
        if (!form.description.trim()) {
            setError('Lütfen ürün açıklamasını giriniz.');
            setTouched(p => ({ ...p, description: true }));
            return;
        }
        if (!form.coverImage) {
            setError('Lütfen en az bir görsel yükleyin ve kapak görselini seçin.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const url = isEditing ? `/api/admin/products/${initialData._id}` : '/api/admin/products';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                if (res.status === 500) throw new Error('Sunucu hatası (500). Lütfen zorunlu alanları kontrol edin.');
                const data = await res.json();
                throw new Error(data.error || 'Kaydetme başarısız.');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/admin/products');
            }, 1500);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Notifications */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckIcon className="w-5 h-5 shrink-0" />
                    <span>Ürün başarıyla kaydedildi! Yönlendiriliyorsunuz...</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <TagIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Temel Bilgiler</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Ürün Başlığı <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                                    placeholder="Örn: Kablosuz Kulaklık"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Açıklama <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={5}
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600 placeholder:text-slate-400 resize-y"
                                    placeholder="Ürün özelliklerini ve detaylarını yazın..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                <PhotoIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Medya Galerisi</h3>
                        </div>

                        <div className="p-6">
                            <div
                                onClick={() => imageInputRef.current?.click()}
                                className={`group relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                   ${uploading ? 'bg-slate-50 border-slate-300 cursor-not-allowed' : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50'}
                 `}
                            >
                                <input
                                    type="file"
                                    ref={imageInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all flex items-center justify-center">
                                        <CloudArrowUpIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Görsel yüklemek için tıklayın</p>
                                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP (Max 5MB)</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setMediaBrowserOpen(true)}
                                className="w-full mt-3 py-3 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all font-medium"
                            >
                                <FolderIcon className="w-5 h-5" />
                                <span>Kütüphaneden Seç</span>
                            </button>

                            {/* Image Grid */}
                            {form.images.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                    {form.images.map((img: string, idx: number) => (
                                        <div key={idx} className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                            <img src={img} alt="" className="w-full h-full object-cover" />

                                            {/* Overlay Actions */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                                                <button
                                                    onClick={() => setForm(p => ({ ...p, coverImage: img }))}
                                                    className={`p-2 rounded-lg backdrop-blur-md transition-colors ${form.coverImage === img ? 'bg-yellow-400 text-yellow-900' : 'bg-white/90 text-slate-600 hover:bg-yellow-400 hover:text-yellow-900'}`}
                                                    title="Kapak Resmi Yap"
                                                >
                                                    {form.coverImage === img ? <StarSolidIcon className="w-4 h-4" /> : <StarOutlineIcon className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newImages = form.images.filter((_: string, i: number) => i !== idx);
                                                        setForm(p => ({
                                                            ...p,
                                                            images: newImages,
                                                            coverImage: p.coverImage === img ? (newImages[0] || '') : p.coverImage
                                                        }));
                                                    }}
                                                    className="p-2 rounded-lg bg-white/90 text-red-600 hover:bg-red-500 hover:text-white backdrop-blur-md transition-colors"
                                                    title="Sil"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Cover Badge */}
                                            {form.coverImage === img && (
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400/90 backdrop-blur-sm text-yellow-900 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                                    Kapak
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                <SwatchIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Seçenekler & Varyasyonlar</h3>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Renkler</label>
                                <div className="flex flex-wrap gap-2 mb-3 min-h-[38px] p-1.5 border border-slate-200 rounded-xl bg-slate-50/50">
                                    {form.colors.map((c: string, i: number) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 dark:text-slate-300 shadow-sm">
                                            <span className="w-3 h-3 rounded-full border border-slate-100" style={{ backgroundColor: c }}></span>
                                            {c}
                                            <button onClick={() => setForm(p => ({ ...p, colors: p.colors.filter((_: string, idx: number) => idx !== i) }))} className="text-slate-400 hover:text-red-500">
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="Renk ekle (Enter)"
                                        className="bg-transparent border-none focus:ring-0 text-sm min-w-[120px]"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = e.currentTarget.value.trim();
                                                if (val && !form.colors.includes(val)) {
                                                    setForm(p => ({ ...p, colors: [...p.colors, val] }));
                                                    e.currentTarget.value = '';
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bedenler / Boyutlar</label>
                                <div className="flex flex-wrap gap-2 mb-3 min-h-[38px] p-1.5 border border-slate-200 rounded-xl bg-slate-50/50">
                                    {form.sizes.map((s: string, i: number) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 dark:text-slate-300 shadow-sm">
                                            {s}
                                            <button onClick={() => setForm(p => ({ ...p, sizes: p.sizes.filter((_: string, idx: number) => idx !== i) }))} className="text-slate-400 hover:text-red-500">
                                                <TrashIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="Boyut ekle (Enter)"
                                        className="bg-transparent border-none focus:ring-0 text-sm min-w-[120px]"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = e.currentTarget.value.trim();
                                                if (val && !form.sizes.includes(val)) {
                                                    setForm(p => ({ ...p, sizes: [...p.sizes, val] }));
                                                    e.currentTarget.value = '';
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Teknik Özellikler (Key: Value)</label>
                                <div className="space-y-3">
                                    {form.attributes.map((attr: any, i: number) => (
                                        <div key={i} className="flex gap-3">
                                            <input
                                                type="text"
                                                value={attr.key}
                                                onChange={(e) => {
                                                    const newAttrs = form.attributes.map((a: any, idx: number) =>
                                                        idx === i ? { ...a, key: e.target.value } : a
                                                    );
                                                    setForm(p => ({ ...p, attributes: newAttrs }));
                                                }}
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                placeholder="Özellik (örn: Malzeme)"
                                            />
                                            <input
                                                type="text"
                                                value={attr.value}
                                                onChange={(e) => {
                                                    const newAttrs = form.attributes.map((a: any, idx: number) =>
                                                        idx === i ? { ...a, value: e.target.value } : a
                                                    );
                                                    setForm(p => ({ ...p, attributes: newAttrs }));
                                                }}
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                placeholder="Değer (örn: %100 Pamuk)"
                                            />
                                            <button
                                                onClick={() => setForm(p => ({ ...p, attributes: p.attributes.filter((_: any, idx: number) => idx !== i) }))}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setForm(p => ({ ...p, attributes: [...p.attributes, { key: '', value: '' }] as any }))}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                    >
                                        <PlusIcon className="w-4 h-4" /> Özellik Ekle
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - Sidebar */}
                <div className="space-y-6">
                    {/* Publish Status & Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Yayınlama</h3>

                        <div className="flex items-center justify-between mb-6">
                            <label className="text-sm text-slate-600">Durum</label>
                            <button
                                onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckIcon className="w-5 h-5" />
                                        <span>{isEditing ? 'Değişiklikleri Kaydet' : 'Ürünü Yayınla'}</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Vazgeç
                            </button>
                        </div>
                    </div>

                    {/* Price & Stock */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <CurrencyDollarIcon className="w-5 h-5 text-emerald-500" />
                            Fiyat & Stok
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fiyat</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                                        className="w-full pl-4 pr-16 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="0.00"
                                    />
                                    <select
                                        value={form.currency}
                                        onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                                        className="absolute right-1 top-1 bottom-1 w-14 bg-slate-100 rounded-lg border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer"
                                    >
                                        <option value="TRY">TRY</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Stok Adedi <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={form.stock}
                                    onChange={e => setForm(p => ({ ...p, stock: Number(e.target.value) }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Durum</label>
                                <select
                                    value={form.condition}
                                    onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                >
                                    <option value="new">Sıfır (Yeni)</option>
                                    <option value="used">İkinci El</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <CubeIcon className="w-5 h-5 text-indigo-500" />
                            Kategoriler
                        </h3>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {categories.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">Kategori bulunamadı.</p>
                            ) : (
                                categories.map(cat => (
                                    <label key={cat._id} className="flex items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={form.categoryIds.includes(cat._id)}
                                            onChange={e => {
                                                if (e.target.checked) setForm(p => ({ ...p, categoryIds: [...p.categoryIds, cat._id] }));
                                                else setForm(p => ({ ...p, categoryIds: p.categoryIds.filter((id: string) => id !== cat._id) }));
                                            }}
                                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                        />
                                        <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Attachments */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <PaperClipIcon className="w-5 h-5 text-slate-500" />
                            Dosyalar
                        </h3>

                        <div
                            onClick={() => attachInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer transition-colors"
                        >
                            <input
                                type="file"
                                ref={attachInputRef}
                                className="hidden"
                                multiple
                                onChange={handleAttachmentUpload}
                                disabled={uploading}
                            />
                            <span className="text-sm text-slate-500 font-medium">Dosya Ekle +</span>
                        </div>

                        <div className="mt-4 space-y-2">
                            {form.attachments.map((file: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                    <a href={file.url} target="_blank" className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:underline truncate max-w-[150px]">
                                        <QueueListIcon className="w-4 h-4 shrink-0" />
                                        {file.name || 'Dosya'}
                                    </a>
                                    <button onClick={() => setForm(p => ({ ...p, attachments: p.attachments.filter((_: any, idx: number) => idx !== i) }))} className="text-slate-400 hover:text-red-500">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            <MediaBrowser
                isOpen={mediaBrowserOpen}
                onClose={() => setMediaBrowserOpen(false)}
                onSelect={handleMediaSelect}
                onUploadNew={() => {
                    setMediaBrowserOpen(false);
                    imageInputRef.current?.click();
                }}
                allowMultipleSelect={true}
                pageContext="products"
                title="Ürün Görselleri Seç"
            />
        </div>
    );

}
