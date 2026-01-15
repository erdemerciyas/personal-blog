
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheckIcon,
    DevicePhoneMobileIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserIcon,
    KeyIcon,
    PhotoIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import MediaBrowser from '@/components/MediaBrowser';
import { InlineLoader } from '@/components/AdminLoader';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function ProfilePage() {
    const router = useRouter();

    // UI State
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | '2fa'>('profile');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isMediaBrowserOpen, setIsMediaBrowserOpen] = useState(false);

    // Profile Data State
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        avatar: '',
        role: ''
    });

    // Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // 2FA State
    const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

    // Fetch User Data
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/admin/profile');
            const data = await res.json();
            if (res.ok) {
                setUserData({
                    name: data.name || '',
                    email: data.email || '',
                    avatar: data.avatar || '',
                    role: data.role || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setPageLoading(false);
        }
    };

    // Profile Handlers
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    avatar: userData.avatar
                })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profil başarıyla güncellendi' });
                setUserData(prev => ({ ...prev, ...data.user }));
                router.refresh(); // Refresh server components like header
            } else {
                setMessage({ type: 'error', text: data.error || 'Güncelleme başarısız' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' });
        } finally {
            setLoading(false);
        }
    };

    // Password Handlers
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor' });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/admin/profile/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi' });
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Şifre değiştirilemedi' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' });
        } finally {
            setLoading(false);
        }
    };

    // 2FA Handlers
    const startSetup = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/2fa/setup', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setSetupData(data);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to start setup' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const verifyAndEnable = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/2fa/setup', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: verificationCode }),
            });
            const data = await res.json();

            if (res.ok) {
                setBackupCodes(data.backupCodes);
                setSetupData(null);
                setVerificationCode('');
                setMessage({ type: 'success', text: 'İki Aşamalı Doğrulama başarıyla etkinleştirildi!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Doğrulama başarısız' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' });
        } finally {
            setLoading(false);
        }
    };

    const disable2FA = async () => {
        const result = await Swal.fire({
            title: 'Emin misiniz?',
            text: '2FA\'yı devre dışı bırakmak istediğinize emin misiniz? Hesabınızın güvenliği azalacaktır.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Evet, devre dışı bırak!',
            cancelButtonText: 'Vazgeç'
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/2fa/setup', { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'İki Aşamalı Doğrulama devre dışı bırakıldı.' });
                setBackupCodes(null);
                toast.success('2FA devre dışı bırakıldı');
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Devre dışı bırakılamadı' });
                toast.error(data.error || 'Devre dışı bırakılamadı');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu' });
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <div className="p-8"><InlineLoader text="Profil bilgileri yükleniyor..." /></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center relative">
                            {userData.avatar ? (
                                <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold">{userData.name?.[0]?.toUpperCase()}</span>
                            )}
                            <button
                                onClick={() => setIsMediaBrowserOpen(true)}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <PhotoIcon className="w-6 h-6 text-white" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1 text-white">{userData.name}</h1>
                        <p className="text-indigo-100 opacity-90">{userData.email}</p>
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                            {userData.role.toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'profile'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <UserIcon className="w-4 h-4" />
                    Profil Bilgileri
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'security'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <KeyIcon className="w-4 h-4" />
                    Şifre Değiştir
                </button>
                <button
                    onClick={() => setActiveTab('2fa')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === '2fa'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <ShieldCheckIcon className="w-4 h-4" />
                    İki Aşamalı Doğrulama
                </button>
            </div>

            {/* Messages */}
            {message && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[400px]">

                {/* 1. Profile Tab */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleUpdateProfile} className="max-w-2xl space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Ad Soyad</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={userData.name}
                                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                        className="pl-10 w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Adınız Soyadınız"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">E-posta Adresi</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        className="pl-10 w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium shadow-sm hover:shadow-indigo-500/30"
                            >
                                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </form>
                )}

                {/* 2. Security Tab (Password) */}
                {activeTab === 'security' && (
                    <form onSubmit={handleChangePassword} className="max-w-xl space-y-6 animate-in fade-in">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Mevcut Şifre</label>
                            <input
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Yeni Şifre</label>
                            <input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Yeni Şifre (Tekrar)</label>
                            <input
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium shadow-sm hover:shadow-indigo-500/30"
                            >
                                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                            </button>
                        </div>
                    </form>
                )}

                {/* 3. 2FA Tab */}
                {activeTab === '2fa' && (
                    <div className="max-w-2xl animate-in fade-in">
                        <div className="bg-indigo-50 rounded-xl p-6 mb-8 border border-indigo-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-full shadow-sm text-indigo-600">
                                    <ShieldCheckIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-indigo-900">Hesabınızı Koruyun</h3>
                                    <p className="text-indigo-700 text-sm">
                                        İki aşamalı doğrulama, hesabınıza yetkisiz erişimi engellemek için ekstra bir güvenlik katmanı sağlar.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!setupData && !backupCodes ? (
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={startSetup}
                                    disabled={loading}
                                    className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5"
                                >
                                    <DevicePhoneMobileIcon className="w-6 h-6" />
                                    <span className="font-semibold text-lg">{loading ? 'Hazırlanıyor...' : '2FA Kurulumunu Başlat'}</span>
                                </button>

                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={disable2FA}
                                        className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-2 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                        Mevcut 2FA Kurulumunu Kaldır / Devre Dışı Bırak
                                    </button>
                                </div>
                            </div>
                        ) : setupData ? (
                            <div className="space-y-8">
                                <ol className="list-decimal list-inside space-y-4 text-slate-600 border-l-2 border-slate-100 pl-4">
                                    <li>Telefonunuza <strong>Google Authenticator</strong> veya benzeri bir uygulama indirin.</li>
                                    <li>Uygulamadan "QR Kodu Tara" seçeneğini seçin.</li>
                                    <li>Aşağıdaki QR kodu taratın veya manuel kodu girin.</li>
                                </ol>

                                <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                    {setupData.qrCodeUrl && (
                                        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                                            <Image
                                                src={setupData.qrCodeUrl}
                                                alt="QR Code"
                                                width={180}
                                                height={180}
                                                className="object-contain"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 text-center md:text-left">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Manuel Kurulum Kodu</p>
                                        <code className="text-xl font-mono block break-all bg-white p-3 rounded-lg border border-slate-200 text-slate-700 select-all">
                                            {setupData.secret}
                                        </code>
                                    </div>
                                </div>

                                <div className="max-w-xs">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Doğrulama Kodu</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000 000"
                                            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-[0.5em] text-xl font-mono"
                                        />
                                    </div>
                                    <button
                                        onClick={verifyAndEnable}
                                        disabled={loading || verificationCode.length !== 6}
                                        className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 font-semibold shadow-lg shadow-indigo-500/20"
                                    >
                                        Doğrula ve Etkinleştir
                                    </button>
                                </div>

                                <button
                                    onClick={() => setSetupData(null)}
                                    className="text-slate-400 text-sm hover:text-slate-600 underline decoration-slate-300 underline-offset-4"
                                >
                                    Kurulumu İptal Et
                                </button>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                    <CheckCircleIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-emerald-800 mb-2">Kurulum Başarıyla Tamamlandı!</h3>
                                <p className="text-emerald-700 mb-6 max-w-md mx-auto">
                                    Hesabınız artık 2FA ile korunuyor. Erişimini kaybetmeniz durumunda kullanabileceğiniz yedek kodlar aşağıdadır.
                                </p>

                                <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm max-w-lg mx-auto mb-6">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Kurtarma Kodları</p>
                                    <div className="grid grid-cols-2 gap-3 font-mono text-slate-600">
                                        {backupCodes?.map((code, i) => (
                                            <div key={i} className="bg-slate-50 py-1.5 px-2 rounded text-center select-all hover:bg-slate-100 transition-colors cursor-copy">{code}</div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setBackupCodes(null)}
                                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-500/20"
                                >
                                    Kodları Güvenli Bir Yere Kaydettim
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Media Browser Modal */}
            <MediaBrowser
                isOpen={isMediaBrowserOpen}
                onClose={() => setIsMediaBrowserOpen(false)}
                onSelect={(url) => {
                    if (Array.isArray(url)) {
                        setUserData({ ...userData, avatar: url[0] });
                    } else {
                        setUserData({ ...userData, avatar: url });
                    }
                    setIsMediaBrowserOpen(false);
                }}
                onUploadNew={() => {
                    // Fallback
                }}
                title="Profil Fotoğrafı Seç"
                allowedTypes={['image/']}
                pageContext="profile"
                enableInlineUpload={true}
            />
        </div>
    );
}
