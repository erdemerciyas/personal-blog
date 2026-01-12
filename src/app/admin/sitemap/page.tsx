
'use client';

import { useState, useEffect } from 'react';
import {
    ArrowPathIcon,
    DocumentTextIcon,
    ClockIcon,
    CloudArrowDownIcon,
    GlobeAltIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SitemapStats {
    exists: boolean;
    lastModified: string | null;
    size: number;
    urlCount: number;
}

export default function SitemapPage() {
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [stats, setStats] = useState<SitemapStats | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/sitemap');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching sitemap stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/sitemap', { method: 'POST' });
            const data = await res.json();

            if (res.ok && data.success) {
                setMessage({ type: 'success', text: 'Sitemap başarıyla oluşturuldu.' });
                setStats({
                    exists: true,
                    lastModified: data.lastModified,
                    size: data.size,
                    urlCount: data.urlCount
                });
            } else {
                setMessage({ type: 'error', text: 'Sitemap oluşturulurken bir hata oluştu.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu.' });
        } finally {
            setGenerating(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <GlobeAltIcon className="w-8 h-8" />
                            Sitemap Yönetimi
                        </h1>
                        <p className="text-blue-100 text-lg opacity-90">
                            Arama motorları için site haritasını oluşturun ve yönetin.
                        </p>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className={`px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2 ${generating ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {generating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                Oluşturuluyor...
                            </>
                        ) : (
                            <>
                                <ArrowPathIcon className="w-5 h-5" />
                                Sitemap Oluştur
                            </>
                        )}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} flex items-center gap-3`}>
                    {message.type === 'success' ? (
                        <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                        <div className="w-6 h-6 border-2 border-red-500 rounded-full flex items-center justify-center">!</div>
                    )}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                            Sitemap Durumu
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-sm text-slate-500 mb-1">Durum</div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${stats?.exists ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="font-semibold text-slate-900">
                                        {stats?.exists ? 'Aktif' : 'Bulunamadı'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-sm text-slate-500 mb-1">Son Güncelleme</div>
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4 text-slate-400" />
                                    <span className="font-semibold text-slate-900">
                                        {stats?.lastModified ? new Date(stats.lastModified).toLocaleString('tr-TR') : '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="text-sm text-slate-500 mb-1">URL Sayısı</div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-900 text-xl">
                                        {stats?.urlCount || 0}
                                    </span>
                                    <span className="text-xs text-slate-400">adres</span>
                                </div>
                            </div>
                        </div>

                        {stats?.exists && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-slate-600">
                                        <span className="font-medium">Dosya Yolu:</span> /public/sitemap.xml
                                        <br />
                                        <span className="font-medium">Dosya Boyutu:</span> {formatSize(stats.size)}
                                    </div>
                                    <a
                                        href="/sitemap.xml"
                                        target="_blank"
                                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <CloudArrowDownIcon className="w-5 h-5" />
                                        Dosyayı Görüntüle
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">İçerik Kapsamı</h2>
                        <p className="text-slate-600 mb-4">
                            Aşağıdaki içerik türleri otomatik olarak sitemap dosyasına dahil edilir:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: 'Statik Sayfalar', desc: 'Anasayfa, Hakkımızda, İletişim vb.', active: true },
                                { label: 'Blog Yazıları', desc: 'Yayınlanmış tüm blog içerikleri', active: true },
                                { label: 'Ürünler', desc: 'Aktif durumdaki tüm ürünler', active: true },
                                { label: 'Portfolyo', desc: 'Tamamlanmış projeler', active: true },
                                { label: 'Hizmetler', desc: 'Hizmet listeleme sayfası', active: true },
                                { label: 'Kategoriler', desc: 'Blog ve ürün kategorileri', active: false }, // Not implemented yet
                            ].map((item, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border ${item.active ? 'border-green-100 bg-green-50/50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {item.active ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                        )}
                                        <span className={`font-semibold ${item.active ? 'text-green-900' : 'text-slate-500'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 ml-7">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <GlobeAltIcon className="w-5 h-5 text-indigo-300" />
                            SEO İpuçları
                        </h3>
                        <ul className="space-y-4 text-sm text-indigo-100">
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                <p>Sitemap dosyanızı düzenli olarak güncelleyerek Google'ın yeni içeriklerinizi daha hızlı keşfetmesini sağlayın.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                <p>Google Search Console hesabınızda sitemap.xml dosya yolunu tanımlamayı unutmayın.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                <p>Blog yazılarınızın başlıklarını ve URL yapılarını SEO uyumlu (kısa ve açıklayıcı) tutun.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
