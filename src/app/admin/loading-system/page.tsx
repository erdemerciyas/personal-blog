'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import { 
  CogIcon, 
  PowerIcon, 
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface LoadingConfig {
  _id?: string;
  globalEnabled: boolean;
  pages: {
    [key: string]: {
      enabled: boolean;
      loadingText: string;
      customClass?: string;
      installed: boolean;
    };
  };
  systemInstalled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const defaultPages = [
  { key: 'home', name: 'Ana Sayfa', path: '/' },
  { key: 'about', name: 'Hakkımda', path: '/about' },
  { key: 'services', name: 'Hizmetler', path: '/services' },
  { key: 'portfolio', name: 'Portfolio', path: '/portfolio' },
  { key: 'portfolio-detail', name: 'Proje Detay', path: '/portfolio/[slug]' },
  { key: 'contact', name: 'İletişim', path: '/contact' },
];

export default function LoadingSystemPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<LoadingConfig>({
    globalEnabled: true,
    pages: {},
    systemInstalled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auth check
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/admin/login');
      return;
    }
  }, [session, status, router]);

  // Load current config
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/loading-system');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        // Initialize with default config
        const defaultConfig: LoadingConfig = {
          globalEnabled: true,
          systemInstalled: true,
          pages: defaultPages.reduce((acc, page) => {
            acc[page.key] = {
              enabled: true,
              loadingText: `${page.name} yükleniyor...`,
              installed: true
            };
            return acc;
          }, {} as LoadingConfig['pages'])
        };
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Config fetch error:', error);
      showMessage('error', 'Konfigürasyon yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/loading-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        showMessage('success', 'Konfigürasyon başarıyla kaydedildi');
        // Update environment variable
        await updateEnvironmentVariable();
      } else {
        throw new Error('Kaydetme hatası');
      }
    } catch (error) {
      console.error('Save error:', error);
      showMessage('error', 'Konfigürasyon kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const updateEnvironmentVariable = async () => {
    try {
      await fetch('/api/admin/loading-system/env', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          enabled: config.globalEnabled && config.systemInstalled 
        }),
      });
    } catch (error) {
      console.error('Env update error:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const toggleGlobalSystem = () => {
    setConfig(prev => ({
      ...prev,
      globalEnabled: !prev.globalEnabled
    }));
  };

  const toggleSystemInstallation = () => {
    setConfig(prev => ({
      ...prev,
      systemInstalled: !prev.systemInstalled,
      globalEnabled: prev.systemInstalled ? false : prev.globalEnabled
    }));
  };

  const togglePageLoading = (pageKey: string) => {
    setConfig(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageKey]: {
          ...prev.pages[pageKey],
          enabled: !prev.pages[pageKey]?.enabled
        }
      }
    }));
  };

  const togglePageInstallation = (pageKey: string) => {
    setConfig(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageKey]: {
          ...prev.pages[pageKey],
          installed: !prev.pages[pageKey]?.installed,
          enabled: prev.pages[pageKey]?.installed ? false : prev.pages[pageKey]?.enabled
        }
      }
    }));
  };

  const updatePageText = (pageKey: string, text: string) => {
    setConfig(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageKey]: {
          ...prev.pages[pageKey],
          loadingText: text
        }
      }
    }));
  };

  const updatePageClass = (pageKey: string, className: string) => {
    setConfig(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageKey]: {
          ...prev.pages[pageKey],
          customClass: className
        }
      }
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!session) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <CogIcon className="h-8 w-8 text-teal-600 mr-3" />
                Loading System Yönetimi
              </h1>
              <p className="text-gray-600 mt-2">
                Modüler loading sistemini yönetin, sayfa bazında aktif/pasif edin
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={saveConfig}
                disabled={saving}
                className="btn-primary flex items-center"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Global System Control */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Sistem Kontrolü
          </h2>
          
          <div className="space-y-4">
            {/* System Installation */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Loading Sistemi</h3>
                <p className="text-sm text-gray-600">
                  Tüm loading sistemini kur/kaldır
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${
                  config.systemInstalled ? 'text-green-600' : 'text-red-600'
                }`}>
                  {config.systemInstalled ? 'Kurulu' : 'Kaldırıldı'}
                </span>
                <button
                  onClick={toggleSystemInstallation}
                  className={`p-2 rounded-lg transition-colors ${
                    config.systemInstalled
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {config.systemInstalled ? (
                    <TrashIcon className="h-5 w-5" />
                  ) : (
                    <PlusIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Global Enable/Disable */}
            {config.systemInstalled && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Global Durum</h3>
                  <p className="text-sm text-gray-600">
                    Tüm loading sistemini aktif/pasif et
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${
                    config.globalEnabled ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {config.globalEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                  <button
                    onClick={toggleGlobalSystem}
                    className={`p-2 rounded-lg transition-colors ${
                      config.globalEnabled
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <PowerIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page-specific Controls */}
        {config.systemInstalled && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sayfa Bazlı Kontroller
            </h2>
            
            <div className="space-y-4">
              {defaultPages.map((page) => {
                const pageConfig = config.pages[page.key] || {
                  enabled: false,
                  loadingText: `${page.name} yükleniyor...`,
                  installed: false
                };

                return (
                  <div key={page.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{page.name}</h3>
                        <p className="text-sm text-gray-600">{page.path}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Installation Toggle */}
                        <button
                          onClick={() => togglePageInstallation(page.key)}
                          className={`p-2 rounded-lg transition-colors ${
                            pageConfig.installed
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                          title={pageConfig.installed ? 'Kaldır' : 'Kur'}
                        >
                          {pageConfig.installed ? (
                            <TrashIcon className="h-4 w-4" />
                          ) : (
                            <PlusIcon className="h-4 w-4" />
                          )}
                        </button>

                        {/* Enable/Disable Toggle */}
                        {pageConfig.installed && (
                          <button
                            onClick={() => togglePageLoading(page.key)}
                            className={`p-2 rounded-lg transition-colors ${
                              pageConfig.enabled && config.globalEnabled
                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={pageConfig.enabled ? 'Pasif Et' : 'Aktif Et'}
                            disabled={!config.globalEnabled}
                          >
                            {pageConfig.enabled && config.globalEnabled ? (
                              <EyeIcon className="h-4 w-4" />
                            ) : (
                              <EyeSlashIcon className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Configuration Options */}
                    {pageConfig.installed && (
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loading Metni
                          </label>
                          <input
                            type="text"
                            value={pageConfig.loadingText}
                            onChange={(e) => updatePageText(page.key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder={`${page.name} yükleniyor...`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Özel CSS Class (Opsiyonel)
                          </label>
                          <input
                            type="text"
                            value={pageConfig.customClass || ''}
                            onChange={(e) => updatePageClass(page.key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="min-h-screen bg-gradient-to-br from-blue-500..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Sistem Durumu
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  config.systemInstalled ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="text-sm text-gray-600">Sistem Durumu</p>
                  <p className="font-medium">
                    {config.systemInstalled ? 'Kurulu' : 'Kaldırıldı'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  config.globalEnabled && config.systemInstalled ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
                <div>
                  <p className="text-sm text-gray-600">Global Durum</p>
                  <p className="font-medium">
                    {config.globalEnabled && config.systemInstalled ? 'Aktif' : 'Pasif'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                <div>
                  <p className="text-sm text-gray-600">Aktif Sayfalar</p>
                  <p className="font-medium">
                    {Object.values(config.pages).filter(p => p.installed && p.enabled).length} / {defaultPages.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}