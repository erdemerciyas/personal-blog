'use client';

import { useState, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    CloudArrowUpIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function BackupPage() {
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [includeMedia, setIncludeMedia] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await fetch('/api/admin/backup/export');
            if (!res.ok) throw new Error('Export failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fixral-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            alert('Yedek dosyası indirildi.');
        } catch (error) {
            alert('Yedek alma işlemi başarısız oldu.');
            console.error(error);
        } finally {
            setExporting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        if (!confirm('DİKKAT: İçe aktarma işlemi mevcut verilerin üzerine yazabilir (kopyalar oluşturmaz, güncelleme yapar). Devam etmek istiyor musunuz?')) return;

        setImporting(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target?.result as string;
                    const json = JSON.parse(content);

                    const res = await fetch('/api/admin/backup/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(json)
                    });

                    const data = await res.json();
                    if (data.success) {
                        alert(data.message);
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    } else {
                        alert('İçe aktarma hatası: ' + data.error);
                    }
                } catch (_err) {
                    alert('Dosya okuma veya sunucu hatası.');
                } finally {
                    setImporting(false);
                }
            };
            reader.readAsText(file);
        } catch (_error) {
            setImporting(false);
            alert('Beklenmeyen bir hata oluştu.');
        }
    };

    return (
        <AdminLayout title="Yedekleme ve Geri Yükleme">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Info Alert */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                        <h4 className="font-bold">Önemli Uyarı</h4>
                        <p>Bu alan projenizin veritabanı yedeğini (Haberler, Ürünler) almanızı ve geri yüklemenizi sağlar. Medya dosyaları (resimler) veritabanında URL olarak saklanır ancak fiziksel dosyalar Cloudinary'de tutulduğu için bu yedekleme medya dosyalarını İÇERMEZ.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Export Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                            <ArrowDownTrayIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Verileri Dışa Aktar (Yedekle)</h3>
                            <p className="text-slate-500 text-sm mt-2">Haber ve Ürün içeriklerinizi bilgisayarınıza indirin.</p>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg w-full text-left">
                            <input
                                type="checkbox"
                                id="includeMedia"
                                checked={includeMedia}
                                onChange={(e) => setIncludeMedia(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                            <label htmlFor="includeMedia" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none flex-1">
                                Medya dosyalarını da indir (Resimler, PDF vb.)
                            </label>
                        </div>
                        {includeMedia && (
                            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded w-full">
                                ⚠️ Medya yedeklemesi dosya boyutuna göre uzun sürebilir.
                            </p>
                        )}

                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="mt-auto w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                        >
                            {exporting ? 'Hazırlanıyor ve İndiriliyor...' : (
                                <>
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                    {includeMedia ? 'Tam Yedeği İndir (.zip)' : 'Veri Yedeğini İndir (.json)'}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Import Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                            <ArrowUpTrayIcon className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Verileri İçe Aktar (Geri Yükle)</h3>
                            <p className="text-slate-500 text-sm mt-2">Daha önce aldığınız bir yedek dosyasını (.json) yükleyerek verilerinizi geri getirin.</p>
                        </div>

                        <div className="w-full space-y-3">
                            <input
                                type="file"
                                accept=".json"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-emerald-50 file:text-emerald-700
                  hover:file:bg-emerald-100
                "
                            />
                            <button
                                onClick={handleImport}
                                disabled={!file || importing}
                                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {importing ? 'Yükleniyor...' : (
                                    <>
                                        <CloudArrowUpIcon className="w-4 h-4" />
                                        Geri Yükle / İçe Aktar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
