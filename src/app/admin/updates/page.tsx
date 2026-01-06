'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowPathIcon, CheckCircleIcon, CubeIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline';

export default function UpdatesPage() {
    const [checking, setChecking] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [currentVersion, setCurrentVersion] = useState("...");
    const [remoteVersionInfo, setRemoteVersionInfo] = useState<any>(null);

    useEffect(() => {
        checkUpdate(false); // Initial passive check
    }, []);

    const checkUpdate = async (manual: boolean) => {
        if (manual) setChecking(true);
        try {
            const res = await fetch('/api/admin/updates/check');
            const data = await res.json();

            setCurrentVersion(data.current?.version || 'Unknown');

            if (data.hasUpdate) {
                setUpdateAvailable(true);
                setRemoteVersionInfo(data.remote);
            } else {
                setUpdateAvailable(false);
                if (manual) alert('Sisteminiz güncel.');
            }
        } catch (_error) {
            console.error('Update check failed', _error);
            if (manual) alert('Güncelleme kontrolü başarısız.');
        } finally {
            if (manual) setChecking(false);
        }
    };

    const handleUpdate = async () => {
        if (!confirm('Sistemi güncellemek istediğinize emin misiniz? Bu işlem core dosyalarını yenileyecektir.')) return;

        setUpdating(true);
        try {
            const res = await fetch('/api/admin/updates/run', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                alert(data.message);
                setUpdateAvailable(false);
                setCurrentVersion(data.newVersion);
                window.location.reload(); // Reload to reflect changes
            } else {
                alert('Güncelleme hatası: ' + data.error);
            }
        } catch (_error) {
            alert('Güncelleme işlemi sırasında bir hata oluştu.');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <AdminLayout title="Sistem Güncellemeleri">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Version Info Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-brand-primary-50 dark:bg-brand-primary-900/30 rounded-2xl flex items-center justify-center">
                                <CubeIcon className="w-8 h-8 text-brand-primary-600 dark:text-brand-primary-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Fixral Core Engine</h2>
                                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    Mevcut Sürüm: <span className="font-mono font-semibold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{currentVersion}</span>
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => checkUpdate(true)}
                            disabled={checking || updating}
                            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${checking
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-brand-primary-50 text-brand-primary-700 hover:bg-brand-primary-100'
                                }`}
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
                            <span>{checking ? 'Kontrol Ediliyor...' : 'Güncel Durumu Kontrol Et'}</span>
                        </button>
                    </div>
                </div>

                {/* Update Status */}
                {updateAvailable && remoteVersionInfo && (
                    <div className="bg-gradient-to-r from-brand-primary-600 to-cyan-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden animate-fade-in">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-white/20 rounded-full animate-pulse">
                                        <CloudArrowDownIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold">Yeni Sürüm Mevcut! ({remoteVersionInfo.version})</h3>
                                </div>
                                <p className="text-brand-primary-50 mb-4 max-w-lg">
                                    Sisteminizi en son özelliklere ve güvenlik yamalarına kavuşturmak için güncelleyin.
                                </p>

                                {remoteVersionInfo.features && (
                                    <ul className="space-y-2 text-sm">
                                        {remoteVersionInfo.features.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg w-fit">
                                                <CheckCircleIcon className="w-4 h-4 text-emerald-300" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="flex-shrink-0">
                                <button
                                    onClick={handleUpdate}
                                    disabled={updating}
                                    className="w-full md:w-auto px-8 py-4 bg-white text-brand-primary-700 font-bold rounded-xl shadow-lg hover:shadow-2xl hover:bg-slate-50 transform hover:-translate-y-1 transition-all disabled:opacity-75 disabled:cursor-wait flex items-center justify-center gap-2"
                                >
                                    {updating ? (
                                        <>
                                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                            Güncelleniyor...
                                        </>
                                    ) : (
                                        <>
                                            <CloudArrowDownIcon className="w-5 h-5" />
                                            Şimdi Güncelle
                                        </>
                                    )}
                                </button>
                                <div className="mt-2 text-center text-xs text-brand-primary-200">
                                    Otomatik yedek alma önerilir
                                </div>
                            </div>
                        </div>

                        {/* Architectural Background Pattern */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
